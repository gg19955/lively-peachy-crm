import supabase from '@/lib/supabase-client';
import { Provider } from '@supabase/supabase-js';

export const handleSocialLogin = async (plateform: Provider) => {
  // Simulate Microsoft login
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: plateform,
      options: {
        scopes:
          plateform === 'azure'
            ? 'openid email profile offline_access'
            : 'openid email profile',
        queryParams: {
          access_type: 'offline',
        },
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      console.error(plateform, ' sign-in error:', error.message);
    }
  } catch (error: any) {
    console.error(plateform, ' sign-in error:', error.message);
  } finally {
  }
};