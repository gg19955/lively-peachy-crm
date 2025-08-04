import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Zap, Building, TrendingUp } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";

export default function StatsCards() {
  const { toast } = useToast();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-lg w-8 h-8 sm:w-10 sm:h-10"></div>
                <div className="ml-3 sm:ml-4 flex-1">
                  <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                  <div className="h-5 sm:h-6 bg-gray-200 dark:bg-gray-600 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: "Total Contacts",
      value: (stats as any)?.totalContacts || 0,
      icon: Users,
      color: "blue" as const,
    },
    {
      title: "Active Leads",
      value: (stats as any)?.activeLeads || 0,
      icon: Zap,
      color: "green" as const,
    },
    {
      title: "Properties",
      value: (stats as any)?.properties || 0,
      icon: Building,
      color: "yellow" as const,
    },
    {
      title: "This Month",
      value: (stats as any)?.thisMonth || 0,
      icon: TrendingUp,
      color: "purple" as const,
    },
  ];

  const colorClasses = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    yellow: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
    purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {statsData.map((stat) => (
        <Card key={stat.title} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${colorClasses[stat.color]}`}>
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">{stat.title}</p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100" data-testid={`text-${stat.title.toLowerCase().replace(' ', '-')}`}>
                  {stat.value.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
