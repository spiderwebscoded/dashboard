
import React from 'react';
import { RevenueData } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp, Calendar, Target } from 'lucide-react';

interface RevenueStatsProps {
  data: RevenueData[];
}

const RevenueStats = ({ data }: RevenueStatsProps) => {
  const currentYear = new Date().getFullYear();
  
  // Calculate total revenue
  const totalRevenue = data.reduce((sum, item) => sum + item.value, 0);
  
  // Calculate current year revenue
  const currentYearRevenue = data
    .filter(item => item.year === currentYear)
    .reduce((sum, item) => sum + item.value, 0);
  
  // Calculate previous year revenue
  const previousYearRevenue = data
    .filter(item => item.year === currentYear - 1)
    .reduce((sum, item) => sum + item.value, 0);
  
  // Calculate growth percentage
  const growthPercentage = previousYearRevenue > 0 
    ? ((currentYearRevenue - previousYearRevenue) / previousYearRevenue) * 100 
    : 0;
  
  // Determine if growth is positive or negative
  const isPositiveGrowth = growthPercentage >= 0;
  
  // Calculate average monthly revenue for current year
  const monthsInCurrentYear = new Set(
    data.filter(item => item.year === currentYear).map(item => item.month)
  ).size;
  
  const averageMonthlyRevenue = monthsInCurrentYear > 0 
    ? currentYearRevenue / monthsInCurrentYear 
    : 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
            {isPositiveGrowth ? (
              <div className="flex items-center text-green-600">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">{Math.abs(growthPercentage).toFixed(1)}%</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <ArrowDownRight className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">{Math.abs(growthPercentage).toFixed(1)}%</span>
              </div>
            )}
          </div>
          <h3 className="mt-4 text-2xl font-bold">
            R{currentYearRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">Current Year Revenue</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-300" />
            </div>
          </div>
          <h3 className="mt-4 text-2xl font-bold">
            R{averageMonthlyRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">Avg. Monthly Revenue</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900">
              <Calendar className="w-6 h-6 text-amber-600 dark:text-amber-300" />
            </div>
          </div>
          <h3 className="mt-4 text-2xl font-bold">
            R{previousYearRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">Previous Year Revenue</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900">
              <Target className="w-6 h-6 text-green-600 dark:text-green-300" />
            </div>
          </div>
          <h3 className="mt-4 text-2xl font-bold">
            R{totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">Total Revenue</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueStats;
