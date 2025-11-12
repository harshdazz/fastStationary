// functions/index.js — PhonePe Standard Checkout V2 (Production)
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const qs = require("qs");
const crypto = require("crypto");
const admin = require("firebase-admin");
const firestore = require("firebase-admin/firestore");

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
const { FieldValue } = firestore;

// Express setup
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define your PhonePe secrets
const PHONEPE_CLIENT_ID = defineSecret("PHONEPE_CLIENT_ID");
const PHONEPE_CLIENT_SECRET = defineSecret("PHONEPE_CLIENT_SECRET");
const PHONEPE_CLIENT_VERSION = defineSecret("PHONEPE_CLIENT_VERSION");
const PHONEPE_MERCHANT_ID = defineSecret("PHONEPE_MERCHANT_ID");
const PHONEPE_SALT_KEY = defineSecret("PHONEPE_SALT_KEY");
const PHONEPE_SALT_INDEX = defineSecret("PHONEPE_SALT_INDEX");

// ✅ Correct Production API paths
const PHONEPE_CONFIG = {
  baseUrl: "https://api.phonepe.com/apis/pg",
  tokenUrl: "https://api.phonepe.com/apis/identity-manager/v1/oauth/token",
  createPaymentPath: "/v1/pay",
  statusPath: "/v1/status/", // /v1/status/{merchantOrderId}
};

// ✅ Generate Access Token
async function getAccessToken() {
  const clientId = PHONEPE_CLIENT_ID.value();
  const clientSecret = PHONEPE_CLIENT_SECRET.value();
  const clientVersion = PHONEPE_CLIENT_VERSION.value();

  const body = qs.stringify({
    client_id: clientId,
    client_secret: clientSecret,
    client_version: clientVersion,
    grant_type: "client_credentials",
  });

  const resp = await axios.post(PHONEPE_CONFIG.tokenUrl, body, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    timeout: 15000,
  });

  return resp.data.access_token;
}

// ✅ Create Payment Endpoint
app.post("/createPayment", async (req, res) => {
  try {
    const { amount, orderId, userId, userPhone, userName, userEmail, redirectUrl } = req.body;

    if (!amount || !orderId) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const merchantId = PHONEPE_MERCHANT_ID.value();
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("Access token not received");

    // Payment payload
    const payload = {
      merchantId,
      merchantTransactionId: orderId,
      amount: Math.round(amount * 100), // convert to paise
      merchantUserId: userId || `guest_${Date.now()}`,
      callbackUrl: redirectUrl || `http://localhost:8080/payment-status?orderId=${orderId}`,
      redirectUrl: redirectUrl || `http://localhost:8080/payment-status?orderId=${orderId}`,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    // Encode payload and generate checksum
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
    const saltKey = PHONEPE_SALT_KEY.value();
    const saltIndex = PHONEPE_SALT_INDEX.value();
    const checksum = crypto
      .createHash("sha256")
      .update(base64Payload + "/pg/v1/pay" + saltKey)
      .digest("hex") + "###" + saltIndex;

    // Send request to PhonePe
    const response = await axios.post(
      `${PHONEPE_CONFIG.baseUrl}${PHONEPE_CONFIG.createPaymentPath}`,
      { request: base64Payload },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
          "X-MERCHANT-ID": merchantId,
        },
      }
    );

    const phonepeResp = response.data;
    console.log("✅ PhonePe Payment Response:", phonepeResp);

    // Store transaction
    await db.collection("transactions").doc(orderId).set({
      merchantOrderId: orderId,
      userId,
      userName: userName || null,
      userEmail: userEmail || null,
      userPhone: userPhone || null,
      amount,
      status: "PENDING",
      paymentMethod: "PHONEPE",
      environment: "PRODUCTION",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Return redirect URL to frontend
    return res.status(200).json({
      success: true,
      paymentUrl: phonepeResp?.data?.instrumentResponse?.redirectInfo?.url || null,
      merchantOrderId: orderId,
    });
  } catch (err) {
    console.error("❌ createPayment error:", err.response?.data || err.message);
    res.status(500).json({
      success: false,
      message: "Failed to create payment",
      error: err.response?.data || err.message,
    });
  }
});

// ✅ Check Payment Status Endpoint
app.post("/checkPaymentStatus", async (req, res) => {
  try {
    const { merchantTransactionId } = req.body;
    const merchantOrderId = merchantTransactionId;
    if (!merchantOrderId) {
      return res.status(400).json({ success: false, message: "merchantOrderId required" });
    }

    const merchantId = PHONEPE_MERCHANT_ID.value();
    const saltKey = PHONEPE_SALT_KEY.value();
    const saltIndex = PHONEPE_SALT_INDEX.value();

    const path = `/pg/v1/status/${merchantOrderId}`;
    const checksum = crypto
      .createHash("sha256")
      .update(path + saltKey)
      .digest("hex") + "###" + saltIndex;

    const statusUrl = `${PHONEPE_CONFIG.baseUrl}/v1/status/${merchantOrderId}`;
    const resp = await axios.get(statusUrl, {
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        "X-MERCHANT-ID": merchantId,
      },
      timeout: 15000,
    });

    const body = resp.data;
    console.log(`📦 Payment status for ${merchantOrderId}:`, body.code);

    let status = "FAILED";
    if (body.code === "PAYMENT_SUCCESS" || body.state === "COMPLETED") status = "SUCCESS";
    else if (body.code === "PAYMENT_PENDING") status = "PENDING";

    // Update transaction
    await db.collection("transactions").doc(merchantOrderId).update({
      status,
      statusResponse: body,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Update order in admin panel
    if (status === "SUCCESS") {
      await db.collection("orders").doc(merchantOrderId).set(
        {
          paymentStatus: "paid",
          status: "fulfilled",
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    return res.json({ success: true, data: body });
  } catch (err) {
    console.error("❌ checkPaymentStatus error:", err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to check payment status",
      error: err.response?.data || err.message,
    });
  }
});

// ✅ Optional callback (if you set webhook in PhonePe dashboard)
app.post("/paymentCallback", async (req, res) => {
  console.log("📩 Payment Callback received:", req.body);
  res.status(200).send("Callback received");
});

// ✅ Export your function (this makes it available to your frontend)
exports.api = onRequest(
  {
    secrets: [
      PHONEPE_CLIENT_ID,
      PHONEPE_CLIENT_SECRET,
      PHONEPE_CLIENT_VERSION,
      PHONEPE_MERCHANT_ID,
      PHONEPE_SALT_KEY,
      PHONEPE_SALT_INDEX,
    ],
  },
  app
);
