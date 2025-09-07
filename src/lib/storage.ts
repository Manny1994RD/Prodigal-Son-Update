import { supabase, isSupabaseEnabled } from './supabase';
import { AppData, Team, User, Activity, ActivityType, TimeFilter, TeamStats, UserStats, UserAchievement } from './types';
import { ACHIEVEMENTS, STREAK_MESSAGES } from './constants';

const STORAGE_KEY = 'prodigal-son-app-data';
const APP_ID = '58dc1cc569';

function getDefaultData(): AppData {
  return {
    teams: [
      { id: '1', name: 'Equipo Rojo', members: [] },
      { id: '2', name: 'Equipo Azul', members: [] },
      { id: '3', name: 'Equipo Verde', members: [] },
      { id: '4', name: 'Equipo Amarillo', members: [] },
    ],
    users: [],
    activities: [],
    activityTypes: getDefaultActivityTypes(),
    userAchievements: [],
    lastActivity: {}
  };
}

function getDefaultActivityTypes(): ActivityType[] {
  return [
    { id: '1', name: 'Simple', points: 1, isChecklistStyle: false },
    { id: '2', name: 'Significativo', points: 20, isChecklistStyle: false },
    { id: '3', name: 'Invitados', points: 100, isChecklistStyle: false },
    { id: '4', name: 'Bautismo', points: 1000, isChecklistStyle: false },
    { id: '5', name: 'Culto', points: 1500, isChecklistStyle: false },
    { id: '6', name: 'Apacienta', points: 5, isChecklistStyle: false },
    { id: '7', name: 'Estudio', points: 10, isChecklistStyle: false },
    { id: '8', name: 'Video', points: 10, isChecklistStyle: false },
    { id: '9', name: 'Libro Padre', points: 10, isChecklistStyle: false },
    { id: '10', name: 'Libro Pastor', points: 10, isChecklistStyle: false },
    { id: '11', name: 'Firma', points: 10, isChecklistStyle: false },
    { id: '12', name: 'Firma Ag', points: 75, isChecklistStyle: false },
    { id: '13', name: 'Edu LMS', points: 200, isChecklistStyle: false },
    { id: '14', name: 'Mi Página', points: 25, isChecklistStyle: true },
    { id: '15', name: 'Oración', points: 25, isChecklistStyle: true },
    { id: '16', name: 'Offline Edu', points: 50, isChecklistStyle: true },
    { id: '17', name: 'Día Preparar', points: 50, isChecklistStyle: true },
    { id: '18', name: 'Carta Madre', points: 10, isChecklistStyle: true },
    { id: '19', name: 'Misión Online', points: 20, isChecklistStyle: true },
  ];
}

export async function getStoredData(): Promise<AppData> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return {
        teams: Array.isArray(data.teams) ? data.teams : [],
        users: Array.isArray(data.users) ? data.users : [],
        activities: Array.isArray(data.activities) ? data.activities : [],
        activityTypes: Array.isArray(data.activityTypes) ? data.activityTypes : getDefaultActivityTypes(),
        userAchievements: Array.isArray(data.userAchievements) ? data.userAchievements : [],
        lastActivity: data.lastActivity && typeof data.lastActivity === 'object' ? data.lastActivity : {}
      };
    }
  } catch (error) {
    console.error('Error loading stored data:', error);
  }
  return getDefaultData();
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data to localStorage:', error);
  }
}

export async function getAllActivityTypes(): Promise<ActivityType[]> {
  const data = await getStoredData();
  return data.activityTypes;
}

export async function addActivity(activity: Omit<Activity, 'id'>): Promise<{ 
  id: string; 
  streakInfo: { message: string; streak: number }; 
  newAchievements: UserAchievement[] 
}> {
  const data = await getStoredData();
  const newActivity: Activity = {
    ...activity,
    id: Date.now().toString(),
  };
  
  data.activities.push(newActivity);
  saveData(data);
  
  return {
    id: newActivity.id,
    streakInfo: { message: '¡Sigue así!', streak: 1 },
    newAchievements: []
  };
}

export async function updateActivity(activityId: string, updates: Partial<Pick<Activity, 'quantity' | 'points'>>): Promise<void> {
  const data = await getStoredData();
  const activityIndex = data.activities.findIndex(a => a.id === activityId);
  
  if (activityIndex !== -1) {
    data.activities[activityIndex] = { 
      ...data.activities[activityIndex], 
      ...updates 
    };
    saveData(data);
  }
}

export async function deleteActivity(activityId: string): Promise<void> {
  const data = await getStoredData();
  data.activities = data.activities.filter(a => a.id !== activityId);
  saveData(data);
}

export async function addUser(name: string, teamId: string): Promise<User> {
  const data = await getStoredData();
  const newUser: User = {
    id: Date.now().toString(),
    name: name.trim(),
    teamId,
  };
  
  data.users.push(newUser);
  
  const team = data.teams.find(t => t.id === teamId);
  if (team && !team.members.includes(newUser.id)) {
    team.members.push(newUser.id);
  }
  
  saveData(data);
  return newUser;
}

export async function addTeam(name: string): Promise<Team> {
  const data = await getStoredData();
  const newTeam: Team = {
    id: Date.now().toString(),
    name: name.trim(),
    members: []
  };
  
  data.teams.push(newTeam);
  saveData(data);
  return newTeam;
}

export async function addActivityType(activityType: Omit<ActivityType, 'id'>): Promise<string> {
  const data = await getStoredData();
  const newActivityType: ActivityType = {
    ...activityType,
    id: Date.now().toString(),
  };
  
  data.activityTypes.push(newActivityType);
  saveData(data);
  return newActivityType.id;
}

export async function updateUser(userId: string, updates: Partial<Omit<User, 'id'>>): Promise<void> {
  const data = await getStoredData();
  const userIndex = data.users.findIndex(u => u.id === userId);
  
  if (userIndex !== -1) {
    const oldTeamId = data.users[userIndex].teamId;
    data.users[userIndex] = { ...data.users[userIndex], ...updates };
    
    if (updates.teamId && updates.teamId !== oldTeamId) {
      const oldTeam = data.teams.find(t => t.id === oldTeamId);
      if (oldTeam) {
        oldTeam.members = oldTeam.members.filter(id => id !== userId);
      }
      
      const newTeam = data.teams.find(t => t.id === updates.teamId);
      if (newTeam && !newTeam.members.includes(userId)) {
        newTeam.members.push(userId);
      }
    }
    
    saveData(data);
  }
}

export async function updateTeam(teamId: string, updates: Partial<Omit<Team, 'id' | 'members'>>): Promise<void> {
  const data = await getStoredData();
  const teamIndex = data.teams.findIndex(t => t.id === teamId);
  
  if (teamIndex !== -1) {
    data.teams[teamIndex] = { ...data.teams[teamIndex], ...updates };
    saveData(data);
  }
}

export async function updateActivityType(activityTypeId: string, name: string, points: number): Promise<void> {
  const data = await getStoredData();
  const activityTypeIndex = data.activityTypes.findIndex(at => at.id === activityTypeId);
  
  if (activityTypeIndex !== -1) {
    data.activityTypes[activityTypeIndex] = { 
      ...data.activityTypes[activityTypeIndex], 
      name: name.trim(), 
      points 
    };
    saveData(data);
  }
}

export async function deleteUser(userId: string): Promise<void> {
  const data = await getStoredData();
  
  data.users = data.users.filter(u => u.id !== userId);
  data.teams.forEach(team => {
    team.members = team.members.filter(id => id !== userId);
  });
  data.activities = data.activities.filter(a => a.userId !== userId);
  if (Array.isArray(data.userAchievements)) {
    data.userAchievements = data.userAchievements.filter(ua => ua.userId !== userId);
  }
  
  saveData(data);
}

export async function deleteTeam(teamId: string): Promise<void> {
  const data = await getStoredData();
  
  const usersInTeam = data.users.filter(u => u.teamId === teamId);
  const remainingTeams = data.teams.filter(t => t.id !== teamId);
  
  if (remainingTeams.length > 0) {
    const firstTeam = remainingTeams[0];
    usersInTeam.forEach(user => {
      user.teamId = firstTeam.id;
      if (!firstTeam.members.includes(user.id)) {
        firstTeam.members.push(user.id);
      }
    });
  } else {
    const userIds = usersInTeam.map(u => u.id);
    data.users = data.users.filter(u => !userIds.includes(u.id));
    data.activities = data.activities.filter(a => !userIds.includes(a.userId));
    if (Array.isArray(data.userAchievements)) {
      data.userAchievements = data.userAchievements.filter(ua => !userIds.includes(ua.userId));
    }
  }
  
  data.teams = data.teams.filter(t => t.id !== teamId);
  saveData(data);
}

export async function deleteActivityType(activityTypeId: string): Promise<void> {
  const data = await getStoredData();
  
  data.activityTypes = data.activityTypes.filter(at => at.id !== activityTypeId);
  data.activities = data.activities.filter(a => a.activityTypeId !== activityTypeId);
  
  saveData(data);
}

export async function exportToCSV(): Promise<string> {
  const data = await getStoredData();
  const headers = ['Fecha', 'Usuario', 'Equipo', 'Actividad', 'Cantidad', 'Puntos Unitarios', 'Puntos Totales'];
  
  const rows = data.activities.map(activity => {
    const user = data.users.find(u => u.id === activity.userId);
    const team = data.teams.find(t => t.id === user?.teamId);
    const activityType = data.activityTypes.find(at => at.id === activity.activityTypeId);
    
    return [
      new Date(activity.date).toLocaleDateString(),
      user?.name || 'Usuario desconocido',
      team?.name || 'Equipo desconocido',
      activityType?.name || 'Actividad desconocida',
      activity.quantity?.toString() || '1',
      activityType?.points?.toString() || '0',
      activity.points?.toString() || '0'
    ];
  });
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');
  
  return csvContent;
}

export async function getUserStats(userId: string, timeFilter: TimeFilter = 'all'): Promise<UserStats> {
  const data = await getStoredData();
  const user = data.users.find(u => u.id === userId);
  
  if (!user) {
    return {
      userId,
      userName: 'Unknown',
      teamId: '',
      teamName: 'Unknown',
      totalPoints: 0,
      totalActivities: 0,
      currentStreak: 0,
      achievements: []
    };
  }
  
  const team = data.teams.find(t => t.id === user.teamId);
  const userActivities = data.activities.filter(a => a.userId === userId);
  const totalPoints = userActivities.reduce((sum, activity) => sum + (activity.points || 0), 0);
  
  const userAchievements = Array.isArray(data.userAchievements) 
    ? data.userAchievements.filter(ua => ua.userId === userId)
    : [];
  
  return {
    userId,
    userName: user.name,
    teamId: user.teamId,
    teamName: team?.name || 'Unknown',
    totalPoints,
    totalActivities: userActivities.length,
    currentStreak: 0,
    achievements: userAchievements
  };
}

export async function getTeamStats(teamId: string, timeFilter: TimeFilter = 'all'): Promise<TeamStats> {
  const data = await getStoredData();
  const team = data.teams.find(t => t.id === teamId);
  
  if (!team) {
    return {
      teamId,
      teamName: 'Unknown',
      totalPoints: 0,
      totalActivities: 0,
      memberCount: 0,
      members: []
    };
  }
  
  const teamMembers = data.users.filter(u => u.teamId === teamId);
  const memberStats = await Promise.all(teamMembers.map(member => getUserStats(member.id, timeFilter)));
  
  const totalPoints = memberStats.reduce((sum, stats) => sum + stats.totalPoints, 0);
  const totalActivities = memberStats.reduce((sum, stats) => sum + stats.totalActivities, 0);
  
  return {
    teamId,
    teamName: team.name,
    totalPoints,
    totalActivities,
    memberCount: teamMembers.length,
    members: memberStats
  };
}
