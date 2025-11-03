import React, { useState, useEffect, useRef } from "react";
import { Menu, X, Search, ShoppingBag, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useLoginModal } from "@/contexts/LoginModalContext";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  // State for UI elements
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // State for the login form
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });
  
  // Custom hooks for application state
  const { isLoginOpen, openLogin, closeLogin } = useLoginModal();
  const { cartItems } = useCart();
  // Destructure 'user', 'loading', and 'error' from AuthContext to manage UI
  const { user, loginOrSignup, error, loading, logout } = useAuth();
  
  // Hooks for DOM element references and navigation
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Effect to handle modal behavior with the browser's back button
  useEffect(() => {
    if (isLoginOpen) {
      window.history.pushState(null, "", window.location.href);
      const handlePopState = (e: PopStateEvent) => {
        closeLogin();
      };
      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, [isLoginOpen, closeLogin]);

  // --- FIX: This new useEffect hook is the core of the fix. ---
  // It listens for a change in the 'user' state. When 'user' becomes populated
  // (i.e., a successful login has occurred) and the login modal is open,
  // it triggers the `closeLogin` function to close the modal. This is
  // a reliable way to handle the asynchronous nature of the login process.
  useEffect(() => {
    if (user && isLoginOpen) {
      closeLogin();
      // Optional: Clear the form fields after successful login
      setLoginForm({ email: "", password: "" }); 
    }
  }, [user, isLoginOpen, closeLogin]);
  // ----------------------------------------------------------------------

  // Effect for scrolling behavior
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Effects to handle search bar expansion and closing
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchExpanded(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSearchExpanded(false);
      }
    };
    if (isSearchExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isSearchExpanded]);

  useEffect(() => {
    if (isSearchExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchExpanded]);

  const handleSearchClick = () => {
    if (window.innerWidth >= 1280) { // xl breakpoint
      setIsSearchExpanded(true);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchValue);
  };

  // --- FIX: The `handleLoginSubmit` function no longer needs to check for `!error`. ---
  // The new `useEffect` hook now handles the closing of the modal after the state updates.
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginOrSignup(loginForm.email, loginForm.password);
  };

  const handleInputChange = (field: string, value: string) => {
    setLoginForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Navigation items for the menu
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
          {/* Logo Container - Perfectly centered */}
          <div className={`flex items-center transition-all duration-500 ease-out ml-2 md:ml-2 ipad:ml-4 xl:ml-4 lg:-ml-2 ${
            isSearchExpanded ? "opacity-0 scale-95 absolute left-4" : "opacity-100 scale-100"
          }`}>
            <img 
              src="/logo.png" 
              alt="FastStationary Logo" 
              className="h-10 sm:h-12 ipad:h-14 w-auto object-contain block"
            />
          </div>

          {/* Desktop Navigation - Hidden when search is expanded */}
          <div className={`hidden xl:flex items-center space-x-6 transition-all duration-500 ease-out ${
            isSearchExpanded ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
          }`}>
            {navItems.map((item) => (
              <a
                key={item.name}
                onClick={()=>{navigate(item.href)}}
                className="text-foreground hover:text-primary transition-colors duration-300 font-medium text-base px-3"
              >
                {item.name}
              </a>
            ))}
            <div className="flex flex-row gap-2"> 
              <Button onClick={() => {
                setIsMenuOpen(false)
                navigate("/track-order");
              }}> 
                <p className="text-lg font-medium">Track order</p>
              </Button>
              {user && (
                <Button variant="ghost" onClick={() => logout()}>
                  <p className="text-lg font-medium">Logout</p>
                </Button>
              )}
            </div>
          </div>

          {/* Desktop Actions - Hidden when search is expanded */}
          <div className={`hidden xl:flex items-center space-x-3 transition-all duration-500 ease-out ${
            isSearchExpanded ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
          }`}>
            <Dialog open={isLoginOpen} onOpenChange={(open) => (open ? openLogin() : closeLogin())}>
              <DialogTrigger asChild>
                {!user? <Button variant="ghost" size="icon" onClick={openLogin}>
                  <User className="w-5 h-5" />
                </Button>:""}
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md mx-4 sm:mx-auto">
                <DialogHeader className="pb-4">
                  <DialogTitle className="text-xl sm:text-2xl font-bold text-center text-gradient">
                    Welcome Back
                  </DialogTitle>
                </DialogHeader>
                <div className="text-center mb-4">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    If no account with the email is found an account will be automatically created.
                  </span>
                </div>
                <form onSubmit={handleLoginSubmit} className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={loginForm.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="pl-10 h-11 sm:h-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className="pl-10 pr-10 h-11 sm:h-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      variant="link"
                      className="text-sm text-primary hover:text-primary-dark"
                    >
                      Forgot password?
                    </Button>
                  </div>
                  {/* The login button is disabled while the auth loading state is true */}
                  <Button 
                    type="submit" 
                    className="w-full btn-primary h-11 sm:h-10 text-sm sm:text-base"
                    disabled={loading}
                  >
                    {/* The button text changes to show a loading state */}
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>
                  {/* An error message is displayed if the auth error state is set */}
                  {error && (
                    <div className="mt-3 px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg shadow-sm animate-fade-in">
                      {error}
                    </div>
                  )}
                </form>
              </DialogContent>
            </Dialog>
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover-scale relative"
              onClick={() => navigate('/cart')}
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItems?.length || 0}
              </span>
            </Button>
          </div>

          {/* Mobile/Tablet Actions - Always visible, no search expansion */}
          <div className="flex items-center space-x-2 xl:hidden">
            <Dialog open={isLoginOpen} onOpenChange={(open) => (open ? openLogin() : closeLogin())}>
              <DialogTrigger asChild>
                {!user? <Button variant="ghost" size="icon" onClick={openLogin}>
                  <User className="w-5 h-5" />
                </Button>:""}
              </DialogTrigger>
              <DialogContent
                className="sm:max-w-md"
                onInteractOutside={(e) => e.preventDefault()}
              >
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-center text-gradient">
                    Welcome Back
                  </DialogTitle>
                </DialogHeader>
                <div className="text-center">
                  <span className="text-sm text-muted-foreground">
                    If no account with the email is found an account will be automatically created.
                  </span>
                </div>
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-mobile" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="email-mobile"
                        type="email"
                        placeholder="Enter your email"
                        value={loginForm.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-mobile" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="password-mobile"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      variant="link"
                      className="text-sm text-primary hover:text-primary-dark"
                    >
                      Forgot password?
                    </Button>
                  </div>
                  {/* The login button is disabled while the auth loading state is true */}
                  <Button 
                    type="submit" 
                    className="w-full btn-primary h-11 sm:h-10 text-sm sm:text-base"
                    disabled={loading}
                  >
                    {/* The button text changes to show a loading state */}
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>
                  {/* An error message is displayed if the auth error state is set */}
                  {error && (
                    <div className="mt-3 px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg shadow-sm animate-fade-in">
                      {error}
                    </div>
                  )}
                </form>
              </DialogContent>
            </Dialog>
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover-scale relative"
              onClick={() => navigate('/cart')}
            >
              <ShoppingBag className="w-5 h-5 ipad:w-6 ipad:h-6" />
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 ipad:w-5 ipad:h-5 flex items-center justify-center text-[10px] ipad:text-xs">
                {cartItems?.length || 0}
              </span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="ipad:w-12 ipad:h-12"
            >
              {isMenuOpen ? <X className="w-6 h-6 ipad:w-7 ipad:h-7" /> : <Menu className="w-6 h-6 ipad:w-7 ipad:h-7" />}
            </Button>
          </div>
        </div>

        {/* Mobile/Tablet menu - Always visible when menu is open */}
        { isMenuOpen && (
          <div className="xl:hidden animate-slide-in">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-background border-t border-border">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.href);
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-3 ipad:py-4 text-base ipad:text-lg font-medium text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors duration-300"
                >
                  {item.name}
                </button>
              ))}
              <div className="flex flex-col gap-2"> 
                <Button onClick={() => {
                  setIsMenuOpen(false)
                  navigate("/track-order");
                }}> 
                  <p className="text-lg font-medium">Track order</p>
                </Button>
                {user && (
                  <Button variant="ghost" onClick={() => logout()}>
                    <p className="text-lg font-medium">Logout</p>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
