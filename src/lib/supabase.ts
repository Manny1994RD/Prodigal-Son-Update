import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://nkmktcsgexbejjqjsyzt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rbWt0Y3NnZXhiZWpqcWpzeXp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMjA1OTksImV4cCI6MjA3MjY5NjU5OX0.Ldepn19Eaw_1arZ6rqD9oAas2K8cvpvUUgvPsE7N5Lw';

export const isSupabaseEnabled = () => !!(supabaseUrl && supabaseKey);

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types
export interface DbTeam {
  id: string;
  name: string;
  members: string[];
  created_at: string;
}

export interface DbUser {
  id: string;
  name: string;
  team_id: string;
  created_at: string;
}

export interface DbActivityType {
  id: string;
  name: string;
  points: number;
  is_checklist_style: boolean;
  is_custom: boolean;
  created_at: string;
}

export interface DbActivity {
  id: string;
  user_id: string;
  activity_type_id: string;
  quantity: number;
  points: number;
  date: string;
  created_at: string;
}

export interface DbUserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
}