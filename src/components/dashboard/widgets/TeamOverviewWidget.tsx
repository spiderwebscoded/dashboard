import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Users, ExternalLink } from 'lucide-react';
import { getTeamMembers } from '@/services/teamService';
import { cn } from '@/lib/utils';

interface TeamOverviewWidgetProps {
  limit?: number;
}

const TeamOverviewWidget: React.FC<TeamOverviewWidgetProps> = ({ limit = 6 }) => {
  const navigate = useNavigate();

  const { data: teamMembers = [], isLoading } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: getTeamMembers,
  });

  const recentMembers = teamMembers.slice(0, limit);

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'Available':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200';
      case 'Busy':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200';
      case 'Away':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse p-3 border rounded-lg">
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (recentMembers.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">No team members</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {recentMembers.map((member) => (
        <div
          key={member.id}
          className="group p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-700"
          onClick={() => navigate(`/dashboard/team/${member.id}`)}
        >
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-10 w-10">
              {member.avatar ? (
                <AvatarImage src={member.avatar} alt={member.name} />
              ) : (
                <AvatarFallback className="bg-blue-500 text-white text-sm">
                  {member.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {member.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{member.role}</p>
            </div>
          </div>
          
          <Badge className={cn("text-xs font-medium border w-full justify-center", getAvailabilityColor(member.availability))}>
            {member.availability}
          </Badge>
          
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Workload</span>
              <span className="font-medium">{member.workload}%</span>
            </div>
            <Progress value={member.workload} className="h-1.5" />
          </div>
        </div>
      ))}
      
      {teamMembers.length > limit && (
        <div className="col-span-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => navigate('/dashboard/team')}
          >
            View all {teamMembers.length} team members
          </Button>
        </div>
      )}
    </div>
  );
};

export default TeamOverviewWidget;
