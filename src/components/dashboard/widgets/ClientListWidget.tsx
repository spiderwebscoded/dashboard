import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, ExternalLink } from 'lucide-react';
import { getClients } from '@/services/clientService';
import { cn } from '@/lib/utils';

interface ClientListWidgetProps {
  limit?: number;
}

const ClientListWidget: React.FC<ClientListWidgetProps> = ({ limit = 6 }) => {
  const navigate = useNavigate();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });

  const activeClients = clients
    .filter(c => c.status === 'Active')
    .slice(0, limit);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200';
      case 'Potential':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex items-center gap-3 p-3 border rounded-lg">
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activeClients.length === 0) {
    return (
      <div className="text-center py-8">
        <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">No active clients</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activeClients.map((client) => (
        <div
          key={client.id}
          className="group flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-700"
          onClick={() => navigate(`/dashboard/clients/${client.id}`)}
        >
          <Avatar className="h-10 w-10 shrink-0">
            {client.logo ? (
              <AvatarImage src={client.logo} alt={client.company} />
            ) : (
              <AvatarFallback className="bg-purple-500 text-white text-sm">
                {client.company.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {client.company}
            </p>
            <p className="text-xs text-gray-500 truncate">{client.name}</p>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <Badge className={cn("text-xs font-medium border", getStatusColor(client.status))}>
              {client.status}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/dashboard/clients/${client.id}`);
              }}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
      
      {clients.filter(c => c.status === 'Active').length > limit && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2"
          onClick={() => navigate('/dashboard/clients')}
        >
          View all active clients
        </Button>
      )}
    </div>
  );
};

export default ClientListWidget;
