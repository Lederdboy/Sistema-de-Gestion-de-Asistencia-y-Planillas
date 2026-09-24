import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://hofnyclwpjmmiliuwrww.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_nLNuoDaCGYe-PaJEPYAZdA_-jN7duNO'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
