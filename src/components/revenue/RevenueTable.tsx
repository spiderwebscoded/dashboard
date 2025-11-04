
import React, { useState } from 'react';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RevenueData } from '@/types/database';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveRevenueData, updateRevenueData } from '@/services/analyticsService';
import { useToast } from '@/components/ui/use-toast';
import RevenueForm from './RevenueForm';
import DeleteConfirmDialog from '../dashboard/DeleteConfirmDialog';

interface RevenueTableProps {
  data: RevenueData[];
  compact?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const RevenueTable = ({ data, compact = false, onEdit, onDelete }: RevenueTableProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<RevenueData | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  
  const updateMutation = useMutation({
    mutationFn: (data: { id: string, updates: Partial<RevenueData> }) => 
      updateRevenueData(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revenueData'] });
      toast({
        title: "Revenue updated",
        description: "The revenue entry has been updated successfully.",
      });
      setEditingItem(null);
    },
    onError: (error) => {
      console.error("Error updating revenue:", error);
      toast({
        title: "Update failed",
        description: "Failed to update the revenue entry. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleEditSubmit = (formData: Omit<RevenueData, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingItem) {
      updateMutation.mutate({
        id: editingItem.id,
        updates: formData
      });
    }
  };
  
  const handleDeleteConfirm = () => {
    if (itemToDelete && onDelete) {
      onDelete(itemToDelete);
      setItemToDelete(null);
    }
  };
  
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No revenue data available.
      </div>
    );
  }
  
  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead>Year</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              {!compact && <TableHead className="w-[100px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.month}</TableCell>
                <TableCell>{entry.year}</TableCell>
                <TableCell className="text-right font-medium">
                  R{typeof entry.value === 'number' 
                    ? entry.value.toLocaleString('en-US', { minimumFractionDigits: 2 })
                    : '0.00'}
                </TableCell>
                {!compact && (
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingItem(entry)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setItemToDelete(entry.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Edit Revenue Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Revenue Entry</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <RevenueForm 
              onSubmit={handleEditSubmit} 
              isLoading={updateMutation.isPending} 
              defaultValues={editingItem}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        title="Delete Revenue Entry"
        description="Are you sure you want to delete this revenue entry? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        isLoading={false}
      />
    </>
  );
};

export default RevenueTable;
