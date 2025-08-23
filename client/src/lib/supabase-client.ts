/* eslint-disable import/no-extraneous-dependencies */
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/db/types';
import { env } from '@/config/config-global';
console.log(env)
const supabase = createClient<Database>(
  env.SUPABASE_DB_URL,
  env.SUPABASE_ANON_KEY,
);

export default supabase;
