import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, Users, Zap, BarChart3, RefreshCw, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Contacts", href: "/contacts", icon: Users },
  { name: "Leads", href: "/leads", icon: Zap },
  { name: "Google Sheets", href: "/google-sheets", icon: RefreshCw },
];

export default function MobileNav() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost" 
          size="sm"
          className="lg:hidden"
          data-testid="button-mobile-menu"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex flex-col h-full bg-white dark:bg-gray-900">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">PropertyCRM</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Property Management</p>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                      isActive
                        ? "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                        : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/50"
                    )}
                    onClick={() => setOpen(false)}
                    data-testid={`mobile-link-${item.name.toLowerCase()}`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
            
            {/* Performance Centre External Link */}
            <a 
              href="https://sheet-grapher-guss5.replit.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors cursor-pointer text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/50"
              onClick={() => setOpen(false)}
              data-testid="mobile-link-performance-centre"
            >
              <BarChart3 className="w-5 h-5 mr-3" />
              Performance Centre
            </a>
          </nav>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {user && (
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                    {((user as any).firstName || (user as any).email || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {(user as any).firstName && (user as any).lastName ? `${(user as any).firstName} ${(user as any).lastName}` : (user as any).email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {(user as any).email}
                  </p>
                </div>
              </div>
            )}
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => {
                window.location.href = "/api/logout";
              }}
              data-testid="button-mobile-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}