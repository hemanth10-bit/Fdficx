import { createClient } from '@supabase/supabase-js';

// Get env values safely. Vite client side variables must use VITE_ prefix.
const getEnvVar = (name: string): string => {
  if (typeof window !== 'undefined') {
    const metaEnv = (import.meta as any).env;
    if (metaEnv) {
      if (metaEnv[name]) return metaEnv[name];
      if (metaEnv[`VITE_${name}`]) return metaEnv[`VITE_${name}`];
    }
  }
  
  if (typeof process !== 'undefined' && process.env) {
    if (process.env[name]) return process.env[name];
    if (process.env[`VITE_${name}`]) return process.env[`VITE_${name}`];
  }
  
  return '';
};

const supabaseUrl = getEnvVar('SUPABASE_URL').trim();
const supabaseAnonKey = getEnvVar('SUPABASE_ANON_KEY').trim();

// Check if keys are properly configured and not default placeholders
const isConfigured = 
  supabaseUrl !== '' && 
  supabaseAnonKey !== '' && 
  !supabaseUrl.includes('YOUR_SUPABASE_URL') && 
  !supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY');

let supabaseInstance: any;

function createMockSupabase() {
  const listeners = new Set<(event: string, session: any) => void>();
  
  // Keep mock session state in localStorage
  const getSessionState = () => {
    const stored = localStorage.getItem('supabase_mock_authenticated');
    if (stored === 'true') {
      return {
        user: {
          id: 'demo-user-id',
          email: 'demo@foodfix.com',
          user_metadata: { full_name: 'Demo Gourmet' }
        },
        access_token: 'mock-session-token'
      };
    }
    return null;
  };

  const notifyListeners = (event: string, session: any) => {
    listeners.forEach(cb => {
      try {
        cb(event, session);
      } catch (e) {
        console.error(e);
      }
    });
  };

  return {
    isMock: true,
    auth: {
      async getSession() {
        return { data: { session: getSessionState() }, error: null };
      },
      onAuthStateChange(callback: (event: string, session: any) => void) {
        listeners.add(callback);
        // Call immediately with current state
        const session = getSessionState();
        callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
        return {
          data: {
            subscription: {
              unsubscribe() {
                listeners.delete(callback);
              }
            }
          }
        };
      },
      async signInWithOAuth(params: { provider: string; options?: any }) {
        localStorage.setItem('supabase_mock_authenticated', 'true');
        const session = getSessionState();
        notifyListeners('SIGNED_IN', session);
        return { data: { provider: params.provider, url: window.location.href }, error: null };
      },
      async signInWithOtp(params: { email: string; options?: { emailRedirectTo?: string } }) {
        localStorage.setItem('supabase_mock_pending_email', params.email);
        localStorage.setItem('supabase_mock_pending_redirect', params.options?.emailRedirectTo || '');
        console.info(`[Mock] Magic link sent to ${params.email} with redirect ${params.options?.emailRedirectTo}`);
        return { data: { email: params.email }, error: null };
      },
      async signOut() {
        localStorage.removeItem('supabase_mock_authenticated');
        localStorage.removeItem('supabase_mock_pending_email');
        localStorage.removeItem('supabase_mock_pending_redirect');
        notifyListeners('SIGNED_OUT', null);
        return { error: null };
      }
    }
  };
}

let isMockMode = false;

if (isConfigured) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    // Add isMock: false to real instance for code consistency
    (supabaseInstance as any).isMock = false;
  } catch (err) {
    console.warn("Failed to initialize real Supabase client. Falling back to Mock.", err);
    supabaseInstance = createMockSupabase();
    isMockMode = true;
  }
} else {
  console.info("Supabase credentials not configured or using placeholders. Running in Demo/Mock Auth mode.");
  supabaseInstance = createMockSupabase();
  isMockMode = true;
}

export const supabase = supabaseInstance;
export { isMockMode };

