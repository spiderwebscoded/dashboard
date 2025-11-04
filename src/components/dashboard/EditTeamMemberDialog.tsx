
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Loader2 } from 'lucide-react';
import { TeamMember } from '@/types/database';

interface EditTeamMemberDialogProps {
  member: TeamMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (member: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>) => void;
  isPending: boolean;
}

const EditTeamMemberDialog: React.FC<EditTeamMemberDialogProps> = ({
  member,
  open,
  onOpenChange,
  onSave,
  isPending
}) => {
  const [editedMember, setEditedMember] = useState<Partial<TeamMember>>({
    name: '',
    role: '',
    email: '',
    phone: '',
    department: '',
    workload: 0,
    activeProjects: 0,
    availability: 'Available',
    skills: [],
  });
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (member) {
      setEditedMember({
        name: member.name,
        role: member.role,
        email: member.email || '',
        phone: member.phone || '',
        department: member.department || '',
        workload: member.workload,
        activeProjects: member.activeProjects,
        availability: member.availability,
        skills: [...member.skills],
      });
    }
  }, [member]);

  const handleAddSkill = () => {
    if (newSkill.trim() && !editedMember.skills?.includes(newSkill.trim())) {
      setEditedMember({
        ...editedMember,
        skills: [...(editedMember.skills || []), newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setEditedMember({
      ...editedMember,
      skills: editedMember.skills?.filter(s => s !== skill) || [],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedMember.name || !editedMember.role) {
      return;
    }
    
    // Convert workload to number if it's a string
    const workload = typeof editedMember.workload === 'string' 
      ? parseInt(editedMember.workload, 10) 
      : editedMember.workload || 0;
    
    onSave({
      name: editedMember.name || '',
      role: editedMember.role || '',
      email: editedMember.email,
      phone: editedMember.phone,
      department: editedMember.department,
      workload,
      activeProjects: editedMember.activeProjects || 0,
      availability: editedMember.availability as TeamMember['availability'] || 'Available',
      skills: editedMember.skills || [],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Team Member</DialogTitle>
          <DialogDescription>
            Update team member details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={editedMember.name || ''}
                onChange={(e) => setEditedMember({ ...editedMember, name: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role" className="text-right">
                Role
              </Label>
              <Input
                id="edit-role"
                value={editedMember.role || ''}
                onChange={(e) => setEditedMember({ ...editedMember, role: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                Email
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={editedMember.email || ''}
                onChange={(e) => setEditedMember({ ...editedMember, email: e.target.value })}
                placeholder="email@company.com"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-phone" className="text-right">
                Phone
              </Label>
              <Input
                id="edit-phone"
                type="tel"
                value={editedMember.phone || ''}
                onChange={(e) => setEditedMember({ ...editedMember, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-department" className="text-right">
                Department
              </Label>
              <Input
                id="edit-department"
                value={editedMember.department || ''}
                onChange={(e) => setEditedMember({ ...editedMember, department: e.target.value })}
                placeholder="e.g., Engineering"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-workload" className="text-right">
                Workload %
              </Label>
              <Input
                id="edit-workload"
                type="number"
                min="0"
                max="100"
                value={editedMember.workload || 0}
                onChange={(e) => setEditedMember({ 
                  ...editedMember, 
                  workload: parseInt(e.target.value) 
                })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-projects" className="text-right">
                Active Projects
              </Label>
              <Input
                id="edit-projects"
                type="number"
                min="0"
                value={editedMember.activeProjects || 0}
                onChange={(e) => setEditedMember({ 
                  ...editedMember, 
                  activeProjects: parseInt(e.target.value) 
                })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-availability" className="text-right">
                Availability
              </Label>
              <select
                id="edit-availability"
                value={editedMember.availability}
                onChange={(e) => setEditedMember({ 
                  ...editedMember, 
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
                  {editedMember.skills?.map((skill, index) => (
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
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

export default EditTeamMemberDialog;
