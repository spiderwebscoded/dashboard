import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar } from 'lucide-react';
import { mockProjects } from '@/data/mockData';

interface PreviewProjectsProps {
  theme?: 'dark' | 'light';
  projects?: typeof mockProjects;
}

const PreviewProjects: React.FC<PreviewProjectsProps> = ({ theme = 'dark', projects = mockProjects }) => {
  const isDark = theme === 'dark';

  return (
    <div className={`w-full rounded-xl overflow-hidden ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="p-4 space-y-3">
        {projects.map((project) => (
          <Card
            key={project.id}
            className={`transition-all duration-200 hover:shadow-lg ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className={`text-base ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {project.name}
                  </CardTitle>
                  <p className={`text-sm mt-1 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {project.client_name}
                  </p>
                </div>
                <Badge
                  variant={project.status === 'In Progress' ? 'default' : 
                          project.status === 'Completed' ? 'secondary' : 'outline'}
                  className="ml-2"
                >
                  {project.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {project.description}
              </p>
              
              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    Progress
                  </span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {project.progress}%
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${
                  isDark ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div
                    className={`h-full transition-all duration-300 ${
                      project.progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Project Details */}
              <div className="flex items-center gap-4 text-sm">
                <div className={`flex items-center gap-1 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <Users className="h-4 w-4" />
                  <span>{project.team_size} members</span>
                </div>
                <div className={`flex items-center gap-1 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(project.end_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PreviewProjects;

