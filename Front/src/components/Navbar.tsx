import React, { useState, useEffect } from "react";
import { Menu, X, ShoppingBag, User, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useLoginModal } from "@/contexts/LoginModalContext";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  const { isLoginOpen, openLogin, closeLogin } = useLoginModal();
  const { cartItems } = useCart();
  const { user, login, logout, error, loading } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (user && isLoginOpen) {
      closeLogin();
      setLoginForm({ email: "", password: "" });
    }
  }, [user, isLoginOpen, closeLogin]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(loginForm.email, loginForm.password);
  };

  const handleInputChange = (field: string, value: string) => {
    setLoginForm((prev) => ({ ...prev, [field]: value }));
  };

  const navItems = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "My Orders", href: "/orders" },
    { name: "Product", href: "/product" },
    { name: "Contact Us", href: "/contact" },
  ];

  return (
    <nav className={`nav-fixed ${isScrolled ? "shadow-elegant" : ""}`}>
      <div className="container mx-auto px-1">
        <div className="flex items-center justify-between py-1">
          {/* Logo */}
          <div className="flex items-center ml-2">
            <img
              src="/logo.png"
              alt="FastStationary Logo"
              className="h-10 sm:h-12 ipad:h-14 w-auto object-contain block"
            />
          </div>

          {/* Desktop Nav */}
          <div className="hidden xl:flex items-center space-x-6">
            {navItems.map((item) => (
              <a
                key={item.name}
                onClick={() => navigate(item.href)}
                className="text-foreground hover:text-primary transition-colors duration-300 font-medium text-base px-3 cursor-pointer"
              >
                {item.name}
              </a>
            ))}
            {user && (
              <Button variant="ghost" onClick={logout}>
                <p className="text-lg font-medium">Logout</p>
              </Button>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden xl:flex items-center space-x-3">
            <Dialog
              open={isLoginOpen}
              onOpenChange={(open) => (open ? openLogin() : closeLogin())}
            >
              <DialogTrigger asChild>
                {!user && (
                  <Button variant="ghost" size="icon" onClick={openLogin}>
                    <User className="w-5 h-5" />
                  </Button>
                )}
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md mx-auto bg-white rounded-xl shadow-xl">
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-semibold mb-1">Welcome Back</h2>
                    <p className="text-sm text-gray-500">
                      Login to your account
                    </p>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={loginForm.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={loginForm.password}
                          onChange={(e) =>
                            handleInputChange("password", e.target.value)
                          }
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Signing In..." : "Login"}
                    </Button>

                    {error && (
                      <p className="text-sm text-red-500 text-center mt-2">
                        {error}
                      </p>
                    )}
                  </form>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="ghost"
              size="icon"
              className="hover-scale relative"
              onClick={() => navigate("/cart")}
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItems?.length || 0}
              </span>
            </Button>
          </div>

          {/* Mobile/Tablet Actions */}
          <div className="flex items-center space-x-2 xl:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="hover-scale relative"
              onClick={() => navigate("/cart")}
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {cartItems?.length || 0}
              </span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="xl:hidden animate-slide-in">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-background border-t border-border">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.href);
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-3 text-base font-medium text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors duration-300"
                >
                  {item.name}
                </button>
              ))}
              {user && (
                <Button variant="ghost" onClick={logout}>
                  <p className="text-lg font-medium">Logout</p>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
