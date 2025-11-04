
import React from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNotifications, Notification } from '@/context/NotificationContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, formatDistanceToNow } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const NotificationItem = ({ notification, onRead, onDelete }: { 
  notification: Notification; 
  onRead: () => void; 
  onDelete: () => void;
}) => {
  const getTypeStyles = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700';
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700';
    }
  };
  
  // Format the date for tooltip and display
  const createdAt = new Date(notification.created_at);
  const formattedDate = format(createdAt, 'MMM d, yyyy h:mm a');
  const relativeTime = formatDistanceToNow(createdAt, { addSuffix: true });
  
  return (
    <div className={`p-4 border-l-4 mb-1 relative ${getTypeStyles()} ${notification.read ? 'opacity-75' : ''}`}>
      <div className="flex justify-between">
        <h4 className="font-semibold text-sm">{notification.title}</h4>
        <div className="flex space-x-1">
          {!notification.read && (
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onRead}>
              <Check className="h-4 w-4" />
              <span className="sr-only">Mark as read</span>
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </div>
      <p className="text-xs mt-1">{notification.message}</p>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="text-xs text-gray-500 mt-2">{relativeTime}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{formattedDate}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

const NotificationCenter = () => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();
  
  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };
  
  const handleDeleteNotification = async (id: string) => {
    await deleteNotification(id);
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between py-2 px-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
              Mark all as read
            </Button>
          )}
        </div>
        
        <ScrollArea className="max-h-[400px]">
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-sm mt-2">Loading notifications...</p>
            </div>
          ) : notifications.length > 0 ? (
            <div className="py-2">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={() => handleMarkAsRead(notification.id)}
                  onDelete={() => handleDeleteNotification(notification.id)}
                />
              ))}
            </div>
          ) : (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500">No notifications</p>
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationCenter;
