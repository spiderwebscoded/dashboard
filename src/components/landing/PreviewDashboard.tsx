import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, FolderKanban, Users, Briefcase, TrendingUp, Clock } from 'lucide-react';
import { mockStats, mockTasks, mockProjects } from '@/data/mockData';

interface PreviewDashboardProps {
  theme?: 'dark' | 'light';
}

const PreviewDashboard: React.FC<PreviewDashboardProps> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';

  return (
    <div className={`w-full rounded-3xl border overflow-hidden ${
      isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
    }`}>
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Team Members Stat */}
          <Card className={`border-l-4 border-l-blue-500 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {mockStats.teamMembers.total}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Team Members
              </div>
            </CardContent>
          </Card>

          {/* Clients Stat */}
          <Card className={`border-l-4 border-l-purple-500 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Briefcase className="h-5 w-5 text-purple-500" />
              </div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {mockStats.clients.active}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Active Clients
              </div>
            </CardContent>
          </Card>

          {/* Projects Stat */}
          <Card className={`border-l-4 border-l-green-500 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <FolderKanban className="h-5 w-5 text-green-500" />
              </div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {mockStats.projects.inProgress}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                In Progress
              </div>
            </CardContent>
          </Card>

          {/* Tasks Stat */}
          <Card className={`border-l-4 border-l-orange-500 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <CheckSquare className="h-5 w-5 text-orange-500" />
              </div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {mockStats.tasks.total - mockStats.tasks.completed}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Active Tasks
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Recent Tasks */}
          <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardHeader className="pb-3">
              <CardTitle className={`text-lg flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                <CheckSquare className="h-5 w-5" />
                Recent Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-lg ${
                    isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`font-medium text-sm ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={
                            task.priority === 'high' ? 'destructive' :
                            task.priority === 'medium' ? 'default' : 'secondary'
                          }
                          className="text-xs"
                        >
                          {task.priority}
                        </Badge>
                        <span className={`text-xs flex items-center gap-1 ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          <Clock className="h-3 w-3" />
                          {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Active Projects */}
          <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardHeader className="pb-3">
              <CardTitle className={`text-lg flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                <FolderKanban className="h-5 w-5" />
                Active Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockProjects.slice(0, 2).map((project) => (
                <div
                  key={project.id}
                  className={`p-3 rounded-lg ${
                    isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <p className={`font-medium text-sm ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {project.name}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {project.status}
                      </Badge>
                    </div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {project.client_name}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                          Progress
                        </span>
                        <span className={`font-medium ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {project.progress}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Revenue Overview */}
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardHeader className="pb-3">
            <CardTitle className={`text-lg flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <TrendingUp className="h-5 w-5" />
              Revenue Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ${(mockStats.revenue.thisMonth / 1000).toFixed(1)}k
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  This month
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-green-500">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    +{mockStats.revenue.growth}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PreviewDashboard;

