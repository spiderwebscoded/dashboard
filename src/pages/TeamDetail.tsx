import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  Briefcase,
  MoreHorizontal,
  Edit2,
  Trash2,
  FolderKanban,
  CheckCircle2,
  Plus,
  GripVertical,
  X,
  FileText,
  BarChart3,
  ListChecks,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { getTeamMembers, deleteTeamMember, updateTeamMember } from '@/services/teamService';
import { getProjects } from '@/services/projectService';
import { getProjectTasks } from '@/services/projectTaskService';
import { TeamMember } from '@/types/database';
import EditTeamMemberDialog from '@/components/dashboard/EditTeamMemberDialog';
import { cn } from '@/lib/utils';
import {
  getTeamMemberWidgets,
  createTeamMemberWidget,
  updateTeamMemberWidget,
  deleteTeamMemberWidget,
  reorderTeamMemberWidgets,
  initializeDefaultWidgets,
  TeamMemberWidget,
  WidgetType,
  UpdateWidgetInput
} from '@/services/teamMemberWidgetService';

const TeamDetail = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  const [editingWidgetId, setEditingWidgetId] = useState<string | null>(null);

  // Fetch team members
  const { data: teamMembers = [], isLoading } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: getTeamMembers,
  });

  const member = teamMembers.find(m => m.id === memberId);

  // Fetch projects
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  // Fetch all tasks
  const { data: allTasks = [] } = useQuery({
    queryKey: ['all-tasks'],
    queryFn: () => getProjectTasks(),
  });

  // Fetch widgets
  const { data: widgets = [], isLoading: isLoadingWidgets } = useQuery({
    queryKey: ['team-member-widgets', memberId],
    queryFn: () => getTeamMemberWidgets(memberId!),
    enabled: !!memberId,
  });

  // Initialize default widgets if none exist
  useEffect(() => {
    if (memberId && !isLoadingWidgets && widgets.length === 0 && member) {
      initializeDefaultWidgets(memberId).then(() => {
        queryClient.invalidateQueries({ queryKey: ['team-member-widgets', memberId] });
      });
    }
  }, [memberId, isLoadingWidgets, widgets.length, member, queryClient]);

  // Get projects assigned to this team member
  const assignedProjects = projects.filter(project => 
    project.team?.some(t => t.id === memberId)
  );

  // Get tasks directly assigned to this member
  const memberTasks = allTasks.filter(task => task.assigned_to === memberId);

  // Widget mutations
  const createWidgetMutation = useMutation({
    mutationFn: createTeamMemberWidget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-member-widgets', memberId] });
      toast({
        title: 'Widget added',
        description: 'The widget has been added to your dashboard.',
      });
    },
  });

  const updateWidgetMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateTeamMemberWidget(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-member-widgets', memberId] });
    },
  });

  const deleteWidgetMutation = useMutation({
    mutationFn: deleteTeamMemberWidget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-member-widgets', memberId] });
      toast({
        title: 'Widget removed',
        description: 'The widget has been removed from your dashboard.',
      });
    },
  });

  const reorderWidgetsMutation = useMutation({
    mutationFn: ({ teamMemberId, widgetIds }: { teamMemberId: string; widgetIds: string[] }) =>
      reorderTeamMemberWidgets(teamMemberId, widgetIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-member-widgets', memberId] });
    },
  });

  // Update member mutation
  const updateMemberMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<TeamMember> }) =>
      updateTeamMember(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
    },
  });

  // Update individual member field with auto-save
  const handleUpdateMemberField = (field: keyof TeamMember, value: any) => {
    if (!memberId) return;
    
    updateMemberMutation.mutate(
      { id: memberId, updates: { [field]: value } },
      {
        onSuccess: () => {
          toast({
            title: 'Field updated',
            description: `${field} has been saved successfully.`,
          });
        },
        onError: (error) => {
          toast({
            title: 'Update failed',
            description: error instanceof Error ? error.message : 'Failed to save changes.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  // Delete member mutation
  const deleteMemberMutation = useMutation({
    mutationFn: deleteTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
      toast({
        title: 'Team member removed',
        description: 'The team member has been deleted.',
      });
      navigate('/dashboard/team');
    },
  });

  const handleDeleteMember = () => {
    if (confirm('Are you sure you want to remove this team member?')) {
      deleteMemberMutation.mutate(memberId!);
    }
  };

  const handleAddWidget = (type: WidgetType) => {
    if (!memberId) return;

    const titles: Record<WidgetType, string> = {
      member_info: 'Member Information',
      skills: 'Skills',
      notes: 'Notes',
      activity: 'Recent Activity',
      tasks: 'Assigned Tasks',
    };

    createWidgetMutation.mutate({
      team_member_id: memberId,
      widget_type: type,
      title: titles[type],
      position: widgets.length,
    });
  };

  const handleDeleteWidget = (id: string) => {
    deleteWidgetMutation.mutate(id);
  };

  const handleUpdateWidget = (id: string, updates: UpdateWidgetInput) => {
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

    queryClient.setQueryData(['team-member-widgets', memberId], newWidgets);
  };

  const handleDragEnd = () => {
    if (draggedWidgetId && memberId) {
      const widgetIds = widgets.map(w => w.id);
      reorderWidgetsMutation.mutate({ teamMemberId: memberId, widgetIds });
    }
    setDraggedWidgetId(null);
  };

  const moveWidgetUp = (id: string) => {
    const index = widgets.findIndex(w => w.id === id);
    if (index === 0) return; // Already at top
    
    const newWidgets = [...widgets];
    [newWidgets[index - 1], newWidgets[index]] = [newWidgets[index], newWidgets[index - 1]];
    
    queryClient.setQueryData(['team-member-widgets', memberId], newWidgets);
    
    const widgetIds = newWidgets.map(w => w.id);
    reorderWidgetsMutation.mutate({ teamMemberId: memberId!, widgetIds });
  };

  const moveWidgetDown = (id: string) => {
    const index = widgets.findIndex(w => w.id === id);
    if (index === widgets.length - 1) return; // Already at bottom
    
    const newWidgets = [...widgets];
    [newWidgets[index], newWidgets[index + 1]] = [newWidgets[index + 1], newWidgets[index]];
    
    queryClient.setQueryData(['team-member-widgets', memberId], newWidgets);
    
    const widgetIds = newWidgets.map(w => w.id);
    reorderWidgetsMutation.mutate({ teamMemberId: memberId!, widgetIds });
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'Available':
        return 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'Busy':
        return 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      case 'Away':
        return 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
      case 'Offline':
        return 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
      default:
        return 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200';
      case 'Completed':
        return 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 border-green-200';
      case 'Planning':
        return 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200';
      case 'On Hold':
        return 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200';
    }
  };

  const getWidgetIcon = (type: WidgetType) => {
    switch (type) {
      case 'member_info':
        return <FileText className="h-4 w-4" />;
      case 'skills':
        return <Briefcase className="h-4 w-4" />;
      case 'notes':
        return <FileText className="h-4 w-4" />;
      case 'activity':
        return <ListChecks className="h-4 w-4" />;
      case 'tasks':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const renderWidget = (widget: TeamMemberWidget) => {
    if (!member) return null;

    const completedProjects = assignedProjects.filter(p => p.status === 'Completed').length;
    const widgetIndex = widgets.findIndex(w => w.id === widget.id);
    const isFirst = widgetIndex === 0;
    const isLast = widgetIndex === widgets.length - 1;

    return (
      <div
        key={widget.id}
        draggable
        onDragStart={() => handleDragStart(widget.id)}
        onDragOver={(e) => handleDragOver(e, widget.id)}
        onDragEnd={handleDragEnd}
        className={cn(
          "group relative transition-all duration-300 ease-out",
          draggedWidgetId === widget.id && "opacity-50"
        )}
      >
        <Card className="hover:shadow-md transition-all duration-300">
          {/* Drag handle and delete */}
          <div className="absolute left-2 top-0.5 flex items-center gap-1 z-10">
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

          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 pl-7 md:pl-6">
              {getWidgetIcon(widget.widget_type)}
              {editingWidgetId === widget.id ? (
                <Input
                  value={widget.title}
                  onChange={(e) => handleUpdateWidget(widget.id, { title: e.target.value })}
                  onBlur={() => setEditingWidgetId(null)}
                  className="h-7 text-sm font-semibold"
                  autoFocus
                />
              ) : (
                <CardTitle 
                  className="text-sm cursor-pointer hover:text-blue-600"
                  onClick={() => setEditingWidgetId(widget.id)}
                >
                  {widget.title}
                </CardTitle>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {/* Member Info Widget */}
            {widget.widget_type === 'member_info' && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                  <Input
                    type="email"
                    defaultValue={member.email || ''}
                    placeholder="email@company.com"
                    className="flex-1 h-9 text-sm"
                    onBlur={(e) => {
                      if (e.target.value !== member.email) {
                        handleUpdateMemberField('email', e.target.value);
                      }
                    }}
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                  <Input
                    type="tel"
                    defaultValue={member.phone || ''}
                    placeholder="+1 (555) 123-4567"
                    className="flex-1 h-9 text-sm"
                    onBlur={(e) => {
                      if (e.target.value !== member.phone) {
                        handleUpdateMemberField('phone', e.target.value);
                      }
                    }}
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4 text-gray-400 shrink-0" />
                  <Input
                    defaultValue={member.department || ''}
                    placeholder="Department"
                    className="flex-1 h-9 text-sm"
                    onBlur={(e) => {
                      if (e.target.value !== member.department) {
                        handleUpdateMemberField('department', e.target.value);
                      }
                    }}
                  />
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Joined {member.created_at ? new Date(member.created_at).toLocaleDateString() : 'Recently'}
                  </span>
                </div>
              </div>
            )}

            {/* Skills Widget */}
            {widget.widget_type === 'skills' && (
              <div className="flex flex-wrap gap-2">
                {member.skills.length > 0 ? (
                  member.skills.map((skill, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    >
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No skills added yet</p>
                )}
              </div>
            )}



            {/* Tasks Widget */}
            {widget.widget_type === 'tasks' && (
              memberTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ListChecks className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No tasks assigned yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {memberTasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                      onClick={() => navigate(`/dashboard/tasks/${task.id}`)}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          readOnly
                          className="h-4 w-4 rounded"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className={cn(
                          "text-sm",
                          task.completed && "line-through text-gray-400"
                        )}>
                          {task.title}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                  {memberTasks.length > 5 && (
                    <p className="text-xs text-gray-500 text-center pt-2">
                      +{memberTasks.length - 5} more tasks
                    </p>
                  )}
                </div>
              )
            )}

            {/* Notes Widget */}
            {widget.widget_type === 'notes' && (
              <Textarea
                value={widget.config.notes || ''}
                onChange={(e) => handleUpdateWidget(widget.id, { 
                  config: { ...widget.config, notes: e.target.value } 
                })}
                placeholder="Add notes about this team member..."
                className="min-h-[120px] text-sm"
              />
            )}

            {/* Activity Widget */}
            {widget.widget_type === 'activity' && (
              <div className="space-y-3">
                <div className="text-sm text-gray-500">
                  <div className="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white">Joined the team</p>
                      <p className="text-xs text-gray-400">
                        {member.created_at ? new Date(member.created_at).toLocaleDateString() : 'Recently'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 pt-3">
                    <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white">Currently working on {member.activeProjects} project{member.activeProjects !== 1 ? 's' : ''}</p>
                      <p className="text-xs text-gray-400">Active</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Team member not found</p>
          <Button onClick={() => navigate('/dashboard/team')} className="mt-4">
            Back to Team
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Fixed Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard/team')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  {member.avatar ? (
                    <AvatarImage src={member.avatar} alt={member.name} />
                  ) : (
                    <AvatarFallback className="bg-blue-500 text-white text-xl">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{member.name}</h1>
                  <p className="text-gray-500 dark:text-gray-400">{member.role}</p>
                </div>
              </div>
              
              <Badge className={cn("font-medium", getAvailabilityColor(member.availability))}>
                {member.availability}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditDialogOpen(true)}
                className="gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Edit Member
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Member
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDeleteMember} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Member
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Customizable Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Add Widget Button */}
        <div className="flex justify-end mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Widget
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => handleAddWidget('member_info')}>
                <FileText className="h-4 w-4 mr-2" />
                Member Information
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddWidget('skills')}>
                <Briefcase className="h-4 w-4 mr-2" />
                Skills
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddWidget('tasks')}>
                <ListChecks className="h-4 w-4 mr-2" />
                Assigned Tasks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddWidget('notes')}>
                <FileText className="h-4 w-4 mr-2" />
                Notes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddWidget('activity')}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Recent Activity
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Widgets Grid */}
        {isLoadingWidgets ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : widgets.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <p className="text-gray-500 mb-4">Initializing dashboard...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {widgets.map(renderWidget)}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <EditTeamMemberDialog
        member={member}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={() => {
          queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
          setEditDialogOpen(false);
        }}
        isPending={updateMemberMutation.isPending}
      />
    </div>
  );
};

export default TeamDetail;
