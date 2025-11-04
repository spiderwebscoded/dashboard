import React from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { CustomAnalytic } from '@/services/analyticsService';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

interface CustomAnalyticChartProps {
  analytic: CustomAnalytic;
}

const CustomAnalyticChart: React.FC<CustomAnalyticChartProps> = ({ analytic }) => {
  // Handle empty data
  if (!analytic.data_points || analytic.data_points.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No data points available</p>
      </div>
    );
  }

  switch (analytic.chart_type) {
    case 'stat':
      const statData = analytic.data_points[0];
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {statData.label || statData.name || 'Value'}
          </div>
          <div className="text-5xl font-bold text-blue-600 dark:text-blue-400">
            {statData.value.toLocaleString()}
          </div>
        </div>
      );

    case 'bar_chart':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytic.data_points}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.3} vertical={false} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              stroke="#9ca3af"
              fontSize={12}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              stroke="#9ca3af"
              fontSize={12}
              dx={-10}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                padding: '12px',
              }}
              cursor={{ fill: 'rgba(59, 130, 246, 0.05)', radius: 8 }}
            />
            <Bar dataKey="value" fill="url(#barGradient)" radius={[8, 8, 0, 0]} animationDuration={1200} />
          </BarChart>
        </ResponsiveContainer>
      );

    case 'pie_chart':
      return (
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <defs>
                  {COLORS.map((color, index) => (
                    <linearGradient key={`gradient-${index}`} id={`pieGradient${index}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.95} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={analytic.data_points}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={90}
                  innerRadius={65}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey={(entry) => entry.name || entry.label}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                    if (percent < 0.05) return null;
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return (
                      <text
                        x={x}
                        y={y}
                        fill="white"
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                        className="text-xs font-semibold"
                      >
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                  paddingAngle={3}
                  animationDuration={1200}
                  animationEasing="ease-out"
                >
                  {analytic.data_points.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#pieGradient${index % COLORS.length})`} stroke="#fff" strokeWidth={3} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    padding: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex flex-col gap-3">
            {analytic.data_points.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{item.name || item.label}</div>
                  <div className="text-xs text-gray-500">{item.value.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'line_chart':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analytic.data_points}>
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.3} vertical={false} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              stroke="#9ca3af"
              fontSize={12}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              stroke="#9ca3af"
              fontSize={12}
              dx={-10}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                padding: '12px',
              }}
              cursor={{ stroke: '#10b981', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7 }}
              animationDuration={1200}
            />
          </LineChart>
        </ResponsiveContainer>
      );

    case 'area_chart':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={analytic.data_points}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.3} vertical={false} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              stroke="#9ca3af"
              fontSize={12}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              stroke="#9ca3af"
              fontSize={12}
              dx={-10}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                padding: '12px',
              }}
              cursor={{ stroke: '#a855f7', strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#a855f7"
              strokeWidth={3}
              fill="url(#areaGradient)"
              animationDuration={1200}
            />
          </AreaChart>
        </ResponsiveContainer>
      );

    default:
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>Unknown chart type</p>
        </div>
      );
  }
};

export default CustomAnalyticChart;
