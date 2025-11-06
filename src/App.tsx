import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import Categories from "./pages/Categories";
import Cart from "./pages/Cart";
import NotFound from "./pages/NotFound";
import { WebflowProvider } from "@/contexts/WebflowContext";
import { LoginModalProvider } from "./contexts/LoginModalContext";
import ProductPage from "./pages/ProductPage";
import About from "./pages/About";
import { AuthProvider } from "./contexts/AuthContext";
import ContactUs from "./pages/Contact";
import CategoryPage from "./pages/Category";
import ScrollToTop from "./components/ScrollToTop";
import Checkout from "./pages/Checkout";  // ✅ changed from PayPalCheckout
import AllProductsPage from "./pages/Allproducts";
import MyOrders from "./pages/Myorder";
import TrackOrder from "./pages/TrackOrder";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ShippingPolicy from "./pages/ShippingPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import { ProductProvider } from "./contexts/ProductContext";
import { ToastProvider } from "./components/ui/toast";
import PaymentStatus from "./pages/paymentStatus";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <WebflowProvider>
        <ProductProvider>
          <LoginModalProvider>
            <CartProvider>
              <TooltipProvider>
                <ToastProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <ScrollToTop />
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/categories" element={<Categories />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<ContactUs />} />
                      <Route path="/category/:category" element={<CategoryPage />} />
                      <Route path="/checkout" element={<Checkout />} /> {/* ✅ new PhonePe checkout */}
                      <Route path="/product" element={<AllProductsPage />} />
                      <Route path="/orders" element={<MyOrders />} />
                      <Route path="/track-order" element={<TrackOrder />} />
                      <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                      <Route path="/shipping-policy" element={<ShippingPolicy />} />
                      <Route path="/refund-policy" element={<RefundPolicy />} />
                      <Route path="/product/:id" element={<ProductPage />} />
                      <Route path="/payment-status" element={<PaymentStatus />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </ToastProvider>
              </TooltipProvider>
            </CartProvider>
          </LoginModalProvider>
        </ProductProvider>
      </WebflowProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
