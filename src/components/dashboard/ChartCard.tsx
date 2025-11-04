
import React, { ReactNode, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

const ChartCard = ({
  title,
  subtitle,
  children,
  className,
  action,
}: ChartCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 border-gray-100 dark:border-gray-800", 
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="px-6 py-5 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-lg font-semibold tracking-tight">{title}</CardTitle>
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={cn("transition-all duration-300", isHovered ? "opacity-100 translate-x-0" : "opacity-70 -translate-x-1")}>
          {action}
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-2">
        {children}
      </CardContent>
    </Card>
  );
};

export default ChartCard;
