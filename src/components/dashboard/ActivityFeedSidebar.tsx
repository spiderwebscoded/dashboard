import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  MessageSquare, 
  X,
  ChevronDown
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  FolderKanban, 
  Users, 
  Briefcase,
  Clock
} from 'lucide-react';
import { getProjects } from '@/services/projectService';
import { getProjectTasks } from '@/services/projectTaskService';
import { getTeamMembers } from '@/services/teamService';
import { getClients } from '@/services/clientService';
import { cn } from '@/lib/utils';

interface ActivityFeedSidebarProps {
  className?: string;
}

interface ActivityItem {
  id: string;
  type: 'task' | 'project' | 'team' | 'client';
  action: 'created' | 'completed' | 'updated' | 'commented' | 'added_file';
  title: string;
  user?: string;
  timestamp: string;
  avatar?: string;
}

const ActivityFeedSidebar: React.FC<ActivityFeedSidebarProps> = ({ className }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { data: tasks = [] } = useQuery({
    queryKey: ['all-tasks'],
    queryFn: () => getProjectTasks(),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: getTeamMembers,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });

  // Build activity items from all data sources
  const activities: ActivityItem[] = [
    ...tasks.slice(0, 3).map(t => ({
      id: t.id,
      type: 'task' as const,
      action: t.completed ? 'completed' as const : 'created' as const,
      title: t.title,
      user: 'You',
      timestamp: t.updated_at || t.created_at,
    })),
    ...projects.slice(0, 2).map(p => ({
      id: p.id,
      type: 'project' as const,
      action: 'created' as const,
      title: p.title,
      user: 'You',
      timestamp: p.created_at || new Date().toISOString(),
    })),
    ...teamMembers.slice(0, 2).map(m => ({
      id: m.id,
      type: 'team' as const,
      action: 'commented' as const,
      title: `${m.name} joined the team`,
      user: m.name,
      timestamp: m.created_at || new Date().toISOString(),
      avatar: m.avatar,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6);

  const getIcon = (type: string, action: string) => {
    if (action === 'completed') return CheckCircle2;
    if (action === 'commented') return MessageSquare;
    if (action === 'added_file') return Paperclip;
    
    switch (type) {
      case 'task':
        return CheckCircle2;
      case 'project':
        return FolderKanban;
      case 'team':
        return Users;
      case 'client':
        return Briefcase;
      default:
        return Clock;
    }
  };

  const getIconColor = (type: string, action: string) => {
    if (action === 'completed') return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/20';
    
    switch (type) {
      case 'task':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'project':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      case 'team':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'client':
        return 'text-pink-600 bg-pink-100 dark:bg-pink-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  if (isCollapsed) {
    return (
      <div className={cn("fixed right-4 top-1/2 -translate-y-1/2 z-50", className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCollapsed(false)}
          className="rounded-full shadow-lg"
        >
          Activity
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-fit max-h-[calc(100vh-200px)] flex flex-col",
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white">Activity</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(true)}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Activity Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activities.map((activity) => {
          const Icon = getIcon(activity.type, activity.action);
          const iconColor = getIconColor(activity.type, activity.action);

          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="relative">
                {activity.avatar ? (
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={activity.avatar} alt={activity.user} />
                    <AvatarFallback className="text-xs">
                      {activity.user?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className={cn("h-7 w-7 rounded-full flex items-center justify-center", iconColor)}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white font-medium leading-tight">
                  {activity.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {activity.user} • {formatTime(activity.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityFeedSidebar;

