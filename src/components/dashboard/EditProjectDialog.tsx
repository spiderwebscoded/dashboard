
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { Project } from '@/types/database';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProject } from '@/services/projectService';
import { useToast } from '@/hooks/use-toast';

interface EditProjectDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const EditProjectDialog: React.FC<EditProjectDialogProps> = ({
  project,
  open,
  onOpenChange,
  onSuccess
}) => {
  const [editedProject, setEditedProject] = useState<Partial<Project>>({
    title: '',
    client: '',
    description: '',
    deadline: '',
    progress: 0,
    status: 'Planning',
    team: [],
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (project) {
      setEditedProject({
        title: project.title,
        client: project.client,
        description: project.description,
        deadline: project.deadline,
        progress: project.progress,
        status: project.status,
        team: [...project.team],
      });
    }
  }, [project]);
  
  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Project> }) => 
      updateProject(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Project updated",
        description: "The project has been updated successfully.",
      });
      onOpenChange(false);
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Failed to update project",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    
    updateProjectMutation.mutate({
      id: project.id,
      updates: editedProject
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Make changes to the project information. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-title" className="text-right">
                Title
              </Label>
              <Input
                id="edit-title"
                value={editedProject.title || ''}
                onChange={(e) => setEditedProject({ ...editedProject, title: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-client" className="text-right">
                Client
              </Label>
              <Input
                id="edit-client"
                value={editedProject.client || ''}
                onChange={(e) => setEditedProject({ ...editedProject, client: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={editedProject.description || ''}
                onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
                className="col-span-3"
                rows={4}
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-deadline" className="text-right">
                Deadline
              </Label>
              <Input
                id="edit-deadline"
                value={editedProject.deadline || ''}
                onChange={(e) => setEditedProject({ ...editedProject, deadline: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-progress" className="text-right">
                Progress %
              </Label>
              <Input
                id="edit-progress"
                type="number"
                min="0"
                max="100"
                value={editedProject.progress || 0}
                onChange={(e) => setEditedProject({ 
                  ...editedProject, 
                  progress: parseInt(e.target.value) 
                })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">
                Status
              </Label>
              <select
                id="edit-status"
                value={editedProject.status}
                onChange={(e) => setEditedProject({ 
                  ...editedProject, 
                  status: e.target.value as Project['status']
                })}
                className="col-span-3 rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
                <option value="Past Client">Past Client</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateProjectMutation.isPending}>
              {updateProjectMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProjectDialog;
