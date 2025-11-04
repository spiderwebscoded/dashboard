
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
import { Loader2 } from 'lucide-react';
import { Client } from '@/types/database';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateClient } from '@/services/clientService';
import { useToast } from '@/hooks/use-toast';

interface EditClientDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const EditClientDialog: React.FC<EditClientDialogProps> = ({
  client,
  open,
  onOpenChange,
  onSuccess
}) => {
  const [editedClient, setEditedClient] = useState<Partial<Client>>({
    name: '',
    company: '',
    email: '',
    phone: '',
    status: 'Active',
    industry: '',
    contract_value: 0,
    priority: 'Medium',
    website: '',
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (client) {
      setEditedClient({
        name: client.name,
        company: client.company,
        email: client.email,
        phone: client.phone,
        status: client.status,
        industry: client.industry || '',
        contract_value: client.contract_value || 0,
        priority: client.priority || 'Medium',
        website: client.website || '',
      });
    }
  }, [client]);
  
  // Update client mutation
  const updateClientMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Client> }) => 
      updateClient(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: "Client updated",
        description: "The client has been updated successfully.",
      });
      onOpenChange(false);
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Failed to update client",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;
    
    updateClientMutation.mutate({
      id: client.id,
      updates: editedClient
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
          <DialogDescription>
            Make changes to the client information. Click save when you're done.
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
                value={editedClient.name || ''}
                onChange={(e) => setEditedClient({ ...editedClient, name: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-company" className="text-right">
                Company
              </Label>
              <Input
                id="edit-company"
                value={editedClient.company || ''}
                onChange={(e) => setEditedClient({ ...editedClient, company: e.target.value })}
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
                value={editedClient.email || ''}
                onChange={(e) => setEditedClient({ ...editedClient, email: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-phone" className="text-right">
                Phone
              </Label>
              <Input
                id="edit-phone"
                value={editedClient.phone || ''}
                onChange={(e) => setEditedClient({ ...editedClient, phone: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">
                Status
              </Label>
              <select
                id="edit-status"
                value={editedClient.status}
                onChange={(e) => setEditedClient({ 
                  ...editedClient, 
                  status: e.target.value as Client['status']
                })}
                className="col-span-3 rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="Active">Active</option>
                <option value="Potential">Potential</option>
                <option value="Former">Former</option>
                <option value="Past Client">Past Client</option>
              </select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-industry" className="text-right">
                Industry
              </Label>
              <Input
                id="edit-industry"
                value={editedClient.industry || ''}
                onChange={(e) => setEditedClient({ 
                  ...editedClient, 
                  industry: e.target.value 
                })}
                className="col-span-3"
                placeholder="e.g., Technology, Healthcare"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-contract-value" className="text-right">
                Contract Value
              </Label>
              <Input
                id="edit-contract-value"
                type="number"
                min="0"
                step="100"
                value={editedClient.contract_value || 0}
                onChange={(e) => setEditedClient({ 
                  ...editedClient, 
                  contract_value: parseFloat(e.target.value) || 0
                })}
                className="col-span-3"
                placeholder="Monthly/Project value"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-priority" className="text-right">
                Priority
              </Label>
              <select
                id="edit-priority"
                value={editedClient.priority}
                onChange={(e) => setEditedClient({ 
                  ...editedClient, 
                  priority: e.target.value as Client['priority']
                })}
                className="col-span-3 rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-website" className="text-right">
                Website
              </Label>
              <Input
                id="edit-website"
                type="url"
                value={editedClient.website || ''}
                onChange={(e) => setEditedClient({ 
                  ...editedClient, 
                  website: e.target.value 
                })}
                className="col-span-3"
                placeholder="https://example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateClientMutation.isPending}>
              {updateClientMutation.isPending ? (
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

export default EditClientDialog;
