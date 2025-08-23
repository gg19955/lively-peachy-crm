/// <reference types="vite/client" />

export type ConfigValue = {
  appName: string;
  appVersion: string;
};

export const CONFIG: ConfigValue = {
  appName: 'Property CRM',
  appVersion: '1.0.1',
};
console.log(import.meta.env,"import.meta")
export const env = {
  // App Info
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Property CRM',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  SUPABASE_DB_URL: import.meta.env.VITE_SUPABASE_DB_URL ,
  apiBaseUrl: import.meta.env.VITE_BASE_URL ,
} as const;
