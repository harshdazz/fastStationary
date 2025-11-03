// functions/index.js - PhonePe UAT/Sandbox Integration (FIXED)
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const qs = require("qs");
const crypto = require("crypto");
const admin = require("firebase-admin");

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define secrets for UAT/Sandbox
const PHONEPE_CLIENT_ID = defineSecret("PHONEPE_CLIENT_ID");
const PHONEPE_CLIENT_SECRET = defineSecret("PHONEPE_CLIENT_SECRET");
const PHONEPE_CLIENT_VERSION = defineSecret("PHONEPE_CLIENT_VERSION");
const PHONEPE_MERCHANT_ID = defineSecret("PHONEPE_MERCHANT_ID");
const PHONEPE_SALT_KEY = defineSecret("PHONEPE_SALT_KEY");

// UAT/Sandbox Configuration - UPDATED URLs
const PHONEPE_CONFIG = {
  tokenUrl: "https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token",
  paymentUrl: "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay",  // FIXED: Added /pg/ path
  statusUrl: "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status",  // FIXED: Added /pg/ path
  refundUrl: "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/refund",  // FIXED: Added /pg/ path
  saltIndex: "1",
};

// Helper: Generate Checksum
function generateChecksum(payload, endpoint, saltKey, saltIndex) {
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
  const stringToHash = base64Payload + endpoint + saltKey;
  const sha256 = crypto.createHash("sha256").update(stringToHash).digest("hex");
  return sha256 + "###" + saltIndex;
}

// Helper: Verify Checksum (for callbacks)
function verifyChecksum(base64Response, receivedChecksum, saltKey) {
  const stringToHash = base64Response + saltKey;
  const calculatedHash = crypto.createHash("sha256").update(stringToHash).digest("hex");
  const receivedHash = receivedChecksum.split("###")[0];
  return calculatedHash === receivedHash;
}

// Route 1: Get Access Token
app.post("/getAccessToken", async (req, res) => {
  try {
    const clientId = PHONEPE_CLIENT_ID.value();
    const clientSecret = PHONEPE_CLIENT_SECRET.value();
    const clientVersion = PHONEPE_CLIENT_VERSION.value();

    console.log("Requesting access token for Client ID:", clientId);

    const body = qs.stringify({
      client_id: clientId,
      client_version: clientVersion,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    });

    const response = await axios.post(PHONEPE_CONFIG.tokenUrl, body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      timeout: 15000,
    });

    console.log("Access token generated successfully");
    return res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (err) {
    console.error("Error fetching PhonePe access token:", err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to get access token",
      error: err.response?.data || { message: err.message },
    });
  }
});

// Route 2: Create Payment (UAT/Sandbox) - FIXED
app.post("/createPayment", async (req, res) => {
  try {
    const {
      amount,
      orderId,
      userId,
      userPhone,
      userName,
      userEmail,
      redirectUrl,
    } = req.body;

    // Validation
    if (!amount || !orderId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: amount, orderId, userId",
      });
    }

    let merchantId = PHONEPE_MERCHANT_ID.value();
    const saltKey = PHONEPE_SALT_KEY.value();
    const saltIndex = PHONEPE_CONFIG.saltIndex;

    // IMPORTANT: Add TEST- prefix if not present for sandbox
    if (!merchantId.startsWith("TEST-")) {
      merchantId = `TEST-${merchantId}`;
    }

    console.log("Creating payment for Merchant ID:", merchantId);
    console.log("Order ID:", orderId);

    const merchantTransactionId = orderId;

    // Create payment payload
    const payload = {
      merchantId,
      merchantTransactionId,
      merchantUserId: userId,
      amount: Math.round(amount * 100), // Convert to paise
      redirectUrl: redirectUrl || `${req.headers.origin}/payment-status?orderId=${orderId}`,
      redirectMode: "POST",
      callbackUrl: `https://${req.headers.host}/paymentCallback`,
      mobileNumber: userPhone || undefined,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    console.log("Payment payload:", JSON.stringify(payload, null, 2));

    // Generate checksum
    const checksum = generateChecksum(payload, "/pg/v1/pay", saltKey, saltIndex);
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");

    console.log("Base64 Payload:", base64Payload);
    console.log("Checksum:", checksum);

    // First, get access token
    const tokenBody = qs.stringify({
      client_id: PHONEPE_CLIENT_ID.value(),
      client_version: PHONEPE_CLIENT_VERSION.value(),
      client_secret: PHONEPE_CLIENT_SECRET.value(),
      grant_type: "client_credentials",
    });

    console.log("Getting access token...");
    const tokenResponse = await axios.post(PHONEPE_CONFIG.tokenUrl, tokenBody, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      timeout: 15000,
    });

    const accessToken = tokenResponse.data.access_token;
    console.log("Access token obtained successfully");

    // Make payment request
    console.log("Sending payment request to:", PHONEPE_CONFIG.paymentUrl);
    const response = await axios.post(
      PHONEPE_CONFIG.paymentUrl,
      { request: base64Payload },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          "X-VERIFY": checksum,
          "X-MERCHANT-ID": merchantId,
        },
        timeout: 15000,
      }
    );

    console.log("Payment response:", JSON.stringify(response.data, null, 2));

    // Store transaction in Firestore
    await db.collection("transactions").doc(merchantTransactionId).set({
      merchantTransactionId,
      userId,
      userName: userName || null,
      userEmail: userEmail || null,
      userPhone: userPhone || null,
      amount: amount,
      currency: "INR",
      status: "PENDING",
      paymentMethod: "PHONEPE",
      environment: "UAT",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      phonepeResponse: response.data,
    });

    console.log("Payment initiated successfully:", merchantTransactionId);

    return res.status(200).json({
      success: true,
      data: response.data,
      paymentUrl: response.data?.data?.instrumentResponse?.redirectInfo?.url,
      merchantTransactionId,
    });
  } catch (error) {
    console.error("Payment creation error:", error.response?.data || error.message);
    console.error("Error details:", error.response?.config);
    return res.status(500).json({
      success: false,
      message: "Failed to create payment",
      error: error.response?.data || { message: error.message },
    });
  }
});

// Route 3: Payment Callback (from PhonePe)
app.post("/paymentCallback", async (req, res) => {
  try {
    console.log("Payment callback received:", req.body);
    console.log("Headers:", req.headers);

    const { response: base64Response } = req.body;
    const checksum = req.headers["x-verify"];

    if (!base64Response || !checksum) {
      console.error("Missing callback data");
      return res.status(400).json({ success: false, message: "Invalid callback data" });
    }

    const saltKey = PHONEPE_SALT_KEY.value();

    // Verify checksum
    const isValid = verifyChecksum(base64Response, checksum, saltKey);
    if (!isValid) {
      console.error("Invalid checksum in callback");
      return res.status(400).json({ success: false, message: "Invalid checksum" });
    }

    // Decode response
    const decodedResponse = JSON.parse(
      Buffer.from(base64Response, "base64").toString("utf-8")
    );

    const {
      merchantTransactionId,
      transactionId,
      code,
      message,
      amount,
      paymentInstrument,
    } = decodedResponse;

    console.log("Decoded callback:", { merchantTransactionId, code, message });

    // Determine status
    let status = "FAILED";
    if (code === "PAYMENT_SUCCESS") {
      status = "SUCCESS";
    } else if (code === "PAYMENT_PENDING") {
      status = "PENDING";
    }

    // Update transaction in Firestore
    const transactionRef = db.collection("transactions").doc(merchantTransactionId);
    const transactionDoc = await transactionRef.get();

    if (!transactionDoc.exists) {
      console.error("Transaction not found:", merchantTransactionId);
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    await transactionRef.update({
      status,
      transactionId: transactionId || null,
      code,
      message: message || null,
      paymentInstrument: paymentInstrument || null,
      callbackResponse: decodedResponse,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("Callback processed successfully");
    return res.status(200).json({ success: true, message: "Callback processed" });
  } catch (error) {
    console.error("Callback processing error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process callback",
      error: error.message,
    });
  }
});

// Route 4: Check Payment Status - FIXED
app.post("/checkPaymentStatus", async (req, res) => {
  try {
    const { merchantTransactionId } = req.body;

    if (!merchantTransactionId) {
      return res.status(400).json({
        success: false,
        message: "merchantTransactionId is required",
      });
    }

    let merchantId = PHONEPE_MERCHANT_ID.value();
    const saltKey = PHONEPE_SALT_KEY.value();
    const saltIndex = PHONEPE_CONFIG.saltIndex;

    // Add TEST- prefix if not present
    if (!merchantId.startsWith("TEST-")) {
      merchantId = `TEST-${merchantId}`;
    }

    console.log("Checking status for transaction:", merchantTransactionId);

    // Generate checksum for status check
    const endpoint = `/pg/v1/status/${merchantId}/${merchantTransactionId}`;
    const stringToHash = endpoint + saltKey;
    const sha256 = crypto.createHash("sha256").update(stringToHash).digest("hex");
    const checksum = sha256 + "###" + saltIndex;

    // Get access token
    const tokenBody = qs.stringify({
      client_id: PHONEPE_CLIENT_ID.value(),
      client_version: PHONEPE_CLIENT_VERSION.value(),
      client_secret: PHONEPE_CLIENT_SECRET.value(),
      grant_type: "client_credentials",
    });

    const tokenResponse = await axios.post(PHONEPE_CONFIG.tokenUrl, tokenBody, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      timeout: 15000,
    });

    const accessToken = tokenResponse.data.access_token;

    // Check status
    const statusUrl = `${PHONEPE_CONFIG.statusUrl}/${merchantId}/${merchantTransactionId}`;
    const response = await axios.get(statusUrl, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "X-VERIFY": checksum,
        "X-MERCHANT-ID": merchantId,
      },
      timeout: 15000,
    });

    console.log("Status response:", response.data);

    // Update Firestore if status changed
    if (response.data.success) {
      const code = response.data.code;
      let status = "FAILED";
      if (code === "PAYMENT_SUCCESS") status = "SUCCESS";
      else if (code === "PAYMENT_PENDING") status = "PENDING";

      await db.collection("transactions").doc(merchantTransactionId).update({
        status,
        statusCheckResponse: response.data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error("Status check error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to check payment status",
      error: error.response?.data || { message: error.message },
    });
  }
});

// Export the function with all secrets
exports.api = onRequest(
  {
    secrets: [
      PHONEPE_CLIENT_ID,
      PHONEPE_CLIENT_SECRET,
      PHONEPE_CLIENT_VERSION,
      PHONEPE_MERCHANT_ID,
      PHONEPE_SALT_KEY,
    ],
  },
  app
);