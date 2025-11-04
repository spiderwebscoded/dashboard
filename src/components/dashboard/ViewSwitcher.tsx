import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  LayoutGrid, 
  List, 
  Table, 
  Calendar, 
  GanttChart,
  Grid3x3,
  Columns
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ViewType = 'gallery' | 'list' | 'table' | 'calendar' | 'timeline' | 'grid' | 'compact';

interface ViewSwitcherProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  availableViews: ViewType[];
  className?: string;
}

const viewConfig = {
  gallery: {
    icon: LayoutGrid,
    label: 'Gallery',
  },
  list: {
    icon: List,
    label: 'List',
  },
  table: {
    icon: Table,
    label: 'Table',
  },
  calendar: {
    icon: Calendar,
    label: 'Calendar',
  },
  timeline: {
    icon: GanttChart,
    label: 'Timeline',
  },
  grid: {
    icon: Grid3x3,
    label: 'Grid',
  },
  compact: {
    icon: Columns,
    label: 'Compact',
  },
};

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({
  currentView,
  onViewChange,
  availableViews,
  className,
}) => {
  return (
    <div className={cn('flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 overflow-x-auto', className)}>
      {availableViews.map((view) => {
        const Icon = viewConfig[view].icon;
        const isActive = currentView === view;
        
        return (
          <Button
            key={view}
            variant="ghost"
            size="sm"
            onClick={() => onViewChange(view)}
            className={cn(
              'h-8 px-3 text-xs font-medium transition-all shrink-0',
              isActive
                ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50'
            )}
          >
            <Icon className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">{viewConfig[view].label}</span>
            <span className="sm:hidden">{viewConfig[view].label.slice(0, 1)}</span>
          </Button>
        );
      })}
    </div>
  );
};

export default ViewSwitcher;

