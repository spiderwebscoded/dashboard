
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

type ProjectStatus = 'In Progress' | 'Completed' | 'Planning' | 'On Hold' | 'Past Client';

interface ProjectCardProps {
  id: string;
  title: string;
  client: string;
  description: string;
  progress: number;
  status: ProjectStatus;
  deadline: string;
  team: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  className?: string;
  onCardClick?: () => void;
}

const getStatusColor = (status: ProjectStatus) => {
  switch (status) {
    case 'In Progress':
      return 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    case 'Completed':
      return 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
    case 'Planning':
      return 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800';
    case 'On Hold':
      return 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    case 'Past Client':
      return 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
    default:
      return 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
  }
};

const getProgressColor = (progress: number) => {
  if (progress >= 90) return 'bg-green-500 dark:bg-green-400';
  if (progress >= 50) return 'bg-blue-500 dark:bg-blue-400';
  if (progress >= 25) return 'bg-amber-500 dark:bg-amber-400';
  return 'bg-gray-500 dark:bg-gray-400';
};

const ProjectCard = ({
  id,
  title,
  client,
  description,
  progress,
  status,
  deadline,
  team,
  className,
  onCardClick,
}: ProjectCardProps) => {
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 border-l-4 border-gray-100 dark:border-gray-800 cursor-pointer", 
        progress >= 90 ? "border-l-green-500" : 
        progress >= 50 ? "border-l-blue-500" : 
        progress >= 25 ? "border-l-amber-500" : 
        "border-l-gray-300",
        className
      )}
      onClick={onCardClick}
    >
      <CardContent className="p-6 pb-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors group">
              {title}
              <span className="block w-0 group-hover:w-full h-0.5 bg-blue-500 transition-all duration-300 mt-0.5"></span>
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{client}</p>
          </div>
          <Badge className={cn("font-medium border", getStatusColor(status))}>
            {status}
          </Badge>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{description}</p>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Progress</span>
            <span className="text-xs font-medium">{progress}%</span>
          </div>
          <Progress 
            value={progress} 
            className="h-1.5 bg-gray-100 dark:bg-gray-800" 
          />
        </div>
        
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Calendar className="h-4 w-4 mr-1.5" />
          <span>Deadline: {deadline}</span>
        </div>
      </CardContent>
      
      <CardFooter className="px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-800/30 flex justify-between items-center border-t border-gray-100 dark:border-gray-800">
        <div className="flex -space-x-2 transition-transform hover:translate-x-1 duration-300">
          {team.slice(0, 3).map((member, index) => (
            <Avatar 
              key={member.id} 
              className={`border-2 border-white dark:border-gray-800 h-8 w-8 transition-all duration-300 hover:scale-110 z-[${10-index}]`}
            >
              {member.avatar ? (
                <AvatarImage src={member.avatar} alt={member.name} />
              ) : (
                <AvatarFallback className="text-xs bg-blue-500 text-white">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              )}
            </Avatar>
          ))}
          
          {team.length > 3 && (
            <Avatar className="border-2 border-white dark:border-gray-800 h-8 w-8">
              <AvatarFallback className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                +{team.length - 3}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
