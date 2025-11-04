import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckSquare, ExternalLink } from 'lucide-react';
import { getProjectTasks, updateProjectTask } from '@/services/projectTaskService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface RecentTasksWidgetProps {
  limit?: number;
}

const RecentTasksWidget: React.FC<RecentTasksWidgetProps> = ({ limit = 5 }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['all-tasks'],
    queryFn: () => getProjectTasks(),
  });

  const toggleTaskMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      updateProjectTask(id, { completed: !completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
    },
  });

  const recentTasks = tasks
    .filter(task => !task.completed)
    .slice(0, limit);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-300 text-red-600 dark:border-red-700 dark:text-red-400';
      case 'medium':
        return 'border-yellow-300 text-yellow-600 dark:border-yellow-700 dark:text-yellow-400';
      case 'low':
        return 'border-green-300 text-green-600 dark:border-green-700 dark:text-green-400';
      default:
        return 'border-gray-300 text-gray-600 dark:border-gray-700 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex items-center gap-3 p-3 border rounded-lg">
            <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (recentTasks.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">No active tasks</p>
        <p className="text-gray-400 text-xs mt-1">Create a task to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recentTasks.map((task) => (
        <div
          key={task.id}
          className="group flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-700"
          onClick={() => navigate(`/dashboard/tasks/${task.id}`)}
        >
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => toggleTaskMutation.mutate({ id: task.id, completed: task.completed })}
            className="mt-0.5"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className={cn(
                "text-sm font-medium truncate",
                task.completed && "line-through text-gray-400"
              )}>
                {task.title}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/dashboard/tasks/${task.id}`);
                }}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={cn("text-xs", getPriorityColor(task.priority))}>
                {task.priority}
              </Badge>
              {task.due_date && (
                <span 
                  className="text-xs text-gray-500 hover:text-blue-600 cursor-pointer transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/dashboard/tasks?date=${task.due_date}`);
                  }}
                >
                  Due: {new Date(task.due_date).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {tasks.length > limit && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2"
          onClick={() => navigate('/dashboard/tasks')}
        >
          View all {tasks.length} tasks
        </Button>
      )}
    </div>
  );
};

export default RecentTasksWidget;
