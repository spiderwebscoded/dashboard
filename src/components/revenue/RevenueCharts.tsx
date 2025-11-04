
import React from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import { RevenueData } from '@/types/database';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface RevenueChartsProps {
  data: RevenueData[];
  chartType: 'line' | 'bar' | 'pie' | 'area';
}

// Soft pastel color palette inspired by modern design
const COLORS = [
  '#10b981', // Mint green
  '#f472b6', // Soft pink
  '#60a5fa', // Sky blue
  '#fb923c', // Soft orange
  '#a78bfa', // Soft purple
  '#34d399', // Emerald
  '#fbbf24', // Soft yellow
  '#f87171'  // Soft red
];

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600 dark:text-gray-300">{entry.name}:</span>
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              R{entry.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Custom label for pie chart
const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Hide labels for small slices

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="text-xs font-semibold drop-shadow-lg"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const RevenueCharts = ({ data, chartType }: RevenueChartsProps) => {
  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data
      .sort((a, b) => {
        if (a.year !== b.year) {
          return a.year - b.year;
        }
        const monthOrder = {
          'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
          'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
        };
        return monthOrder[a.month] - monthOrder[b.month];
      })
      .map(item => ({
        name: `${item.month.slice(0, 3)} ${item.year}`,
        revenue: item.value,
        costs: item.costs || 0,
        profit: item.value - (item.costs || 0),
        month: item.month,
        year: item.year,
        label: `${item.month} ${item.year}`,
        category: item.category || 'General',
        source: item.source || 'Sales'
      }));
  }, [data]);
  
  // For pie chart, group by category
  const pieData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Group by category if available, otherwise by year
    if (data.some(item => item.category)) {
      const categoryTotals = data.reduce((acc, item) => {
        const category = item.category || 'General';
        acc[category] = (acc[category] || 0) + item.value;
        return acc;
      }, {} as Record<string, number>);
      
      return Object.entries(categoryTotals).map(([name, value]) => ({
        name,
        value: Number(value)
      }));
    } else {
      const yearTotals = data.reduce((acc, item) => {
        acc[item.year] = (acc[item.year] || 0) + item.value;
        return acc;
      }, {} as Record<number, number>);
      
      return Object.entries(yearTotals).map(([year, value]) => ({
        name: String(year),
        value: Number(value)
      }));
    }
  }, [data]);
  
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No data available for chart visualization
      </div>
    );
  }
  
  // Chart configuration with soft pastel colors
  const chartConfig = {
    revenue: {
      label: "Revenue",
      theme: {
        light: "#10b981", // Mint green
        dark: "#34d399"   // Lighter mint
      }
    },
    costs: {
      label: "Costs",
      theme: {
        light: "#f472b6", // Soft pink
        dark: "#fb9bcb"   // Lighter pink
      }
    },
    profit: {
      label: "Profit",
      theme: {
        light: "#60a5fa", // Sky blue
        dark: "#93c5fd"   // Lighter blue
      }
    }
  };
  
  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={chartData}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#e5e7eb" 
              strokeOpacity={0.3}
              vertical={false}
              className="dark:stroke-gray-700"
            />
            <XAxis 
              dataKey="name" 
              stroke="#9ca3af"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#9ca3af"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dx={-10}
              tickFormatter={(value) => `R${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '24px' }}
              iconType="circle"
              iconSize={8}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              name="Revenue" 
              stroke="#10b981" 
              strokeWidth={2.5}
              dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} 
              animationDuration={1200}
              animationEasing="ease-in-out"
            />
            {chartData.some(d => d.costs > 0) && (
              <Line 
                type="monotone" 
                dataKey="costs" 
                name="Costs" 
                stroke="#f472b6" 
                strokeWidth={2.5}
                dot={{ fill: '#f472b6', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: '#f472b6', stroke: '#fff', strokeWidth: 2 }} 
                animationDuration={1200}
                animationEasing="ease-in-out"
              />
            )}
            {chartData.some(d => d.profit > 0) && (
              <Line 
                type="monotone" 
                dataKey="profit" 
                name="Profit" 
                stroke="#60a5fa" 
                strokeWidth={2.5}
                dot={{ fill: '#60a5fa', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: '#60a5fa', stroke: '#fff', strokeWidth: 2 }} 
                animationDuration={1200}
                animationEasing="ease-in-out"
              />
            )}
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart data={chartData} barGap={8} barCategoryGap="20%">
            <defs>
              <linearGradient id="barRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.9}/>
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.6}/>
              </linearGradient>
              <linearGradient id="barCosts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f472b6" stopOpacity={0.9}/>
                <stop offset="100%" stopColor="#f472b6" stopOpacity={0.6}/>
              </linearGradient>
              <linearGradient id="barProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.9}/>
                <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.6}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#e5e7eb" 
              strokeOpacity={0.3}
              vertical={false}
              className="dark:stroke-gray-700"
            />
            <XAxis 
              dataKey="name" 
              stroke="#9ca3af"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#9ca3af"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dx={-10}
              tickFormatter={(value) => `R${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(16, 185, 129, 0.05)'}} />
            <Legend 
              wrapperStyle={{ paddingTop: '24px' }}
              iconType="circle"
              iconSize={8}
            />
            <Bar 
              dataKey="revenue" 
              name="Revenue" 
              fill="url(#barRevenue)" 
              radius={[6, 6, 0, 0]}
              animationDuration={1200}
            />
            {chartData.some(d => d.costs > 0) && (
              <Bar 
                dataKey="costs" 
                name="Costs" 
                fill="url(#barCosts)" 
                radius={[6, 6, 0, 0]}
                animationDuration={1200}
              />
            )}
            {chartData.some(d => d.profit > 0) && (
              <Bar 
                dataKey="profit" 
                name="Profit" 
                fill="url(#barProfit)" 
                radius={[6, 6, 0, 0]}
                animationDuration={1200}
              />
            )}
          </BarChart>
        );
      case 'area':
        return (
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="areaRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="areaCosts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f472b6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#f472b6" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="areaProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#e5e7eb" 
              strokeOpacity={0.3}
              vertical={false}
              className="dark:stroke-gray-700"
            />
            <XAxis 
              dataKey="name" 
              stroke="#9ca3af"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#9ca3af"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dx={-10}
              tickFormatter={(value) => `R${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '24px' }}
              iconType="circle"
              iconSize={8}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              name="Revenue" 
              stroke="#10b981" 
              strokeWidth={2.5}
              fill="url(#areaRevenue)" 
              animationDuration={1200}
              animationEasing="ease-in-out"
            />
            {chartData.some(d => d.costs > 0) && (
              <Area 
                type="monotone" 
                dataKey="costs" 
                name="Costs" 
                stroke="#f472b6" 
                strokeWidth={2}
                fill="url(#areaCosts)" 
                animationDuration={1200}
                animationEasing="ease-in-out"
              />
            )}
            {chartData.some(d => d.profit > 0) && (
              <Area 
                type="monotone" 
                dataKey="profit" 
                name="Profit" 
                stroke="#60a5fa" 
                strokeWidth={2}
                fill="url(#areaProfit)" 
                animationDuration={1200}
                animationEasing="ease-in-out"
              />
            )}
          </AreaChart>
        );
      case 'pie':
        const totalValue = pieData.reduce((sum, entry) => sum + entry.value, 0);
        return (
          <PieChart>
            <defs>
              {COLORS.map((color, index) => (
                <linearGradient key={`gradient-${index}`} id={`pieGradient${index}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.95}/>
                  <stop offset="100%" stopColor={color} stopOpacity={0.7}/>
                </linearGradient>
              ))}
            </defs>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={65}
              label={CustomPieLabel}
              labelLine={false}
              paddingAngle={3}
              animationBegin={0}
              animationDuration={1200}
              animationEasing="ease-out"
            >
              {pieData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#pieGradient${index % COLORS.length})`}
                  stroke="#fff"
                  strokeWidth={3}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <text
              x="50%"
              y="45%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs font-medium fill-gray-500"
            >
              Total Revenue
            </text>
            <text
              x="50%"
              y="55%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-2xl font-bold fill-gray-900 dark:fill-white"
            >
              R{(totalValue / 1000).toFixed(1)}k
            </text>
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              iconSize={8}
              formatter={(value, entry: any) => (
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {value}
                </span>
              )}
            />
          </PieChart>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="w-full h-64 md:h-80">
      <ChartContainer config={chartConfig} className="h-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

export default RevenueCharts;
