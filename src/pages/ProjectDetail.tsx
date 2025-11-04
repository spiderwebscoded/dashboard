import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjects, deleteProject } from '@/services/projectService';
import {
  getProjectTasks,
  createProjectTask,
  updateProjectTask,
  deleteProjectTask,
  toggleProjectTaskCompletion,
} from '@/services/projectTaskService';
import {
  getProjectNotes,
  createProjectNote,
  updateProjectNote,
  deleteProjectNote,
} from '@/services/projectNoteService';
import {
  getProjectCalendarEvents,
  getProjectCalendarEventsByDate,
  createProjectCalendarEvent,
  deleteProjectCalendarEvent,
} from '@/services/projectCalendarService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  CheckSquare,
  FileText,
  Plus,
  Trash2,
  Edit2,
  Share,
  MoreHorizontal,
  ChevronDown,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import EditProjectDialog from '@/components/dashboard/EditProjectDialog';
import DeleteConfirmDialog from '@/components/dashboard/DeleteConfirmDialog';

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for forms
  const [newTaskText, setNewTaskText] = useState('');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // State for dialogs
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch projects data
  const { data: projects = [], isLoading: isLoadingProject } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  const project = projects.find((p) => p.id === projectId);

  // Fetch tasks
  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ['project-tasks', projectId],
    queryFn: () => getProjectTasks(projectId),
    enabled: !!projectId,
  });

  // Fetch notes
  const { data: notes = [], isLoading: isLoadingNotes } = useQuery({
    queryKey: ['project-notes', projectId],
    queryFn: () => getProjectNotes(projectId!),
    enabled: !!projectId,
  });

  // Fetch calendar events
  const { data: calendarEvents = [] } = useQuery({
    queryKey: ['project-calendar-events', projectId],
    queryFn: () => getProjectCalendarEvents(projectId!),
    enabled: !!projectId,
  });

  // Mutations for tasks
  const createTaskMutation = useMutation({
    mutationFn: createProjectTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId] });
      setNewTaskText('');
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
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      toggleProjectTaskCompletion(id, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteProjectTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId] });
      toast({
        title: 'Task deleted',
        description: 'Your task has been removed.',
      });
    },
  });

  // Mutations for notes
  const createNoteMutation = useMutation({
    mutationFn: createProjectNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-notes', projectId] });
      setNewNote({ title: '', content: '' });
      toast({
        title: 'Note created',
        description: 'Your note has been saved successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to create note',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, title, content }: { id: string; title: string; content: string }) =>
      updateProjectNote(id, { title, content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-notes', projectId] });
      setEditingNote(null);
      toast({
        title: 'Note updated',
        description: 'Your changes have been saved.',
      });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: deleteProjectNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-notes', projectId] });
      toast({
        title: 'Note deleted',
        description: 'Your note has been removed.',
      });
    },
  });

  // Mutations for calendar events
  const createEventMutation = useMutation({
    mutationFn: createProjectCalendarEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-calendar-events', projectId] });
      toast({
        title: 'Event added',
        description: 'Your calendar event has been created.',
      });
    },
  });

  // Mutation for deleting project
  const deleteProjectMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: 'Project deleted',
        description: 'The project has been successfully deleted.',
      });
      navigate('/dashboard/projects');
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete project',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  // Handlers
  const handleAddTask = () => {
    if (newTaskText.trim() && projectId) {
      createTaskMutation.mutate({
        title: newTaskText,
        project_id: projectId,
      });
    }
  };

  const handleToggleTask = (id: string, completed: boolean) => {
    updateTaskMutation.mutate({ id, completed: !completed });
  };

  const handleDeleteTask = (id: string) => {
    deleteTaskMutation.mutate(id);
  };

  const handleAddNote = () => {
    if (newNote.title.trim() && newNote.content.trim() && projectId) {
      createNoteMutation.mutate({
        project_id: projectId,
        title: newNote.title,
        content: newNote.content,
      });
    }
  };

  const handleUpdateNote = (id: string, title: string, content: string) => {
    updateNoteMutation.mutate({ id, title, content });
  };

  const handleDeleteNote = (id: string) => {
    deleteNoteMutation.mutate(id);
  };

  const handleAddCalendarEvent = () => {
    if (selectedDate && projectId) {
      const title = prompt('Add a note for this date:');
      if (title) {
        const dateStr = selectedDate.toISOString().split('T')[0];
        createEventMutation.mutate({
          project_id: projectId,
          event_date: dateStr,
          title,
        });
      }
    }
  };

  const handleDeleteProject = () => {
    if (projectId) {
      deleteProjectMutation.mutate(projectId);
    }
  };

  const handleDataRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    setEditDialogOpen(false);
  };

  // Get events for selected date
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return calendarEvents.filter((event) => event.event_date === dateStr);
  };

  if (isLoadingProject) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Project not found</h2>
          <Button onClick={() => navigate('/dashboard/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'Completed':
        return 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'Planning':
        return 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      case 'On Hold':
        return 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
    }
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard/projects')}
          className="mb-4 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Back to Projects</span>
          <span className="sm:hidden">Back</span>
        </Button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="w-full sm:w-auto overflow-hidden">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2 truncate">
              {project.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
              <span className="text-gray-600 dark:text-gray-400 truncate">Client: {project.client}</span>
              <Badge className={`font-medium border ${getStatusColor(project.status)} shrink-0`}>
                {project.status}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <Button variant="ghost" size="sm" className="flex-1 sm:flex-none">
              <Share className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Project
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Inline Project Stats */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-6 text-xs sm:text-sm pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 shrink-0">Progress:</span>
            <span className="font-semibold text-gray-900 dark:text-white">{project.progress}%</span>
            <div className="w-16 sm:w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="text-gray-500 shrink-0">Deadline:</span>
            <span className="font-semibold text-gray-900 dark:text-white truncate">{project.deadline}</span>
          </div>
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-gray-500 shrink-0">Description:</span>
            <span className="text-gray-700 dark:text-gray-300 truncate">{project.description}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        {/* Tasks Section */}
        <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">Project Tasks</CardTitle>
              <Button onClick={handleAddTask} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Quick Add Task */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
              <Input
                placeholder="+ Add new task..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                className="border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            {/* Task Table */}
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 dark:border-gray-800 hover:bg-transparent">
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="font-semibold">Task Name</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingTasks ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32">
                      <div className="text-center text-gray-500">Loading tasks...</div>
                    </TableCell>
                  </TableRow>
                ) : tasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32">
                      <div className="text-center text-gray-500">
                        <CheckSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm font-medium">No tasks yet</p>
                        <p className="text-xs mt-1">Add your first task above to get started!</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  tasks.map((task) => (
                    <TableRow
                      key={task.id}
                      className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 cursor-pointer"
                      onClick={() => navigate(`/dashboard/tasks/${task.id}`)}
                    >
                      <TableCell className="py-3" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => handleToggleTask(task.id, task.completed)}
                        />
                      </TableCell>
                      <TableCell className="py-3">
                        <span
                          className={`text-sm font-medium ${
                            task.completed ? 'line-through text-gray-400' : ''
                          }`}
                        >
                          {task.title}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge
                          variant="outline"
                          className={`text-xs font-medium ${
                            task.completed
                              ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}
                        >
                          {task.completed ? 'Completed' : 'In Progress'}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="text-xs text-gray-500">
                          {new Date(task.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </TableCell>
                      <TableCell className="py-3" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Task Stats Footer */}
            {tasks.length > 0 && (
              <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                <p className="text-xs text-gray-500">
                  {tasks.filter((t) => t.completed).length} of {tasks.length} tasks completed
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Schedule and Notes Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Schedule Card */}
          <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <CardTitle className="text-xl font-semibold">Schedule</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-6">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border w-full"
                />
              </div>

              {selectedDate && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {selectedDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <div className="space-y-2">
                      {selectedDateEvents.length === 0 ? (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900">
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            No events for this date
                          </p>
                        </div>
                      ) : (
                        selectedDateEvents.map((event) => (
                          <div
                            key={event.id}
                            className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                            onClick={() => {
                              // Navigate to associated task if event has task_id
                              if ((event as any).task_id) {
                                navigate(`/dashboard/tasks/${(event as any).task_id}`);
                              }
                            }}
                          >
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {event.title}
                            </p>
                            {event.description && (
                              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                                {event.description}
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <Button onClick={handleAddCalendarEvent} className="w-full" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Note for This Date
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes Card */}
          <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <CardTitle className="text-xl font-semibold">Notes</CardTitle>
                </div>
                <Button
                  onClick={handleAddNote}
                  size="sm"
                  disabled={!newNote.title.trim() || !newNote.content.trim()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
              {/* Add Note Form */}
              <div className="space-y-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                <Input
                  placeholder="Note title..."
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  className="text-sm"
                />
                <Textarea
                  placeholder="Note content..."
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  rows={3}
                  className="text-sm"
                />
              </div>

              {/* Notes List */}
              <div className="space-y-3">
                {isLoadingNotes ? (
                  <div className="text-center py-8 text-gray-500">Loading notes...</div>
                ) : notes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No notes yet</p>
                    <p className="text-xs mt-1">Add your first note above</p>
                  </div>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 group hover:border-gray-200 dark:hover:border-gray-600 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        {editingNote === note.id ? (
                          <Input
                            defaultValue={note.title}
                            onBlur={(e) => handleUpdateNote(note.id, e.target.value, note.content)}
                            autoFocus
                            className="text-sm font-medium"
                          />
                        ) : (
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                            {note.title}
                          </h4>
                        )}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingNote(note.id)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNote(note.id)}
                            className="h-7 w-7 p-0"
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      {editingNote === note.id ? (
                        <Textarea
                          defaultValue={note.content}
                          onBlur={(e) => handleUpdateNote(note.id, note.title, e.target.value)}
                          rows={3}
                          className="text-sm"
                        />
                      ) : (
                        <p className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap mb-2">
                          {note.content}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        {new Date(note.updated_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Project Dialog */}
      <EditProjectDialog
        project={project}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleDataRefresh}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        description={`Are you sure you want to delete "${project?.title}"? This action cannot be undone and will also delete all tasks, notes, and calendar events associated with this project.`}
      />
    </div>
  );
};

export default ProjectDetail;
