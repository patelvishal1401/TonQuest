import { createClient } from '@supabase/supabase-js'
import { envObj } from '../../constants/env'

export const supabase = createClient(envObj.supabaseUrl, envObj.supabaseAnonKey)
