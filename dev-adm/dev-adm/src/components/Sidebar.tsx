import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Star, 
  Users, 
  Image, 
  TrendingUp, 
  Settings, 
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Featured', href: '/featured', icon: Star },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Banners', href: '/banners', icon: Image },
  { name: 'Sales', href: '/sales', icon: TrendingUp },
  { name: 'Popup Queries', href: '/getintouch', icon: Settings },
 

];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 z-50 h-full bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        isOpen ? "w-64" : "lg:w-16"
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
            {isOpen && (
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Admin Panel
              </h1>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 p-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                    onClick={() => setIsOpen(false)} 
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-sidebar-accent group",
                    isActive 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg" 
                      : "text-sidebar-foreground hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                    isActive && "text-sidebar-primary-foreground"
                  )} />
                  {isOpen && (
                    <span className="animate-fade-in">{item.name}</span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          {isOpen && (
            <div className="border-t border-sidebar-border p-4">
              <div className="text-xs text-sidebar-foreground/60">
                Admin Dashboard v1.0
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile toggle button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed top-4 left-4 z-40 lg:hidden",
          isOpen && "hidden"
        )}
      >
        <Menu className="h-5 w-5" />
      </Button>
    </>
  );
}