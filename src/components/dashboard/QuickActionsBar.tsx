import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, CheckSquare, FolderKanban, Users, Briefcase } from 'lucide-react';
import DataEntryForm from './DataEntryForm';
import { cn } from '@/lib/utils';

interface QuickActionsBarProps {
  onDataChange?: () => void;
  className?: string;
}

const QuickActionsBar: React.FC<QuickActionsBarProps> = ({ onDataChange, className }) => {
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [showClientDialog, setShowClientDialog] = useState(false);
  const [showTeamDialog, setShowTeamDialog] = useState(false);

  const handleSuccess = () => {
    onDataChange?.();
  };

  return (
    <>
      <div className={cn(
        "flex gap-2 flex-wrap",
        className
      )}>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setShowTaskDialog(true)}
            className="gap-2 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 hover:rotate-1"
          >
            <CheckSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Task</span>
          </Button>
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setShowProjectDialog(true)}
            className="gap-2 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 hover:rotate-1"
          >
            <FolderKanban className="h-4 w-4" />
            <span className="hidden sm:inline">Project</span>
          </Button>
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setShowClientDialog(true)}
            className="gap-2 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 hover:rotate-1"
          >
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Client</span>
          </Button>
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setShowTeamDialog(true)}
            className="gap-2 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 hover:rotate-1"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Team</span>
          </Button>
      </div>

      {/* Dialogs */}
      <DataEntryForm
        type="task"
        open={showTaskDialog}
        onOpenChange={setShowTaskDialog}
        onSuccess={handleSuccess}
      />
      
      <DataEntryForm
        type="project"
        open={showProjectDialog}
        onOpenChange={setShowProjectDialog}
        onSuccess={handleSuccess}
      />
      
      <DataEntryForm
        type="client"
        open={showClientDialog}
        onOpenChange={setShowClientDialog}
        onSuccess={handleSuccess}
      />
      
      <DataEntryForm
        type="team"
        open={showTeamDialog}
        onOpenChange={setShowTeamDialog}
        onSuccess={handleSuccess}
      />
    </>
  );
};

export default QuickActionsBar;
