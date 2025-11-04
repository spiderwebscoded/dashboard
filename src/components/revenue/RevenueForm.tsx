
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RevenueData } from '@/types/database';
import { DialogFooter } from '@/components/ui/dialog';

const monthOptions = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Create schema for form validation
const formSchema = z.object({
  month: z.string().min(1, { message: "Month is required" }),
  year: z.coerce.number().int().min(2000).max(2100),
  value: z.coerce.number().min(0, { message: "Revenue must be a positive number" }),
  costs: z.coerce.number().min(0, { message: "Costs must be a positive number" }).optional(),
  notes: z.string().optional(),
  category: z.string().optional(),
  source: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface RevenueFormProps {
  onSubmit: (data: Omit<RevenueData, 'id' | 'created_at'>) => void;
  isLoading: boolean;
  defaultValues?: RevenueData;
}

const RevenueForm = ({ onSubmit, isLoading, defaultValues }: RevenueFormProps) => {
  const currentYear = new Date().getFullYear();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      month: defaultValues?.month || 'January',
      year: defaultValues?.year || currentYear,
      value: defaultValues?.value || 0,
      costs: defaultValues?.costs || 0,
      notes: defaultValues?.notes || '',
      category: defaultValues?.category || 'General',
      source: defaultValues?.source || 'Sales',
    }
  });
  
  const handleSubmit = (data: FormValues) => {
    onSubmit({
      month: data.month,
      year: data.year,
      value: data.value,
      costs: data.costs,
      notes: data.notes,
      category: data.category,
      source: data.source,
    });
  };
  
  const categoryOptions = [
    'General', 'Product', 'Service', 'Subscription', 'Contract', 'License', 'Other'
  ];
  
  const sourceOptions = [
    'Sales', 'Investment', 'Grants', 'Royalties', 'Consulting', 'Other'
  ];
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="month"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Month</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a month" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {monthOptions.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter year"
                    min={2000}
                    max={2100}
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Revenue Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter revenue amount"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormDescription>Total revenue for this period</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="costs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Costs Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter costs amount"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormDescription>Total costs for this period</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categoryOptions.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sourceOptions.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional notes about this revenue entry"
                  disabled={isLoading}
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <DialogFooter className="mt-6">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : defaultValues ? 'Update Revenue' : 'Add Revenue'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default RevenueForm;
