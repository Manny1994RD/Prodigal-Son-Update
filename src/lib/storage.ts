import { supabase, isSupabaseEnabled } from './supabase'
import type {
  AppData, Team, User, Activity, ActivityType,
  TimeFilter, TeamStats, UserStats, UserAchievement
} from './types'

const STORAGE_KEY = 'prodigal-son-app-data'

/* ======================
   Local (fallback) utils
   ====================== */
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

function saveLocal(data: AppData) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

async function getLocal(): Promise<AppData> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
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

/* ======================
   Helpers (Supabase)
   ====================== */
function buildTeamsWithMembers(
  rawTeams: { id: string; name: string }[],
  users: { id: string; name: string; team_id: string | null }[]
): Team[] {
  const byTeam: Record<string, string[]> = {}
  for (const u of users) {
    if (!u.team_id) continue
    byTeam[u.team_id] ||= []
    byTeam[u.team_id].push(u.id)
  }
  return rawTeams.map(t => ({ id: t.id, name: t.name, members: byTeam[t.id] ?? [] }))
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

/* ======================
   Achievement logic
   (keys chosen to be generic; map to your UI as you like)
   ====================== */
type Totals = { totalPoints: number; totalActivities: number; currentStreak: number }

function ymd(d: Date) {
  const z = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  return z.toISOString().slice(0,10)
}

function computeTotalsForUser(acts: { date: string; points?: number }[]): Totals {
  const totalActivities = acts.length
  const totalPoints = acts.reduce((s, a) => s + (a.points ?? 0), 0)

  const dates = new Set<string>(acts.map(a => (a.date ?? '').slice(0,10)).filter(Boolean))
  // current streak: count back from today
  let cur = 0
  const today = new Date()
  while (true) {
    const key = ymd(new Date(today.getFullYear(), today.getMonth(), today.getDate() - cur))
    if (dates.has(key)) cur++
    else break
  }
  return { totalPoints, totalActivities, currentStreak: cur }
}

const ACH_KEYS = {
  FIRST: 'first_activity',
  P100: 'points_100',
  P500: 'points_500',
  P1000: 'points_1000',
  S3: 'streak_3',
  S7: 'streak_7',
} as const

function decideNewAchievementKeys(t: Totals, ownedKeys: Set<string>): string[] {
  const candidates: [string, boolean][] = [
    [ACH_KEYS.FIRST, t.totalActivities >= 1],
    [ACH_KEYS.P100, t.totalPoints >= 100],
    [ACH_KEYS.P500, t.totalPoints >= 500],
    [ACH_KEYS.P1000, t.totalPoints >= 1000],
    [ACH_KEYS.S3, t.currentStreak >= 3],
    [ACH_KEYS.S7, t.currentStreak >= 7],
  ]
  return candidates.filter(([k, ok]) => ok && !ownedKeys.has(k)).map(([k]) => k)
}

async function fetchUserAchievements(userId: string): Promise<UserAchievement[]> {
  const { data, error } = await supabase
    .from('user_achievements')
    .select('id,user_id,key,earned_at')
    .eq('user_id', userId)
  if (error) throw error
  return (data ?? []).map((a: any) => ({ id: a.id, userId: a.user_id, key: a.key, earnedAt: a.earned_at }))
}

async function insertUserAchievements(userId: string, keys: string[]): Promise<UserAchievement[]> {
  if (!keys.length) return []
  const rows = keys.map(k => ({ user_id: userId, key: k }))
  const { data, error } = await supabase
    .from('user_achievements')
    .insert(rows)
    .select('id,user_id,key,earned_at')
  if (error) throw error
  return (data ?? []).map((a: any) => ({ id: a.id, userId: a.user_id, key: a.key, earnedAt: a.earned_at }))
}

/* ======================
   Public API
   ====================== */
export async function getStoredData(): Promise<AppData> {
  if (isSupabaseEnabled) {
    try {
      await seedActivityTypesIfEmpty()

      const results = await Promise.all([
        supabase.from('teams').select('id,name').order('created_at', { ascending: true }),
        supabase.from('app_users').select('id,name,team_id'),
        supabase.from('activity_types').select('id,name,points,is_checklist_style'),
        supabase.from('activities').select('id,user_id,activity_type_id,date,quantity,points'),
        supabase.from('user_achievements').select('id,user_id,key,earned_at')
      ])

      const [{ data: teams, error: e1 },
             { data: users, error: e2 },
             { data: types, error: e3 },
             { data: acts, error: e4 },
             { data: achievements, error: e5 }] = results as any

      if (e1) throw e1
      if (e2) throw e2
      if (e3) throw e3
      if (e4) throw e4
      if (e5) throw e5

      const teamsWithMembers = buildTeamsWithMembers(teams ?? [], users ?? [])

      return {
        teams: teamsWithMembers,
        users: (users ?? []).map((u: any) => ({ id: u.id, name: u.name, teamId: u.team_id ?? '' })),
        activityTypes: (types ?? []).map((t: any) => ({ id: t.id, name: t.name, points: t.points, isChecklistStyle: !!t.is_checklist_style })),
        activities: (acts ?? []).map((a: any) => ({ id: a.id, userId: a.user_id, activityTypeId: a.activity_type_id, date: a.date, quantity: a.quantity, points: a.points })),
        userAchievements: (achievements ?? []).map((a: any) => ({ id: a.id, userId: a.user_id, key: a.key, earnedAt: a.earned_at })),
        lastActivity: {}
      }
    } catch (err) {
      console.error('getStoredData remote error:', err)
    }
  }
  // Fallback
  return getLocal()
}

export function saveData(data: AppData): void {
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

/* -------- Activity Types -------- */
export async function getAllActivityTypes(): Promise<ActivityType[]> {
  if (isSupabaseEnabled) {
    const { data, error } = await supabase
      .from('activity_types')
      .select('id,name,points,is_checklist_style')
      .order('name', { ascending: true })
    if (error) throw error
    return (data ?? []).map((t: any) => ({ id: t.id, name: t.name, points: t.points, isChecklistStyle: !!t.is_checklist_style }))
  }
  const d = await getLocal(); return d.activityTypes
}

export async function addActivityType(activityType: Omit<ActivityType, 'id'>): Promise<string> {
  if (isSupabaseEnabled) {
    const { data, error } = await supabase.from('activity_types')
      .insert({ name: activityType.name.trim(), points: activityType.points, is_checklist_style: !!activityType.isChecklistStyle })
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
    const { error } = await supabase.from('activity_types').delete().eq('id', activityTypeId)
    if (error) throw error
    return
  }
  const data = await getLocal()
  data.activityTypes = data.activityTypes.filter(at => at.id !== activityTypeId)
  data.activities = data.activities.filter(a => a.activityTypeId !== activityTypeId)
  saveLocal(data)
}

/* -------- Activities (with auto-achievements) -------- */
export async function addActivity(activity: Omit<Activity, 'id'>): Promise<{ id: string; streakInfo: { message: string; streak: number }; newAchievements: UserAchievement[] }> {
  if (isSupabaseEnabled) {
    // Compute points if not provided
    let pts = activity.points
    if (pts == null) {
      const { data: at, error: e } = await supabase.from('activity_types')
        .select('points').eq('id', activity.activityTypeId).single()
      if (e) throw e
      const qty = activity.quantity ?? 1
      pts = (at?.points ?? 0) * qty
    }
    const payload: any = {
      user_id: activity.userId,
      activity_type_id: activity.activityTypeId,
      date: activity.date || new Date().toISOString().slice(0,10),
      quantity: activity.quantity ?? 1,
      points: pts ?? 0
    }
    const { data, error } = await supabase.from('activities').insert(payload).select('id').single()
    if (error) throw error

    // Recompute totals + streak for the user
    const { data: acts, error: aerr } = await supabase
      .from('activities')
      .select('date,points')
      .eq('user_id', activity.userId)
    if (aerr) throw aerr
    const totals = computeTotalsForUser((acts ?? []).map((x:any)=>({date:x.date, points:x.points})))

    // Award new achievements if any
    const owned = await fetchUserAchievements(activity.userId)
    const ownedKeys = new Set(owned.map(a => a.key))
    const newKeys = decideNewAchievementKeys(totals, ownedKeys)
    const newAchievements = await insertUserAchievements(activity.userId, newKeys)

    // Simple streak message
    const streakInfo = { message: totals.currentStreak >= 2 ? '🔥 ¡Racha en curso!' : '¡Sigue así!', streak: totals.currentStreak }

    return { id: data!.id, streakInfo, newAchievements }
  }
  // Local fallback
  const data = await getLocal()
  const newActivity: Activity = { ...activity, id: Date.now().toString() }
  data.activities.push(newActivity); saveLocal(data)
  return { id: newActivity.id, streakInfo: { message: '¡Sigue así!', streak: 1 }, newAchievements: [] }
}

export async function updateActivity(activityId: string, updates: Partial<Pick<Activity, 'quantity' | 'points'>>) {
  if (isSupabaseEnabled) {
    const patch: any = {}
    if (updates.quantity !== undefined) patch.quantity = updates.quantity
    if (updates.points !== undefined) patch.points = updates.points
    const { error } = await supabase.from('activities').update(patch).eq('id', activityId)
    if (error) throw error
    return
  }
  const data = await getLocal()
  const i = data.activities.findIndex(a => a.id === activityId)
  if (i !== -1) { data.activities[i] = { ...data.activities[i], ...updates }; saveLocal(data) }
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

/* -------- Achievements direct helpers -------- */
export async function addUserAchievement(userId: string, key: string): Promise<UserAchievement> {
  if (!isSupabaseEnabled) throw new Error('Supabase disabled')
  const { data, error } = await supabase
    .from('user_achievements')
    .insert({ user_id: userId, key })
    .select('id,user_id,key,earned_at')
    .single()
  if (error) throw error
  return { id: data!.id, userId: data!.user_id, key: data!.key, earnedAt: data!.earned_at }
}

export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  if (!isSupabaseEnabled) return []
  return fetchUserAchievements(userId)
}

export async function backfillAchievements(): Promise<number> {
  // Scan all users and ensure base achievements are awarded
  const [{ data: users, error: uerr }, { data: acts, error: aerr }, { data: existing, error: eerr }] = await Promise.all([
    supabase.from('app_users').select('id'),
    supabase.from('activities').select('user_id,date,points'),
    supabase.from('user_achievements').select('user_id,key')
  ]) as any
  if (uerr) throw uerr
  if (aerr) throw aerr
  if (eerr) throw eerr

  const actsByUser: Record<string, {date:string;points?:number}[]> = {}
  for (const a of (acts ?? [])) {
    (actsByUser[a.user_id] ||= []).push({ date: a.date, points: a.points })
  }
  const ownedByUser = new Map<string, Set<string>>()
  for (const e of (existing ?? [])) {
    const set = ownedByUser.get(e.user_id) || new Set<string>()
    set.add(e.key)
    ownedByUser.set(e.user_id, set)
  }

  let inserted = 0
  for (const u of (users ?? [])) {
    const totals = computeTotalsForUser(actsByUser[u.id] ?? [])
    const owned = ownedByUser.get(u.id) || new Set<string>()
    const newKeys = decideNewAchievementKeys(totals, owned)
    if (newKeys.length) {
      const { error } = await supabase.from('user_achievements').insert(newKeys.map(k => ({ user_id: u.id, key: k })))
      if (error) throw error
      inserted += newKeys.length
    }
  }
  return inserted
}

/* -------- Stats / CSV -------- */
export async function exportToCSV(): Promise<string> {
  const data = await getStoredData()
  const headers = ['Fecha', 'Usuario', 'Equipo', 'Actividad', 'Cantidad', 'Puntos Unitarios', 'Puntos Totales']
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
  return [headers, ...rows]
    .map(r => r.map(f => '"' + String(f).replace(/"/g, '""') + '"').join(','))
    .join('\n')
}

export async function getUserStats(userId: string, _time: TimeFilter = 'all'): Promise<UserStats> {
  const data = await getStoredData()
  const u = data.users.find(x => x.id === userId)
  if (!u) {
    return { userId, userName: 'Unknown', teamId: '', teamName: 'Unknown', totalPoints: 0, totalActivities: 0, currentStreak: 0, achievements: [] }
  }
  const t = data.teams.find(x => x.id === u.teamId)
  const acts = data.activities.filter(a => a.userId === userId)
  const totals = computeTotalsForUser(acts.map(a => ({ date: a.date!, points: a.points })))
  const achievements = (data.userAchievements ?? []).filter(ua => ua.userId === userId)
  return {
    userId, userName: u.name, teamId: u.teamId, teamName: t?.name || 'Unknown',
    totalPoints: totals.totalPoints,
    totalActivities: totals.totalActivities,
    currentStreak: totals.currentStreak,
    achievements
  }
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

/* -------- Bulk Stats -------- */
export async function getAllUserStats(timeFilter: TimeFilter = 'all'): Promise<UserStats[]> {
  const data = await getStoredData()
  const users = data.users || []
  const results = await Promise.all(users.map(u => getUserStats(u.id, timeFilter)))
  return results
}

export async function getAllTeamStats(timeFilter: TimeFilter = 'all'): Promise<TeamStats[]> {
  const data = await getStoredData()
  const teams = data.teams || []
  const results = await Promise.all(teams.map(t => getTeamStats(t.id, timeFilter)))
  return results
}

/* -------- Realtime -------- */
export function subscribeToRealtime(onChange: () => void) {
  if (!isSupabaseEnabled) return () => {}
  const channel = supabase
    .channel('realtime-all')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'app_users' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_types' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'user_achievements' }, onChange)
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}
