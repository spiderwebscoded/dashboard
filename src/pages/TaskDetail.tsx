import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Flag, 
  MessageSquare, 
  Paperclip, 
  Plus, 
  Tag, 
  Trash2, 
  User,
  MoreHorizontal,
  Edit2,
  FileText,
  X,
  GripVertical,
  Heading1,
  Heading2,
  List,
  ListChecks,
  Code,
  Quote,
  Image,
  Link,
  Type,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  getProjectTasks, 
  updateProjectTask, 
  deleteProjectTask,
  ProjectTask 
} from '@/services/projectTaskService';
import {
  getTaskContentBlocks,
  createTaskContentBlock,
  updateTaskContentBlock,
  deleteTaskContentBlock,
  reorderTaskContentBlocks,
  TaskContentBlock
} from '@/services/taskContentBlockService';
import {
  getFocusSessions,
  createFocusSession,
  deleteFocusSession,
  FocusSession
} from '@/services/focusSessionService';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'created' | 'updated' | 'completed' | 'comment' | 'status_change';
  description: string;
  timestamp: string;
  user: string;
}

// Block types for the scrapbook
type BlockType = 'text' | 'heading' | 'heading2' | 'checklist' | 'code' | 'quote' | 'image' | 'link' | 'list';

interface ContentBlock {
  id: string;
  type: BlockType;
  content: string;
  metadata?: {
    checked?: boolean;
    items?: Array<{ id: string; text: string; checked?: boolean }>;
    language?: string;
    url?: string;
  };
}

const TaskDetail = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for editing
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [isCanvasMaximized, setIsCanvasMaximized] = useState(false);
  const [isPropertiesPanelCollapsed, setIsPropertiesPanelCollapsed] = useState(false);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  
  // Focus timer
  const [isTracking, setIsTracking] = useState(false);
  const [currentSessionStart, setCurrentSessionStart] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Fetch focus sessions from database
  const { data: focusSessions = [] } = useQuery({
    queryKey: ['focus-sessions', taskId],
    queryFn: () => getFocusSessions(taskId!),
    enabled: !!taskId,
  });
  

  // Fetch content blocks from database
  const { data: dbContentBlocks = [], isLoading: isLoadingBlocks } = useQuery({
    queryKey: ['task-content-blocks', taskId],
    queryFn: () => getTaskContentBlocks(taskId!),
    enabled: !!taskId,
  });

  // Local state for unsaved changes
  const [localContentBlocks, setLocalContentBlocks] = useState<TaskContentBlock[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const lastSyncedDbBlocks = React.useRef<string>('');

  // Sync database blocks to local state when data loads
  React.useEffect(() => {
    if (dbContentBlocks) {
      const newDbData = JSON.stringify(dbContentBlocks);
      
      // Only sync if the database data actually changed (not local changes)
      if (lastSyncedDbBlocks.current !== newDbData) {
        lastSyncedDbBlocks.current = newDbData;
        setLocalContentBlocks(dbContentBlocks);
        setHasUnsavedChanges(false);
      }
    }
  }, [dbContentBlocks]);

  // Mock data
  const [activity, setActivity] = useState<ActivityItem[]>([
    { id: '1', type: 'created', description: 'created this task', timestamp: '3 days ago', user: 'You' },
    { id: '2', type: 'updated', description: 'updated the content', timestamp: '2 days ago', user: 'You' },
  ]);

  // Fetch task data
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => getProjectTasks(),
  });

  const task = tasks.find(t => t.id === taskId);

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateProjectTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Task updated',
        description: 'Your changes have been saved.',
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: deleteProjectTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Task deleted',
        description: 'The task has been removed.',
      });
      navigate('/dashboard/tasks');
    },
  });

  // Content block mutations
  const createBlockMutation = useMutation({
    mutationFn: createTaskContentBlock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-content-blocks', taskId] });
    },
  });

  const updateBlockMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateTaskContentBlock(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-content-blocks', taskId] });
    },
  });

  const deleteBlockMutation = useMutation({
    mutationFn: deleteTaskContentBlock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-content-blocks', taskId] });
      toast({
        title: 'Block deleted',
        description: 'Content block has been removed.',
      });
    },
  });

  const reorderBlocksMutation = useMutation({
    mutationFn: ({ taskId, blockIds }: { taskId: string; blockIds: string[] }) => 
      reorderTaskContentBlocks(taskId, blockIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-content-blocks', taskId] });
    },
  });

  // Focus session mutations
  const createSessionMutation = useMutation({
    mutationFn: createFocusSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focus-sessions', taskId] });
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: deleteFocusSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focus-sessions', taskId] });
      toast({
        title: 'Session deleted',
        description: 'Focus session has been removed.',
      });
    },
  });

  React.useEffect(() => {
    if (task) {
      setEditedTitle(task.title);
    }
  }, [task]);

  // Focus timer interval
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking && currentSessionStart) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - currentSessionStart) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, currentSessionStart]);

  // Warn before leaving with unsaved changes
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Task not found</p>
          <Button onClick={() => navigate('/dashboard/tasks')} className="mt-4">
            Back to Tasks
          </Button>
        </div>
      </div>
    );
  }

  const handleSaveTitle = () => {
    if (editedTitle.trim() && editedTitle !== task.title) {
      updateTaskMutation.mutate({ id: task.id, data: { title: editedTitle } });
    }
    setIsEditingTitle(false);
  };

  const handleToggleComplete = () => {
    updateTaskMutation.mutate({ id: task.id, data: { completed: !task.completed } });
  };

  const handlePriorityChange = (priority: 'low' | 'medium' | 'high') => {
    updateTaskMutation.mutate({ id: task.id, data: { priority } });
  };

  const handleDeleteTask = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate(task.id);
    }
  };

  // Scrapbook block functions
  const addBlock = (type: BlockType) => {
    if (!taskId) return;
    
    const newBlock: TaskContentBlock = {
      id: `temp-${Date.now()}`, // Temporary ID for new blocks
      task_id: taskId,
      user_id: '', // Will be set on save
      type,
      content: '',
      metadata: type === 'checklist' || type === 'list' ? { items: [] } : {},
      position: localContentBlocks.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    setLocalContentBlocks([...localContentBlocks, newBlock]);
    setHasUnsavedChanges(true);
    setEditingBlockId(newBlock.id);
  };

  const updateBlock = (id: string, updates: Partial<TaskContentBlock>) => {
    setLocalContentBlocks(localContentBlocks.map(block => 
      block.id === id ? { ...block, ...updates } : block
    ));
    setHasUnsavedChanges(true);
  };

  const deleteBlock = (id: string) => {
    setLocalContentBlocks(localContentBlocks.filter(block => block.id !== id));
    setHasUnsavedChanges(true);
  };

  const handleDragStart = (id: string) => {
    setDraggedBlockId(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedBlockId || draggedBlockId === targetId) return;

    const draggedIndex = localContentBlocks.findIndex(b => b.id === draggedBlockId);
    const targetIndex = localContentBlocks.findIndex(b => b.id === targetId);

    const newBlocks = [...localContentBlocks];
    const [draggedBlock] = newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(targetIndex, 0, draggedBlock);

    // Update position for all blocks
    const reorderedBlocks = newBlocks.map((block, index) => ({
      ...block,
      position: index,
    }));

    setLocalContentBlocks(reorderedBlocks);
  };

  const handleDragEnd = () => {
    if (draggedBlockId) {
      setHasUnsavedChanges(true);
    }
    setDraggedBlockId(null);
  };

  const moveBlockUp = (id: string) => {
    const index = localContentBlocks.findIndex(b => b.id === id);
    if (index === 0) return; // Already at top
    
    const newBlocks = [...localContentBlocks];
    [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
    
    // Update positions
    const reorderedBlocks = newBlocks.map((block, idx) => ({
      ...block,
      position: idx,
    }));
    
    setLocalContentBlocks(reorderedBlocks);
    setHasUnsavedChanges(true);
  };

  const moveBlockDown = (id: string) => {
    const index = localContentBlocks.findIndex(b => b.id === id);
    if (index === localContentBlocks.length - 1) return; // Already at bottom
    
    const newBlocks = [...localContentBlocks];
    [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
    
    // Update positions
    const reorderedBlocks = newBlocks.map((block, idx) => ({
      ...block,
      position: idx,
    }));
    
    setLocalContentBlocks(reorderedBlocks);
    setHasUnsavedChanges(true);
  };

  const addChecklistItem = (blockId: string) => {
    const block = localContentBlocks.find(b => b.id === blockId);
    if (block && block.metadata?.items) {
      const newItem = { id: Date.now().toString(), text: '', checked: false };
      updateBlock(blockId, {
        metadata: {
          ...block.metadata,
          items: [...block.metadata.items, newItem]
        }
      });
    }
  };

  const updateChecklistItem = (blockId: string, itemId: string, text: string) => {
    const block = localContentBlocks.find(b => b.id === blockId);
    if (block && block.metadata?.items) {
      updateBlock(blockId, {
        metadata: {
          ...block.metadata,
          items: block.metadata.items.map(item =>
            item.id === itemId ? { ...item, text } : item
          )
        }
      });
    }
  };

  const toggleChecklistItem = (blockId: string, itemId: string) => {
    const block = localContentBlocks.find(b => b.id === blockId);
    if (block && block.metadata?.items) {
      updateBlock(blockId, {
        metadata: {
          ...block.metadata,
          items: block.metadata.items.map(item =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
          )
        }
      });
    }
  };

  const deleteChecklistItem = (blockId: string, itemId: string) => {
    const block = localContentBlocks.find(b => b.id === blockId);
    if (block && block.metadata?.items) {
      updateBlock(blockId, {
        metadata: {
          ...block.metadata,
          items: block.metadata.items.filter(item => item.id !== itemId)
        }
      });
    }
  };

  // Save canvas changes to database
  const handleSaveCanvas = async () => {
    if (!taskId || !hasUnsavedChanges) return;

    setIsSaving(true);
    try {
      // Find new blocks (temporary IDs starting with 'temp-')
      const newBlocks = localContentBlocks.filter(block => block.id.startsWith('temp-'));
      
      // Find deleted blocks (in DB but not in local)
      const dbBlockIds = dbContentBlocks.map(b => b.id);
      const localBlockIds = localContentBlocks.filter(b => !b.id.startsWith('temp-')).map(b => b.id);
      const deletedBlockIds = dbBlockIds.filter(id => !localBlockIds.includes(id));
      
      // Find updated blocks (exist in both with different content/metadata/position)
      const updatedBlocks = localContentBlocks.filter(block => {
        if (block.id.startsWith('temp-')) return false; // Skip new blocks
        const dbBlock = dbContentBlocks.find(b => b.id === block.id);
        if (!dbBlock) return false;
        
        return (
          block.content !== dbBlock.content ||
          JSON.stringify(block.metadata) !== JSON.stringify(dbBlock.metadata) ||
          block.position !== dbBlock.position ||
          block.type !== dbBlock.type
        );
      });

      // Execute all operations
      const operations = [];

      // Create new blocks
      for (const block of newBlocks) {
        operations.push(
          createBlockMutation.mutateAsync({
            task_id: taskId,
            type: block.type,
            content: block.content,
            metadata: block.metadata,
            position: block.position,
          })
        );
      }

      // Update existing blocks
      for (const block of updatedBlocks) {
        operations.push(
          updateBlockMutation.mutateAsync({
            id: block.id,
            data: {
              type: block.type,
              content: block.content,
              metadata: block.metadata,
              position: block.position,
            }
          })
        );
      }

      // Delete removed blocks
      for (const blockId of deletedBlockIds) {
        operations.push(deleteBlockMutation.mutateAsync(blockId));
      }

      // Wait for all operations to complete
      await Promise.all(operations);

      // Refresh the data from database
      await queryClient.invalidateQueries({ queryKey: ['task-content-blocks', taskId] });

      setHasUnsavedChanges(false);
      toast({
        title: 'Canvas saved',
        description: 'All changes have been saved successfully.',
      });
    } catch (error) {
      console.error('Error saving canvas:', error);
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Failed to save canvas changes.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };



  // Focus timer helper functions
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalFocusedTime = (): number => {
    return focusSessions.reduce((total, session) => total + session.duration, 0);
  };

  const deleteSession = (id: string) => {
    deleteSessionMutation.mutate(id);
  };

  const startTimeTracking = () => {
    setIsTracking(true);
    setCurrentSessionStart(Date.now());
    setElapsedTime(0);
    toast({
      title: 'Focus session started',
      description: 'Timer is now running.',
    });
  };

  const stopTimeTracking = () => {
    if (currentSessionStart && elapsedTime > 0 && taskId) {
      const sessionData = {
        task_id: taskId,
        start_time: new Date(currentSessionStart).toISOString(),
        end_time: new Date().toISOString(),
        duration: elapsedTime
      };
      
      createSessionMutation.mutate(sessionData, {
        onSuccess: () => {
          toast({
            title: 'Focus session completed',
            description: `${formatTime(elapsedTime)} logged successfully.`,
          });
        },
      });
    }
    setIsTracking(false);
    setCurrentSessionStart(null);
    setElapsedTime(0);
  };


  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      case 'medium':
        return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20';
      case 'low':
        return 'text-green-500 bg-green-50 dark:bg-green-900/20';
      default:
        return 'text-gray-500 bg-gray-50 dark:bg-gray-800';
    }
  };



  const renderBlock = (block: ContentBlock) => {
    const isEditing = editingBlockId === block.id;
    const blockIndex = localContentBlocks.findIndex(b => b.id === block.id);
    const isFirst = blockIndex === 0;
    const isLast = blockIndex === localContentBlocks.length - 1;

    return (
      <div
        key={block.id}
        draggable
        onDragStart={() => handleDragStart(block.id)}
        onDragOver={(e) => handleDragOver(e, block.id)}
        onDragEnd={handleDragEnd}
        className={cn(
          "group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-3 transition-all duration-300 ease-out",
          draggedBlockId === block.id && "opacity-50",
          "hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700"
        )}
      >
        {/* Drag handle and delete */}
        <div className="absolute left-2 top-4 flex items-center gap-1 z-10">
          {/* Desktop: Drag handle */}
          <div className="hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
          </div>
          
          {/* Mobile: Up/Down buttons */}
          <div className="flex flex-col md:hidden gap-0.5">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={(e) => {
                e.stopPropagation();
                moveBlockUp(block.id);
              }}
              disabled={isFirst}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={(e) => {
                e.stopPropagation();
                moveBlockDown(block.id);
              }}
              disabled={isLast}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
            onClick={() => deleteBlock(block.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="pl-7 md:pl-6">
          {block.type === 'heading' && (
            isEditing ? (
              <Input
                value={block.content}
                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                onBlur={() => setEditingBlockId(null)}
                className="text-2xl font-bold"
                autoFocus
              />
            ) : (
              <h1
                className="text-2xl font-bold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-1 rounded"
                onClick={() => setEditingBlockId(block.id)}
              >
                {block.content || 'Click to edit heading...'}
              </h1>
            )
          )}

          {block.type === 'heading2' && (
            isEditing ? (
              <Input
                value={block.content}
                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                onBlur={() => setEditingBlockId(null)}
                className="text-xl font-semibold"
                autoFocus
              />
            ) : (
              <h2
                className="text-xl font-semibold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-1 rounded"
                onClick={() => setEditingBlockId(block.id)}
              >
                {block.content || 'Click to edit heading...'}
              </h2>
            )
          )}

          {block.type === 'text' && (
            isEditing ? (
              <Textarea
                value={block.content}
                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                onBlur={() => setEditingBlockId(null)}
                className="min-h-[100px]"
                autoFocus
              />
            ) : (
              <p
                className="text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded min-h-[50px]"
                onClick={() => setEditingBlockId(block.id)}
              >
                {block.content || 'Click to add text...'}
              </p>
            )
          )}

          {block.type === 'list' && (
            <div className="space-y-2">
              {block.metadata?.items?.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <span className="text-gray-400">•</span>
                  <Input
                    value={item.text}
                    onChange={(e) => updateChecklistItem(block.id, item.id, e.target.value)}
                    placeholder="List item..."
                    className="flex-1 border-0 shadow-none focus-visible:ring-0"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => deleteChecklistItem(block.id, item.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addChecklistItem(block.id)}
                className="text-gray-500"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add item
              </Button>
            </div>
          )}

          {block.type === 'checklist' && (
            <div className="space-y-2">
              {block.metadata?.items?.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleChecklistItem(block.id, item.id)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Input
                    value={item.text}
                    onChange={(e) => updateChecklistItem(block.id, item.id, e.target.value)}
                    placeholder="Checklist item..."
                    className={cn(
                      "flex-1 border-0 shadow-none focus-visible:ring-0",
                      item.checked && "line-through text-gray-400"
                    )}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => deleteChecklistItem(block.id, item.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addChecklistItem(block.id)}
                className="text-gray-500"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add item
              </Button>
            </div>
          )}

          {block.type === 'code' && (
            isEditing ? (
              <Textarea
                value={block.content}
                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                onBlur={() => setEditingBlockId(null)}
                className="font-mono text-sm min-h-[120px] bg-gray-900 text-green-400"
                autoFocus
              />
            ) : (
              <pre
                className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm cursor-pointer hover:bg-gray-800 overflow-x-auto"
                onClick={() => setEditingBlockId(block.id)}
              >
                {block.content || '// Click to add code...'}
              </pre>
            )
          )}

          {block.type === 'quote' && (
            isEditing ? (
              <Textarea
                value={block.content}
                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                onBlur={() => setEditingBlockId(null)}
                className="min-h-[80px]"
                autoFocus
              />
            ) : (
              <blockquote
                className="border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded"
                onClick={() => setEditingBlockId(block.id)}
              >
                {block.content || 'Click to add quote...'}
              </blockquote>
            )
          )}

          {block.type === 'link' && (
            <div className="space-y-2">
              <Input
                value={block.content}
                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                placeholder="URL..."
                className="font-mono text-sm"
              />
              {block.content && (
                <a
                  href={block.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline text-sm flex items-center gap-1"
                >
                  <Link className="h-3 w-3" />
                  {block.content}
                </a>
              )}
            </div>
          )}

          {block.type === 'image' && (
            <div className="space-y-2">
              <Input
                value={block.content}
                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                placeholder="Image URL..."
                className="text-sm"
              />
              {block.content ? (
                <img
                  src={block.content}
                  alt="Block content"
                  className="max-w-full rounded border border-gray-200 dark:border-gray-700"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3EImage Error%3C/text%3E%3C/svg%3E';
                  }}
                />
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center text-gray-400">
                  <Image className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">Add image URL above</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={cn(
      "min-h-screen bg-gray-50 dark:bg-gray-900 transition-all",
      isCanvasMaximized && "bg-white dark:bg-gray-950"
    )}>
      {/* Header */}
      <div className={cn(
        "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20 transition-all",
        isCanvasMaximized && "border-0"
      )}>
        <div className={cn(
          "mx-auto px-4 sm:px-6 py-3 transition-all",
          isCanvasMaximized ? "max-w-full" : "max-w-7xl"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!isCanvasMaximized && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/dashboard/tasks')}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Back</span>
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                </>
              )}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleComplete}
                  className="p-1"
                >
                  {task.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </Button>
                {isEditingTitle ? (
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="h-8 max-w-md"
                    autoFocus
                    onBlur={handleSaveTitle}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTitle();
                      if (e.key === 'Escape') setIsEditingTitle(false);
                    }}
                  />
                ) : (
                  <h1
                    className="text-lg font-semibold cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                    onClick={() => setIsEditingTitle(true)}
                  >
                    {task.title}
                  </h1>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCanvasMaximized(!isCanvasMaximized)}
                title={isCanvasMaximized ? "Exit fullscreen" : "Fullscreen"}
              >
                {isCanvasMaximized ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditingTitle(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Title
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDeleteTask} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        "mx-auto px-4 sm:px-6 py-6 transition-all",
        isCanvasMaximized ? "max-w-full" : "max-w-7xl"
      )}>
        <div className={cn(
          "grid gap-6 transition-all",
          isCanvasMaximized ? "grid-cols-1" : isPropertiesPanelCollapsed ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"
        )}>
          {/* Scrapbook Canvas */}
          <div className={cn(
            "space-y-4 transition-all",
            isCanvasMaximized ? "col-span-1" : isPropertiesPanelCollapsed ? "col-span-1" : "lg:col-span-2"
          )}>
            {/* Canvas Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-500" />
                <Badge variant="outline">{localContentBlocks.length} blocks</Badge>
                {hasUnsavedChanges && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    Unsaved
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={hasUnsavedChanges ? "default" : "outline"}
                  onClick={handleSaveCanvas}
                  disabled={!hasUnsavedChanges || isSaving}
                  className="gap-2"
                >
                  <Save className={cn("h-4 w-4", isSaving && "animate-spin")} />
                  {isSaving ? 'Saving...' : 'Save Canvas'}
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Block
                    </Button>
                  </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => addBlock('heading')}>
                    <Heading1 className="h-4 w-4 mr-2" />
                    Heading 1
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock('heading2')}>
                    <Heading2 className="h-4 w-4 mr-2" />
                    Heading 2
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock('text')}>
                    <Type className="h-4 w-4 mr-2" />
                    Text Block
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock('list')}>
                    <List className="h-4 w-4 mr-2" />
                    Bullet List
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock('checklist')}>
                    <ListChecks className="h-4 w-4 mr-2" />
                    Checklist
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock('code')}>
                    <Code className="h-4 w-4 mr-2" />
                    Code Block
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock('quote')}>
                    <Quote className="h-4 w-4 mr-2" />
                    Quote
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock('link')}>
                    <Link className="h-4 w-4 mr-2" />
                    Link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock('image')}>
                    <Image className="h-4 w-4 mr-2" />
                    Image
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </div>
            </div>

            {/* Canvas Content */}
            <div className={cn(
              "min-h-[500px] rounded-lg transition-all",
              isCanvasMaximized && "min-h-[calc(100vh-200px)]"
            )}>
              {localContentBlocks.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold mb-2">Empty Canvas</h3>
                  <p className="text-gray-500 mb-4">Start adding blocks to create your content</p>
                  <Button onClick={() => addBlock('text')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Block
                  </Button>
                </div>
              ) : (
                <div className="space-y-0">
                  {localContentBlocks.map(renderBlock)}
                </div>
              )}
            </div>

            {/* Save notification */}
            <div className={cn(
              "flex items-center justify-between text-sm p-3 rounded-lg",
              hasUnsavedChanges 
                ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800" 
                : isSaving
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800"
                : "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800"
            )}>
              <div className="flex items-center gap-2">
                <Save className={cn("h-4 w-4", isSaving && "animate-spin")} />
                <span className="font-medium">
                  {isSaving
                    ? 'Saving changes...'
                    : hasUnsavedChanges
                    ? 'You have unsaved changes'
                    : 'All changes saved'}
                </span>
              </div>
              <span className="text-xs opacity-75">Drag blocks to reorder</span>
            </div>
          </div>

          {/* Properties Panel */}
          {!isCanvasMaximized && (
            <div className="space-y-4 transition-all">
              {/* Collapse button - Always visible */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPropertiesPanelCollapsed(!isPropertiesPanelCollapsed)}
                className="w-full lg:hidden"
              >
                {isPropertiesPanelCollapsed ? (
                  <>
                    <ChevronRight className="h-4 w-4 mr-2" />
                    Show Properties
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Hide Properties
                  </>
                )}
              </Button>

              {/* Properties Content - Collapsible */}
              {!isPropertiesPanelCollapsed && (
                <>
              {/* Priority */}
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                      <Flag className="h-4 w-4" />
                      Priority
                    </div>
                    <Select value={task.priority} onValueChange={handlePriorityChange}>
                      <SelectTrigger className={getPriorityColor(task.priority)}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Due Date */}
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      Due Date
                    </div>
                    <Input
                      type="date"
                      value={task.due_date || ''}
                      onChange={(e) =>
                        updateTaskMutation.mutate({ id: task.id, data: { due_date: e.target.value } })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Focus Timer */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Focus Timer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Total focused time */}
                  {focusSessions.length > 0 && (
                    <div className="text-center pb-2 border-b border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-500 mb-1">Total Focused Time</div>
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {formatTime(getTotalFocusedTime())}
                      </div>
                    </div>
                  )}

                  {/* Current session timer */}
                  <div className="text-center py-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="text-4xl font-mono font-bold text-gray-900 dark:text-gray-100">
                      {formatTime(elapsedTime)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {isTracking ? 'Session in progress' : 'Ready to focus'}
                    </div>
                  </div>

                  {/* Start/Stop button */}
                  <Button 
                    size="sm" 
                    className={cn(
                      "w-full",
                      isTracking && "animate-pulse"
                    )}
                    variant={isTracking ? "destructive" : "default"}
                    onClick={isTracking ? stopTimeTracking : startTimeTracking}
                  >
                    {isTracking ? (
                      <>
                        <Clock className="h-3 w-3 mr-2" />
                        Stop Session
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3 mr-2" />
                        Start Focus Session
                      </>
                    )}
                  </Button>

                  {/* Focus sessions history */}
                  {focusSessions.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-xs font-medium text-gray-500 flex items-center justify-between">
                        <span>Recent Sessions</span>
                        <Badge variant="outline" className="text-xs">
                          {focusSessions.length}
                        </Badge>
                      </div>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {focusSessions.map((session) => (
                          <div
                            key={session.id}
                            className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800/50 text-xs group"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 dark:text-gray-100">
                                {formatTime(session.duration)}
                              </div>
                              <div className="text-gray-500 text-[10px]">
                                {new Date(session.start_time).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                                {' - '}
                                {new Date(session.end_time).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-red-500"
                              onClick={() => deleteSession(session.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Task Info */}
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Created</span>
                      <span>{new Date(task.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Updated</span>
                      <span>{new Date(task.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
