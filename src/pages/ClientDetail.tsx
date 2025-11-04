import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  Briefcase,
  DollarSign,
  Calendar,
  MoreHorizontal,
  Edit2,
  Trash2,
  FolderKanban,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { getClients, deleteClient } from '@/services/clientService';
import { getProjects } from '@/services/projectService';
import { Client } from '@/types/database';
import EditClientDialog from '@/components/dashboard/EditClientDialog';
import { cn } from '@/lib/utils';

const ClientDetail = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Fetch clients
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });

  const client = clients.find(c => c.id === clientId);

  // Fetch projects
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  // Get projects for this client
  const clientProjects = projects.filter(project => 
    project.client === client?.company || project.client === client?.name
  );

  // Delete client mutation
  const deleteClientMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: 'Client deleted',
        description: 'The client has been removed.',
      });
      navigate('/dashboard/clients');
    },
  });

  const handleDeleteClient = () => {
    if (confirm('Are you sure you want to delete this client?')) {
      deleteClientMutation.mutate(clientId!);
    }
  };

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

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200';
      case 'Completed':
        return 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 border-green-200';
      case 'Planning':
        return 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200';
      case 'On Hold':
        return 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Client not found</p>
          <Button onClick={() => navigate('/dashboard/clients')} className="mt-4">
            Back to Clients
          </Button>
        </div>
      </div>
    );
  }

  const completedProjects = clientProjects.filter(p => p.status === 'Completed').length;
  const totalRevenue = clientProjects.reduce((sum, p) => sum + (client.contract_value || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard/clients')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-gray-100 dark:border-gray-700">
                  {client.logo ? (
                    <AvatarImage src={client.logo} alt={client.company} />
                  ) : (
                    <AvatarFallback className="bg-blue-500 text-white text-xl font-bold">
                      {client.company.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{client.company}</h1>
                  <p className="text-gray-500 dark:text-gray-400">{client.name}</p>
                </div>
              </div>
              
              <Badge className={cn("font-medium border", getStatusColor(client.status))}>
                {client.status}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditDialogOpen(true)}
                className="gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Edit Client
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Client
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDeleteClient} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Client
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Client Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Contact Person</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{client.name}</div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                  <a 
                    href={`mailto:${client.email}`}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {client.email}
                  </a>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                  <a 
                    href={`tel:${client.phone}`}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {client.phone}
                  </a>
                </div>

                {client.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-gray-400 shrink-0" />
                    <a 
                      href={client.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate"
                    >
                      {client.website}
                    </a>
                  </div>
                )}

                {client.industry && (
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{client.industry}</span>
                  </div>
                )}

                {client.priority && (
                  <div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Priority</div>
                    <Badge 
                      variant="outline"
                      className={cn(
                        "font-medium",
                        client.priority === 'High' ? 'border-red-300 text-red-600 dark:border-red-700 dark:text-red-400' :
                        client.priority === 'Medium' ? 'border-yellow-300 text-yellow-600 dark:border-yellow-700 dark:text-yellow-400' :
                        'border-blue-300 text-blue-600 dark:border-blue-700 dark:text-blue-400'
                      )}
                    >
                      {client.priority} Priority
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contract Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  Contract Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {client.contract_value && (
                  <div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Contract Value</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ${client.contract_value.toLocaleString()}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Client Since</div>
                  <div className="text-sm text-gray-900 dark:text-white">
                    {client.created_at ? new Date(client.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'N/A'}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</div>
                  <Badge className={cn("font-medium border", getStatusColor(client.status))}>
                    {client.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statistics Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <FolderKanban className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {clientProjects.length}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total Projects</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {clientProjects.filter(p => p.status === 'In Progress').length}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Active Projects</div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {completedProjects}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Completed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Projects Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FolderKanban className="h-5 w-5" />
                  Projects
                  <Badge variant="outline">{clientProjects.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {clientProjects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FolderKanban className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No projects yet</p>
                    <p className="text-xs mt-1">Create a project for this client to get started</p>
                  </div>
                ) : (
                  <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                          <TableHead className="font-semibold">Project</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                          <TableHead className="font-semibold">Progress</TableHead>
                          <TableHead className="font-semibold">Deadline</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clientProjects.map((project) => (
                          <TableRow
                            key={project.id}
                            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                            onClick={() => navigate(`/dashboard/projects/${project.id}`)}
                          >
                            <TableCell className="font-medium">
                              <div>
                                <div className="font-semibold text-gray-900 dark:text-white text-sm">
                                  {project.title}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                                  {project.description}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className={cn("text-xs font-medium border", getProjectStatusColor(project.status))}
                              >
                                {project.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={project.progress} className="h-2 w-20" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {project.progress}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                              {project.deadline}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity Timeline Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500 mt-2 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white font-medium">Client added</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {client.created_at ? new Date(client.created_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        }) : 'Recently'}
                      </p>
                    </div>
                  </div>

                  {clientProjects.length > 0 && (
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                          Working on {clientProjects.filter(p => p.status === 'In Progress').length} active project{clientProjects.filter(p => p.status === 'In Progress').length !== 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Current</p>
                      </div>
                    </div>
                  )}

                  {completedProjects > 0 && (
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-purple-500 mt-2 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                          Completed {completedProjects} project{completedProjects !== 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total deliveries</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <EditClientDialog
        client={client}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['clients'] });
          setEditDialogOpen(false);
        }}
      />
    </div>
  );
};

export default ClientDetail;
