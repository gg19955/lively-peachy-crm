import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Home, Users, Building, Zap, BarChart3, LogOut, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Contacts", href: "/contacts", icon: Users },
  { name: "Leads", href: "/leads", icon: Zap },
  { name: "Google Sheets", href: "/google-sheets", icon: RefreshCw },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <div className="hidden lg:flex w-64 bg-white dark:bg-gray-900 shadow-sm border-r border-gray-200 dark:border-gray-700 flex-col h-full">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100" data-testid="text-app-title">PropertyCRM</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Property Management</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                  isActive
                    ? "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                    : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/50"
                )}
                data-testid={`link-${item.name.toLowerCase()}`}
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
          className="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/50"
          data-testid="link-performance-centre"
        >
          <BarChart3 className="w-5 h-5 mr-3" />
          Performance Centre
        </a>
        
        {/* Prop Performance Centre External Link */}
        <a 
          href="https://property-graphs.replit.app" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/50"
          data-testid="link-prop-performance-centre"
        >
          <Building className="w-5 h-5 mr-3" />
          Prop Performance Centre
        </a>
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-3">
          <img
            src={(user as any)?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64"}
            alt="User profile"
            className="w-10 h-10 rounded-full object-cover"
            data-testid="img-user-avatar"
          />
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100" data-testid="text-user-name">
              {(user as any)?.firstName && (user as any)?.lastName 
                ? `${(user as any).firstName} ${(user as any).lastName}` 
                : (user as any)?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Property Manager</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => window.location.href = '/api/logout'}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
