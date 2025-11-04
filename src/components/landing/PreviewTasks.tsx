import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Circle, CheckCircle2 } from 'lucide-react';
import { mockTasks } from '@/data/mockData';

interface PreviewTasksProps {
  theme?: 'dark' | 'light';
  tasks?: typeof mockTasks;
}

const PreviewTasks: React.FC<PreviewTasksProps> = ({ theme = 'dark', tasks = mockTasks }) => {
  const isDark = theme === 'dark';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      default:
        return isDark ? 'bg-gray-600' : 'bg-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <div className={`w-full rounded-xl overflow-hidden ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="p-4">
        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* To Do Column */}
          <div className="space-y-3">
            <div className={`font-semibold text-sm flex items-center gap-2 mb-3 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <Circle className="h-4 w-4" />
              To Do ({tasks.filter(t => t.status === 'todo').length})
            </div>
            <div className="space-y-2">
              {tasks.filter(t => t.status === 'todo').map((task) => (
                <Card
                  key={task.id}
                  className={`transition-all duration-200 hover:shadow-md ${
                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}
                >
                  <CardContent className="p-3 space-y-2">
                    <p className={`font-medium text-sm ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                        {task.priority}
                      </Badge>
                      <span className={`text-xs flex items-center gap-1 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        <Clock className="h-3 w-3" />
                        {new Date(task.due_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="space-y-3">
            <div className={`font-semibold text-sm flex items-center gap-2 mb-3 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <div className="h-4 w-4 rounded-full bg-blue-500" />
              In Progress ({tasks.filter(t => t.status === 'in_progress').length})
            </div>
            <div className="space-y-2">
              {tasks.filter(t => t.status === 'in_progress').map((task) => (
                <Card
                  key={task.id}
                  className={`transition-all duration-200 hover:shadow-md border-l-4 border-l-blue-500 ${
                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}
                >
                  <CardContent className="p-3 space-y-2">
                    <p className={`font-medium text-sm ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                        {task.priority}
                      </Badge>
                      <span className={`text-xs flex items-center gap-1 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        <Clock className="h-3 w-3" />
                        {new Date(task.due_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Completed Column */}
          <div className="space-y-3">
            <div className={`font-semibold text-sm flex items-center gap-2 mb-3 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Done ({tasks.filter(t => t.status === 'completed').length})
            </div>
            <div className="space-y-2">
              {tasks.filter(t => t.status === 'completed').map((task) => (
                <Card
                  key={task.id}
                  className={`transition-all duration-200 hover:shadow-md opacity-75 ${
                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}
                >
                  <CardContent className="p-3 space-y-2">
                    <p className={`font-medium text-sm line-through ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {task.priority}
                      </Badge>
                      <span className={`text-xs flex items-center gap-1 ${
                        isDark ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        <Clock className="h-3 w-3" />
                        {new Date(task.due_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewTasks;

