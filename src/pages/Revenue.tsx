
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRevenueData, saveRevenueData, deleteRevenueData } from '@/services/analyticsService';
import ChartCard from '@/components/dashboard/ChartCard';
import PageTitle from '@/components/dashboard/PageTitle';
import { Button } from '@/components/ui/button';
import { Plus, BarChart3, PieChart, LineChart, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RevenueTable from '@/components/revenue/RevenueTable';
import RevenueForm from '@/components/revenue/RevenueForm';
import RevenueCharts from '@/components/revenue/RevenueCharts';
import RevenueStats from '@/components/revenue/RevenueStats';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogTrigger } from '@/components/ui/dialog';
import EmptyState from '@/components/dashboard/EmptyState';
import { RevenueData } from '@/types/database';

const Revenue = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const queryClient = useQueryClient();
  
  // Fetch revenue data
  const { data: revenueData, isLoading, isError } = useQuery({
    queryKey: ['revenueData'],
    queryFn: getRevenueData
  });
  
  // Create/update revenue mutation
  const saveMutation = useMutation({
    mutationFn: saveRevenueData,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['revenueData']});
      queryClient.invalidateQueries({queryKey: ['overallStats']});
      toast({
        title: "Revenue data saved",
        description: "Your changes have been saved successfully.",
      });
      setIsAddDialogOpen(false);
    },
    onError: (error: any) => {
      console.error("Error saving revenue data:", error);
      toast({
        title: "Failed to save",
        description: "There was an error saving your changes. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Delete revenue mutation
  const deleteMutation = useMutation({
    mutationFn: deleteRevenueData,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['revenueData']});
      queryClient.invalidateQueries({queryKey: ['overallStats']});
      toast({
        title: "Revenue deleted",
        description: "The revenue entry has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Error deleting revenue data:", error);
      toast({
        title: "Failed to delete",
        description: "There was an error deleting the revenue entry. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleAddRevenue = (data: Omit<RevenueData, 'id' | 'created_at' | 'updated_at'>) => {
    saveMutation.mutate(data);
  };
  
  const handleDeleteRevenue = (id: string) => {
    deleteMutation.mutate(id);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-50 text-blue-600 mb-4">
          <BarChart3 className="h-8 w-8 animate-pulse" />
        </div>
        <h3 className="text-lg font-medium">Loading revenue data...</h3>
        <p className="text-sm text-muted-foreground mt-1">Please wait while we fetch your data.</p>
      </div>
    );
  }
  
  // Ensure revenueData is an array
  const revenueDataArray: RevenueData[] = revenueData || [];
  const isEmpty = revenueDataArray.length === 0;
  
  return (
    <div className="container mx-auto p-6 md:p-8 max-w-[1600px] space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-2">
            Revenue Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base">Track, analyze and manage your financial data</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-sm">
              <Plus className="h-4 w-4" />
              <span>Add Revenue</span>
            </Button>
          </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Revenue Entry</DialogTitle>
              </DialogHeader>
              <RevenueForm onSubmit={handleAddRevenue} isLoading={saveMutation.isPending} />
            </DialogContent>
        </Dialog>
      </div>
      
      {isEmpty ? (
        <EmptyState
          icon={<BarChart3 className="h-10 w-10 text-gray-400" />}
          title="No revenue data yet"
          description="Start by adding your first revenue entry to visualize your financial performance."
          actions={
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Revenue Data
            </Button>
          }
        />
      ) : (
        <>
          <RevenueStats data={revenueDataArray} />
          
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full md:w-auto grid-cols-3">
              <TabsTrigger value="overview" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="charts" className="gap-2">
                <PieChart className="h-4 w-4" />
                <span className="hidden sm:inline">Charts</span>
              </TabsTrigger>
              <TabsTrigger value="data" className="gap-2">
                <LineChart className="h-4 w-4" />
                <span className="hidden sm:inline">Raw Data</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ChartCard title="Revenue Trend" subtitle="Monthly revenue over time">
                  <RevenueCharts data={revenueDataArray} chartType="line" />
                </ChartCard>
                <ChartCard title="Revenue Distribution" subtitle="By category">
                  <RevenueCharts data={revenueDataArray} chartType="pie" />
                </ChartCard>
              </div>
              <ChartCard title="Recent Revenue Entries">
                <RevenueTable 
                  data={revenueDataArray.slice(0, 5)} 
                  compact 
                />
              </ChartCard>
            </TabsContent>
            
            <TabsContent value="charts" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard title="Revenue Trend" subtitle="Monthly revenue over time">
                  <RevenueCharts data={revenueDataArray} chartType="line" />
                </ChartCard>
                <ChartCard title="Revenue Distribution" subtitle="By category">
                  <RevenueCharts data={revenueDataArray} chartType="pie" />
                </ChartCard>
                <ChartCard title="Revenue Comparison" subtitle="Year over year">
                  <RevenueCharts data={revenueDataArray} chartType="bar" />
                </ChartCard>
                <ChartCard title="Revenue vs Costs" subtitle="Profit margin">
                  <RevenueCharts data={revenueDataArray} chartType="area" />
                </ChartCard>
              </div>
            </TabsContent>
            
            <TabsContent value="data">
              <ChartCard title="Revenue Data" action={
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </Button>
              }>
                <RevenueTable 
                  data={revenueDataArray} 
                  onDelete={handleDeleteRevenue}
                  onEdit={(id) => console.log('Edit', id)} 
                />
              </ChartCard>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default Revenue;
