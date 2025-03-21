import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL! || 'http://127.0.0.1:54321',
  process.env.LIVE_SUPABASE_SERVICE_ROLE_KEY! ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
  {
    realtime: {
      params: {
        eventsPerSecond: 1000,
      },
    },
  }
)

export type SupabaseClient = typeof supabase

export default supabase
