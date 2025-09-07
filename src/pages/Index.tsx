import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, TimeFilter } from '@/lib/types';
import { getStoredData } from '@/lib/storage';
import UserSelector from '@/components/UserSelector';
import ActivityLogger from '@/components/ActivityLogger';
import Leaderboard from '@/components/Leaderboard';
import AdminPanel from '@/components/AdminPanel';
import { Users, Trophy, Settings, Plus } from 'lucide-react';

export default function Index() {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleActivityAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleUserSelected = (userId: string) => {
    console.log('User selected:', userId); // Debug log
    setSelectedUserId(userId);
  };

  const handleDataChanged = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Logo */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex flex-col items-center space-y-4">
              {/* Logo */}
              <div className="w-24 h-24 rounded-full overflow-hidden bg-white shadow-lg border-4 border-blue-100 flex items-center justify-center">
                <img 
                  src="/assets/logo.png" 
                  alt="Prodigal Son Logo" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    console.log('Logo failed to load');
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) {
                      fallback.style.display = 'flex';
                    }
                  }}
                />
                <div 
                  className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-2xl items-center justify-center hidden"
                  style={{ display: 'none' }}
                >
                  PS
                </div>
              </div>
              
              {/* Title */}
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Prodigal Son Team Leaderboard
              </CardTitle>
              
              {/* Subtitle */}
              <p className="text-muted-foreground">
                Sistema de seguimiento de actividades y puntos
              </p>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="activities" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="activities" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Actividades
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Tabla de Posiciones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activities" className="space-y-6">
            {/* User Selection */}
            <UserSelector 
              onUserSelected={handleUserSelected}
              selectedUserId={selectedUserId}
            />

            {/* Activity Logger */}
            <ActivityLogger
              onActivityAdded={handleActivityAdded}
              selectedUserId={selectedUserId}
            />
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Leaderboard
              refreshTrigger={refreshTrigger}
            />
          </TabsContent>
        </Tabs>

        {/* Admin Panel */}
        <AdminPanel onDataChanged={handleDataChanged} />
      </div>
    </div>
  );
}