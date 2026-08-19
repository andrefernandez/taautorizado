import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://frftpuvwtlluyenairwy.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyZnRwdXZ3dGxsdXllbmFpcnd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxMDA5MzYsImV4cCI6MjEwMjY3NjkzNn0.Du1eM9Z6QK0gSF-AfnoOlYtcLcWogr_eV02sgtsEE-I'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
