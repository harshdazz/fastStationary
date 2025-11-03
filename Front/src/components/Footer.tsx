import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center">
              <img 
                src="/logo-with-bg.png" 
                alt="FastStationary Logo" 
                className="w-32 h-19 md:w-36 md:h-19 lg:w-19 lg:h-19 object-contain block"
              />
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed mt-0">
              ADITI ENTERPRISE - Distinguished player in the stationery industry, specializing in high-quality stationery items for educational institutions, offices, and retail markets. Based in Ahmedabad, Gujarat.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="icon" className="hover:bg-primary-light/20">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-primary-light/20">
                <Instagram className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-primary-light/20">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-primary-light/20">
                <Linkedin className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Get in Touch - Right Side */}
          <div className="md:text-right md:flex md:flex-col md:justify-start">
            <h3 className="text-lg font-semibold mb-4">Get in Touch</h3>
            <div className="space-y-4 mb-6">
              <div className="flex items-start space-x-3 md:justify-end">
                <MapPin className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                <div className="text-primary-foreground/80 text-sm text-left md:text-right">
                  <div className="font-medium">ADITI ENTERPRISE</div>
                  <div>FF122 SHREE TAPASVI ICON</div>
                  <div>HATHIJAN AHMEDABAD GUJARAT 382449</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 md:justify-end">
                <Phone className="w-4 h-4 text-secondary flex-shrink-0" />
                <span className="text-primary-foreground/80 text-sm">+918200672272</span>
              </div>
              <div className="flex items-center space-x-3 md:justify-end">
                <Mail className="w-4 h-4 text-secondary flex-shrink-0" />
                <span className="text-primary-foreground/80 text-sm">faststationary0@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-light/30 mt-6 pt-4">
          {/* Policy Links */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-4">
            <Link 
              to="/terms-and-conditions" 
              className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors"
            >
              Terms and Conditions
            </Link>
            <Link 
              to="/privacy-policy" 
              className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/shipping-policy" 
              className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors"
            >
              Shipping Policy
            </Link>
            <Link 
              to="/refund-policy" 
              className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors"
            >
              Refund/Cancellation Policy
            </Link>
          </div>
          
          <div className="text-center">
            <p className="text-primary-foreground/60 text-sm">
              © {currentYear} FastStationary. All rights reserved. 
            </p>
            <p className="text-primary-foreground/40 text-xs mt-2 flex items-center justify-center gap-1">
              Made with <Heart className="w-3 h-3 fill-red-500 text-red-500" /> <a href="https://www.qikkspace.com" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/60 hover:text-primary-foreground/80 transition-colors">Qikk space</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;