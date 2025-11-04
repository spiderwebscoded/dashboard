import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ThumbsUp, DollarSign, TrendingUp } from 'lucide-react';
import { getProjectTasks } from '@/services/projectTaskService';
import { getRevenueData } from '@/services/analyticsService';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  className?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  change,
  changeType = 'neutral',
  className,
  onClick
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'negative':
        return 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400';
      default:
        return 'text-slate-600 bg-slate-50 dark:bg-slate-900/20 dark:text-slate-400';
    }
  };

  return (
    <div 
      className={cn(
        "p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 shadow-sm">
          {icon}
        </div>
        {change && (
          <span className={cn(
            "text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm",
            getChangeColor()
          )}>
            {change}
          </span>
        )}
      </div>
      
      <div className="space-y-2">
        <p className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          {title}
        </p>
      </div>
    </div>
  );
};

const StatsBar: React.FC = () => {
  const navigate = useNavigate();
  
  const { data: tasks = [] } = useQuery({
    queryKey: ['all-tasks'],
    queryFn: () => getProjectTasks(),
  });

  const { data: revenueData = [] } = useQuery({
    queryKey: ['revenue-data'],
    queryFn: getRevenueData,
  });

  // Month name to number mapping
  const monthToNumber: Record<string, number> = {
    'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
    'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
  };

  // Calculate dates for revenue filtering
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Filter revenue data for last 30 days
  const last30DaysRevenue = revenueData
    .filter(item => {
      const itemDate = new Date(item.year, monthToNumber[item.month] || 0, 1);
      return itemDate >= thirtyDaysAgo && itemDate <= now;
    })
    .reduce((sum, item) => sum + (item.value || 0), 0);

  // Filter revenue data for previous 30 days (30-60 days ago)
  const prev30DaysRevenue = revenueData
    .filter(item => {
      const itemDate = new Date(item.year, monthToNumber[item.month] || 0, 1);
      return itemDate >= sixtyDaysAgo && itemDate < thirtyDaysAgo;
    })
    .reduce((sum, item) => sum + (item.value || 0), 0);

  // Calculate revenue growth percentage
  const revenueGrowth = prev30DaysRevenue > 0 
    ? ((last30DaysRevenue - prev30DaysRevenue) / prev30DaysRevenue) * 100 
    : last30DaysRevenue > 0 ? 100 : 0;

  // Calculate today's completed tasks
  const today = new Date().toDateString();
  const completedToday = tasks.filter(task => 
    task.completed && 
    task.updated_at && 
    new Date(task.updated_at).toDateString() === today
  ).length;

  // Calculate completed tasks
  const completedTasks = tasks.filter(task => task.completed).length;

  // Format revenue display
  const formatRevenue = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `R${value.toFixed(0)}`;
  };

  // Calculate changes
  const finishedChange = completedToday > 0 ? `+${completedToday} today` : undefined;
  const revenueChange = revenueGrowth !== 0 
    ? `${revenueGrowth > 0 ? '+' : ''}${revenueGrowth.toFixed(1)}%` 
    : undefined;
  const growthChange = prev30DaysRevenue > 0 
    ? `vs prev 30d` 
    : last30DaysRevenue > 0 ? 'new' : undefined;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <StatCard
        icon={<ThumbsUp className="h-6 w-6 text-emerald-600" />}
        title="Finished"
        value={completedTasks}
        change={finishedChange}
        changeType="positive"
        onClick={() => navigate('/dashboard/tasks?filter=completed')}
      />
      
      <StatCard
        icon={<DollarSign className="h-6 w-6 text-blue-600" />}
        title="Revenue (30d)"
        value={formatRevenue(last30DaysRevenue)}
        change={revenueChange}
        changeType={revenueGrowth >= 0 ? 'positive' : 'negative'}
        onClick={() => navigate('/dashboard/revenue')}
      />
      
      <StatCard
        icon={<TrendingUp className="h-6 w-6 text-purple-600" />}
        title="Growth"
        value={`${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth.toFixed(1)}%`}
        change={growthChange}
        changeType={revenueGrowth >= 10 ? 'positive' : revenueGrowth < 0 ? 'negative' : 'neutral'}
        onClick={() => navigate('/dashboard/analytics')}
      />
    </div>
  );
};

export default StatsBar;

