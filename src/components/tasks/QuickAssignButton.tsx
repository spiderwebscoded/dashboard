import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserPlus, Check } from 'lucide-react';
import { assignTaskToMember } from '@/services/projectTaskService';
import { getTeamMembers } from '@/services/teamService';
import { updateTeamMemberStats } from '@/services/teamStatsService';
import { useToast } from '@/hooks/use-toast';

interface QuickAssignButtonProps {
  taskId: string;
  currentAssignee?: {
    id: string;
    name: string;
    avatar?: string;
  } | null;
  onAssignmentChange?: () => void;
}

const QuickAssignButton: React.FC<QuickAssignButtonProps> = ({
  taskId,
  currentAssignee,
  onAssignmentChange,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members'],
    queryFn: getTeamMembers,
  });

  const assignMutation = useMutation({
    mutationFn: ({ taskId, memberId }: { taskId: string; memberId: string | null }) =>
      assignTaskToMember(taskId, memberId),
    onSuccess: async (data) => {
      // Update stats for old assignee if exists
      if (currentAssignee) {
        await updateTeamMemberStats(currentAssignee.id);
      }
      // Update stats for new assignee if exists
      if (data.assigned_to) {
        await updateTeamMemberStats(data.assigned_to);
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });

      toast({
        title: 'Task assigned',
        description: data.assigned_to
          ? `Task assigned to ${data.assignee?.name}`
          : 'Task unassigned',
      });

      onAssignmentChange?.();
    },
    onError: (error) => {
      toast({
        title: 'Failed to assign task',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  const handleAssign = (memberId: string | null) => {
    assignMutation.mutate({ taskId, memberId });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={assignMutation.isPending}
        >
          {currentAssignee ? (
            <Avatar className="h-6 w-6">
              {currentAssignee.avatar ? (
                <AvatarImage src={currentAssignee.avatar} alt={currentAssignee.name} />
              ) : (
                <AvatarFallback className="text-xs bg-blue-500 text-white">
                  {currentAssignee.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
          ) : (
            <UserPlus className="h-4 w-4 text-gray-400" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            handleAssign(null);
          }}
          className="cursor-pointer"
        >
          <div className="flex items-center gap-2 w-full">
            <UserPlus className="h-4 w-4 text-gray-400" />
            <span>Unassign</span>
            {!currentAssignee && <Check className="h-4 w-4 ml-auto text-blue-500" />}
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {teamMembers.map((member) => (
          <DropdownMenuItem
            key={member.id}
            onClick={(e) => {
              e.stopPropagation();
              handleAssign(member.id);
            }}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-2 w-full min-w-0">
              <Avatar className="h-6 w-6 flex-shrink-0">
                {member.avatar ? (
                  <AvatarImage src={member.avatar} alt={member.name} />
                ) : (
                  <AvatarFallback className="text-xs bg-blue-500 text-white">
                    {member.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{member.name}</div>
                <div className="text-xs text-gray-500 truncate">{member.role}</div>
              </div>
              <Badge variant="outline" className="flex-shrink-0 text-xs">
                {member.workload}%
              </Badge>
              {currentAssignee?.id === member.id && (
                <Check className="h-4 w-4 text-blue-500 flex-shrink-0" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default QuickAssignButton;
