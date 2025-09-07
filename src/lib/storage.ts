<<<<<<< HEAD
import { supabase, isSupabaseEnabled } from './supabase'
import type { AppData, Team, User, Activity, ActivityType, TimeFilter, TeamStats, UserStats, UserAchievement } from './types'

const STORAGE_KEY = 'prodigal-son-app-data'

/* ======================
   Local (fallback) utils
   ====================== */
=======
// storage.ts
import { supabase, isSupabaseEnabled } from './supabase'
import type {
  AppData, Team, User, Activity, ActivityType,
  TimeFilter, TeamStats, UserStats, UserAchievement
} from './types'
import { ACHIEVEMENTS, STREAK_MESSAGES } from './constants'

const STORAGE_KEY = 'prodigal-son-app-data'
const APP_ID = '58dc1cc569' // (still unused; keep if you’ll shard storage later)

/* ---------- Local fallback (unchanged) ---------- */
>>>>>>> 1900ec64daff16c5db99e2b03e4d174536f769dd
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
  ]
}
<<<<<<< HEAD

=======
>>>>>>> 1900ec64daff16c5db99e2b03e4d174536f769dd
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
  }
}
<<<<<<< HEAD

function saveLocal(data: AppData) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

async function getLocal(): Promise<AppData> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
=======
function saveLocal(data: AppData) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}
async function getLocal(): Promise<AppData> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const data = JSON.parse(stored)
>>>>>>> 1900ec64daff16c5db99e2b03e4d174536f769dd
      return {
        teams: Array.isArray(data.teams) ? data.teams : [],
        users: Array.isArray(data.users) ? data.users : [],
        activities: Array.isArray(data.activities) ? data.activities : [],
        activityTypes: Array.isArray(data.activityTypes) ? data.activityTypes : getDefaultActivityTypes(),
        userAchievements: Array.isArray(data.userAchievements) ? data.userAchievements : [],
        lastActivity: data.lastActivity && typeof data.lastActivity === 'object' ? data.lastActivity : {}
      }
    }
  } catch {}
  return getDefaultData()
}

<<<<<<< HEAD
/* ======================
   Remote helpers
   ====================== */
function buildTeamsWithMembers(
  rawTeams: { id: string; name: string }[],
  users: { id: string; name: string; team_id: string | null }[]
): Team[] {
=======
/* ---------- Supabase helpers ---------- */
function toTeamMembersMap(users: { id: string; team_id: string | null }[]) {
>>>>>>> 1900ec64daff16c5db99e2b03e4d174536f769dd
  const byTeam: Record<string, string[]> = {}
  for (const u of users) {
    if (!u.team_id) continue
    byTeam[u.team_id] ||= []
    byTeam[u.team_id].push(u.id)
  }
<<<<<<< HEAD
  return rawTeams.map(t => ({ id: t.id, name: t.name, members: byTeam[t.id] ?? [] }))
}

/* ======================
   Public API
   ====================== */
export async function getStoredData(): Promise<AppData> {
  // Remote-first for Teams/Users
  if (isSupabaseEnabled) {
    try {
      const [{ data: teams, error: e1 }, { data: users, error: e2 }] = await Promise.all([
        supabase.from('teams').select('id,name').order('created_at', { ascending: true }),
        supabase.from('app_users').select('id,name,team_id')
      ])
      if (e1) throw e1
      if (e2) throw e2

      const teamsWithMembers = buildTeamsWithMembers(teams ?? [], users ?? [])

      // Keep other sections from local until you migrate them
      const localRaw = localStorage.getItem(STORAGE_KEY)
      const local = localRaw ? JSON.parse(localRaw) : {}

      return {
        teams: teamsWithMembers,
        users: (users ?? []).map(u => ({ id: u.id, name: u.name, teamId: u.team_id ?? '' })),
        activities: Array.isArray(local.activities) ? local.activities : [],
        activityTypes: Array.isArray(local.activityTypes) ? local.activityTypes : getDefaultActivityTypes(),
        userAchievements: Array.isArray(local.userAchievements) ? local.userAchievements : [],
        lastActivity: (local.lastActivity && typeof local.lastActivity === 'object') ? local.lastActivity : {}
      }
    } catch (err) {
      console.error('getStoredData remote error:', err)
    }
  }
  // Fallback
=======
  return byTeam
}

async function seedActivityTypesIfEmpty() {
  const { data, error } = await supabase.from('activity_types').select('id').limit(1)
  if (error) throw error
  if (data && data.length) return
  const defaults = getDefaultActivityTypes().map(d => ({
    name: d.name, points: d.points, is_checklist_style: d.isChecklistStyle
  }))
  await supabase.from('activity_types').insert(defaults)
}

async function getRemote(): Promise<AppData> {
  await seedActivityTypesIfEmpty()

  const [{ data: teams }, { data: users }, { data: acts }, { data: types }, { data: achieves }] =
    await Promise.all([
      supabase.from('teams').select('id,name').order('created_at', { ascending: true }),
      supabase.from('app_users').select('id,name,team_id'),
      supabase.from('activities').select('id,user_id,activity_type_id,date,quantity,points'),
      supabase.from('activity_types').select('id,name,points,is_checklist_style'),
      supabase.from('user_achievements').select('id,user_id,key,earned_at')
    ])

  const map = toTeamMembersMap(users ?? [])
  const teamsWithMembers: Team[] = (teams ?? []).map(t => ({
    id: t.id, name: t.name, members: map[t.id] ?? []
  }))

  const activityTypes: ActivityType[] = (types ?? []).map(t => ({
    id: t.id, name: t.name, points: t.points, isChecklistStyle: !!t.is_checklist_style
  }))

  return {
    teams: teamsWithMembers,
    users: (users ?? []).map(u => ({ id: u.id, name: u.name, teamId: u.team_id ?? '' })),
    activities: (acts ?? []).map(a => ({
      id: a.id, userId: a.user_id, activityTypeId: a.activity_type_id,
      date: a.date, quantity: a.quantity, points: a.points
    })),
    activityTypes,
    userAchievements: (achieves ?? []).map(a => ({
      id: a.id, userId: a.user_id, key: a.key, earnedAt: a.earned_at
    })) as UserAchievement[],
    lastActivity: {}
  }
}

/* ---------- Public API (same names as yours) ---------- */
export async function getStoredData(): Promise<AppData> {
  if (isSupabaseEnabled) {
    try { return await getRemote() } catch (e) { console.error(e) }
  }
>>>>>>> 1900ec64daff16c5db99e2b03e4d174536f769dd
  return getLocal()
}

export function saveData(data: AppData): void {
<<<<<<< HEAD
  // Only affects local fallback pieces
  saveLocal(data)
}

/* -------- Teams (REMOTE) -------- */
export async function addTeam(name: string): Promise<Team> {
  if (isSupabaseEnabled) {
    const { data, error } = await supabase
      .from('teams')
      .insert({ name: name.trim() })
      .select('id,name')
      .single()
    if (error) throw error
    return { id: data!.id, name: data!.name, members: [] }
=======
  // Only affects local mode; remote writes happen in the CRUD below
  saveLocal(data)
}

export async function getAllActivityTypes(): Promise<ActivityType[]> {
  if (isSupabaseEnabled) {
    const { data, error } = await supabase
      .from('activity_types')
      .select('id,name,points,is_checklist_style')
      .order('created_at', { ascending: true })
    if (error) throw error
    return (data ?? []).map(t => ({
      id: t.id, name: t.name, points: t.points, isChecklistStyle: !!t.is_checklist_style
    }))
  }
  const d = await getLocal(); return d.activityTypes
}

/* -------- Activities -------- */
export async function addActivity(activity: Omit<Activity,'id'>) {
  if (isSupabaseEnabled) {
    const { data, error } = await supabase.from('activities')
      .insert({
        user_id: activity.userId,
        activity_type_id: activity.activityTypeId,
        date: activity.date ?? new Date().toISOString().slice(0,10),
        quantity: activity.quantity ?? 1,
        points: activity.points ?? 0
      })
      .select('id')
      .single()
    if (error) throw error
    return { id: data!.id, streakInfo: { message: '¡Sigue así!', streak: 1 }, newAchievements: [] as UserAchievement[] }
  }
  // local fallback (your original)
  const data = await getLocal()
  const newActivity: Activity = { ...activity, id: Date.now().toString() }
  data.activities.push(newActivity); saveLocal(data)
  return { id: newActivity.id, streakInfo: { message: '¡Sigue así!', streak: 1 }, newAchievements: [] as UserAchievement[] }
}

export async function updateActivity(activityId: string, updates: Partial<Pick<Activity,'quantity'|'points'>>) {
  if (isSupabaseEnabled) {
    const patch: any = {}
    if (updates.quantity !== undefined) patch.quantity = updates.quantity
    if (updates.points !== undefined) patch.points = updates.points
    const { error } = await supabase.from('activities').update(patch).eq('id', activityId)
    if (error) throw error
    return
  }
  const data = await getLocal()
  const idx = data.activities.findIndex(a => a.id === activityId)
  if (idx !== -1) { data.activities[idx] = { ...data.activities[idx], ...updates }; saveLocal(data) }
}

export async function deleteActivity(activityId: string) {
  if (isSupabaseEnabled) {
    const { error } = await supabase.from('activities').delete().eq('id', activityId)
    if (error) throw error
    return
  }
  const data = await getLocal()
  data.activities = data.activities.filter(a => a.id !== activityId); saveLocal(data)
}

/* -------- Users -------- */
export async function addUser(name: string, teamId: string): Promise<User> {
  if (isSupabaseEnabled) {
    const { data, error } = await supabase
      .from('app_users')
      .insert({ name: name.trim(), team_id: teamId || null })
      .select('id,name,team_id')
      .single()
    if (error) throw error
    return { id: data!.id, name: data!.name, teamId: data!.team_id ?? '' }
  }
  const data = await getLocal()
  const newUser: User = { id: Date.now().toString(), name: name.trim(), teamId }
  data.users.push(newUser)
  const team = data.teams.find(t => t.id === teamId)
  if (team && !team.members.includes(newUser.id)) team.members.push(newUser.id)
  saveLocal(data); return newUser
}

export async function updateUser(userId: string, updates: Partial<Omit<User,'id'>>) {
  if (isSupabaseEnabled) {
    const patch: any = {}
    if (updates.name !== undefined) patch.name = updates.name.trim()
    if (updates.teamId !== undefined) patch.team_id = updates.teamId || null
    const { error } = await supabase.from('app_users').update(patch).eq('id', userId)
    if (error) throw error
    return
  }
  const data = await getLocal()
  const i = data.users.findIndex(u => u.id === userId)
  if (i !== -1) {
    const oldTeamId = data.users[i].teamId
    data.users[i] = { ...data.users[i], ...updates }
    if (updates.teamId && updates.teamId !== oldTeamId) {
      const oldTeam = data.teams.find(t => t.id === oldTeamId)
      if (oldTeam) oldTeam.members = oldTeam.members.filter(id => id !== userId)
      const newTeam = data.teams.find(t => t.id === updates.teamId)
      if (newTeam && !newTeam.members.includes(userId)) newTeam.members.push(userId)
    }
    saveLocal(data)
>>>>>>> 1900ec64daff16c5db99e2b03e4d174536f769dd
  }
  const data = await getLocal()
  const newTeam: Team = { id: Date.now().toString(), name: name.trim(), members: [] }
  data.teams.push(newTeam); saveLocal(data); return newTeam
}

<<<<<<< HEAD
export async function updateTeam(teamId: string, updates: Partial<Omit<Team, 'id' | 'members'>>): Promise<void> {
  if (isSupabaseEnabled) {
    const patch: any = {}
    if (updates.name !== undefined) patch.name = updates.name.trim()
    const { error } = await supabase.from('teams').update(patch).eq('id', teamId)
    if (error) throw error
    return
  }
  const data = await getLocal()
  const i = data.teams.findIndex(t => t.id === teamId)
  if (i !== -1) { data.teams[i] = { ...data.teams[i], ...updates }; saveLocal(data) }
}

export async function deleteTeam(teamId: string): Promise<void> {
  if (isSupabaseEnabled) {
    // set users.team_id = null then delete team
    const { error: upErr } = await supabase.from('app_users').update({ team_id: null }).eq('team_id', teamId)
    if (upErr) throw upErr
    const { error: delErr } = await supabase.from('teams').delete().eq('id', teamId)
    if (delErr) throw delErr
    return
  }
  const data = await getLocal()
  const usersInTeam = data.users.filter(u => u.teamId === teamId)
  const remainingTeams = data.teams.filter(t => t.id !== teamId)
  if (remainingTeams.length > 0) {
    const firstTeam = remainingTeams[0]
    usersInTeam.forEach(u => {
      u.teamId = firstTeam.id
      if (!firstTeam.members.includes(u.id)) firstTeam.members.push(u.id)
    })
  } else {
    const ids = usersInTeam.map(u => u.id)
    data.users = data.users.filter(u => !ids.includes(u.id))
    data.activities = data.activities.filter(a => !ids.includes(a.userId))
    if (Array.isArray(data.userAchievements)) {
      data.userAchievements = data.userAchievements.filter(ua => !ids.includes(ua.userId))
    }
  }
  data.teams = data.teams.filter(t => t.id !== teamId)
  saveLocal(data)
}

/* -------- Users (REMOTE) -------- */
export async function addUser(name: string, teamId: string): Promise<User> {
  if (isSupabaseEnabled) {
    const { data, error } = await supabase
      .from('app_users')
      .insert({ name: name.trim(), team_id: teamId || null })
      .select('id,name,team_id')
      .single()
    if (error) throw error
    return { id: data!.id, name: data!.name, teamId: data!.team_id ?? '' }
  }
  const data = await getLocal()
  const newUser: User = { id: Date.now().toString(), name: name.trim(), teamId }
  data.users.push(newUser)
  const team = data.teams.find(t => t.id === teamId)
  if (team && !team.members.includes(newUser.id)) team.members.push(newUser.id)
  saveLocal(data); return newUser
}

export async function updateUser(userId: string, updates: Partial<Omit<User, 'id'>>): Promise<void> {
  if (isSupabaseEnabled) {
    const patch: any = {}
    if (updates.name !== undefined) patch.name = updates.name.trim()
    if (updates.teamId !== undefined) patch.team_id = updates.teamId || null
    const { error } = await supabase.from('app_users').update(patch).eq('id', userId)
    if (error) throw error
    return
  }
  const data = await getLocal()
  const i = data.users.findIndex(u => u.id === userId)
  if (i !== -1) {
    const oldTeamId = data.users[i].teamId
    data.users[i] = { ...data.users[i], ...updates }
    if (updates.teamId && updates.teamId !== oldTeamId) {
      const oldTeam = data.teams.find(t => t.id === oldTeamId)
      if (oldTeam) oldTeam.members = oldTeam.members.filter(id => id !== userId)
      const newTeam = data.teams.find(t => t.id === updates.teamId)
      if (newTeam && !newTeam.members.includes(userId)) newTeam.members.push(userId)
    }
    saveLocal(data)
  }
}

export async function deleteUser(userId: string): Promise<void> {
  if (isSupabaseEnabled) {
    const { error } = await supabase.from('app_users').delete().eq('id', userId)
    if (error) throw error
    return
  }
  const data = await getLocal()
  data.users = data.users.filter(u => u.id !== userId)
  data.teams.forEach(t => { t.members = t.members.filter(id => id !== userId) })
  data.activities = data.activities.filter(a => a.userId !== userId)
  if (Array.isArray(data.userAchievements)) {
    data.userAchievements = data.userAchievements.filter(ua => ua.userId !== userId)
  }
  saveLocal(data)
}

/* -------- Activities & Types (LOCAL for now) -------- */
export async function getAllActivityTypes(): Promise<ActivityType[]> {
  const d = await getStoredData(); return d.activityTypes
}

export async function addActivity(activity: Omit<Activity, 'id'>): Promise<{ id: string; streakInfo: { message: string; streak: number }; newAchievements: UserAchievement[] }> {
  const data = await getLocal()
  const newActivity: Activity = { ...activity, id: Date.now().toString() }
  data.activities.push(newActivity); saveLocal(data)
  return { id: newActivity.id, streakInfo: { message: '¡Sigue así!', streak: 1 }, newAchievements: [] }
}

export async function updateActivity(activityId: string, updates: Partial<Pick<Activity, 'quantity' | 'points'>>): Promise<void> {
  const data = await getLocal()
  const i = data.activities.findIndex(a => a.id === activityId)
  if (i !== -1) { data.activities[i] = { ...data.activities[i], ...updates }; saveLocal(data) }
}

export async function deleteActivity(activityId: string): Promise<void> {
  const data = await getLocal()
  data.activities = data.activities.filter(a => a.id !== activityId); saveLocal(data)
}

export async function addActivityType(activityType: Omit<ActivityType, 'id'>): Promise<string> {
  const data = await getLocal()
  const newType: ActivityType = { ...activityType, id: Date.now().toString() }
  data.activityTypes.push(newType); saveLocal(data); return newType.id
}

export async function updateActivityType(activityTypeId: string, name: string, points: number): Promise<void> {
  const data = await getLocal()
  const i = data.activityTypes.findIndex(at => at.id === activityTypeId)
  if (i !== -1) { data.activityTypes[i] = { ...data.activityTypes[i], name: name.trim(), points }; saveLocal(data) }
}

export async function deleteActivityType(activityTypeId: string): Promise<void> {
  const data = await getLocal()
  data.activityTypes = data.activityTypes.filter(at => at.id !== activityTypeId)
  data.activities = data.activities.filter(a => a.activityTypeId !== activityTypeId)
  saveLocal(data)
}

/* -------- Stats / CSV (local-only) -------- */
export async function exportToCSV(): Promise<string> {
  const data = await getStoredData()
  const headers = ['Fecha', 'Usuario', 'Equipo', 'Actividad', 'Cantidad', 'Puntos Unitarios', 'Puntos Totales']
=======
export async function deleteUser(userId: string) {
  if (isSupabaseEnabled) {
    const { error } = await supabase.from('app_users').delete().eq('id', userId)
    if (error) throw error
    // activities & achievements cascade via FK
    return
  }
  const data = await getLocal()
  data.users = data.users.filter(u => u.id !== userId)
  data.teams.forEach(t => (t.members = t.members.filter(id => id !== userId)))
  data.activities = data.activities.filter(a => a.userId !== userId)
  if (Array.isArray(data.userAchievements)) {
    data.userAchievements = data.userAchievements.filter(ua => ua.userId !== userId)
  }
  saveLocal(data)
}

/* -------- Teams -------- */
export async function addTeam(name: string): Promise<Team> {
  if (isSupabaseEnabled) {
    const { data, error } = await supabase
      .from('teams')
      .insert({ name: name.trim() })
      .select('id,name')
      .single()
    if (error) throw error
    return { id: data!.id, name: data!.name, members: [] }
  }
  const data = await getLocal()
  const newTeam: Team = { id: Date.now().toString(), name: name.trim(), members: [] }
  data.teams.push(newTeam); saveLocal(data); return newTeam
}

export async function updateTeam(teamId: string, updates: Partial<Omit<Team,'id'|'members'>>) {
  if (isSupabaseEnabled) {
    const patch: any = {}
    if (updates.name !== undefined) patch.name = updates.name.trim()
    const { error } = await supabase.from('teams').update(patch).eq('id', teamId)
    if (error) throw error
    return
  }
  const data = await getLocal()
  const i = data.teams.findIndex(t => t.id === teamId)
  if (i !== -1) { data.teams[i] = { ...data.teams[i], ...updates } ; saveLocal(data) }
}

export async function deleteTeam(teamId: string) {
  if (isSupabaseEnabled) {
    // Option A: reassign users in this team to NULL (or another team)
    const { error: upErr } = await supabase.from('app_users').update({ team_id: null }).eq('team_id', teamId)
    if (upErr) throw upErr
    const { error: delErr } = await supabase.from('teams').delete().eq('id', teamId)
    if (delErr) throw delErr
    return
  }
  const data = await getLocal()
  const usersInTeam = data.users.filter(u => u.teamId === teamId)
  const remainingTeams = data.teams.filter(t => t.id !== teamId)
  if (remainingTeams.length > 0) {
    const firstTeam = remainingTeams[0]
    usersInTeam.forEach(u => {
      u.teamId = firstTeam.id
      if (!firstTeam.members.includes(u.id)) firstTeam.members.push(u.id)
    })
  } else {
    const userIds = usersInTeam.map(u => u.id)
    data.users = data.users.filter(u => !userIds.includes(u.id))
    data.activities = data.activities.filter(a => !userIds.includes(a.userId))
    if (Array.isArray(data.userAchievements)) {
      data.userAchievements = data.userAchievements.filter(ua => !userIds.includes(ua.userId))
    }
  }
  data.teams = data.teams.filter(t => t.id !== teamId)
  saveLocal(data)
}

/* -------- Activity Types -------- */
export async function addActivityType(activityType: Omit<ActivityType,'id'>): Promise<string> {
  if (isSupabaseEnabled) {
    const { data, error } = await supabase.from('activity_types')
      .insert({
        name: activityType.name.trim(),
        points: activityType.points,
        is_checklist_style: !!activityType.isChecklistStyle
      })
      .select('id')
      .single()
    if (error) throw error
    return data!.id
  }
  const data = await getLocal()
  const newOne: ActivityType = { ...activityType, id: Date.now().toString() }
  data.activityTypes.push(newOne); saveLocal(data); return newOne.id
}

export async function updateActivityType(activityTypeId: string, name: string, points: number) {
  if (isSupabaseEnabled) {
    const { error } = await supabase.from('activity_types')
      .update({ name: name.trim(), points })
      .eq('id', activityTypeId)
    if (error) throw error
    return
  }
  const data = await getLocal()
  const i = data.activityTypes.findIndex(at => at.id === activityTypeId)
  if (i !== -1) { data.activityTypes[i] = { ...data.activityTypes[i], name: name.trim(), points }; saveLocal(data) }
}

export async function deleteActivityType(activityTypeId: string) {
  if (isSupabaseEnabled) {
    // delete type and orphan its activities' type (set null) or cascade if you prefer
    const { error } = await supabase.from('activity_types').delete().eq('id', activityTypeId)
    if (error) throw error
    return
  }
  const data = await getLocal()
  data.activityTypes = data.activityTypes.filter(at => at.id !== activityTypeId)
  data.activities = data.activities.filter(a => a.activityTypeId !== activityTypeId)
  saveLocal(data)
}

/* -------- Stats / CSV (unchanged logic, but read from getStoredData) -------- */
export async function exportToCSV(): Promise<string> {
  const data = await getStoredData()
  const headers = ['Fecha','Usuario','Equipo','Actividad','Cantidad','Puntos Unitarios','Puntos Totales']
>>>>>>> 1900ec64daff16c5db99e2b03e4d174536f769dd
  const rows = data.activities.map(a => {
    const u = data.users.find(x => x.id === a.userId)
    const t = data.teams.find(x => x.id === u?.teamId)
    const at = data.activityTypes.find(x => x.id === a.activityTypeId)
    return [
      new Date(a.date ?? new Date()).toLocaleDateString(),
      u?.name || 'Usuario desconocido',
      t?.name || 'Equipo desconocido',
      at?.name || 'Actividad desconocida',
      String(a.quantity ?? 1),
      String(at?.points ?? 0),
      String(a.points ?? 0)
    ]
  })
<<<<<<< HEAD
  return [headers, ...rows].map(r => r.map(f => \`"\${f}"\`).join(',')).join('\n')
=======
  return [headers, ...rows].map(r => r.map(f => `"${f}"`).join(',')).join('\n')
>>>>>>> 1900ec64daff16c5db99e2b03e4d174536f769dd
}

export async function getUserStats(userId: string, _time: TimeFilter = 'all'): Promise<UserStats> {
  const data = await getStoredData()
  const u = data.users.find(x => x.id === userId)
  if (!u) {
    return { userId, userName: 'Unknown', teamId: '', teamName: 'Unknown', totalPoints: 0, totalActivities: 0, currentStreak: 0, achievements: [] }
  }
  const t = data.teams.find(x => x.id === u.teamId)
  const acts = data.activities.filter(a => a.userId === userId)
<<<<<<< HEAD
  const totalPoints = acts.reduce((s, a) => s + (a.points ?? 0), 0)
  const achievements = (data.userAchievements ?? []).filter(ua => ua.userId === userId)
  return { userId, userName: u.name, teamId: u.teamId, teamName: t?.name || 'Unknown', totalPoints, totalActivities: acts.length, currentStreak: 0, achievements }
=======
  const totalPoints = acts.reduce((s,a) => s + (a.points ?? 0), 0)
  const achievements = (data.userAchievements ?? []).filter(ua => ua.userId === userId)
  return {
    userId, userName: u.name, teamId: u.teamId, teamName: t?.name || 'Unknown',
    totalPoints, totalActivities: acts.length, currentStreak: 0, achievements
  }
>>>>>>> 1900ec64daff16c5db99e2b03e4d174536f769dd
}

export async function getTeamStats(teamId: string, _time: TimeFilter = 'all'): Promise<TeamStats> {
  const data = await getStoredData()
  const t = data.teams.find(x => x.id === teamId)
  if (!t) return { teamId, teamName: 'Unknown', totalPoints: 0, totalActivities: 0, memberCount: 0, members: [] }
  const members = data.users.filter(u => u.teamId === teamId)
  const memberStats = await Promise.all(members.map(m => getUserStats(m.id)))
  const totalPoints = memberStats.reduce((s, st) => s + st.totalPoints, 0)
  const totalActivities = memberStats.reduce((s, st) => s + st.totalActivities, 0)
  return { teamId, teamName: t.name, totalPoints, totalActivities, memberCount: members.length, members: memberStats }
}
