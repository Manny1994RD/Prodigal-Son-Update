import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, Team } from '@/lib/types';
import { getStoredData } from '@/lib/storage';
import { Users, UserCheck } from 'lucide-react';

interface UserSelectorProps {
  onUserSelected: (userId: string) => void;
  selectedUserId?: string;
}

export default function UserSelector({ onUserSelected, selectedUserId }: UserSelectorProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getStoredData();
      setUsers(data.users);
      setTeams(data.teams);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedUser = users.find(u => u.id === selectedUserId);
  const selectedUserTeam = selectedUser ? teams.find(t => t.id === selectedUser.teamId) : null;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Seleccionar Usuario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando usuarios...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Seleccionar Usuario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay usuarios registrados</p>
            <p className="text-sm">Usa el panel de administración para agregar usuarios</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          Seleccionar Usuario
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Select value={selectedUserId || ''} onValueChange={onUserSelected}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un usuario" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => {
                const team = teams.find(t => t.id === user.teamId);
                return (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{user.name}</span>
                      {team && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {team.name}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {selectedUser && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="h-4 w-4 text-green-500" />
              <span className="font-medium">Usuario seleccionado:</span>
            </div>
            <div className="space-y-1">
              <div className="text-sm">
                <span className="font-medium">{selectedUser.name}</span>
              </div>
              {selectedUserTeam && (
                <div className="text-xs text-muted-foreground">
                  Equipo: {selectedUserTeam.name}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}