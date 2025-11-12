import { useEffect, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";

const Checkout = () => {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { user, userData } = useAuth();

  // User form state (with address)
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (userData) {
      setUserDetails((prev) => ({ ...prev, ...userData }));
    }
  }, [userData]);

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // ✅ Local Emulator URL — change project ID if needed
  const FIREBASE_FUNCTION_URL =
    "http://127.0.0.1:5001/fir-admin-d1ae6/us-central1/api";
  const handlePayment = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some items before checkout.",
        variant: "destructive",
      });
      return;
    }

    if (
      !userDetails.name ||
      !userDetails.email ||
      !userDetails.phone ||
      !userDetails.address
    ) {
      toast({
        title: "Missing details",
        description: "Please fill in all your details.",
        variant: "destructive",
      });
      return;
    }

    if (!/^\d{10}$/.test(userDetails.phone)) {
      toast({
        title: "Invalid phone",
        description: "Please enter a valid 10-digit phone number.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const orderId = `ORD_${Date.now()}`;

      // ✅ Save order to Firestore (so admin sees it)
      const orderRef = doc(db, "orders", orderId);
      const orderPayload = {
        amount: totalAmount,
        items: cartItems,
        name: userDetails.name,
        email: userDetails.email,
        phone: userDetails.phone,
        address: userDetails.address,
        userId: user?.uid || `ANON_${Date.now()}`,
        status: "pending",
        createdAt: serverTimestamp(),
        paymentStatus: "unpaid",
        orderId,
      };

      await setDoc(orderRef, orderPayload);

      // ✅ Call Firebase Function (local or deployed)
      const body = {
        amount: totalAmount,
        orderId,
        userId: user?.uid || orderPayload.userId,
        userPhone: userDetails.phone,
        userName: userDetails.name,
        userEmail: userDetails.email,
        redirectUrl: `${window.location.origin}/payment-status?orderId=${orderId}`,
      };

      console.log("Payment Request Body:", body);

      const response = await fetch(`${FIREBASE_FUNCTION_URL}/createPayment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log("Payment Response:", data);

      if (data.success && data.paymentUrl) {
        toast({
          title: "Redirecting to PhonePe...",
          description: "Please complete your payment on the PhonePe page.",
        });

        clearCart();

        setTimeout(() => {
          window.location.href = data.paymentUrl;
        }, 1000);
      } else {
        await setDoc(
          orderRef,
          { paymentStatus: "failed", status: "pending" },
          { merge: true }
        );

        toast({
          title: "Payment Initiation Failed",
          description: data?.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Payment/Error saving order:", err);
      toast({
        title: "Error",
        description: "Unable to process order or connect to payment server.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      {/* Order Summary */}
      <div className="border rounded-lg p-6 mb-6 bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        {cartItems.length === 0 ? (
          <p className="text-gray-500">Your cart is empty</p>
        ) : (
          <>
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between mb-3 pb-3 border-b">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <span className="font-semibold">₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div className="pt-3 flex justify-between text-lg font-bold">
              <span>Total Amount</span>
              <span className="text-indigo-600">₹{totalAmount}</span>
            </div>
          </>
        )}
      </div>

      {/* User Details */}
      <div className="border rounded-lg p-6 mb-6 bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Your Details</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name *</label>
            <input
              type="text"
              value={userDetails.name}
              onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })}
              placeholder="Enter your full name"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <input
              type="email"
              value={userDetails.email}
              onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
              placeholder="your.email@example.com"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Phone Number *</label>
            <input
              type="tel"
              value={userDetails.phone}
              onChange={(e) =>
                setUserDetails({ ...userDetails, phone: e.target.value.replace(/\D/g, "") })
              }
              placeholder="9999999999"
              maxLength={10}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">10 digit mobile number</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Address *</label>
            <textarea
              value={userDetails.address}
              onChange={(e) => setUserDetails({ ...userDetails, address: e.target.value })}
              placeholder="House number, street, city, state, pincode"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={3}
              required
            />
          </div>
        </div>
      </div>

      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={loading || cartItems.length === 0}
        className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                clipRule="evenodd"
              />
            </svg>
            Pay ₹{totalAmount} with PhonePe
          </>
        )}
      </button>

      <p className="text-center text-sm text-gray-500 mt-4">
        Secure payment powered by PhonePe
      </p>
    </div>
  );
};

export default Checkout;
