import { Team, User, ActivityType, Achievement } from './types';

export const ADMIN_PIN = '1234';

// Default activities with their point values and input types
export const DEFAULT_ACTIVITIES = {
  // Quantity input activities (with +/- controls)
  simple: 1,
  significativo: 20,
  invitados: 100,
  bautismo: 1000,
  culto: 1500,
  apacienta: 5,
  estudio: 10,
  video: 10,
  libroPadre: 10,
  libroPastor: 10,
  firma: 10,
  firmaAg: 75,
  edulms: 200,
  // Checklist style activities (simple completion)
  miPagina: 25,
  oracion: 25,
  offlineEdu: 50,
  diaPreparar: 50,
  cartaMadre: 10,
  misionOnline: 20
};

export const DEFAULT_ACTIVITY_TYPES: ActivityType[] = [
  // Quantity input activities
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
  // Checklist style activities
  { id: '14', name: 'Mi Página', points: 25, isChecklistStyle: true },
  { id: '15', name: 'Oración', points: 25, isChecklistStyle: true },
  { id: '16', name: 'Offline Edu', points: 50, isChecklistStyle: true },
  { id: '17', name: 'Día Preparar', points: 50, isChecklistStyle: true },
  { id: '18', name: 'Carta Madre', points: 10, isChecklistStyle: true },
  { id: '19', name: 'Misión Online', points: 20, isChecklistStyle: true },
];

export const DEFAULT_TEAMS: Team[] = [
  { id: '1', name: 'Equipo Rojo', members: [] },
  { id: '2', name: 'Equipo Azul', members: [] },
  { id: '3', name: 'Equipo Verde', members: [] },
  { id: '4', name: 'Equipo Amarillo', members: [] },
];

export const DEFAULT_USERS: User[] = [
  { id: '1', name: 'Juan Pérez', teamId: '1' },
  { id: '2', name: 'María García', teamId: '1' },
  { id: '3', name: 'Carlos López', teamId: '2' },
  { id: '4', name: 'Ana Martínez', teamId: '2' },
  { id: '5', name: 'Luis Rodríguez', teamId: '3' },
  { id: '6', name: 'Elena Fernández', teamId: '3' },
  { id: '7', name: 'Miguel Torres', teamId: '4' },
  { id: '8', name: 'Carmen Ruiz', teamId: '4' },
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_activity',
    name: 'Primer Paso',
    description: 'Registra tu primera actividad',
    icon: '🎯',
    threshold: 1,
    type: 'activities'
  },
  {
    id: 'points_100',
    name: 'Centenario',
    description: 'Alcanza 100 puntos',
    icon: '💯',
    threshold: 100,
    type: 'points'
  },
  {
    id: 'points_500',
    name: 'Quinientos',
    description: 'Alcanza 500 puntos',
    icon: '🏆',
    threshold: 500,
    type: 'points'
  },
  {
    id: 'points_1000',
    name: 'Milenario',
    description: 'Alcanza 1000 puntos',
    icon: '👑',
    threshold: 1000,
    type: 'points'
  },
  {
    id: 'streak_3',
    name: 'Constante',
    description: 'Mantén una racha de 3 días',
    icon: '🔥',
    threshold: 3,
    type: 'streak'
  },
  {
    id: 'streak_7',
    name: 'Semanal',
    description: 'Mantén una racha de 7 días',
    icon: '⚡',
    threshold: 7,
    type: 'streak'
  },
  {
    id: 'streak_30',
    name: 'Mensual',
    description: 'Mantén una racha de 30 días',
    icon: '🌟',
    threshold: 30,
    type: 'streak'
  },
  {
    id: 'activities_10',
    name: 'Activo',
    description: 'Registra 10 actividades',
    icon: '📈',
    threshold: 10,
    type: 'activities'
  },
  {
    id: 'activities_50',
    name: 'Dedicado',
    description: 'Registra 50 actividades',
    icon: '🎖️',
    threshold: 50,
    type: 'activities'
  },
  {
    id: 'activities_100',
    name: 'Comprometido',
    description: 'Registra 100 actividades',
    icon: '🏅',
    threshold: 100,
    type: 'activities'
  }
];

export const STREAK_MESSAGES = {
  start: "¡Excelente! Comenzaste tu racha 🎯",
  default: "¡Sigue así! Mantén el impulso 💪",
  good: "¡Genial! 3 días consecutivos 🔥",
  strong: "¡Increíble! Una semana completa ⚡",
  fire: "¡Imparable! 30 días de constancia 🌟"
};