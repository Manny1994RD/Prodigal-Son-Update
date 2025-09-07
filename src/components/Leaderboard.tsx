import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Medal, Award, Users, Target, Flame, Crown, Star } from 'lucide-react';
import { getAllUserStats, getAllTeamStats } from '@/lib/storage';
import { TimeFilter, UserStats, TeamStats } from '@/lib/types';
import { ACHIEVEMENTS } from '@/lib/constants';
import AchievementBadge from './AchievementBadge';

interface LeaderboardProps {
  refreshTrigger: number;
}

export default function Leaderboard({ refreshTrigger }: LeaderboardProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [activeTab, setActiveTab] = useState('teams');
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [timeFilter, refreshTrigger]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [users, teams] = await Promise.all([
        getAllUserStats(timeFilter),
        getAllTeamStats(timeFilter)
      ]);
      
      setUserStats(users.sort((a, b) => b.totalPoints - a.totalPoints));
      setTeamStats(teams.sort((a, b) => b.totalPoints - a.totalPoints));
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const topUsers = useMemo(() => {
    return userStats.slice(0, 10);
  }, [userStats]);

  const topTeams = useMemo(() => {
    return teamStats.slice(0, 5);
  }, [teamStats]);

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">#{position}</span>;
    }
  };

  const getRankBadgeVariant = (position: number) => {
    switch (position) {
      case 1:
        return 'default';
      case 2:
        return 'secondary';
      case 3:
        return 'outline';
      default:
        return 'outline';
    }
  };

  const renderUserLeaderboard = () => (
    <div className="space-y-4">
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando estadísticas...</p>
        </div>
      ) : topUsers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No hay actividades registradas aún</p>
          <p className="text-sm">¡Comienza registrando tu primera actividad!</p>
        </div>
      ) : (
        topUsers.map((user, index) => {
          const position = index + 1;
          
          // Safely get user achievements with proper filtering
          const userAchievements = user.achievements
            .map(ua => ACHIEVEMENTS.find(a => a.id === ua.achievementId))
            .filter((achievement): achievement is NonNullable<typeof achievement> => achievement !== undefined);

          return (
            <Card key={user.userId} className={`transition-all duration-200 ${position <= 3 ? 'ring-2 ring-primary/20' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getRankIcon(position)}
                      <Badge variant={getRankBadgeVariant(position)}>
                        #{position}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold">{user.userName}</h3>
                      <p className="text-sm text-muted-foreground">{user.teamName}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className="font-bold text-lg">{user.totalPoints.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        <span>{user.totalActivities}</span>
                      </div>
                      {user.currentStreak > 0 && (
                        <div className="flex items-center gap-1">
                          <Flame className="h-3 w-3 text-orange-500" />
                          <span>{user.currentStreak}d</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {userAchievements.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex flex-wrap gap-1">
                      {userAchievements.slice(0, 5).map((achievement) => (
                        <AchievementBadge 
                          key={achievement.id} 
                          achievement={achievement} 
                          size="sm" 
                        />
                      ))}
                      {userAchievements.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{userAchievements.length - 5} más
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );

  const renderTeamLeaderboard = () => (
    <div className="space-y-4">
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando estadísticas...</p>
        </div>
      ) : topTeams.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No hay equipos con actividades registradas</p>
          <p className="text-sm">¡Los equipos aparecerán aquí cuando registren actividades!</p>
        </div>
      ) : (
        topTeams.map((team, index) => {
          const position = index + 1;
          const avgPointsPerMember = team.memberCount > 0 ? Math.round(team.totalPoints / team.memberCount) : 0;

          return (
            <Card key={team.teamId} className={`transition-all duration-200 ${position <= 3 ? 'ring-2 ring-primary/20' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getRankIcon(position)}
                      <Badge variant={getRankBadgeVariant(position)}>
                        #{position}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {team.teamName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {team.memberCount} miembro{team.memberCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className="font-bold text-lg">{team.totalPoints.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        <span>{team.totalActivities}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        <span>{avgPointsPerMember}/miembro</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team members preview */}
                <div className="pt-3 border-t">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {team.members.slice(0, 4).map((member) => (
                      <div key={member.userId} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <span className="text-sm font-medium">{member.userName}</span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Trophy className="h-3 w-3" />
                          <span>{member.totalPoints.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                    {team.members.length > 4 && (
                      <div className="flex items-center justify-center p-2 bg-muted/30 rounded text-sm text-muted-foreground">
                        +{team.members.length - 4} más
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Tabla de Posiciones
            </CardTitle>
            <Select value={timeFilter} onValueChange={(value) => setTimeFilter(value as TimeFilter)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo</SelectItem>
                <SelectItem value="today">Hoy</SelectItem>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="teams" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Equipos
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Individuales
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="teams" className="mt-4">
              {renderTeamLeaderboard()}
            </TabsContent>
            
            <TabsContent value="users" className="mt-4">
              {renderUserLeaderboard()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}