import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { mockStats, mockRevenueData } from '@/data/mockData';

interface PreviewRevenueProps {
  theme?: 'dark' | 'light';
  stats?: typeof mockStats;
  revenueData?: typeof mockRevenueData;
}

const PreviewRevenue: React.FC<PreviewRevenueProps> = ({ theme = 'dark', stats = mockStats, revenueData = mockRevenueData }) => {
  const isDark = theme === 'dark';

  return (
    <div className={`w-full rounded-xl overflow-hidden ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="p-4 space-y-4">
        {/* Key Revenue Metrics */}
        <div className="grid grid-cols-2 gap-4">
          {/* Total Revenue */}
          <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className={`text-xs font-medium ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Total Revenue
                </div>
                <div className={`text-3xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  ${(stats.revenue.total / 1000).toFixed(0)}k
                </div>
                <div className="flex items-center gap-1 text-green-500">
                  <ArrowUpRight className="h-4 w-4" />
                  <span className="text-sm font-medium">+{stats.revenue.growth}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* This Month */}
          <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className={`text-xs font-medium ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  This Month
                </div>
                <div className={`text-3xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  ${(stats.revenue.thisMonth / 1000).toFixed(1)}k
                </div>
                <div className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  vs ${(stats.revenue.lastMonth / 1000).toFixed(1)}k last month
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Trend Chart */}
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <TrendingUp className="h-4 w-4" />
              6-Month Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {revenueData.map((data, idx) => {
                const maxRevenue = Math.max(...revenueData.map(d => d.revenue));
                const barWidth = (data.revenue / maxRevenue) * 100;
                const isLatest = idx === revenueData.length - 1;
                
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-medium ${
                        isLatest 
                          ? isDark ? 'text-white' : 'text-gray-900'
                          : isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {data.month}
                      </span>
                      <span className={`font-semibold ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        ${(data.revenue / 1000).toFixed(0)}k
                      </span>
                    </div>
                    <div className={`w-full h-6 rounded overflow-hidden ${
                      isDark ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      <div
                        className={`h-full transition-all duration-500 flex items-center justify-end pr-2 ${
                          isLatest 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                            : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                        }`}
                        style={{ width: `${barWidth}%` }}
                      >
                        {barWidth > 30 && (
                          <span className="text-xs text-white font-medium">
                            {data.projects}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Growth Indicator */}
        <div className={`p-3 rounded-lg ${
          isDark ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-green-500">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className={`text-sm font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Strong Growth
                </p>
                <p className={`text-xs ${
                  isDark ? 'text-green-300' : 'text-green-700'
                }`}>
                  Revenue up {stats.revenue.growth}% this period
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewRevenue;

