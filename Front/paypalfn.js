const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK once
admin.initializeApp();


const PAYPAL_CLIENT_ID = 'ASQdjOrsXQ9ebQpcK2azsf29FfqcWh0-BPBC2pyIktsbOKQFVsnC2eZUx1d8oyoDoNqYcFNPmCJKFpik';
const PAYPAL_SECRET ="EG49k9dcTzyv0lVuAjYm5j0pzwBGYwDhsEj23XS8EIdleleVTRrPzZHZOUMxbLC2Gy-VNWxLeVvR8Kl4";
const IS_SANDBOX = "true";

const PAYPAL_API_BASE = IS_SANDBOX
  ? "https://api-m.sandbox.paypal.com"
  : "https://api-m.paypal.com";

// Helper: Get PayPal access token
async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64");

  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) throw new Error(`Failed to get access token: ${res.statusText}`);

  const data = await res.json();
  return data.access_token;
}

exports.verifyPayPalOrder = functions.https.onRequest(async (req, res) => {
  console.log("📥 Incoming verifyPayPalOrder request:", req.body);

  const { orderId, amount, currency } = req.body;

  if (!orderId || !amount || !currency) {
    console.warn("⚠ Missing required fields:", { orderId, amount, currency });
    return res.status(400).json({
      error: "Missing required fields",
      received: { orderId, amount, currency },
    });
  }

  try {
    console.log("🔑 Fetching PayPal access token...");
    const accessToken = await getPayPalAccessToken();
    console.log("✅ Access token retrieved:", accessToken ? "yes" : "no");

    console.log(`🌐 Fetching PayPal order ${orderId}...`);
    const paypalRes = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    console.log("🔍 PayPal API status:", paypalRes.status, paypalRes.statusText);

    if (!paypalRes.ok) {
      const errorText = await paypalRes.text();
      console.error("❌ PayPal lookup failed:", errorText);
      return res.status(500).json({ error: "PayPal lookup failed", details: errorText });
    } 

    const orderData = await paypalRes.json();
    console.log("📦 PayPal order data:", JSON.stringify(orderData, null, 2));

    // Extract details
    const status = orderData.status;
    const purchaseUnit = orderData.purchase_units?.[0];
    const paypalAmount = purchaseUnit?.amount?.value;
    const paypalCurrency = purchaseUnit?.amount?.currency_code;

    console.log("💰 Payment details from PayPal:", {
      status,
      paypalAmount,
      paypalCurrency,
      expectedAmount: amount,
      expectedCurrency: currency,
    });

    // Decide verification status
    let paymentStatus = "FAILED";
    console.log(amount)
  if (
  status === "COMPLETED" &&
  parseFloat(paypalAmount).toFixed(2) === parseFloat(amount).toFixed(2) &&
  paypalCurrency === currency
) {
  paymentStatus = "SUCCESS";
}

    console.log("📝 Updating Firestore with paymentStatus:", paymentStatus);
    const ordersRef = admin.firestore().collection("orders");
    const snapshot = await ordersRef.where("orderId", "==", orderId).get();

    if (snapshot.empty) {
      console.warn("⚠ No matching order found in Firestore for orderId:", orderId);
    } else {
      const batch = admin.firestore().batch();
      snapshot.forEach((doc) => {
        console.log(`📄 Updating doc ${doc.id} with status ${paymentStatus}`);
        batch.update(doc.ref, { paymentStatus });
      });
      await batch.commit();
      console.log("✅ Firestore updated successfully.");
    }

    return res.json({ verified: paymentStatus === "SUCCESS", paymentStatus });
  } catch (err) {
    console.error("💥 PayPal verification failed:", err);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
});