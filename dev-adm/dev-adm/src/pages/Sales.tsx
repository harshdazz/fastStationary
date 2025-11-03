"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  FileDown,
  TrendingUp,
  CheckCircle,
  Truck,
  PackageCheck,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
  updateDoc,
  doc,
} from "firebase/firestore";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  orderId: string;
  createdAt?: { seconds: number; nanoseconds: number };
  total: number;
  paymentStatus: string;
  status:
    | "pending"
    | "received"
    | "shipped"
    | "fulfilled"
    | "cancelled"
    | "completed";
  customerName: string;
  address: string;
  cartItems: CartItem[];
}

export default function AdminSales() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch all orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        const data: Order[] = snapshot.docs.map((docSnap) => {
          const raw = docSnap.data() as any;

          return {
            id: docSnap.id,
            orderId: raw.orderId,
            createdAt: raw.createdAt,
            total: raw.total || 0,
            paymentStatus: raw.paymentStatus || "unpaid",
            status: raw.status || "pending",
            customerName: raw.userData?.name || "Unknown",
            address: raw.userData
              ? `${raw.userData.address || ""}, ${raw.userData.city || ""}, ${
                  raw.userData.country || ""
                }`
              : "N/A",
            cartItems: raw.cartItems || [],
          };
        });

        setOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders by search term
  const filteredOrders = orders.filter((order) =>
    order.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Generate invoice PDF
  const generateInvoicePDF = (order: Order) => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("INVOICE", 20, 20);

    doc.setFontSize(12);
    doc.text(`Invoice ID: ${order.orderId}`, 20, 40);
    doc.text(
      `Date: ${
        order.createdAt?.seconds
          ? new Date(order.createdAt.seconds * 1000).toLocaleDateString()
          : "N/A"
      }`,
      20,
      50
    );
    doc.text(`Status: ${order.status.toUpperCase()}`, 20, 60);

    doc.text("Bill To:", 20, 80);
    doc.text(order.customerName || "Unknown Customer", 20, 90);
    doc.text(order.address || "No address provided", 20, 100);

    autoTable(doc, {
      head: [["Product", "Quantity", "Unit Price", "Total"]],
      body: order.cartItems.map((item) => [
        item.name,
        item.quantity.toString(),
        `$${item.price.toFixed(2)}`,
        `$${(item.price * item.quantity).toFixed(2)}`,
      ]),
      startY: 120,
      theme: "grid",
      headStyles: { fillColor: [139, 69, 199] },
    });

    doc.setFontSize(14);
    doc.text(
      `Total: $${order.total.toFixed(2)}`,
      150,
      (doc as any).lastAutoTable.finalY + 20
    );

    doc.save(`invoice_${order.orderId}.pdf`);

    toast({
      title: "Invoice Generated",
      description: `Invoice for ${order.customerName} has been downloaded.`,
    });
  };

  // Status badge styles
  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "completed":
      case "fulfilled":
        return "bg-success text-success-foreground";
      case "pending":
      case "received":
        return "bg-warning text-warning-foreground";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Update status in Firestore
  const updateOrderStatus = async (id: string, newStatus: Order["status"]) => {
    try {
      await updateDoc(doc(db, "orders", id), { status: newStatus });

      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? { ...order, status: newStatus } : order
        )
      );

      toast({
        title: "Status Updated",
        description: `Order #${id} updated to ${newStatus.toUpperCase()}.`,
      });
    } catch (err) {
      console.error("Error updating order:", err);
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    }
  };

  // Stats
  const totalRevenue = orders
    .filter(
      (order) => order.status === "completed" || order.status === "fulfilled"
    )
    .reduce((sum, order) => sum + order.total, 0);

  const pendingOrders = orders.filter(
    (order) => order.status === "pending" || order.status === "received"
  ).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Admin Sales Management
        </h1>
        <p className="text-muted-foreground text-lg mt-2">
          Track, update, and manage all customer orders
        </p>
      </div>

      {/* Stats */}
     

      {/* Orders Table */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Sales Orders</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground">
              Loading orders...
            </p>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order, index) => (
                    <TableRow
                      key={order.id}
                      className="border-border/50 hover:bg-muted/50 transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell className="font-medium">
                        #{order.orderId}
                      </TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell
                        className="max-w-xs truncate"
                        title={order.address}
                      >
                        {order.address}
                      </TableCell>
                      <TableCell className="font-semibold text-primary">
                        ${order.total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {order.createdAt?.seconds
                          ? new Date(
                              order.createdAt.seconds * 1000
                            ).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Select
                          onValueChange={(value) =>
                            updateOrderStatus(
                              order.id,
                              value as Order["status"]
                            )
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Update Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="received">
                              <CheckCircle className="h-4 w-4 inline mr-1" />
                              Received
                            </SelectItem>
                            <SelectItem value="shipped">
                              <Truck className="h-4 w-4 inline mr-1" />
                              Shipped
                            </SelectItem>
                            <SelectItem value="fulfilled">
                              <PackageCheck className="h-4 w-4 inline mr-1" />
                              Fulfilled
                            </SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateInvoicePDF(order)}
                          className="text-primary border-primary hover:bg-primary hover:text-primary-foreground"
                        >
                          <FileDown className="h-4 w-4 mr-1" />
                          Invoice
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
