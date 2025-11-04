
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Building, FileText, Mail, Phone, MoreHorizontal, Edit, Trash2, DollarSign, Globe, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface ClientCardProps {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  logo?: string;
  industry?: string;
  contract_value?: number;
  priority?: 'High' | 'Medium' | 'Low';
  website?: string;
  status: 'Active' | 'Potential' | 'Former' | 'Past Client';
  className?: string;
  onClick?: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const getStatusColor = (status: 'Active' | 'Potential' | 'Former' | 'Past Client') => {
  switch (status) {
    case 'Active':
      return 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
    case 'Potential':
      return 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800';
    case 'Former':
      return 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
    case 'Past Client':
      return 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
    default:
      return 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
  }
};

const ClientCard = ({
  id,
  name,
  company,
  email,
  phone,
  logo,
  industry,
  contract_value,
  priority,
  website,
  status,
  className,
  onClick,
  onEdit,
  onDelete,
}: ClientCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Card 
      className={cn(
        "overflow-hidden card-hover border-t-4 cursor-pointer", 
        status === 'Active' ? "border-t-green-500" : 
        status === 'Potential' ? "border-t-purple-500" : 
        "border-t-gray-300",
        className
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 border-2 border-gray-100 dark:border-gray-700 shadow-sm transition-all duration-300 hover:scale-110">
            {logo ? (
              <AvatarImage src={logo} alt={company} />
            ) : (
              <AvatarFallback className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold">
                {company.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start min-w-0">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold truncate">{company}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{name}</p>
              </div>
              
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Badge className={cn("font-medium border", getStatusColor(status))}>
                  {status}
                </Badge>
                
                {(onEdit || onDelete) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className={cn(
                          "h-8 w-8 rounded-full transition-opacity duration-300",
                          isHovered ? "opacity-100" : "opacity-0"
                        )}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 animate-scale-in">
                      {onEdit && (
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onEdit(id);
                        }} className="cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit Client</span>
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(id);
                            }}
                            className="cursor-pointer text-red-500 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Remove Client</span>
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 min-w-0">
                <Mail className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                <span className="truncate">{email}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 min-w-0">
                <Phone className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                <span className="truncate">{phone}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              {industry && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 min-w-0">
                  <Briefcase className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                  <span className="truncate">{industry}</span>
                </div>
              )}
              
              {contract_value && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 min-w-0">
                  <DollarSign className="h-4 w-4 mr-2 text-green-500 dark:text-green-400 flex-shrink-0" />
                  <span className="truncate">${contract_value.toLocaleString()}</span>
                </div>
              )}
              
              {priority && (
                <div className="flex items-center text-sm min-w-0">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs truncate",
                      priority === 'High' ? 'border-red-300 text-red-600 dark:border-red-700 dark:text-red-400' :
                      priority === 'Medium' ? 'border-yellow-300 text-yellow-600 dark:border-yellow-700 dark:text-yellow-400' :
                      'border-blue-300 text-blue-600 dark:border-blue-700 dark:text-blue-400'
                    )}
                  >
                    {priority} Priority
                  </Badge>
                </div>
              )}
              
              {website && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 group hover:text-blue-600 dark:hover:text-blue-400 transition-colors min-w-0">
                  <Globe className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 flex-shrink-0" />
                  <a href={website} target="_blank" rel="noopener noreferrer" className="truncate hover:underline" onClick={(e) => e.stopPropagation()}>
                    Website
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientCard;
