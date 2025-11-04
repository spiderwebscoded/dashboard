
import { supabase } from '@/lib/supabase';
import { Client } from '@/types/database';
import { createSystemNotification, createClientNotification } from './notificationService';
import { toast } from '@/hooks/use-toast';

export const getClients = async (): Promise<Client[]> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching clients:', error);
    toast({
      title: "Error fetching clients",
      description: error.message,
      variant: "destructive"
    });
    throw new Error('Failed to fetch clients');
  }
  
  return data || [];
};

export const createClient = async (client: Partial<Client>): Promise<Client> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('No user found when creating client');
    throw new Error('User not authenticated. Please log in again.');
  }

  console.log('Creating client with user_id:', user.id);
  console.log('Client data:', client);

  const { data, error } = await supabase
    .from('clients')
    .insert({ ...client, user_id: user.id })
    .select()
    .single();
  
  if (error) {
    console.error('Supabase error creating client:', error);
    console.error('Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    
    let errorMessage = error.message;
    
    // Provide more specific error messages
    if (error.message.includes('column') && error.message.includes('user_id')) {
      errorMessage = 'Database not configured. Please run the SQL migration first.';
    } else if (error.code === 'PGRST301' || error.message.includes('RLS')) {
      errorMessage = 'Permission denied. Please check database RLS policies.';
    } else if (error.message.includes('violates')) {
      errorMessage = 'Data validation error. Please check all required fields.';
    }
    
    toast({
      title: "Error creating client",
      description: errorMessage,
      variant: "destructive"
    });
    throw new Error(errorMessage);
  }
  
  // Create notifications for the new client
  await createSystemNotification(
    user.id,
    'New Client Added',
    `Client "${client.name}" has been added to your account.`
  );
  
  await createClientNotification(
    user.id,
    'Client Created',
    `Client "${client.name}" has been added successfully.`,
    data.id
  );

  toast({
    title: "Client created",
    description: `${client.name} has been added successfully.`
  });
  
  return data;
};

export const updateClient = async (id: string, client: Partial<Client>): Promise<Client> => {
  const { data, error } = await supabase
    .from('clients')
    .update({ ...client, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating client:', error);
    toast({
      title: "Error updating client",
      description: error.message,
      variant: "destructive"
    });
    throw new Error('Failed to update client');
  }
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    // Create notifications for the client update
    await createSystemNotification(
      user.id,
      'Client Updated',
      `Client "${data.name}" information has been updated.`
    );
    
    await createClientNotification(
      user.id,
      'Client Updated',
      `Client "${data.name}" has been updated successfully.`,
      data.id
    );

    toast({
      title: "Client updated",
      description: `${data.name} has been updated successfully.`
    });
  }
  
  return data;
};

export const deleteClient = async (id: string): Promise<void> => {
  // Get client details before deletion
  const { data: client } = await supabase
    .from('clients')
    .select('name, id')
    .eq('id', id)
    .single();
  
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting client:', error);
    toast({
      title: "Error deleting client",
      description: error.message,
      variant: "destructive"
    });
    throw new Error('Failed to delete client');
  }
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user && client) {
    // Create notifications for the client deletion
    await createSystemNotification(
      user.id,
      'Client Deleted',
      `Client "${client.name}" has been removed from your account.`
    );
    
    await createClientNotification(
      user.id,
      'Client Deleted',
      `Client "${client.name}" has been removed from your account.`,
      client.id
    );

    toast({
      title: "Client deleted",
      description: `${client.name} has been removed successfully.`
    });
  }
};
