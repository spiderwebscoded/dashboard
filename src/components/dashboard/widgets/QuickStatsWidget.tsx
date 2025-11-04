import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Briefcase, 
  FolderKanban, 
  CheckCircle2,
  Clock,
  TrendingUp,
  Activity
} from 'lucide-react';
import { getTeamMembers } from '@/services/teamService';
import { getClients } from '@/services/clientService';
import { getProjects } from '@/services/projectService';
import { getProjectTasks } from '@/services/projectTaskService';
import { cn } from '@/lib/utils';

const QuickStatsWidget: React.FC = () => {
  const navigate = useNavigate();

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: getTeamMembers,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['all-tasks'],
    queryFn: () => getProjectTasks(),
  });

  const stats = [
    {
      title: 'Team Members',
      value: teamMembers.length,
      icon: Users,
      color: 'blue',
      path: '/dashboard/team',
      subtitle: `${teamMembers.filter(m => m.availability === 'Available').length} available`,
    },
    {
      title: 'Active Clients',
      value: clients.filter(c => c.status === 'Active').length,
      icon: Briefcase,
      color: 'purple',
      path: '/dashboard/clients',
      subtitle: `${clients.length} total`,
    },
    {
      title: 'Projects',
      value: projects.filter(p => p.status === 'In Progress').length,
      icon: FolderKanban,
      color: 'green',
      path: '/dashboard/projects',
      subtitle: `${projects.filter(p => p.status === 'Completed').length} completed`,
    },
    {
      title: 'Active Tasks',
      value: tasks.filter(t => !t.completed).length,
      icon: CheckCircle2,
      color: 'orange',
      path: '/dashboard/tasks',
      subtitle: `${tasks.filter(t => t.completed).length} done`,
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          border: 'border-blue-500',
          bg: 'bg-blue-100 dark:bg-blue-900/20',
          text: 'text-blue-600 dark:text-blue-400',
          icon: 'text-blue-500',
        };
      case 'purple':
        return {
          border: 'border-purple-500',
          bg: 'bg-purple-100 dark:bg-purple-900/20',
          text: 'text-purple-600 dark:text-purple-400',
          icon: 'text-purple-500',
        };
      case 'green':
        return {
          border: 'border-green-500',
          bg: 'bg-green-100 dark:bg-green-900/20',
          text: 'text-green-600 dark:text-green-400',
          icon: 'text-green-500',
        };
      case 'orange':
        return {
          border: 'border-orange-500',
          bg: 'bg-orange-100 dark:bg-orange-900/20',
          text: 'text-orange-600 dark:text-orange-400',
          icon: 'text-orange-500',
        };
      default:
        return {
          border: 'border-gray-500',
          bg: 'bg-gray-100 dark:bg-gray-900/20',
          text: 'text-gray-600 dark:text-gray-400',
          icon: 'text-gray-500',
        };
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const colors = getColorClasses(stat.color);
        const Icon = stat.icon;
        
        return (
          <div
            key={stat.title}
            className={cn(
              "p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-gray-100 dark:border-gray-700",
              colors.border
            )}
            onClick={() => navigate(stat.path)}
          >
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {stat.title}
              </p>
              <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", colors.bg)}>
                <Icon className={cn("h-5 w-5", colors.icon)} />
              </div>
            </div>
            <div className={cn("text-2xl font-bold mb-1", colors.text)}>
              {stat.value}
            </div>
            <p className="text-xs text-gray-500">
              {stat.subtitle}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default QuickStatsWidget;
