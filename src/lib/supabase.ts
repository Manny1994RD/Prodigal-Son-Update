import { createClient } from '@supabase/supabase-js'

// Prefer ENV vars in Vercel/Local .env.
// These fallbacks are for convenience during setup only.
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://nkmktcsgexbejjqjsyzt.supabase.co'

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rbWt0Y3NnZXhiZWpqcWpzeXp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMjA1OTksImV4cCI6MjA3MjY5NjU5OX0.Ldepn19Eaw_1arZ6rqD9oAas2K8cvpvUUgvPsE7N5Lw'

export const isSupabaseEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
