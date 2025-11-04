
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { createTeamMember } from '@/services/teamService';
import { createProject } from '@/services/projectService';
import { createClient } from '@/services/clientService';
import { createProjectTask } from '@/services/projectTaskService';
import { useQueryClient } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Form schema for team member
const teamMemberSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  role: z.string().min(2, { message: 'Role must be at least 2 characters.' }),
  skills: z.string().optional(),
  workload: z.coerce.number().min(0).max(100).default(0),
  activeProjects: z.coerce.number().min(0).default(0),
  availability: z.enum(['Available', 'Busy', 'Away', 'Offline']).default('Available'),
});

// Form schema for client
const clientSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  company: z.string().min(2, { message: 'Company must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(5, { message: 'Phone number must be at least 5 characters.' }),
  status: z.enum(['Active', 'Potential', 'Former', 'Past Client']).default('Active'),
  industry: z.string().optional(),
  contract_value: z.coerce.number().min(0).optional(),
  priority: z.enum(['High', 'Medium', 'Low']).default('Medium'),
  website: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
});

// Form schema for project
const projectSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
  client: z.string().min(2, { message: 'Client must be at least 2 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  deadline: z.string().min(2, { message: 'Deadline is required.' }),
  progress: z.coerce.number().min(0).max(100).default(0),
  status: z.enum(['Planning', 'In Progress', 'On Hold', 'Completed', 'Past Client']).default('Planning'),
});

// Form schema for task
const taskSchema = z.object({
  title: z.string().min(2, { message: 'Task title must be at least 2 characters.' }),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  due_date: z.string().optional(),
});

type DataEntryFormProps = {
  type: 'team' | 'client' | 'project' | 'task';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

const DataEntryForm: React.FC<DataEntryFormProps> = ({ type, open, onOpenChange, onSuccess }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const queryClient = useQueryClient();
  
  // Define schema based on type
  const schema = 
    type === 'team' ? teamMemberSchema : 
    type === 'client' ? clientSchema : 
    type === 'task' ? taskSchema :
    projectSchema;
  
  const form = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: 
      type === 'team' ? { name: '', role: '', skills: '', workload: 0, activeProjects: 0, availability: 'Available' } : 
      type === 'client' ? { name: '', company: '', email: '', phone: '', status: 'Active', industry: '', contract_value: 0, priority: 'Medium', website: '' } : 
      type === 'task' ? { title: '', priority: 'medium', due_date: '' } :
      { title: '', client: '', description: '', deadline: '', progress: 0, status: 'Planning' },
  });
  
  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      let formattedData: any = { ...data };
      
      // Format data based on type
      if (type === 'team') {
        // Convert skills string to array
        formattedData.skills = data.skills ? data.skills.split(',').map((skill: string) => skill.trim()).filter(Boolean) : [];
        
        console.log("Submitting team member data:", formattedData);
        
        // Create team member
        await createTeamMember(formattedData);
        
        // Invalidate team members cache
        queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
      } else if (type === 'client') {
        // Format client data - convert camelCase to lowercase for database
        const clientData = {
          name: formattedData.name,
          company: formattedData.company,
          email: formattedData.email,
          phone: formattedData.phone,
          status: formattedData.status,
          industry: formattedData.industry || null,
          contract_value: formattedData.contract_value || null,
          priority: formattedData.priority || 'Medium',
          website: formattedData.website || null,
        };
        
        console.log("Submitting client data:", clientData);
        
        // Create client
        await createClient(clientData);
        
        // Invalidate clients cache
        queryClient.invalidateQueries({ queryKey: ['clients'] });
      } else if (type === 'task') {
        // Create standalone task (no project association)
        const taskData = {
          title: formattedData.title,
          priority: formattedData.priority || 'medium',
          due_date: formattedData.due_date || null,
          completed: false,
          project_id: null,  // Standalone task
        };
        
        console.log("Submitting task data:", taskData);
        
        // Create task
        await createProjectTask(taskData);
        
        // Invalidate tasks cache
        queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
        queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
      } else {
        // Create project with empty team array and ensure progress is a number
        formattedData.team = [];
        formattedData.progress = Number(data.progress) || 0;
        
        console.log("Submitting project data:", formattedData);
        
        // Create project
        await createProject(formattedData);
        
        // Invalidate projects cache
        queryClient.invalidateQueries({ queryKey: ['projects'] });
      }
      
      toast({
        title: 'Success!',
        description: `New ${type} added successfully.`,
      });
      
      form.reset();
      onSuccess();
      onOpenChange(false);
      
    } catch (error: any) {
      console.error(`Error adding ${type}:`, error);
      toast({
        title: 'Error',
        description: error.message || `Failed to add ${type}. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getTitle = () => {
    return `Add New ${type.charAt(0).toUpperCase() + type.slice(1)}`;
  };

  // Define the getFormFields function to render appropriate form fields based on form type
  const getFormFields = () => {
    switch (type) {
      case 'team':
        return (
          <>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Input placeholder="Developer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills (comma separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="React, TypeScript, Node.js" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="workload"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workload (%)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" max="100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="activeProjects"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Active Projects</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="availability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Availability</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Busy">Busy</SelectItem>
                      <SelectItem value="Away">Away</SelectItem>
                      <SelectItem value="Offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
        
      case 'client':
        return (
          <>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Inc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 234 567 890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Potential">Potential</SelectItem>
                      <SelectItem value="Former">Former</SelectItem>
                      <SelectItem value="Past Client">Past Client</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Technology, Healthcare, Finance" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="contract_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract Value ($)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="100" placeholder="Monthly or project value" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website (optional)</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
        
      case 'task':
        return (
          <>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Complete documentation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date (optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
        
      case 'project':
        return (
          <>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Website Redesign" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="client"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Inc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Project description..." 
                      className="min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deadline</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., June 30, 2025" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="progress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Progress (%)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" max="100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Planning">Planning</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Past Client">Past Client</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new {type} to your dashboard.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {getFormFields()}
            
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DataEntryForm;
