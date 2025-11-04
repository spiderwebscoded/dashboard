import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getTeamMembers } from '@/services/teamService';
import { User } from 'lucide-react';

interface TeamMemberSelectorProps {
  value?: string | null;
  onChange: (memberId: string | null) => void;
  placeholder?: string;
  className?: string;
}

const TeamMemberSelector: React.FC<TeamMemberSelectorProps> = ({
  value,
  onChange,
  placeholder = 'Assign to...',
  className,
}) => {
  const { data: teamMembers = [], isLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: getTeamMembers,
  });

  return (
    <Select
      value={value || 'unassigned'}
      onValueChange={(val) => onChange(val === 'unassigned' ? null : val)}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="unassigned">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            <span>Unassigned</span>
          </div>
        </SelectItem>
        {isLoading ? (
          <SelectItem value="loading" disabled>
            <span className="text-gray-400">Loading...</span>
          </SelectItem>
        ) : (
          teamMembers.map((member) => (
            <SelectItem key={member.id} value={member.id}>
              <div className="flex items-center gap-2 min-w-0">
                <Avatar className="h-6 w-6 flex-shrink-0">
                  {member.avatar ? (
                    <AvatarImage src={member.avatar} alt={member.name} />
                  ) : (
                    <AvatarFallback className="text-xs bg-blue-500 text-white">
                      {member.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="truncate flex-1">{member.name}</span>
                <Badge
                  variant="outline"
                  className="ml-2 flex-shrink-0 text-xs"
                >
                  {member.workload}%
                </Badge>
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};

export default TeamMemberSelector;