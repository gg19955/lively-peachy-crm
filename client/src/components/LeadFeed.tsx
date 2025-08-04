import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Clock, 
  Plus, 
  ArrowRight, 
  MapPin, 
  User,
  Calendar,
  CheckCircle,
  FileText
} from "lucide-react";
import { type Lead } from "@shared/schema";

interface ActivityItem {
  id: string;
  type: 'lead_created' | 'stage_changed' | 'lead_updated';
  leadId: string;
  userId: string;
  userName: string;
  propertyAddress: string;
  fromStage?: string;
  toStage?: string;
  timestamp: string;
  details?: string;
}

const stageDisplayNames = {
  inquiry: 'Inquiry',
  meeting_booked: 'Meeting Booked',
  proposal_sent: 'Proposal Sent',
  contract_sent: 'Contract Sent',
  signed: 'Contract Signed',
  closed: 'Closed',
};

const activityIcons = {
  lead_created: Plus,
  stage_changed: ArrowRight,
  lead_updated: FileText,
};

const stageColors = {
  inquiry: 'text-blue-600 dark:text-blue-400',
  meeting_booked: 'text-yellow-600 dark:text-yellow-400',
  signed: 'text-green-600 dark:text-green-400',
  closed: 'text-gray-600 dark:text-gray-400',
};

export default function LeadFeed() {
  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  // Fetch user details for proper names
  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
    enabled: leads.length > 0,
  });

  // Generate activity feed from leads data
  // In a real implementation, this would come from a dedicated activity log table
  const generateActivityFeed = (leads: Lead[]): ActivityItem[] => {
    const activities: ActivityItem[] = [];
    
    // Helper function to get user name
    const getUserName = (userId: string | null) => {
      if (!userId || !users.length) return 'Guss McSmith';
      const user = users.find((u: any) => u.id === userId);
      if (user) {
        return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Guss McSmith';
      }
      return 'Guss McSmith';
    };
    
    leads.forEach((lead) => {
      // Add lead creation activity
      if (lead.createdAt) {
        activities.push({
          id: `created-${lead.id}`,
          type: 'lead_created',
          leadId: lead.id,
          userId: lead.createdBy || 'system',
          userName: getUserName(lead.createdBy),
          propertyAddress: lead.propertyAddress || 'Unknown Address',
          timestamp: typeof lead.createdAt === 'string' ? lead.createdAt : lead.createdAt.toISOString(),
        });
      }

      // Add stage change activity (simulated)
      if (lead.stage && lead.stage !== 'inquiry' && lead.updatedAt) {
        activities.push({
          id: `stage-${lead.id}`,
          type: 'stage_changed',
          leadId: lead.id,
          userId: lead.createdBy || 'system',
          userName: getUserName(lead.createdBy),
          propertyAddress: lead.propertyAddress || 'Unknown Address',
          fromStage: 'inquiry',
          toStage: lead.stage,
          timestamp: typeof lead.updatedAt === 'string' ? lead.updatedAt : lead.updatedAt.toISOString(),
        });
      }
    });

    // Sort by timestamp (newest first)
    return activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 20); // Show last 20 activities
  };

  const activities = generateActivityFeed(leads);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getActivityMessage = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'lead_created':
        return (
          <span>
            <span className="font-medium">{activity.userName}</span> added a new lead for{' '}
            <span className="font-medium text-blue-600">{activity.propertyAddress}</span>
          </span>
        );
      case 'stage_changed':
        return (
          <span>
            <span className="font-medium">{activity.userName}</span> moved{' '}
            <span className="font-medium text-blue-600">{activity.propertyAddress}</span> from{' '}
            <Badge variant="outline" className="mx-1">
              {activity.fromStage && stageDisplayNames[activity.fromStage as keyof typeof stageDisplayNames] || activity.fromStage}
            </Badge>
            to{' '}
            <Badge variant="outline" className="mx-1">
              {activity.toStage && stageDisplayNames[activity.toStage as keyof typeof stageDisplayNames] || activity.toStage}
            </Badge>
            {activity.toStage === 'signed' && (
              <span className="text-green-600 font-medium"> - Contract sent!</span>
            )}
          </span>
        );
      case 'lead_updated':
        return (
          <span>
            <span className="font-medium">{activity.userName}</span> updated details for{' '}
            <span className="font-medium text-blue-600">{activity.propertyAddress}</span>
          </span>
        );
      default:
        return `${activity.userName} performed an action`;
    }
  };

  const getActivityIcon = (activity: ActivityItem) => {
    const IconComponent = activityIcons[activity.type];
    let iconColor = 'text-gray-500';
    
    if (activity.type === 'lead_created') iconColor = 'text-green-500';
    if (activity.type === 'stage_changed') {
      if (activity.toStage === 'signed') iconColor = 'text-green-500';
      else if (activity.toStage === 'meeting_booked') iconColor = 'text-yellow-500';
      else iconColor = 'text-blue-500';
    }
    
    return <IconComponent className={`h-4 w-4 ${iconColor}`} />;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Lead Activity Feed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-4 animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Lead Activity Feed</CardTitle>
            <Badge variant="secondary" className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              {activities.length} recent activities
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-700 dark:text-gray-300">No recent activity</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Lead activities will appear here as they happen</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex-shrink-0">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                        {activity.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getActivityIcon(activity)}
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {getActivityMessage(activity)}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-4">
                        {formatTimeAgo(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}