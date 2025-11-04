import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, FolderKanban, Users, CheckSquare } from 'lucide-react';
import { mockStats, mockRevenueData } from '@/data/mockData';

interface PreviewAnalyticsProps {
  theme?: 'dark' | 'light';
  stats?: typeof mockStats;
  revenueData?: typeof mockRevenueData;
}

const PreviewAnalytics: React.FC<PreviewAnalyticsProps> = ({ theme = 'dark', stats = mockStats, revenueData = mockRevenueData }) => {
  const isDark = theme === 'dark';

  return (
    <div className={`w-full rounded-xl overflow-hidden ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="p-4 space-y-4">
        {/* Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardHeader className="pb-3">
              <CardTitle className={`text-sm font-medium flex items-center gap-2 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <DollarSign className="h-4 w-4" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ${(stats.revenue.total / 1000).toFixed(0)}k
                </p>
                <div className="flex items-center gap-1 text-sm text-green-500">
                  <TrendingUp className="h-4 w-4" />
                  <span>+{stats.revenue.growth}% from last month</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardHeader className="pb-3">
              <CardTitle className={`text-sm font-medium flex items-center gap-2 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <DollarSign className="h-4 w-4" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ${(stats.revenue.thisMonth / 1000).toFixed(1)}k
                </p>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Last month: ${(stats.revenue.lastMonth / 1000).toFixed(1)}k
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardHeader className="pb-3">
            <CardTitle className={`text-base flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <TrendingUp className="h-5 w-5" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {revenueData.map((data, idx) => {
                const maxRevenue = Math.max(...revenueData.map(d => d.revenue));
                const barWidth = (data.revenue / maxRevenue) * 100;
                
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        {data.month}
                      </span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        ${(data.revenue / 1000).toFixed(0)}k
                      </span>
                    </div>
                    <div className={`w-full h-8 rounded overflow-hidden ${
                      isDark ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500 flex items-center justify-end pr-2"
                        style={{ width: `${barWidth}%` }}
                      >
                        <span className="text-xs text-white font-medium">
                          {data.projects} projects
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className={`border-l-4 border-l-blue-500 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <CardContent className="p-3">
              <div className="space-y-1">
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Projects
                </div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.projects.total}
                </div>
                <div className="flex items-center gap-1 text-xs text-green-500">
                  <TrendingUp className="h-3 w-3" />
                  <span>{stats.projects.inProgress} active</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`border-l-4 border-l-purple-500 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <CardContent className="p-3">
              <div className="space-y-1">
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Clients
                </div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.clients.total}
                </div>
                <div className="flex items-center gap-1 text-xs text-green-500">
                  <TrendingUp className="h-3 w-3" />
                  <span>{stats.clients.active} active</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`border-l-4 border-l-orange-500 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <CardContent className="p-3">
              <div className="space-y-1">
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Tasks
                </div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.tasks.total}
                </div>
                <div className={`flex items-center gap-1 text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <CheckSquare className="h-3 w-3" />
                  <span>{stats.tasks.completed} done</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`border-l-4 border-l-green-500 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <CardContent className="p-3">
              <div className="space-y-1">
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Team
                </div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.teamMembers.total}
                </div>
                <div className={`flex items-center gap-1 text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <Users className="h-3 w-3" />
                  <span>{stats.teamMembers.available} available</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PreviewAnalytics;

