import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings, Users, UserPlus, Edit, Trash2, Shield, Download, RefreshCw, Plus, CheckCircle, Calendar, History } from 'lucide-react';
import { toast } from 'sonner';
import { 
  getStoredData, 
  addUser, 
  addTeam, 
  updateUser, 
  updateTeam, 
  deleteUser, 
  deleteTeam, 
  exportToCSV,
  clearAllData,
  addActivityType,
  updateActivityType,
  deleteActivityType,
  deleteActivity,
  updateActivity
} from '@/lib/storage';
import { User, Team, ActivityType, Activity } from '@/lib/types';

interface AdminPanelProps {
  onDataChanged: () => void;
}

export default function AdminPanel({ onDataChanged }: AdminPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [newUserName, setNewUserName] = useState('');
  const [newUserTeam, setNewUserTeam] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityPoints, setNewActivityPoints] = useState(10);
  const [newActivityIsChecklist, setNewActivityIsChecklist] = useState(false);
  
  // Edit states
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editingActivity, setEditingActivity] = useState<ActivityType | null>(null);
  const [editingSubmission, setEditingSubmission] = useState<Activity | null>(null);

  const ADMIN_PIN = '1234';

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getStoredData();
      setUsers(data.users);
      setTeams(data.teams);
      setActivityTypes(data.activityTypes);
      setActivities(data.activities);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setIsAuthenticated(true);
      setPin('');
      toast.success('Acceso autorizado');
    } else {
      toast.error('PIN incorrecto');
      setPin('');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserTeam) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      await addUser(newUserName, newUserTeam);
      setNewUserName('');
      setNewUserTeam('');
      await loadData();
      onDataChanged();
      toast.success('Usuario agregado exitosamente');
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error('Error al agregar usuario');
    }
  };

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) {
      toast.error('Por favor ingresa un nombre para el equipo');
      return;
    }

    try {
      await addTeam(newTeamName);
      setNewTeamName('');
      await loadData();
      onDataChanged();
      toast.success('Equipo agregado exitosamente');
    } catch (error) {
      console.error('Error adding team:', error);
      toast.error('Error al agregar equipo');
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivityName.trim() || newActivityPoints < 1) {
      toast.error('Por favor completa todos los campos correctamente');
      return;
    }

    try {
      await addActivityType({
        name: newActivityName.trim(),
        points: newActivityPoints,
        isChecklistStyle: newActivityIsChecklist,
        isCustom: true
      });
      setNewActivityName('');
      setNewActivityPoints(10);
      setNewActivityIsChecklist(false);
      await loadData();
      onDataChanged();
      toast.success('Actividad agregada exitosamente');
    } catch (error) {
      console.error('Error adding activity:', error);
      toast.error('Error al agregar actividad');
    }
  };

  const handleUpdateSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubmission) return;

    try {
      await updateActivity(editingSubmission.id, {
        quantity: editingSubmission.quantity,
        points: editingSubmission.points
      });
      setEditingSubmission(null);
      await loadData();
      onDataChanged();
      toast.success('Registro actualizado exitosamente');
    } catch (error) {
      console.error('Error updating submission:', error);
      toast.error('Error al actualizar registro');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      await loadData();
      onDataChanged();
      toast.success('Usuario eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error al eliminar usuario');
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      await deleteTeam(teamId);
      await loadData();
      onDataChanged();
      toast.success('Equipo eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error('Error al eliminar equipo');
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    try {
      await deleteActivityType(activityId);
      await loadData();
      onDataChanged();
      toast.success('Actividad eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast.error('Error al eliminar actividad');
    }
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    try {
      await deleteActivity(submissionId);
      await loadData();
      onDataChanged();
      toast.success('Registro eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting submission:', error);
      toast.error('Error al eliminar registro');
    }
  };

  const handleExportCSV = async () => {
    try {
      const csvContent = await exportToCSV();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `prodigal-son-data-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Datos exportados exitosamente');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Error al exportar datos');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        <Settings className="h-4 w-4 mr-2" />
        Admin
      </Button>
    );
  }

  if (!isAuthenticated) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              Panel de Administración
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pin">PIN de Acceso</Label>
              <Input
                id="pin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Ingresa el PIN"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full">
              Acceder
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-500" />
            Panel de Administración
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando datos...</p>
          </div>
        ) : (
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="users">Usuarios</TabsTrigger>
              <TabsTrigger value="teams">Equipos</TabsTrigger>
              <TabsTrigger value="activities">Actividades</TabsTrigger>
              <TabsTrigger value="submissions">Registros</TabsTrigger>
              <TabsTrigger value="data">Datos</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Agregar Usuario</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddUser} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="user-name">Nombre</Label>
                        <Input
                          id="user-name"
                          value={newUserName}
                          onChange={(e) => setNewUserName(e.target.value)}
                          placeholder="Nombre del usuario"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="user-team">Equipo</Label>
                        <Select value={newUserTeam} onValueChange={setNewUserTeam}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un equipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {teams.map((team) => (
                              <SelectItem key={team.id} value={team.id}>
                                {team.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button type="submit">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Agregar Usuario
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Usuarios Existentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {users.map((user) => {
                      const team = teams.find(t => t.id === user.teamId);
                      return (
                        <div key={user.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <span className="font-medium">{user.name}</span>
                            {team && (
                              <Badge variant="outline" className="ml-2">
                                {team.name}
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción eliminará permanentemente al usuario "{user.name}" y todas sus actividades.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      );
                    })}
                    {users.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">
                        No hay usuarios registrados
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="teams" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Agregar Equipo</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddTeam} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="team-name">Nombre del Equipo</Label>
                      <Input
                        id="team-name"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        placeholder="Nombre del equipo"
                      />
                    </div>
                    <Button type="submit">
                      <Users className="h-4 w-4 mr-2" />
                      Agregar Equipo
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Equipos Existentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {teams.map((team) => {
                      const memberCount = users.filter(u => u.teamId === team.id).length;
                      return (
                        <div key={team.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <span className="font-medium">{team.name}</span>
                            <Badge variant="secondary" className="ml-2">
                              {memberCount} miembro{memberCount !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar equipo?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción eliminará permanentemente el equipo "{team.name}". Los usuarios serán movidos al primer equipo disponible.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteTeam(team.id)}>
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Agregar Actividad Personalizada</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddActivity} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="activity-name">Nombre de la Actividad</Label>
                        <Input
                          id="activity-name"
                          value={newActivityName}
                          onChange={(e) => setNewActivityName(e.target.value)}
                          placeholder="Ej: Reunión Semanal"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="activity-points">Puntos por Actividad</Label>
                        <Input
                          id="activity-points"
                          type="number"
                          min="1"
                          max="10000"
                          value={newActivityPoints}
                          onChange={(e) => setNewActivityPoints(parseInt(e.target.value) || 10)}
                          placeholder="10"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="activity-checklist"
                        checked={newActivityIsChecklist}
                        onCheckedChange={setNewActivityIsChecklist}
                      />
                      <Label htmlFor="activity-checklist" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Actividad de tipo checklist (solo marcar completado)
                        </div>
                      </Label>
                    </div>
                    <Button type="submit">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Actividad
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actividades Existentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {activityTypes.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <span className="font-medium">{activity.name}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">
                              {activity.points} pts
                            </Badge>
                            {activity.isChecklistStyle && (
                              <Badge variant="secondary" className="text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Checklist
                              </Badge>
                            )}
                            {activity.isCustom && (
                              <Badge variant="secondary" className="text-xs">
                                Personalizada
                              </Badge>
                            )}
                          </div>
                        </div>
                        {activity.isCustom && (
                          <div className="flex gap-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar actividad?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción eliminará permanentemente la actividad "{activity.name}" y todos los registros asociados.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteActivity(activity.id)}>
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="submissions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <History className="h-5 w-5" />
                    Gestión de Registros de Actividades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {activities.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No hay registros de actividades
                      </p>
                    ) : (
                      activities
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((submission) => {
                          const user = users.find(u => u.id === submission.userId);
                          const team = teams.find(t => t.id === user?.teamId);
                          const activityType = activityTypes.find(at => at.id === submission.activityTypeId);
                          
                          return (
                            <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{user?.name || 'Usuario desconocido'}</span>
                                  {team && (
                                    <Badge variant="outline" className="text-xs">
                                      {team.name}
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  <span className="font-medium">{activityType?.name || 'Actividad desconocida'}</span>
                                  {' • '}
                                  <span>Cantidad: {submission.quantity}</span>
                                  {' • '}
                                  <span className="text-green-600 font-medium">{submission.points} pts</span>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  <Calendar className="h-3 w-3 inline mr-1" />
                                  {formatDate(submission.date)}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">
                                  {submission.points} pts
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingSubmission(submission)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>¿Eliminar registro?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Esta acción eliminará permanentemente el registro de actividad de "{user?.name}" - "{activityType?.name}" ({submission.points} puntos).
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteSubmission(submission.id)}>
                                        Eliminar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Gestión de Datos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <Button onClick={handleExportCSV} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar CSV
                    </Button>
                    <Button onClick={loadData} variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Recargar Datos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Edit Submission Dialog */}
        {editingSubmission && (
          <Dialog open={!!editingSubmission} onOpenChange={() => setEditingSubmission(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Registro de Actividad</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdateSubmission} className="space-y-4">
                <div className="space-y-2">
                  <Label>Usuario</Label>
                  <div className="p-2 bg-muted rounded">
                    {users.find(u => u.id === editingSubmission.userId)?.name || 'Usuario desconocido'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Actividad</Label>
                  <div className="p-2 bg-muted rounded">
                    {activityTypes.find(at => at.id === editingSubmission.activityTypeId)?.name || 'Actividad desconocida'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-quantity">Cantidad</Label>
                  <Input
                    id="edit-quantity"
                    type="number"
                    min="1"
                    max="100"
                    value={editingSubmission.quantity}
                    onChange={(e) => setEditingSubmission({ 
                      ...editingSubmission, 
                      quantity: parseInt(e.target.value) || 1 
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-points">Puntos Totales</Label>
                  <Input
                    id="edit-points"
                    type="number"
                    min="1"
                    max="10000"
                    value={editingSubmission.points}
                    onChange={(e) => setEditingSubmission({ 
                      ...editingSubmission, 
                      points: parseInt(e.target.value) || 1 
                    })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Guardar Cambios</Button>
                  <Button type="button" variant="outline" onClick={() => setEditingSubmission(null)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}