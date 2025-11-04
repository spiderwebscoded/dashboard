import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, ChevronDown, Pencil, Trash2, Calendar, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
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
import ProjectCard from '@/components/dashboard/ProjectCard';
import ViewSwitcher, { ViewType } from '@/components/dashboard/ViewSwitcher';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjects, deleteProject } from '@/services/projectService';
import { Project } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import DataEntryForm from '@/components/dashboard/DataEntryForm';
import EditProjectDialog from '@/components/dashboard/EditProjectDialog';
import { cn } from '@/lib/utils';

const Projects = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('gallery');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch projects with React Query
  const { data: projectsData = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: 'Project deleted',
        description: 'The project has been removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete project',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    },
  });

  const handleDeleteProject = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProjectMutation.mutate(id);
    }
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setEditDialogOpen(true);
  };

  const handleDataRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  };

  const filteredProjects = projectsData.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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

  // Gallery View (existing card view)
  const GalleryView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredProjects.map((project) => (
        <div key={project.id} className="relative group">
          <ProjectCard {...project} onCardClick={() => navigate(`/dashboard/projects/${project.id}`)} />
          <div className="absolute top-3 right-3 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 bg-white"
              onClick={(e) => {
                e.stopPropagation();
                handleEditProject(project);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 bg-white text-red-500 hover:text-red-700"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteProject(project.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  // Table View
  const TableView = () => (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="min-w-[800px]">
        <TableHeader>
          <TableRow className="bg-gray-50 dark:bg-gray-800/50">
            <TableHead className="font-semibold">Project</TableHead>
            <TableHead className="font-semibold">Client</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Progress</TableHead>
            <TableHead className="font-semibold">Deadline</TableHead>
            <TableHead className="font-semibold w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProjects.map((project) => (
            <TableRow
              key={project.id}
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 group"
              onClick={() => navigate(`/dashboard/projects/${project.id}`)}
            >
              <TableCell className="font-medium">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{project.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {project.description}
                  </div>
                </div>
              </TableCell>
              <TableCell>{project.client}</TableCell>
              <TableCell>
                <Badge variant="outline" className={`text-xs font-medium border ${getStatusColor(project.status)}`}>
                  {project.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress value={project.progress} className="h-2 w-24" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{project.progress}%</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  {project.deadline}
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <button
                      className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProject(project);
                      }}
                    >
                      Edit Project
                    </button>
                    <button
                      className="w-full text-left px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id);
                      }}
                    >
                      Delete Project
                    </button>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </div>
  );

  // Timeline View (Gantt-style)
  const TimelineView = () => {
    const today = new Date();
    const timelineStart = new Date();
    timelineStart.setDate(today.getDate() - 30); // Start 30 days ago
    const timelineEnd = new Date();
    timelineEnd.setDate(today.getDate() + 90); // End 90 days from now
    
    const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    
    // Generate month markers for the timeline
    const getMonthMarkers = () => {
      const markers = [];
      const current = new Date(timelineStart);
      
      while (current <= timelineEnd) {
        const position = ((current.getTime() - timelineStart.getTime()) / (timelineEnd.getTime() - timelineStart.getTime())) * 100;
        markers.push({
          date: new Date(current),
          position: position,
          label: current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        });
        current.setMonth(current.getMonth() + 1);
      }
      
      return markers;
    };

    const getTodayPosition = () => {
      return ((today.getTime() - timelineStart.getTime()) / (timelineEnd.getTime() - timelineStart.getTime())) * 100;
    };

    const getProjectTimelineData = (project: any) => {
      // Assuming projects start based on created date or now if no created date
      const createdAt = project.created_at ? new Date(project.created_at) : new Date(today);
      const deadline = new Date(project.deadline);
      
      // Calculate start position (projects start date or timeline start, whichever is later)
      const projectStart = createdAt < timelineStart ? timelineStart : createdAt;
      const startPosition = ((projectStart.getTime() - timelineStart.getTime()) / (timelineEnd.getTime() - timelineStart.getTime())) * 100;
      
      // Calculate end position
      const projectEnd = deadline > timelineEnd ? timelineEnd : deadline;
      const endPosition = ((projectEnd.getTime() - timelineStart.getTime()) / (timelineEnd.getTime() - timelineStart.getTime())) * 100;
      
      // Calculate project duration width
      const durationWidth = endPosition - startPosition;
      
      // Calculate completed width based on progress
      const completedWidth = (durationWidth * project.progress) / 100;
      
      // Check if overdue
      const isOverdue = deadline < today && project.status !== 'completed';
      
      return {
        startPosition: Math.max(0, startPosition),
        durationWidth: Math.max(0.5, durationWidth), // Minimum 0.5% width for visibility
        completedWidth,
        isOverdue,
        daysRemaining: Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
        deadlineDate: deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
    };

    const monthMarkers = getMonthMarkers();
    const todayPosition = getTodayPosition();

    return (
      <div className="space-y-3 overflow-x-auto pb-4 scrollbar-thin">
        <div className="min-w-[900px]">
          {/* Timeline Header with Month Markers */}
          <div className="flex items-stretch mb-2">
            <div className="w-64 shrink-0" /> {/* Project name column spacer */}
            <div className="flex-1 relative h-16 bg-gray-50 dark:bg-gray-800/30 rounded-t-lg border border-gray-200 dark:border-gray-700 border-b-0">
              {/* Month labels */}
              <div className="absolute top-0 left-0 right-0 h-8 flex items-center px-2">
                {monthMarkers.map((marker, idx) => (
                  <div
                    key={idx}
                    className="absolute -translate-x-1/2 text-xs font-semibold text-gray-700 dark:text-gray-300"
                    style={{ left: `${marker.position}%` }}
                  >
                    {marker.label}
                  </div>
                ))}
              </div>
              
              {/* Week grid lines */}
              <div className="absolute top-8 left-0 right-0 bottom-0">
                {Array.from({ length: Math.ceil(totalDays / 7) }).map((_, idx) => {
                  const weekPosition = (idx * 7 / totalDays) * 100;
                  return (
                    <div
                      key={idx}
                      className="absolute top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700"
                      style={{ left: `${weekPosition}%` }}
                    />
                  );
                })}
                
                {/* Today indicator line in header */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10"
                  style={{ left: `${todayPosition}%` }}
                >
                  <div className="absolute -top-0 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap">
                    Today
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Items */}
          <div className="space-y-2">
            {filteredProjects.map((project) => {
              const timelineData = getProjectTimelineData(project);
              
              return (
                <div
                  key={project.id}
                  className="flex items-stretch group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 rounded-lg transition-colors"
                >
                  {/* Project Info Column */}
                  <div 
                    className="w-64 shrink-0 p-3 border-l-4 rounded-l-lg cursor-pointer"
                    style={{ borderLeftColor: timelineData.isOverdue ? '#ef4444' : '#3b82f6' }}
                    onClick={() => navigate(`/dashboard/projects/${project.id}`)}
                  >
                    <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                      {project.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                      {project.client}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] font-medium border ${getStatusColor(project.status)}`}
                      >
                        {project.status}
                      </Badge>
                      {timelineData.isOverdue && (
                        <span className="text-[10px] text-red-600 dark:text-red-400 font-semibold">
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Timeline Bar Column */}
                  <div className="flex-1 relative min-h-[80px] p-3 border border-l-0 border-gray-200 dark:border-gray-700 rounded-r-lg cursor-pointer"
                    onClick={() => navigate(`/dashboard/projects/${project.id}`)}
                  >
                    {/* Week grid lines */}
                    {Array.from({ length: Math.ceil(totalDays / 7) }).map((_, idx) => {
                      const weekPosition = (idx * 7 / totalDays) * 100;
                      return (
                        <div
                          key={idx}
                          className="absolute top-0 bottom-0 w-px bg-gray-100 dark:bg-gray-800"
                          style={{ left: `${weekPosition}%` }}
                        />
                      );
                    })}

                    {/* Today indicator line */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-blue-400/30 dark:bg-blue-500/30 z-10"
                      style={{ left: `${todayPosition}%` }}
                    />

                    {/* Project Timeline Bar */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 h-8 flex items-center"
                      style={{ 
                        left: `${timelineData.startPosition}%`,
                        width: `${timelineData.durationWidth}%`,
                        minWidth: '40px'
                      }}
                    >
                      {/* Total duration bar (background) */}
                      <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600" />
                      
                      {/* Completed progress bar */}
                      <div
                        className={cn(
                          'absolute left-0 top-0 bottom-0 rounded-md transition-all duration-300',
                          timelineData.isOverdue && project.progress < 100
                            ? 'bg-gradient-to-r from-red-500 to-red-600'
                            : project.progress >= 90
                            ? 'bg-gradient-to-r from-green-500 to-green-600'
                            : project.progress >= 50
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                            : 'bg-gradient-to-r from-amber-500 to-amber-600'
                        )}
                        style={{ 
                          width: `${(timelineData.completedWidth / timelineData.durationWidth) * 100}%`
                        }}
                      />

                      {/* Progress text */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={cn(
                          "text-xs font-semibold z-10 drop-shadow-sm",
                          project.progress > 30 ? "text-white" : "text-gray-700 dark:text-gray-300"
                        )}>
                          {project.progress}%
                        </span>
                      </div>

                      {/* Deadline flag at the end */}
                      <div className="absolute -right-1 top-1/2 -translate-y-1/2">
                        <div className={cn(
                          "w-2 h-6 rounded-r",
                          timelineData.isOverdue && project.progress < 100
                            ? "bg-red-600"
                            : "bg-gray-400 dark:bg-gray-500"
                        )} />
                        <div className="absolute -bottom-5 right-0 text-[10px] font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {timelineData.deadlineDate}
                        </div>
                      </div>

                      {/* Hover tooltip */}
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap z-20">
                        <div className="font-semibold">{project.title}</div>
                        <div className="text-gray-300 dark:text-gray-400">
                          {timelineData.isOverdue 
                            ? `Overdue by ${Math.abs(timelineData.daysRemaining)} days`
                            : `${timelineData.daysRemaining} days remaining`
                          }
                        </div>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="w-full sm:w-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">Projects</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and track all your agency projects</p>
        </div>

        <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto shrink-0" onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          <span>New Project</span>
        </Button>
      </div>

      {/* Search, Filters, and View Switcher */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search projects..."
            className="pl-9 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center justify-between w-full sm:w-auto">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Status
                </div>
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px]">
              <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                <DropdownMenuRadioItem value="all">All Projects</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="In Progress">In Progress</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Completed">Completed</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Planning">Planning</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="On Hold">On Hold</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Past Client">Past Client</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <ViewSwitcher
            currentView={currentView}
            onViewChange={setCurrentView}
            availableViews={['gallery', 'table', 'timeline']}
            className="w-full sm:w-auto"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Projects Display */}
      {!isLoading && filteredProjects.length === 0 && (
        <div className="col-span-full flex flex-col items-center justify-center py-12 px-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <p className="text-gray-500 text-center">No projects found matching your filters.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {!isLoading && filteredProjects.length > 0 && (
        <>
          {currentView === 'gallery' && <GalleryView />}
          {currentView === 'table' && <TableView />}
          {currentView === 'timeline' && <TimelineView />}
        </>
      )}

      {/* Add Project Form */}
      <DataEntryForm
        type="project"
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={handleDataRefresh}
      />

      {/* Edit Project Dialog */}
      <EditProjectDialog
        project={selectedProject}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleDataRefresh}
      />
    </div>
  );
};

export default Projects;
