import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  CheckCircle2, 
  FolderKanban, 
  Users, 
  Briefcase,
  Clock,
  Plus
} from 'lucide-react';
import { getProjects } from '@/services/projectService';
import { getProjectTasks } from '@/services/projectTaskService';
import { getTeamMembers } from '@/services/teamService';
import { getClients } from '@/services/clientService';
import { cn } from '@/lib/utils';

interface ActivityFeedWidgetProps {
  limit?: number;
}

interface ActivityItem {
  id: string;
  type: 'task' | 'project' | 'team' | 'client';
  action: 'created' | 'completed' | 'updated';
  title: string;
  timestamp: string;
}

const ActivityFeedWidget: React.FC<ActivityFeedWidgetProps> = ({ limit = 10 }) => {
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
    ...tasks.map(t => ({
      id: t.id,
      type: 'task' as const,
      action: t.completed ? 'completed' as const : 'created' as const,
      title: t.title,
      timestamp: t.updated_at || t.created_at,
    })),
    ...projects.map(p => ({
      id: p.id,
      type: 'project' as const,
      action: 'created' as const,
      title: p.title,
      timestamp: p.created_at || new Date().toISOString(),
    })),
    ...teamMembers.map(m => ({
      id: m.id,
      type: 'team' as const,
      action: 'created' as const,
      title: m.name,
      timestamp: m.created_at || new Date().toISOString(),
    })),
    ...clients.map(c => ({
      id: c.id,
      type: 'client' as const,
      action: 'created' as const,
      title: c.company,
      timestamp: c.created_at || new Date().toISOString(),
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);

  const getIcon = (type: string) => {
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
    if (action === 'completed') return 'text-green-500 bg-green-100 dark:bg-green-900/20';
    
    switch (type) {
      case 'task':
        return 'text-blue-500 bg-blue-100 dark:bg-blue-900/20';
      case 'project':
        return 'text-purple-500 bg-purple-100 dark:bg-purple-900/20';
      case 'team':
        return 'text-orange-500 bg-orange-100 dark:bg-orange-900/20';
      case 'client':
        return 'text-pink-500 bg-pink-100 dark:bg-pink-900/20';
      default:
        return 'text-gray-500 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getActionText = (type: string, action: string) => {
    if (action === 'completed') return 'completed';
    return type === 'team' ? 'joined' : 'created';
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const Icon = getIcon(activity.type);
        const iconColor = getIconColor(activity.type, activity.action);

        return (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0", iconColor)}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 dark:text-white">
                <span className="font-medium">{activity.title}</span>
                {' '}
                <span className="text-gray-500">
                  {getActionText(activity.type, activity.action)}
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {formatTime(activity.timestamp)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityFeedWidget;
