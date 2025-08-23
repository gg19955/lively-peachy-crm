/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_SUPABASE_DB_URL: string;
  readonly VITE_BASE_URL: string;
  readonly VITE_APP_ENV: 'development' | 'production' | 'staging';
}
