import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { FolderKanban, ExternalLink, Users } from 'lucide-react';
import { getProjects } from '@/services/projectService';
import { cn } from '@/lib/utils';

interface ActiveProjectsWidgetProps {
  limit?: number;
}

const ActiveProjectsWidget: React.FC<ActiveProjectsWidgetProps> = ({ limit = 4 }) => {
  const navigate = useNavigate();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  const activeProjects = projects
    .filter(p => p.status === 'In Progress')
    .slice(0, limit);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200';
      case 'Planning':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200';
      case 'On Hold':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse p-4 border rounded-lg">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (activeProjects.length === 0) {
    return (
      <div className="text-center py-8">
        <FolderKanban className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">No active projects</p>
        <p className="text-gray-400 text-xs mt-1">Create a project to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activeProjects.map((project) => (
        <div
          key={project.id}
          className="group p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-700"
          onClick={() => navigate(`/dashboard/projects/${project.id}`)}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {project.title}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {project.client}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <Badge className={cn("text-xs font-medium border", getStatusColor(project.status))}>
                {project.status}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/dashboard/projects/${project.id}`);
                }}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Progress</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>
          
          {project.team && project.team.length > 0 && (
            <div className="flex items-center gap-1 mt-3 text-xs text-gray-500">
              <Users className="h-3 w-3" />
              <span>{project.team.length} team member{project.team.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      ))}
      
      {projects.filter(p => p.status === 'In Progress').length > limit && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2"
          onClick={() => navigate('/dashboard/projects')}
        >
          View all active projects
        </Button>
      )}
    </div>
  );
};

export default ActiveProjectsWidget;
