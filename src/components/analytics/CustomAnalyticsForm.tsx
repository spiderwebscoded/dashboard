
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, Plus, X, BarChart3, PieChart, LineChart, AreaChart, Hash } from 'lucide-react';
import { addCustomAnalytic } from '@/services/analyticsService';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
  chart_type: z.enum(['stat', 'bar_chart', 'pie_chart', 'line_chart', 'area_chart']),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;
type ChartType = FormValues['chart_type'];

interface DataPoint {
  label?: string;
  name?: string;
  value: number;
}

interface CustomAnalyticsFormProps {
  onAnalyticAdded: () => void;
}

const CustomAnalyticsForm: React.FC<CustomAnalyticsFormProps> = ({ onAnalyticAdded }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chartType, setChartType] = useState<ChartType>('stat');
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([{ label: '', value: 0 }]);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      chart_type: 'stat',
      notes: '',
    },
  });

  // Update data points when chart type changes
  const handleChartTypeChange = (value: ChartType) => {
    setChartType(value);
    form.setValue('chart_type', value);
    
    // Reset data points based on chart type
    if (value === 'stat') {
      setDataPoints([{ label: 'Value', value: 0 }]);
    } else if (value === 'pie_chart') {
      setDataPoints([
        { name: '', value: 0 },
        { name: '', value: 0 },
      ]);
    } else {
      setDataPoints([
        { label: '', value: 0 },
        { label: '', value: 0 },
      ]);
    }
  };

  const addDataPoint = () => {
    if (chartType === 'pie_chart') {
      setDataPoints([...dataPoints, { name: '', value: 0 }]);
    } else {
      setDataPoints([...dataPoints, { label: '', value: 0 }]);
    }
  };

  const removeDataPoint = (index: number) => {
    if (dataPoints.length > 1) {
      setDataPoints(dataPoints.filter((_, i) => i !== index));
    }
  };

  const updateDataPoint = (index: number, field: 'label' | 'name' | 'value', value: string) => {
    const newDataPoints = [...dataPoints];
    if (field === 'value') {
      newDataPoints[index] = { ...newDataPoints[index], value: parseFloat(value) || 0 };
    } else {
      newDataPoints[index] = { ...newDataPoints[index], [field]: value };
    }
    setDataPoints(newDataPoints);
  };

  const validateDataPoints = (): boolean => {
    // Check if all data points have values
    const hasEmptyValues = dataPoints.some(dp => dp.value === 0 || isNaN(dp.value));
    if (hasEmptyValues) {
      toast({
        title: 'Validation Error',
        description: 'All data points must have non-zero values.',
        variant: 'destructive',
      });
      return false;
    }

    // Check if all data points have labels/names (except for stat)
    if (chartType !== 'stat') {
      const hasEmptyLabels = dataPoints.some(dp => {
        if (chartType === 'pie_chart') {
          return !dp.name || dp.name.trim() === '';
        } else {
          return !dp.label || dp.label.trim() === '';
        }
      });

      if (hasEmptyLabels) {
        toast({
          title: 'Validation Error',
          description: `All data points must have ${chartType === 'pie_chart' ? 'names' : 'labels'}.`,
          variant: 'destructive',
        });
        return false;
      }
    }

    return true;
  };
  
  const onSubmit = async (data: FormValues) => {
    if (!validateDataPoints()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await addCustomAnalytic({
        title: data.title,
        chart_type: chartType,
        data_points: dataPoints,
        notes: data.notes,
      });
      
      toast({
        title: 'Analytic added',
        description: 'Your custom analytic has been added successfully.',
      });
      
      // Reset form
      form.reset({
        title: '',
        chart_type: 'stat',
        notes: '',
      });
      setChartType('stat');
      setDataPoints([{ label: 'Value', value: 0 }]);
      
      onAnalyticAdded();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add custom analytic. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getChartTypeIcon = (type: ChartType) => {
    switch (type) {
      case 'stat': return <Hash className="h-4 w-4" />;
      case 'bar_chart': return <BarChart3 className="h-4 w-4" />;
      case 'pie_chart': return <PieChart className="h-4 w-4" />;
      case 'line_chart': return <LineChart className="h-4 w-4" />;
      case 'area_chart': return <AreaChart className="h-4 w-4" />;
    }
  };
  
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-lg">Add Custom Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g. Monthly Revenue" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="chart_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chart Type</FormLabel>
                  <Select onValueChange={handleChartTypeChange} value={chartType}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select chart type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="stat">
                        <div className="flex items-center gap-2">
                          {getChartTypeIcon('stat')}
                          Stat Card
                        </div>
                      </SelectItem>
                      <SelectItem value="bar_chart">
                        <div className="flex items-center gap-2">
                          {getChartTypeIcon('bar_chart')}
                          Bar Chart
                        </div>
                      </SelectItem>
                      <SelectItem value="pie_chart">
                        <div className="flex items-center gap-2">
                          {getChartTypeIcon('pie_chart')}
                          Pie Chart
                        </div>
                      </SelectItem>
                      <SelectItem value="line_chart">
                        <div className="flex items-center gap-2">
                          {getChartTypeIcon('line_chart')}
                          Line Chart
                        </div>
                      </SelectItem>
                      <SelectItem value="area_chart">
                        <div className="flex items-center gap-2">
                          {getChartTypeIcon('area_chart')}
                          Area Chart
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose how to visualize your data
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Data Points Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>Data Points</FormLabel>
                {chartType !== 'stat' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addDataPoint}
                    className="h-8"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                {dataPoints.map((point, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={chartType === 'pie_chart' ? 'Name' : 'Label'}
                      value={chartType === 'pie_chart' ? point.name || '' : point.label || ''}
                      onChange={(e) =>
                        updateDataPoint(index, chartType === 'pie_chart' ? 'name' : 'label', e.target.value)
                      }
                      disabled={chartType === 'stat'}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Value"
                      value={point.value || ''}
                      onChange={(e) => updateDataPoint(index, 'value', e.target.value)}
                      className="w-24"
                    />
                    {chartType !== 'stat' && dataPoints.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDataPoint(index)}
                        className="h-10 w-10 p-0 text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional information..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Add Analytic'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CustomAnalyticsForm;
