
import React from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { Sun, Moon, Settings as SettingsIcon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  
  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully.",
    });
  };
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <SettingsIcon className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" />
        <h1 className="text-2xl font-bold dark:text-white">Settings</h1>
      </div>
      
      <div className="grid gap-6">
        {/* Appearance */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg dark:text-white">Appearance</CardTitle>
            <CardDescription className="dark:text-gray-400">
              Customize how the application looks on your device
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {theme === 'dark' ? 
                    <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" /> : 
                    <Sun className="h-5 w-5 text-yellow-500" />
                  }
                  <Label htmlFor="theme-mode" className="dark:text-gray-200">
                    Dark Mode
                  </Label>
                </div>
                <Switch
                  id="theme-mode"
                  checked={theme === 'dark'}
                  onCheckedChange={toggleTheme}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end mt-4">
          <Button
            onClick={handleSaveSettings}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
