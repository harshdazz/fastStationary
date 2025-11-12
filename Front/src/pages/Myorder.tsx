import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import Navbar from "@/components/Navbar";

const MyOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchOrders = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "orders"),
          where("userEmail", "==", user.email)
        );
        const querySnapshot = await getDocs(q);

        const fetchedOrders = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading your orders...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6 text-center">My Orders</h1>

        {orders.length === 0 ? (
          <p className="text-gray-600 text-center">You have no orders yet.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-100"
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="font-semibold text-lg">
                      Order ID: <span className="font-mono text-indigo-600">{order.orderId}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Placed on {new Date(order.createdAt?.seconds * 1000).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      order.status === "COMPLETED"
                        ? "bg-green-100 text-green-600"
                        : order.status === "FAILED"
                        ? "bg-red-100 text-red-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {order.status || "Pending"}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold mb-2 text-gray-800">Items</h3>
                  <div className="space-y-2">
                    {order.items?.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between text-sm text-gray-700"
                      >
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between font-semibold mt-4">
                    <span>Total Amount:</span>
                    <span>₹{order.amount}</span>
                  </div>

                  {order.transactionId && (
                    <p className="text-xs text-gray-500 mt-2">
                      Transaction ID: {order.transactionId}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
