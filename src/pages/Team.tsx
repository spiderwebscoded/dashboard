
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronDown, UserPlus, Loader2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import TeamMemberCard from '@/components/dashboard/TeamMemberCard';
import EditTeamMemberDialog from '@/components/dashboard/EditTeamMemberDialog';
import ViewSwitcher, { ViewType } from '@/components/dashboard/ViewSwitcher';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTeamMembers, createTeamMember, deleteTeamMember, updateTeamMember } from '@/services/teamService';
import { TeamMember } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Team = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [currentView, setCurrentView] = useState<ViewType>('gallery');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [newMember, setNewMember] = useState<Partial<TeamMember>>({
    name: '',
    role: '',
    workload: 0,
    activeProjects: 0,
    availability: 'Available',
    skills: [],
  });
  const [newSkill, setNewSkill] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: teamData = [], isLoading, error, isError, refetch } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: getTeamMembers,
    retry: 2,
    // The onError option is not supported in the latest version of react-query
    // Instead, we'll handle errors in the component with the isError flag
  });
  
  // Display error toast when there's an error
  useEffect(() => {
    if (isError && error) {
      console.error("Error fetching team members:", error);
      toast({
        title: "Failed to load team members",
        description: "There was an error loading the team data. Please try again.",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);
  
  const addMemberMutation = useMutation({
    mutationFn: createTeamMember,
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
        toast({
          title: "Team member added",
          description: `${newMember.name} has been added to the team.`,
        });
        setAddDialogOpen(false);
        resetNewMemberForm();
      } else {
        toast({
          title: "Failed to add team member",
          description: "An error occurred while adding the team member.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to add team member",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });
  
  const deleteMemberMutation = useMutation({
    mutationFn: deleteTeamMember,
    onSuccess: (success, id) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
        toast({
          title: "Team member removed",
          description: "The team member has been removed.",
        });
      } else {
        toast({
          title: "Failed to remove team member",
          description: "An error occurred while removing the team member.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to remove team member",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });
  
  const editMemberMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<TeamMember> }) => 
      updateTeamMember(id, updates),
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
        toast({
          title: "Team member updated",
          description: "The team member has been updated successfully.",
        });
        setEditDialogOpen(false);
        setSelectedMember(null);
      } else {
        toast({
          title: "Failed to update team member",
          description: "An error occurred while updating the team member.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to update team member",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });
  
  useEffect(() => {
    const checkAndCreateTable = async () => {
      if (isError && error) {
        console.log("Attempting to recover from team members table error");
        // Could implement table creation logic here if needed
      }
    };
    
    checkAndCreateTable();
  }, [isError, error]);
  
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.role) {
      toast({
        title: "Missing information",
        description: "Please provide a name and role for the team member.",
        variant: "destructive",
      });
      return;
    }
    
    const workload = typeof newMember.workload === 'string' 
      ? parseInt(newMember.workload, 10) 
      : newMember.workload || 0;
    
    addMemberMutation.mutate({
      ...newMember,
      workload,
      activeProjects: newMember.activeProjects || 0,
      skills: newMember.skills || [],
    } as Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>);
  };
  
  const handleEditMember = (updatedMember: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>) => {
    if (!selectedMember) return;
    
    editMemberMutation.mutate({
      id: selectedMember.id,
      updates: updatedMember
    });
  };
  
  const handleDeleteMember = (id: string) => {
    if (confirm("Are you sure you want to remove this team member?")) {
      deleteMemberMutation.mutate(id);
    }
  };
  
  const handleOpenEditDialog = (member: TeamMember) => {
    setSelectedMember(member);
    setEditDialogOpen(true);
  };
  
  const handleAddSkill = () => {
    if (newSkill.trim() && !newMember.skills?.includes(newSkill.trim())) {
      setNewMember({
        ...newMember,
        skills: [...(newMember.skills || []), newSkill.trim()],
      });
      setNewSkill('');
    }
  };
  
  const handleRemoveSkill = (skill: string) => {
    setNewMember({
      ...newMember,
      skills: newMember.skills?.filter(s => s !== skill) || [],
    });
  };
  
  const resetNewMemberForm = () => {
    setNewMember({
      name: '',
      role: '',
      workload: 0,
      activeProjects: 0,
      availability: 'Available',
      skills: [],
    });
    setNewSkill('');
  };
  
  const filteredTeam = teamData.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
                          
    const matchesAvailability = availabilityFilter === 'all' || member.availability === availabilityFilter;
    
    return matchesSearch && matchesAvailability;
  });

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

  // Gallery View (existing cards)
  const GalleryView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {filteredTeam.map((member) => (
        <TeamMemberCard 
          key={member.id} 
          {...member} 
          onDelete={() => handleDeleteMember(member.id)}
          onEdit={() => handleOpenEditDialog(member)}
        />
      ))}
    </div>
  );

  // Table View
  const TableView = () => (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 dark:bg-gray-800/50">
            <TableHead className="font-semibold">Member</TableHead>
            <TableHead className="font-semibold">Role</TableHead>
            <TableHead className="font-semibold">Availability</TableHead>
            <TableHead className="font-semibold">Workload</TableHead>
            <TableHead className="font-semibold">Projects</TableHead>
            <TableHead className="font-semibold">Skills</TableHead>
            <TableHead className="font-semibold w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTeam.map((member) => (
            <TableRow
              key={member.id}
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 group"
              onClick={() => navigate(`/dashboard/team/${member.id}`)}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    {member.avatar ? (
                      <AvatarImage src={member.avatar} alt={member.name} />
                    ) : (
                      <AvatarFallback className="bg-blue-500 text-white text-sm">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="font-semibold text-gray-900 dark:text-white">{member.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-gray-600 dark:text-gray-400">{member.role}</TableCell>
              <TableCell>
                <Badge className={cn("text-xs font-medium", getAvailabilityColor(member.availability))}>
                  {member.availability}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress value={member.workload} className="h-2 w-20" />
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-10">{member.workload}%</span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                {member.activeProjects}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {member.skills.slice(0, 2).map((skill, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {member.skills.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{member.skills.length - 2}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEditDialog(member);
                    }}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMember(member.id);
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  // List View
  const ListView = () => (
    <div className="space-y-3">
      {filteredTeam.map((member) => (
        <div
          key={member.id}
          className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow cursor-pointer group"
          onClick={() => navigate(`/dashboard/team/${member.id}`)}
        >
          <Avatar className="h-14 w-14 shrink-0">
            {member.avatar ? (
              <AvatarImage src={member.avatar} alt={member.name} />
            ) : (
              <AvatarFallback className="bg-blue-500 text-white font-semibold">
                {member.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">{member.name}</h3>
              <Badge className={cn("text-xs font-medium", getAvailabilityColor(member.availability))}>
                {member.availability}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{member.role}</p>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 min-w-[120px]">
                <span className="text-xs text-gray-500">Workload:</span>
                <Progress value={member.workload} className="h-1.5 w-16" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{member.workload}%</span>
              </div>
              
              <div className="text-xs text-gray-500">
                {member.activeProjects} Active Project{member.activeProjects !== 1 ? 's' : ''}
              </div>
              
              <div className="flex flex-wrap gap-1">
                {member.skills.slice(0, 3).map((skill, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    {skill}
                  </Badge>
                ))}
                {member.skills.length > 3 && (
                  <Badge variant="outline" className="text-xs">+{member.skills.length - 3}</Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  handleOpenEditDialog(member);
                }}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteMember(member.id);
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team</h1>
          <p className="text-gray-500 mt-1">Manage your team members and their workload</p>
        </div>
        
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Team Member</DialogTitle>
              <DialogDescription>
                Add a new member to your team. Fill in their details below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddMember}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newMember.name || ''}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Role
                  </Label>
                  <Input
                    id="role"
                    value={newMember.role || ''}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="availability" className="text-right">
                    Availability
                  </Label>
                  <select
                    id="availability"
                    value={newMember.availability}
                    onChange={(e) => setNewMember({ 
                      ...newMember, 
                      availability: e.target.value as TeamMember['availability'] 
                    })}
                    className="col-span-3 rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="Available">Available</option>
                    <option value="Busy">Busy</option>
                    <option value="Away">Away</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="workload" className="text-right">
                    Workload %
                  </Label>
                  <Input
                    id="workload"
                    type="number"
                    min="0"
                    max="100"
                    value={newMember.workload || 0}
                    onChange={(e) => setNewMember({ 
                      ...newMember, 
                      workload: parseInt(e.target.value) 
                    })}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="projects" className="text-right">
                    Active Projects
                  </Label>
                  <Input
                    id="projects"
                    type="number"
                    min="0"
                    value={newMember.activeProjects || 0}
                    onChange={(e) => setNewMember({ 
                      ...newMember, 
                      activeProjects: parseInt(e.target.value) 
                    })}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right pt-2">Skills</Label>
                  <div className="col-span-3">
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill"
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleAddSkill}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {newMember.skills?.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {skill}
                          <button 
                            type="button" 
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-muted-foreground hover:text-foreground ml-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addMemberMutation.isPending}>
                  {addMemberMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Member'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        <EditTeamMemberDialog
          member={selectedMember}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSave={handleEditMember}
          isPending={editMemberMutation.isPending}
        />
      </div>
      
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search team members..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Availability
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                  <DropdownMenuRadioItem value="all">All Members</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Available">Available</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Busy">Busy</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Away">Away</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Offline">Offline</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex justify-end">
          <ViewSwitcher
            currentView={currentView}
            onViewChange={setCurrentView}
            availableViews={['gallery', 'table', 'list']}
          />
        </div>
      </div>
      
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      )}
      
      {isError && !isLoading && (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 max-w-md">
            <h3 className="font-semibold mb-2">Error loading team members</h3>
            <p className="text-sm">{error instanceof Error ? error.message : "Unable to load team data"}</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => refetch()}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      )}
      
      {!isLoading && !isError && teamData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 text-center mb-4">No team members found. Add your first team member to get started.</p>
          <Button 
            onClick={() => setAddDialogOpen(true)}
            className="mt-2"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Team Member
          </Button>
        </div>
      )}
      
      {!isLoading && !isError && teamData.length > 0 && (
        <>
          {filteredTeam.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500 text-center">No team members found matching your filters.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setAvailabilityFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              {currentView === 'gallery' && <GalleryView />}
              {currentView === 'table' && <TableView />}
              {currentView === 'list' && <ListView />}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Team;
