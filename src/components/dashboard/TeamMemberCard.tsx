
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FolderKanban, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface TeamMemberCardProps {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  workload: number;
  activeProjects: number;
  availability: 'Available' | 'Busy' | 'Away' | 'Offline';
  skills: string[];
  className?: string;
  onDelete?: () => void;
  onEdit?: () => void;
}

const getAvailabilityColor = (
  availability: 'Available' | 'Busy' | 'Away' | 'Offline'
) => {
  switch (availability) {
    case 'Available':
      return 'bg-green-50 text-green-600';
    case 'Busy':
      return 'bg-red-50 text-red-600';
    case 'Away':
      return 'bg-amber-50 text-amber-600';
    case 'Offline':
      return 'bg-gray-50 text-gray-600';
    default:
      return 'bg-gray-50 text-gray-600';
  }
};

const TeamMemberCard = ({
  id,
  name,
  role,
  avatar,
  workload,
  activeProjects,
  availability,
  skills,
  className,
  onDelete,
  onEdit,
}: TeamMemberCardProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      className={cn("overflow-hidden hover:shadow-md transition-shadow cursor-pointer", className)}
      onClick={() => navigate(`/dashboard/team/${id}`)}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            {avatar ? (
              <AvatarImage src={avatar} alt={name} />
            ) : (
              <AvatarFallback className="bg-blue-500 text-white">
                {name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{name}</h3>
                <p className="text-sm text-gray-500">{role}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className={cn("font-medium", getAvailabilityColor(availability))}>
                  {availability}
                </Badge>
                
                {(onDelete || onEdit) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger 
                      className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onEdit && (
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onEdit();
                        }}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                          }}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-500">Workload</span>
                <span className="text-xs font-medium">{workload}%</span>
              </div>
              <Progress 
                value={workload} 
                className={cn(
                  "h-1.5",
                  workload > 80 ? "bg-gray-100 [&>div]:bg-red-500" : 
                  workload > 60 ? "bg-gray-100 [&>div]:bg-amber-500" : 
                  "bg-gray-100 [&>div]:bg-green-500"
                )}
              />
            </div>
            
            <div className="flex items-center mt-4 text-sm text-gray-500">
              <FolderKanban className="h-4 w-4 mr-1" />
              <span>{activeProjects} Active Projects</span>
            </div>
            
            <div className="flex flex-wrap gap-1 mt-4">
              {skills.map((skill, index) => (
                <Badge key={index} variant="outline" className="bg-gray-50 text-gray-700 font-normal">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamMemberCard;
