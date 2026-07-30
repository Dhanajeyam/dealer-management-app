import { createClient } from '@supabase/supabase-js'

// Clean & sanitize Supabase URL (strips trailing /rest/v1/ or slashes if user pasted REST endpoint directly)
const cleanUrl = (url) => {
  if (!url) return ''
  return url.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')
}

const rawUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseUrl = cleanUrl(rawUrl)
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl !== 'https://your-project-id.supabase.co' &&
    supabaseAnonKey !== 'your-anon-key-here'
  )
}

// Initialize client (uses fallback placeholder URL if empty to prevent immediate JS crash)
export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured() ? supabaseAnonKey : 'placeholder-key'
)
