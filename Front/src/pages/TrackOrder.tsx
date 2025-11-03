import { useState } from "react";
import { Search, Package, Truck, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface TrackingStatus {
  id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  location: string;
  description: string;
}

interface OrderDetails {
  orderId: string;
  customerName: string;
  email: string;
  phone: string;
  totalAmount: number;
  orderDate: string;
  estimatedDelivery: string;
  currentStatus: string;
  trackingHistory: TrackingStatus[];
}

const TrackOrder = () => {
  const [trackingId, setTrackingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [error, setError] = useState("");

  // Mock tracking data - replace with actual API call
  const mockOrderData: { [key: string]: OrderDetails } = {
    "ORD123456": {
      orderId: "ORD123456",
      customerName: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      totalAmount: 1250.00,
      orderDate: "2024-01-15",
      estimatedDelivery: "2024-01-25",
      currentStatus: "shipped",
      trackingHistory: [
        {
          id: "1",
          status: "pending",
          date: "2024-01-15",
          location: "New Delhi, India",
          description: "Order placed and payment confirmed"
        },
        {
          id: "2",
          status: "processing",
          date: "2024-01-16",
          location: "New Delhi, India",
          description: "Order is being processed and prepared for shipment"
        },
        {
          id: "3",
          status: "shipped",
          date: "2024-01-18",
          location: "Mumbai, India",
          description: "Package has been shipped and is in transit"
        }
      ]
    }
  };

  const handleTrackOrder = async () => {
    if (!trackingId.trim()) {
      setError("Please enter a tracking ID");
      return;
    }

    setLoading(true);
    setError("");
    setOrderDetails(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const order = mockOrderData[trackingId.toUpperCase()];
      if (order) {
        setOrderDetails(order);
      } else {
        setError("Tracking ID not found. Please check your tracking ID and try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'shipped':
        return 'text-purple-600 bg-purple-100';
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-4">Track Your Order</h1>
            <p className="text-gray-600 text-lg">
              Enter your tracking ID to get real-time updates on your order status
            </p>
          </div>

          {/* Tracking Input */}
          <Card className="max-w-2xl mx-auto mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Enter Tracking ID
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  type="text"
                  placeholder="Enter your tracking ID (e.g., ORD123456)"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleTrackOrder()}
                />
                <Button 
                  onClick={handleTrackOrder} 
                  disabled={loading}
                  className="px-8"
                >
                  {loading ? "Tracking..." : "Track Order"}
                </Button>
              </div>
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
            </CardContent>
          </Card>

          {/* Order Details */}
          {orderDetails && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Current Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(orderDetails.currentStatus)}
                    Current Status: <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(orderDetails.currentStatus)}`}>
                      {orderDetails.currentStatus.charAt(0).toUpperCase() + orderDetails.currentStatus.slice(1)}
                    </span>
                  </CardTitle>
                </CardHeader>
              </Card>

              {/* Tracking History */}
              <Card>
                <CardHeader>
                  <CardTitle>Tracking History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orderDetails.trackingHistory.map((status, index) => (
                      <div key={status.id} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          {getStatusIcon(status.status)}
                          {index < orderDetails.trackingHistory.length - 1 && (
                            <div className="w-px h-8 bg-gray-300 mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status.status)}`}>
                              {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                            </span>
                            <span className="text-sm text-gray-500">{new Date(status.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{status.description}</p>
                          <p className="text-xs text-gray-500">{status.location}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Help Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    If you have any questions about your order or need assistance, please contact our customer support.
                  </p>
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => window.location.href = "/contact"}>
                      Contact Support
                    </Button>
                    <Button asChild variant="outline">
  <a href="https://wa.link/3y9hea" target="_blank" rel="noopener noreferrer">
    WhatsApp Support
  </a>
</Button>

                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Sample Tracking IDs */}
          {!orderDetails && (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Sample Tracking ID</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  For testing purposes, you can use this sample tracking ID:
                </p>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <code className="text-sm font-mono">ORD123456</code>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This is a demo tracking ID. In a real application, you would receive your tracking ID via email after placing an order.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TrackOrder;
