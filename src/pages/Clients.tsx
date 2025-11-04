
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronDown, UserPlus, Pencil, Trash2, MoreHorizontal, Globe, Briefcase, DollarSign, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import ClientCard from '@/components/dashboard/ClientCard';
import ViewSwitcher, { ViewType } from '@/components/dashboard/ViewSwitcher';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClients, createClient, updateClient, deleteClient } from '@/services/clientService';
import { Client } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import DataEntryForm from '@/components/dashboard/DataEntryForm';
import EditClientDialog from '@/components/dashboard/EditClientDialog';
import { cn } from '@/lib/utils';

const Clients = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentView, setCurrentView] = useState<ViewType>('gallery');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch clients with React Query
  const { data: clientsData = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });
  
  // Delete client mutation
  const deleteClientMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: "Client deleted",
        description: "The client has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete client",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });
  
  const handleDeleteClient = (id: string) => {
    if (confirm("Are you sure you want to delete this client?")) {
      deleteClientMutation.mutate(id);
    }
  };
  
  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setEditDialogOpen(true);
  };
  
  const handleDataRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['clients'] });
  };
  
  const filteredClients = clientsData.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          client.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          client.email.toLowerCase().includes(searchQuery.toLowerCase());
                          
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 border-green-200';
      case 'Potential':
        return 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200';
      case 'Former':
        return 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200';
      case 'Past Client':
        return 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200';
    }
  };

  // Gallery View (existing cards)
  const GalleryView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {filteredClients.map((client) => (
        <ClientCard 
          key={client.id}
          {...client}
          onClick={() => navigate(`/dashboard/clients/${client.id}`)}
          onEdit={() => handleEditClient(client)}
          onDelete={() => handleDeleteClient(client.id)}
        />
      ))}
    </div>
  );

  // Table View
  const TableView = () => (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 dark:bg-gray-800/50">
            <TableHead className="font-semibold">Company</TableHead>
            <TableHead className="font-semibold">Contact</TableHead>
            <TableHead className="font-semibold">Email</TableHead>
            <TableHead className="font-semibold">Phone</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Priority</TableHead>
            <TableHead className="font-semibold">Value</TableHead>
            <TableHead className="font-semibold w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredClients.map((client) => (
            <TableRow
              key={client.id}
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 group"
              onClick={() => navigate(`/dashboard/clients/${client.id}`)}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    {client.logo ? (
                      <AvatarImage src={client.logo} alt={client.company} />
                    ) : (
                      <AvatarFallback className="bg-blue-500 text-white text-sm font-bold">
                        {client.company.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="font-semibold text-gray-900 dark:text-white">{client.company}</span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-gray-600 dark:text-gray-400">{client.name}</TableCell>
              <TableCell className="text-sm text-blue-600 dark:text-blue-400 hover:underline" onClick={(e) => e.stopPropagation()}>
                <a href={`mailto:${client.email}`}>{client.email}</a>
              </TableCell>
              <TableCell className="text-sm text-gray-600 dark:text-gray-400">{client.phone}</TableCell>
              <TableCell>
                <Badge className={cn("text-xs font-medium border", getStatusColor(client.status))}>
                  {client.status}
                </Badge>
              </TableCell>
              <TableCell>
                {client.priority && (
                  <Badge 
                    variant="outline"
                    className={cn(
                      "text-xs",
                      client.priority === 'High' ? 'border-red-300 text-red-600 dark:border-red-700 dark:text-red-400' :
                      client.priority === 'Medium' ? 'border-yellow-300 text-yellow-600 dark:border-yellow-700 dark:text-yellow-400' :
                      'border-blue-300 text-blue-600 dark:border-blue-700 dark:text-blue-400'
                    )}
                  >
                    {client.priority}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-sm font-medium text-gray-900 dark:text-white">
                {client.contract_value ? `$${client.contract_value.toLocaleString()}` : '-'}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      handleEditClient(client);
                    }}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClient(client.id);
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  // List View
  const ListView = () => (
    <div className="space-y-3">
      {filteredClients.map((client) => (
        <div
          key={client.id}
          className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow cursor-pointer group"
          onClick={() => navigate(`/dashboard/clients/${client.id}`)}
        >
          <Avatar className="h-16 w-16 shrink-0 border-2 border-gray-100 dark:border-gray-700">
            {client.logo ? (
              <AvatarImage src={client.logo} alt={client.company} />
            ) : (
              <AvatarFallback className="bg-blue-500 text-white font-bold text-lg">
                {client.company.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">{client.company}</h3>
              <Badge className={cn("text-xs font-medium border", getStatusColor(client.status))}>
                {client.status}
              </Badge>
              {client.priority && (
                <Badge 
                  variant="outline"
                  className={cn(
                    "text-xs",
                    client.priority === 'High' ? 'border-red-300 text-red-600 dark:border-red-700 dark:text-red-400' :
                    client.priority === 'Medium' ? 'border-yellow-300 text-yellow-600 dark:border-yellow-700 dark:text-yellow-400' :
                    'border-blue-300 text-blue-600 dark:border-blue-700 dark:text-blue-400'
                  )}
                >
                  {client.priority}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{client.name}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400" onClick={(e) => e.stopPropagation()}>
                <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                <a href={`mailto:${client.email}`} className="hover:text-blue-600 dark:hover:text-blue-400 truncate">
                  {client.email}
                </a>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400" onClick={(e) => e.stopPropagation()}>
                <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                <a href={`tel:${client.phone}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                  {client.phone}
                </a>
              </div>
              
              {client.website && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400" onClick={(e) => e.stopPropagation()}>
                  <Globe className="h-4 w-4 text-gray-400 shrink-0" />
                  <a href={client.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 truncate">
                    Website
                  </a>
                </div>
              )}
              
              {client.industry && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Briefcase className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="truncate">{client.industry}</span>
                </div>
              )}
              
              {client.contract_value && (
                <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                  <DollarSign className="h-4 w-4 shrink-0" />
                  <span>${client.contract_value.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  handleEditClient(client);
                }}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClient(client.id);
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 mt-1">Manage your client relationships</p>
        </div>
        
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setAddDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>
      
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search clients..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Status
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                  <DropdownMenuRadioItem value="all">All Clients</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Active">Active</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Potential">Potential</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Past Client">Past Client</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex justify-end">
          <ViewSwitcher
            currentView={currentView}
            onViewChange={setCurrentView}
            availableViews={['gallery', 'table', 'list']}
          />
        </div>
      </div>
      
      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Clients Display */}
      {!isLoading && (
        <>
          {filteredClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500 text-center">No clients found matching your filters.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              {currentView === 'gallery' && <GalleryView />}
              {currentView === 'table' && <TableView />}
              {currentView === 'list' && <ListView />}
            </>
          )}
        </>
      )}
      
      {/* Add Client Form */}
      <DataEntryForm
        type="client"
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={handleDataRefresh}
      />
      
      {/* Edit Client Dialog */}
      <EditClientDialog
        client={selectedClient}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleDataRefresh}
      />
    </div>
  );
};

export default Clients;
