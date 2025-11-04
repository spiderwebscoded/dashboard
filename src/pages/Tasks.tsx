import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  CheckSquare,
  Plus,
  Trash2,
  Filter,
  Clock,
  ChevronDown,
  Share,
  MoreHorizontal,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import ViewSwitcher, { ViewType } from '@/components/dashboard/ViewSwitcher';
import {
  getProjectTasks,
  createProjectTask,
  updateProjectTask,
  deleteProjectTask,
} from '@/services/projectTaskService';
import { getProjects } from '@/services/projectService';
import { cn } from '@/lib/utils';
import QuickAssignButton from '@/components/tasks/QuickAssignButton';

const Tasks = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { userProfile, user } = useAuth();
  const queryClient = useQueryClient();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [filterProject, setFilterProject] = useState<'all' | string>('all');
  const [currentView, setCurrentView] = useState<ViewType>('table');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const displayName = userProfile?.display_name || user?.email?.split('@')[0] || 'User';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getCurrentDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  // Handle URL parameters on mount
  useEffect(() => {
    const dateParam = searchParams.get('date');
    const filterParam = searchParams.get('filter');
    
    if (dateParam) {
      setCurrentView('calendar');
      setSelectedDate(new Date(dateParam));
    }
    
    if (filterParam === 'completed') {
      setFilterStatus('completed');
    }
  }, [searchParams]);

  // Fetch all tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['all-tasks'],
    queryFn: () => getProjectTasks(),
  });

  // Fetch projects for the filter dropdown
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  // Mutations
  const createTaskMutation = useMutation({
    mutationFn: createProjectTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
      setNewTaskTitle('');
      toast({
        title: 'Task created',
        description: 'Your task has been added successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to create task',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateProjectTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteProjectTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
      toast({
        title: 'Task deleted',
        description: 'Your task has been removed.',
      });
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-red-200';
      case 'medium':
        return 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200';
      case 'low':
        return 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 border-green-200';
      default:
        return 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200';
    }
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      createTaskMutation.mutate({
        title: newTaskTitle,
        priority: 'medium',
        project_id: null,
      });
    }
  };

  const handleToggleTask = (id: string, completed: boolean) => {
    updateTaskMutation.mutate({
      id,
      data: { completed: !completed },
    });
  };

  const handleUpdatePriority = (id: string, priority: 'low' | 'medium' | 'high') => {
    updateTaskMutation.mutate({
      id,
      data: { priority },
    });
  };

  const handleDeleteTask = (id: string) => {
    deleteTaskMutation.mutate(id);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const statusMatch =
      filterStatus === 'all' ||
      (filterStatus === 'active' && !task.completed) ||
      (filterStatus === 'completed' && task.completed);

    const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;

    const projectMatch =
      filterProject === 'all' ||
      (filterProject === 'standalone' && !task.project_id) ||
      task.project_id === filterProject;

    return statusMatch && priorityMatch && projectMatch;
  });

  const stats = {
    total: tasks.length,
    active: tasks.filter((t) => !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
    high: tasks.filter((t) => t.priority === 'high' && !t.completed).length,
  };

  const getProjectName = (projectId: string | null) => {
    if (!projectId) return 'Personal';
    const project = projects.find((p) => p.id === projectId);
    return project ? project.title : 'Unknown Project';
  };

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return filteredTasks.filter((task) => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  // List View Component
  const ListView = () => (
    <div className="space-y-2">
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <CheckSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-medium">No tasks yet</p>
          <p className="text-xs mt-1">
            {tasks.length === 0 ? 'Add your first task above to get started!' : 'Try adjusting your filters'}
          </p>
        </div>
      ) : (
        filteredTasks.map((task) => (
          <div
            key={task.id}
            className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg group hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all cursor-pointer"
            onClick={() => navigate(`/dashboard/tasks/${task.id}`)}
          >
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => handleToggleTask(task.id, task.completed)}
              className="mt-0.5"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <span className={`text-sm font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                  {task.title}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTask(task.id);
                  }}
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </Badge>
                <span className="text-xs text-gray-500">{getProjectName(task.project_id)}</span>
                {task.assignee && (
                  <div className="flex items-center gap-1 text-xs text-gray-500" onClick={(e) => e.stopPropagation()}>
                    <Avatar className="h-4 w-4">
                      {task.assignee.avatar ? (
                        <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
                      ) : (
                        <AvatarFallback className="text-[8px] bg-blue-500 text-white">
                          {task.assignee.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span>{task.assignee.name}</span>
                  </div>
                )}
                <span className="text-xs text-gray-400">
                  {new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  // Calendar View Component
  const CalendarView = () => {
    const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Task Calendar</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="rounded-md border" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate ? selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Select a date'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedDateTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No tasks for this date</p>
              </div>
            ) : (
              selectedDateTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all"
                  onClick={() => navigate(`/dashboard/tasks/${task.id}`)}
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => handleToggleTask(task.id, task.completed)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1">
                    <span className={`text-sm font-medium ${task.completed ? 'line-through text-gray-400' : ''}`}>
                      {task.title}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </Badge>
                      <span className="text-xs text-gray-500">{getProjectName(task.project_id)}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTask(task.id);
                    }}
                    className="h-7 w-7 p-0"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // Table View Component
  const TableView = () => (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-gray-200 dark:border-gray-800 hover:bg-transparent">
          <TableHead className="w-12"></TableHead>
          <TableHead className="font-semibold">Task Name</TableHead>
          <TableHead className="font-semibold">Project</TableHead>
          <TableHead className="font-semibold">Priority</TableHead>
          <TableHead className="font-semibold">Status</TableHead>
          <TableHead className="font-semibold">Assigned To</TableHead>
          <TableHead className="font-semibold">Created</TableHead>
          <TableHead className="w-12"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={8} className="h-32">
              <div className="text-center text-gray-500">Loading tasks...</div>
            </TableCell>
          </TableRow>
        ) : filteredTasks.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="h-32">
              <div className="text-center text-gray-500">
                <CheckSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-medium">No tasks yet</p>
                <p className="text-xs mt-1">
                  {tasks.length === 0 ? 'Add your first task above to get started!' : 'Try adjusting your filters'}
                </p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          filteredTasks.map((task) => (
            <TableRow
              key={task.id}
              className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 cursor-pointer"
              onClick={() => navigate(`/dashboard/tasks/${task.id}`)}
            >
              <TableCell className="py-3" onClick={(e) => e.stopPropagation()}>
                <Checkbox checked={task.completed} onCheckedChange={() => handleToggleTask(task.id, task.completed)} />
              </TableCell>
              <TableCell className="py-3">
                <span className={`text-sm font-medium ${task.completed ? 'line-through text-gray-400' : ''}`}>
                  {task.title}
                </span>
              </TableCell>
              <TableCell className="py-3">
                <span className="text-xs text-gray-600 dark:text-gray-400">{getProjectName(task.project_id)}</span>
              </TableCell>
              <TableCell className="py-3" onClick={(e) => e.stopPropagation()}>
                <Select value={task.priority} onValueChange={(value: any) => handleUpdatePriority(task.id, value)}>
                  <SelectTrigger className="w-[110px] h-7 text-xs border-gray-200 dark:border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="py-3">
                <Badge variant="outline" className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.completed ? 'Completed' : task.priority}
                </Badge>
              </TableCell>
              <TableCell className="py-3">
                <QuickAssignButton
                  taskId={task.id}
                  currentAssignee={task.assignee}
                />
              </TableCell>
              <TableCell className="py-3">
                <span className="text-xs text-gray-500">
                  {new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </TableCell>
              <TableCell className="py-3" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteTask(task.id)}
                  className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto">
      {/* Greeting Header */}
      <div className="mb-6 sm:mb-8">
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">{getCurrentDate()}</p>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4 truncate">
          {getGreeting()}, {displayName}.
        </h1>

        {/* Inline Stats */}
        <div className="flex flex-wrap gap-4 sm:gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="font-semibold text-gray-900 dark:text-white">{stats.completed}</span>
            <span className="text-gray-500">Tasks Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-gray-400" />
            <span className="font-semibold text-gray-900 dark:text-white">{stats.active}</span>
            <span className="text-gray-500">Tasks In-Progress</span>
          </div>
          {stats.high > 0 && (
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 flex items-center justify-center text-red-600">⚠</span>
              <span className="font-semibold text-gray-900 dark:text-white">{stats.high}</span>
              <span className="text-gray-500">High Priority</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Task Card */}
      <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
        <CardHeader className="border-b border-gray-100 dark:border-gray-800">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <CardTitle className="text-xl font-semibold">My Tasks</CardTitle>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
              <ViewSwitcher
                currentView={currentView}
                onViewChange={setCurrentView}
                availableViews={['list', 'table', 'calendar']}
                className="w-full sm:w-auto"
              />
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="flex-1 sm:flex-none">
                  <Share className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
                <Button onClick={handleAddTask} className="flex-1 sm:flex-none">
                  <Plus className="h-4 w-4 sm:mr-2" />
                  <span className="sm:inline">Add Task</span>
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Quick Add Task */}
          {currentView !== 'calendar' && (
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
              <Input
                placeholder="+ Add new task..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                className="border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          )}

          {/* Filters */}
          {currentView !== 'calendar' && (
            <div className="px-4 sm:px-6 py-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 -mb-2 scrollbar-thin">
                <Button variant="ghost" size="sm" className="h-8 shrink-0">
                  <Filter className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Filter</span>
                </Button>
                <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                  <SelectTrigger className="w-[120px] sm:w-[140px] h-8 text-sm shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tasks</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPriority} onValueChange={(value: any) => setFilterPriority(value)}>
                  <SelectTrigger className="w-[120px] sm:w-[140px] h-8 text-sm shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterProject} onValueChange={(value: string) => setFilterProject(value)}>
                  <SelectTrigger className="w-[140px] sm:w-[180px] h-8 text-sm shrink-0">
                    <SelectValue placeholder="All Projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    <SelectItem value="standalone">Personal Tasks</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Views */}
          <div className={currentView === 'calendar' ? 'p-6' : ''}>
            {currentView === 'list' && <div className="px-4 sm:px-6 py-4"><ListView /></div>}
            {currentView === 'table' && (
              <div className="overflow-x-auto">
                <TableView />
              </div>
            )}
            {currentView === 'calendar' && <CalendarView />}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Tasks;
