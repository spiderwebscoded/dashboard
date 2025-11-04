import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus,
  X,
  CheckSquare,
  FolderKanban,
  Users,
  Briefcase,
  BarChart3,
  Clock,
  StickyNote,
  Calendar as CalendarIcon,
  Activity,
  ChevronUp,
  ChevronDown,
  GripVertical
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  getDashboardWidgets,
  createDashboardWidget,
  updateDashboardWidget,
  deleteDashboardWidget,
  initializeDefaultDashboardWidgets,
  reorderDashboardWidgets,
  DashboardWidget,
  WidgetType,
  WidgetSize
} from '@/services/dashboardWidgetService';
import QuickActionsBar from '@/components/dashboard/QuickActionsBar';
import PersonalizedHeader from '@/components/dashboard/PersonalizedHeader';
import StatsBar from '@/components/dashboard/StatsBar';
import ActivityFeedSidebar from '@/components/dashboard/ActivityFeedSidebar';
import ViewSwitcher from '@/components/dashboard/ViewSwitcher';
import { getDashboardViewPreference, saveDashboardViewPreference, DashboardView } from '@/services/profileService';
import RecentTasksWidget from '@/components/dashboard/widgets/RecentTasksWidget';
import ActiveProjectsWidget from '@/components/dashboard/widgets/ActiveProjectsWidget';
import QuickStatsWidget from '@/components/dashboard/widgets/QuickStatsWidget';
import ActivityFeedWidget from '@/components/dashboard/widgets/ActivityFeedWidget';
import TeamOverviewWidget from '@/components/dashboard/widgets/TeamOverviewWidget';
import ClientListWidget from '@/components/dashboard/widgets/ClientListWidget';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  const [editingWidgetId, setEditingWidgetId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<DashboardView>('grid');

  // Get dashboard widgets
  const { data: widgets = [], isLoading: isLoadingWidgets } = useQuery({
    queryKey: ['dashboard-widgets'],
    queryFn: getDashboardWidgets,
  });

  // Load view preference
  const { data: viewPreference } = useQuery({
    queryKey: ['dashboard-view-preference'],
    queryFn: getDashboardViewPreference,
  });

  useEffect(() => {
    if (viewPreference) {
      setCurrentView(viewPreference);
    }
  }, [viewPreference]);

  // Save view preference when changed
  const handleViewChange = async (view: DashboardView) => {
    setCurrentView(view);
    try {
      await saveDashboardViewPreference(view);
      toast({
        title: 'View updated',
        description: `Switched to ${view} view`,
      });
    } catch (error) {
      console.error('Failed to save view preference:', error);
      toast({
        title: 'Error',
        description: 'Failed to save view preference',
        variant: 'destructive',
      });
    }
  };

  // Initialize default widgets if none exist
  useEffect(() => {
    if (!isLoadingWidgets && widgets.length === 0) {
      initializeDefaultDashboardWidgets().then(() => {
        queryClient.invalidateQueries({ queryKey: ['dashboard-widgets'] });
      });
    }
  }, [isLoadingWidgets, widgets.length, queryClient]);

  // Widget mutations
  const createWidgetMutation = useMutation({
    mutationFn: createDashboardWidget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-widgets'] });
      toast({
        title: 'Widget added',
        description: 'The widget has been added to your dashboard.',
      });
    },
  });

  const updateWidgetMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateDashboardWidget(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-widgets'] });
    },
  });

  const deleteWidgetMutation = useMutation({
    mutationFn: deleteDashboardWidget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-widgets'] });
      toast({
        title: 'Widget removed',
        description: 'The widget has been removed from your dashboard.',
      });
    },
  });

  // Widget handlers
  const handleAddWidget = (type: WidgetType) => {
    const titles: Record<WidgetType, string> = {
      recent_tasks: 'Recent Tasks',
      active_projects: 'Active Projects',
      team_overview: 'Team Overview',
      client_list: 'Active Clients',
      revenue_chart: 'Revenue Chart',
      quick_stats: 'Quick Stats',
      activity_feed: 'Recent Activity',
      calendar: 'Calendar',
      focus_timer: 'Focus Timer',
      notes: 'Quick Notes',
    };

    const sizes: Record<WidgetType, WidgetSize> = {
      recent_tasks: 'medium',
      active_projects: 'medium',
      team_overview: 'medium',
      client_list: 'medium',
      revenue_chart: 'large',
      quick_stats: 'large',
      activity_feed: 'large',
      calendar: 'medium',
      focus_timer: 'small',
      notes: 'medium',
    };

    createWidgetMutation.mutate({
      widget_type: type,
      title: titles[type],
      size: sizes[type],
      position: widgets.length,
      config: {},
    });
  };

  const handleDeleteWidget = (id: string) => {
    deleteWidgetMutation.mutate(id);
  };

  const handleUpdateWidget = (id: string, updates: any) => {
    updateWidgetMutation.mutate({ id, data: updates });
  };

  const handleDragStart = (id: string) => {
    setDraggedWidgetId(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedWidgetId || draggedWidgetId === targetId) return;

    const draggedIndex = widgets.findIndex(w => w.id === draggedWidgetId);
    const targetIndex = widgets.findIndex(w => w.id === targetId);

    const newWidgets = [...widgets];
    const [draggedWidget] = newWidgets.splice(draggedIndex, 1);
    newWidgets.splice(targetIndex, 0, draggedWidget);

    queryClient.setQueryData(['dashboard-widgets'], newWidgets);
  };

  const handleDragEnd = async () => {
    if (draggedWidgetId) {
      const widgetIds = widgets.map(w => w.id);
      try {
        await reorderDashboardWidgets(widgetIds);
      } catch (error) {
        console.error('Failed to save widget order:', error);
        queryClient.invalidateQueries({ queryKey: ['dashboard-widgets'] });
      }
    }
    setDraggedWidgetId(null);
  };

  const moveWidgetUp = async (id: string) => {
    const index = widgets.findIndex(w => w.id === id);
    if (index === 0) return;
    
    const newWidgets = [...widgets];
    [newWidgets[index - 1], newWidgets[index]] = [newWidgets[index], newWidgets[index - 1]];
    
    queryClient.setQueryData(['dashboard-widgets'], newWidgets);
    
    const widgetIds = newWidgets.map(w => w.id);
    try {
      await reorderDashboardWidgets(widgetIds);
    } catch (error) {
      console.error('Failed to save widget order:', error);
      queryClient.invalidateQueries({ queryKey: ['dashboard-widgets'] });
    }
  };

  const moveWidgetDown = async (id: string) => {
    const index = widgets.findIndex(w => w.id === id);
    if (index === widgets.length - 1) return;
    
    const newWidgets = [...widgets];
    [newWidgets[index], newWidgets[index + 1]] = [newWidgets[index + 1], newWidgets[index]];
    
    queryClient.setQueryData(['dashboard-widgets'], newWidgets);
    
    const widgetIds = newWidgets.map(w => w.id);
    try {
      await reorderDashboardWidgets(widgetIds);
    } catch (error) {
      console.error('Failed to save widget order:', error);
      queryClient.invalidateQueries({ queryKey: ['dashboard-widgets'] });
    }
  };

  const getSizeClass = (size: WidgetSize, view: DashboardView) => {
    if (view === 'list') {
      return 'w-full'; // Full width in list view
    }
    
    if (view === 'compact') {
      // Compact view - smaller widgets
      switch (size) {
        case 'small':
          return 'md:col-span-1';
        case 'medium':
          return 'md:col-span-2';
        case 'large':
          return 'md:col-span-4';
        default:
          return 'md:col-span-1';
      }
    }
    
    // Grid view (default)
    switch (size) {
      case 'small':
        return 'md:col-span-1';
      case 'medium':
        return 'md:col-span-2';
      case 'large':
        return 'md:col-span-3';
      default:
        return 'md:col-span-1';
    }
  };

  const renderWidget = (widget: DashboardWidget) => {
    const widgetIndex = widgets.findIndex(w => w.id === widget.id);
    const isFirst = widgetIndex === 0;
    const isLast = widgetIndex === widgets.length - 1;

    const renderContent = () => {
      switch (widget.widget_type) {
        case 'recent_tasks':
          return <RecentTasksWidget limit={widget.config?.limit || 5} />;
        case 'active_projects':
          return <ActiveProjectsWidget limit={widget.config?.limit || 4} />;
        case 'quick_stats':
          return <QuickStatsWidget />;
        case 'activity_feed':
          return <ActivityFeedWidget limit={widget.config?.limit || 10} />;
        case 'team_overview':
          return <TeamOverviewWidget limit={widget.config?.limit || 6} />;
        case 'client_list':
          return <ClientListWidget limit={widget.config?.limit || 6} />;
        default:
          return <p className="text-gray-500 text-sm">Widget not implemented yet</p>;
      }
    };

    return (
      <div
        key={widget.id}
        draggable
        onDragStart={() => handleDragStart(widget.id)}
        onDragOver={(e) => handleDragOver(e, widget.id)}
        onDragEnd={handleDragEnd}
        className={cn(
          "group relative transition-all duration-300 ease-out",
          getSizeClass(widget.size, currentView),
          draggedWidgetId === widget.id && "opacity-50"
        )}
      >
        <Card className={cn(
          "h-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700",
          currentView === 'compact' && "rounded-xl"
        )}>
          {/* Controls */}
          <div className="absolute left-2 top-3 flex items-center gap-1 z-10">
            {/* Desktop: Drag handle */}
            <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
            </div>
            
            {/* Mobile: Up/Down buttons */}
            <div className="flex md:hidden gap-0.5">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  moveWidgetUp(widget.id);
                }}
                disabled={isFirst}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  moveWidgetDown(widget.id);
                }}
                disabled={isLast}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
              onClick={() => handleDeleteWidget(widget.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <CardHeader className={cn(
            "pb-4",
            currentView === 'compact' && "pb-2 pt-3"
          )}>
            <div className="pl-7 md:pl-6">
              {editingWidgetId === widget.id ? (
                <Input
                  value={widget.title}
                  onChange={(e) => handleUpdateWidget(widget.id, { title: e.target.value })}
                  onBlur={() => setEditingWidgetId(null)}
                  className="h-8 text-lg font-semibold bg-transparent border-0 p-0 focus-visible:ring-0"
                  autoFocus
                />
              ) : (
                <CardTitle 
                  className="text-lg font-semibold cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  onClick={() => setEditingWidgetId(widget.id)}
                >
                  {widget.title}
                </CardTitle>
              )}
            </div>
          </CardHeader>

          <CardContent className={cn(
            "pt-0",
            currentView === 'compact' && "p-3"
          )}>
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    );
  };

  const handleDataRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
    queryClient.invalidateQueries({ queryKey: ['clients'] });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-[1800px] mx-auto">
        {/* Dashboard Hero Section - Quick Actions */}
        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="space-y-2">
                {(() => {
                  const [time, setTime] = React.useState(new Date().toLocaleTimeString());
                  React.useEffect(() => {
                    const interval = setInterval(() => {
                      setTime(new Date().toLocaleTimeString());
                    }, 1000);
                    return () => clearInterval(interval);
                  }, []);
                  return (
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                      {time}
                    </h1>
                  );
                })()}
                <p className="text-base text-gray-600 dark:text-gray-400">
                  Manage your projects and track progress
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3 items-center">
                <QuickActionsBar onDataChange={handleDataRefresh} />
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-2 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 bg-white dark:bg-gray-800">
                      <Plus className="h-4 w-4" />
                      Add Widget
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => handleAddWidget('recent_tasks')}>
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Recent Tasks
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAddWidget('active_projects')}>
                      <FolderKanban className="h-4 w-4 mr-2" />
                      Active Projects
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAddWidget('team_overview')}>
                      <Users className="h-4 w-4 mr-2" />
                      Team Overview
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAddWidget('client_list')}>
                      <Briefcase className="h-4 w-4 mr-2" />
                      Client List
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAddWidget('quick_stats')}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Quick Stats
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAddWidget('activity_feed')}>
                      <Activity className="h-4 w-4 mr-2" />
                      Activity Feed
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 lg:p-8">
          {/* Personalized Header */}
          <PersonalizedHeader />

          {/* Stats Bar */}
          <StatsBar />

          {/* Two Column Layout */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Content */}
            <div className="flex-1 space-y-6">
              {/* View Switcher */}
              <div className="mb-4">
                <ViewSwitcher
                  currentView={currentView}
                  onViewChange={handleViewChange}
                  availableViews={['grid', 'compact', 'list']}
                />
              </div>

              {/* Widgets Grid */}
            {isLoadingWidgets ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : widgets.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800">
                <p className="text-gray-500 mb-4">Initializing your dashboard...</p>
              </div>
            ) : (
              <div className={cn(
                "gap-4",
                currentView === 'grid' && "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
                currentView === 'compact' && "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3",
                currentView === 'list' && "flex flex-col space-y-4"
              )}>
                {widgets.map(renderWidget)}
              </div>
            )}
            </div>

            {/* Activity Feed Sidebar - Desktop Only */}
            <div className="hidden lg:block lg:w-80">
              <ActivityFeedSidebar />
            </div>
          </div>

          {/* Mobile Activity Feed */}
          <div className="lg:hidden mt-6">
            <ActivityFeedSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;