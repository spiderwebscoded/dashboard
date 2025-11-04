
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAnalyticsSummary, getCustomAnalytics, deleteCustomAnalytic, CustomAnalytic } from '@/services/analyticsService';
import CustomAnalyticsForm from '@/components/analytics/CustomAnalyticsForm';
import CustomAnalyticChart from '@/components/analytics/CustomAnalyticChart';
import { Button } from '@/components/ui/button';
import { 
  Trash2, 
  LineChart as LineChartIcon, 
  BarChart as BarChartIcon, 
  PieChart as PieChartIcon, 
  Layers,
  Users,
  Briefcase,
  FolderKanban,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const Analytics = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get analytics summary data
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['analyticsSummary'],
    queryFn: getAnalyticsSummary,
    refetchOnWindowFocus: false,
  });
  
  // Get custom analytics data
  const { data: customAnalytics = [], isLoading: loadingCustom } = useQuery({
    queryKey: ['customAnalytics'],
    queryFn: getCustomAnalytics,
    refetchOnWindowFocus: false,
  });
  
  // Delete custom analytic mutation
  const deleteAnalyticMutation = useMutation({
    mutationFn: deleteCustomAnalytic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customAnalytics'] });
      toast({
        title: 'Analytic deleted',
        description: 'The custom analytic has been deleted.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete the analytic. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Handle analytic delete
  const handleDeleteAnalytic = (id: string) => {
    if (confirm('Are you sure you want to delete this analytic?')) {
      deleteAnalyticMutation.mutate(id);
    }
  };
  
  // Handle analytic added
  const handleAnalyticAdded = () => {
    queryClient.invalidateQueries({ queryKey: ['customAnalytics'] });
  };
  
  // Project status data for pie chart
  const projectStatusData = summary ? [
    { name: 'Completed', value: summary.completedProjects },
    { name: 'In Progress', value: summary.inProgressProjects },
    { name: 'Other', value: summary.projectCount - summary.completedProjects - summary.inProgressProjects },
  ] : [];
  
  // Team vs Client data for bar chart
  const teamClientData = summary ? [
    { name: 'Team Members', value: summary.teamCount },
    { name: 'Clients', value: summary.clientCount },
    { name: 'Projects', value: summary.projectCount },
  ] : [];
  
  // Top clients data for bar chart
  const topClientsData = summary?.topClients || [];
  
  // Soft pastel color palette
  const COLORS = ['#10b981', '#f472b6', '#60a5fa', '#fb923c', '#a78bfa', '#34d399', '#fbbf24', '#f87171'];
  
  // Skeleton loader component
  const SkeletonCard = () => (
    <Card className="animate-pulse">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </CardHeader>
      <CardContent>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
      </CardContent>
    </Card>
  );

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'in progress':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };
  
  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-base">Comprehensive insights and performance metrics</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center">
            <Layers className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center">
            <PieChartIcon className="mr-2 h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center">
            <BarChartIcon className="mr-2 h-4 w-4" />
            Clients
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center">
            <LineChartIcon className="mr-2 h-4 w-4" />
            Custom Analytics
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loadingSummary ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                {/* Team Members Card */}
                <Card 
                  className="hover:shadow-lg transition-all duration-300 border-l-4 border-blue-500 hover:-translate-y-1 cursor-pointer hover:scale-105"
                  onClick={() => navigate('/dashboard/team')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate('/dashboard/team')}
                  title="View all team members"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Team Members</CardTitle>
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {summary?.teamCount || 0}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Activity className="h-3 w-3 text-blue-500" />
                      Average workload: {Math.round(summary?.teamWorkloadAvg || 0)}%
                    </p>
                  </CardContent>
                </Card>
                
                {/* Clients Card */}
                <Card 
                  className="hover:shadow-lg transition-all duration-300 border-l-4 border-purple-500 hover:-translate-y-1 cursor-pointer hover:scale-105"
                  onClick={() => navigate('/dashboard/clients')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate('/dashboard/clients')}
                  title="View all clients"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Clients</CardTitle>
                    <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                      <Briefcase className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {summary?.clientCount || 0}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      Active partnerships
                    </p>
                  </CardContent>
                </Card>
                
                {/* Projects Card */}
                <Card 
                  className="hover:shadow-lg transition-all duration-300 border-l-4 border-green-500 hover:-translate-y-1 cursor-pointer hover:scale-105"
                  onClick={() => navigate('/dashboard/projects')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate('/dashboard/projects')}
                  title="View all projects"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Projects</CardTitle>
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <FolderKanban className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {summary?.projectCount || 0}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3 text-orange-500" />
                      Avg progress: {Math.round(summary?.avgProjectProgress || 0)}%
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-lg">Team & Client Overview</CardTitle>
                <CardDescription>Comparison of key metrics</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={teamClientData} barGap={8} barCategoryGap="20%">
                      <defs>
                        <linearGradient id="analyticsBar1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.9}/>
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0.6}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke="#e5e7eb" 
                        strokeOpacity={0.3}
                        vertical={false}
                      />
                      <XAxis 
                        dataKey="name" 
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
                          padding: '12px'
                        }}
                        cursor={{fill: 'rgba(16, 185, 129, 0.05)', radius: 8}}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="url(#analyticsBar1)" 
                        radius={[8, 8, 0, 0]}
                        animationDuration={1200}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-lg">Project Status</CardTitle>
                <CardDescription>Distribution by project status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="h-80 flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <defs>
                          {COLORS.map((color, index) => (
                            <linearGradient key={`gradient-status-${index}`} id={`pieGradientStatus${index}`} x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor={color} stopOpacity={0.95}/>
                              <stop offset="100%" stopColor={color} stopOpacity={0.7}/>
                            </linearGradient>
                          ))}
                        </defs>
                        <Pie
                          data={projectStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={90}
                          innerRadius={65}
                          fill="#8884d8"
                          dataKey="value"
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
                          {projectStatusData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={`url(#pieGradientStatus${index % COLORS.length})`}
                              stroke="#fff"
                              strokeWidth={3}
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                            padding: '12px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Legend */}
                  <div className="flex flex-col gap-3">
                    {projectStatusData.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.value} projects</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loadingSummary ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                <Card 
                  className="hover:shadow-lg transition-all duration-300 border-l-4 border-blue-500 hover:-translate-y-1 cursor-pointer hover:scale-105"
                  onClick={() => navigate('/dashboard/projects')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate('/dashboard/projects')}
                  title="View all projects"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Projects</CardTitle>
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <FolderKanban className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {summary?.projectCount || 0}
                    </div>
                  </CardContent>
                </Card>
                
                <Card 
                  className="hover:shadow-lg transition-all duration-300 border-l-4 border-green-500 hover:-translate-y-1 cursor-pointer hover:scale-105"
                  onClick={() => navigate('/dashboard/projects')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate('/dashboard/projects')}
                  title="View completed projects"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</CardTitle>
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {summary?.completedProjects || 0}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      {Math.round((summary?.completedProjects || 0) / (summary?.projectCount || 1) * 100)}% completion rate
                    </p>
                  </CardContent>
                </Card>
                
                <Card 
                  className="hover:shadow-lg transition-all duration-300 border-l-4 border-orange-500 hover:-translate-y-1 cursor-pointer hover:scale-105"
                  onClick={() => navigate('/dashboard/projects')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate('/dashboard/projects')}
                  title="View projects in progress"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</CardTitle>
                    <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {summary?.inProgressProjects || 0}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Activity className="h-3 w-3 text-orange-500" />
                      Avg: {Math.round(summary?.avgProjectProgress || 0)}% complete
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
          
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-lg">Recent Projects</CardTitle>
              <CardDescription>Latest project updates and progress</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSummary ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse p-4 border rounded-lg">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              ) : summary?.recentProjects && summary.recentProjects.length > 0 ? (
                <div className="space-y-4">
                  {summary.recentProjects.map(project => (
                    <div 
                      key={project.id}
                      onClick={() => navigate(`/dashboard/projects/${project.id}`)}
                      className="group p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:shadow-md transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                            {project.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{project.client}</p>
                        </div>
                        <Badge className={cn("ml-4", getStatusBadge(project.status))}>
                          {project.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>Progress</span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div 
                            className={cn(
                              "h-2 rounded-full transition-all duration-500",
                              project.progress >= 75 ? "bg-green-500" :
                              project.progress >= 50 ? "bg-blue-500" :
                              project.progress >= 25 ? "bg-yellow-500" : "bg-orange-500"
                            )}
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Deadline: {project.deadline}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FolderKanban className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 mb-2">No projects found</p>
                  <p className="text-sm text-gray-400">Create your first project to see it here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Clients Tab */}
        <TabsContent value="clients" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-lg">Top Clients by Projects</CardTitle>
                <CardDescription>Clients ranked by project volume</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                {topClientsData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topClientsData} barGap={8} barCategoryGap="20%">
                        <defs>
                          <linearGradient id="analyticsBar2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#a855f7" stopOpacity={0.9}/>
                            <stop offset="100%" stopColor="#a855f7" stopOpacity={0.6}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid 
                          strokeDasharray="3 3" 
                          stroke="#e5e7eb" 
                          strokeOpacity={0.3}
                          vertical={false}
                        />
                        <XAxis 
                          dataKey="name" 
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
                            padding: '12px'
                          }}
                          cursor={{fill: 'rgba(168, 85, 247, 0.05)', radius: 8}}
                        />
                        <Bar 
                          dataKey="projectCount" 
                          fill="url(#analyticsBar2)" 
                          radius={[8, 8, 0, 0]}
                          animationDuration={1200}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No client data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-lg">Client Distribution</CardTitle>
                <CardDescription>Project allocation by client</CardDescription>
              </CardHeader>
              <CardContent>
                {topClientsData.length > 0 ? (
                  <div className="flex items-center gap-6">
                    <div className="h-80 flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <defs>
                            {COLORS.map((color, index) => (
                              <linearGradient key={`gradient-client-${index}`} id={`pieGradientClient${index}`} x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity={0.95}/>
                                <stop offset="100%" stopColor={color} stopOpacity={0.7}/>
                              </linearGradient>
                            ))}
                          </defs>
                          <Pie
                            data={topClientsData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={90}
                            innerRadius={65}
                            fill="#8884d8"
                            dataKey="projectCount"
                            nameKey="name"
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
                            {topClientsData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={`url(#pieGradientClient${index % COLORS.length})`}
                                stroke="#fff"
                                strokeWidth={3}
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'white',
                              border: 'none',
                              borderRadius: '12px',
                              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                              padding: '12px'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Legend */}
                    <div className="flex flex-col gap-3">
                      {topClientsData.slice(0, 5).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{item.name}</div>
                            <div className="text-xs text-gray-500">{item.projectCount} projects</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No client data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Custom Analytics Tab */}
        <TabsContent value="custom" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Custom Analytics Grid */}
            <div className="lg:col-span-3">
              {loadingCustom ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : customAnalytics.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {customAnalytics.map((analytic: CustomAnalytic) => (
                    <Card key={analytic.id} className="hover:shadow-lg transition-shadow duration-300">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{analytic.title}</CardTitle>
                            {analytic.notes && (
                              <CardDescription className="mt-1">{analytic.notes}</CardDescription>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteAnalytic(analytic.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CustomAnalyticChart analytic={analytic} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="py-16">
                    <div className="text-center">
                      <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <LineChartIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">No custom analytics yet</h3>
                      <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">
                        Create your first custom analytic with rich visualizations to track your personalized metrics and KPIs
                      </p>
                      <p className="text-xs text-gray-400">
                        Use the form on the right to get started →
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Add Form */}
            <div className="lg:col-span-1">
              <CustomAnalyticsForm onAnalyticAdded={handleAnalyticAdded} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
