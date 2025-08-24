import { Database } from "@/db/types";
import { createClient } from "@supabase/supabase-js";

const supabaseServerClient = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  {
    auth: {
      autoRefreshToken: false, // Disable auto-refresh for server-side clients
      persistSession: false, // Disable session persistence for server-side clients
    },
  },
);

export default supabaseServerClient;
