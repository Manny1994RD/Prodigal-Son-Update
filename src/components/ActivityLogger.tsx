import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, Trophy, Target, Trash2, CheckCircle, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { addActivity, getAllActivityTypes, getStoredData } from '@/lib/storage';
import { ActivityType, User, UserAchievement } from '@/lib/types';
import AchievementBadge from './AchievementBadge';
import { ACHIEVEMENTS } from '@/lib/constants';

interface ActivityLoggerProps {
  onActivityAdded: () => void;
  selectedUserId?: string;
}

interface SelectedActivity {
  id: string;
  activityTypeId: string;
  quantity: number;
  points: number;
}

export default function ActivityLogger({ onActivityAdded, selectedUserId }: ActivityLoggerProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>(selectedUserId || '');
  const [selectedActivities, setSelectedActivities] = useState<SelectedActivity[]>([]);
  const [currentActivityType, setCurrentActivityType] = useState<string>('');
  const [currentQuantity, setCurrentQuantity] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      setSelectedUser(selectedUserId);
    }
  }, [selectedUserId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [storedData, types] = await Promise.all([
        getStoredData(),
        getAllActivityTypes()
      ]);
      setUsers(storedData.users);
      setActivityTypes(types);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  const addActivityToList = () => {
    if (!currentActivityType) {
      toast.error('Por favor selecciona una actividad');
      return;
    }

    const activityType = activityTypes.find(at => at.id === currentActivityType);
    if (!activityType) {
      toast.error('Tipo de actividad no encontrado');
      return;
    }

    // Check if activity already exists in the list
    const existingIndex = selectedActivities.findIndex(sa => sa.activityTypeId === currentActivityType);
    
    if (existingIndex !== -1) {
      // Update existing activity
      const updatedActivities = [...selectedActivities];
      const finalQuantity = activityType.isChecklistStyle ? 1 : currentQuantity;
      updatedActivities[existingIndex] = {
        ...updatedActivities[existingIndex],
        quantity: finalQuantity,
        points: activityType.points * finalQuantity
      };
      setSelectedActivities(updatedActivities);
      toast.success('Actividad actualizada en la lista');
    } else {
      // Add new activity
      const finalQuantity = activityType.isChecklistStyle ? 1 : currentQuantity;
      const newActivity: SelectedActivity = {
        id: Date.now().toString(),
        activityTypeId: currentActivityType,
        quantity: finalQuantity,
        points: activityType.points * finalQuantity
      };
      setSelectedActivities([...selectedActivities, newActivity]);
      toast.success('Actividad agregada a la lista');
    }

    // Reset form
    setCurrentActivityType('');
    setCurrentQuantity(1);
  };

  const removeActivityFromList = (activityId: string) => {
    setSelectedActivities(selectedActivities.filter(sa => sa.id !== activityId));
    toast.success('Actividad removida de la lista');
  };

  const updateActivityQuantity = (activityId: string, newQuantity: number) => {
    const updatedActivities = selectedActivities.map(sa => {
      if (sa.id === activityId) {
        const activityType = activityTypes.find(at => at.id === sa.activityTypeId);
        if (activityType) {
          return {
            ...sa,
            quantity: newQuantity,
            points: activityType.points * newQuantity
          };
        }
      }
      return sa;
    });
    setSelectedActivities(updatedActivities);
  };

  const handleSubmitAll = async () => {
    if (!selectedUser) {
      toast.error('Por favor selecciona un usuario');
      return;
    }

    if (selectedActivities.length === 0) {
      toast.error('Por favor agrega al menos una actividad');
      return;
    }

    setIsSubmitting(true);

    try {
      let totalPoints = 0;
      const totalActivities = selectedActivities.length;
      const allNewAchievements: UserAchievement[] = [];

      // Submit all activities
      for (const activity of selectedActivities) {
        const result = await addActivity({
          userId: selectedUser,
          activityTypeId: activity.activityTypeId,
          quantity: activity.quantity,
          points: activity.points,
          date: new Date().toISOString()
        });

        totalPoints += activity.points;
        allNewAchievements.push(...result.newAchievements);
      }

      // Show success message
      toast.success(`¡${totalActivities} actividades registradas!`, {
        description: `Total: +${totalPoints} puntos`,
        duration: 4000,
      });

      // Show new achievements if any
      if (allNewAchievements.length > 0) {
        const uniqueAchievements = allNewAchievements.filter((achievement, index, self) => 
          index === self.findIndex(a => a.achievementId === achievement.achievementId)
        );

        uniqueAchievements.forEach(userAchievement => {
          const achievement = ACHIEVEMENTS.find(a => a.id === userAchievement.achievementId);
          if (achievement) {
            toast.success(`¡Nuevo logro desbloqueado!`, {
              description: `${achievement.icon} ${achievement.name}: ${achievement.description}`,
              duration: 6000,
            });
          }
        });
      }

      // Clear the list
      setSelectedActivities([]);

      // Notify parent component
      onActivityAdded();
    } catch (error) {
      console.error('Error submitting activities:', error);
      toast.error('Error al registrar las actividades');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearAllActivities = () => {
    setSelectedActivities([]);
    toast.success('Lista de actividades limpiada');
  };

  const currentActivityTypeData = activityTypes.find(at => at.id === currentActivityType);
  const isChecklistStyle = currentActivityTypeData?.isChecklistStyle || false;
  const totalPoints = selectedActivities.reduce((sum, activity) => sum + activity.points, 0);

  const incrementQuantity = () => {
    if (!isChecklistStyle) {
      setCurrentQuantity(prev => Math.min(prev + 1, 100));
    }
  };

  const decrementQuantity = () => {
    if (!isChecklistStyle) {
      setCurrentQuantity(prev => Math.max(prev - 1, 1));
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Registrar Actividades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando datos...</p>
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
            <Target className="h-5 w-5 text-blue-500" />
            Registrar Actividades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay usuarios registrados</p>
            <p className="text-sm">Usa el panel de administración para agregar usuarios primero</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Registrar Actividades Múltiples
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-select">Usuario</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger id="user-select">
                <SelectValue placeholder="Selecciona un usuario" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Add Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Agregar Actividades</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="activity-select">Actividad</Label>
              <Select value={currentActivityType} onValueChange={setCurrentActivityType}>
                <SelectTrigger id="activity-select">
                  <SelectValue placeholder="Selecciona una actividad" />
                </SelectTrigger>
                <SelectContent>
                  {activityTypes.map((activityType) => (
                    <SelectItem key={activityType.id} value={activityType.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{activityType.name}</span>
                        <div className="flex items-center gap-2 ml-2">
                          {activityType.isChecklistStyle && (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {activityType.points} pts
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentActivityTypeData && (
              <div className="space-y-2">
                <Label htmlFor="quantity">
                  {isChecklistStyle ? 'Completado' : 'Cantidad'}
                </Label>
                {isChecklistStyle ? (
                  <div className="flex items-center space-x-2 p-3 border rounded-md bg-muted/50">
                    <Checkbox 
                      id="completed" 
                      checked={currentQuantity === 1}
                      onCheckedChange={(checked) => setCurrentQuantity(checked ? 1 : 0)}
                    />
                    <Label htmlFor="completed" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Completado
                    </Label>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={decrementQuantity}
                      disabled={currentQuantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max="100"
                      value={currentQuantity}
                      onChange={(e) => setCurrentQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                      className="w-20 text-center"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={incrementQuantity}
                      disabled={currentQuantity >= 100}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-end">
              <Button 
                onClick={addActivityToList}
                disabled={!currentActivityType || (isChecklistStyle && currentQuantity === 0)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar a Lista
              </Button>
            </div>
          </div>

          {currentActivityTypeData && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground">
                {isChecklistStyle 
                  ? `${currentActivityTypeData.name} (${currentActivityTypeData.points} pts)`
                  : `${currentQuantity} × ${currentActivityTypeData.name} (${currentActivityTypeData.points} pts c/u) = ${currentActivityTypeData.points * currentQuantity} pts`
                }
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activities List */}
      {selectedActivities.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Actividades Seleccionadas</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {selectedActivities.length} actividad{selectedActivities.length !== 1 ? 'es' : ''}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllActivities}
                >
                  Limpiar Todo
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedActivities.map((activity) => {
              const activityType = activityTypes.find(at => at.id === activity.activityTypeId);
              if (!activityType) return null;

              return (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{activityType.name}</span>
                      {activityType.isChecklistStyle && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {activityType.isChecklistStyle 
                        ? `Completado (${activityType.points} pts)`
                        : `${activity.quantity} × ${activityType.points} pts = ${activity.points} pts`
                      }
                    </div>
                  </div>

                  {!activityType.isChecklistStyle && (
                    <div className="flex items-center gap-2 mx-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateActivityQuantity(activity.id, Math.max(1, activity.quantity - 1))}
                        disabled={activity.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{activity.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateActivityQuantity(activity.id, Math.min(100, activity.quantity + 1))}
                        disabled={activity.quantity >= 100}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {activity.points} pts
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeActivityFromList(activity.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}

            <Separator />

            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="font-bold text-lg">Total: {totalPoints} puntos</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={clearAllActivities}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSubmitAll}
                  disabled={!selectedUser || selectedActivities.length === 0 || isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? 'Registrando...' : `Registrar Todo (${selectedActivities.length})`}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}