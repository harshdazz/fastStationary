import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Featured from "./pages/Featured";
import Users from "./pages/Users";
import Banners from "./pages/Banners";
import Sales from "./pages/Sales";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthProvider";
import BottomSheetAuth from "./pages/Login";
import { WebflowProvider } from "./context/WebflowContext";
import { ProductProvider } from "./context/ProductContext";
import { FeaturedProvider } from "./context/FeaturedContext";
import ProductManagement from "./pages/AddProduct";
import EditProductPage from "./pages/EditProduct";
import AdminGetInTouch from "./pages/Getintouch";

const queryClient = new QueryClient();

const App = () => (
<QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <WebflowProvider>
        <ProductProvider>
<FeaturedProvider>

      <BrowserRouter>
        <Layout>
          <Routes>
             <Route path="/login" element={<BottomSheetAuth />} /> 
            {/* Public route (example) */}
            {/**/}

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route
              path="/featured"
              element={
                <ProtectedRoute>
                  <Featured />
                </ProtectedRoute>
              }
            />
             <Route
              path="/getintouch"
              element={
                <ProtectedRoute>
                  <AdminGetInTouch />
                </ProtectedRoute>
              }
            />
            <Route path="/editproduct/:id"    element={
                <ProtectedRoute>
                  <EditProductPage />
                </ProtectedRoute>
              } />
              <Route
              path="/add"
              element={
                <ProtectedRoute>
                  <ProductManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/banners"
              element={
                <ProtectedRoute>
                  <Banners />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sales"
              element={
                <ProtectedRoute>
                  <Sales />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
</FeaturedProvider>

        </ProductProvider>

        </WebflowProvider>

      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>

);

export default App;
