import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function CallbackPage() {
  const checkUser = useAuthStore((s) => s.checkUser);
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      try {
        // 🧠 STEP 1: Wait for session to be ready
        let session = null;
        let retries = 0;

        while (!session && retries < 5) {
          const { data } = await supabase.auth.getSession();
          session = data.session;

          if (!session) {
            await new Promise((res) => setTimeout(res, 300));
            retries++;
          }
        }

        if (!session) {
          throw new Error("Session not established");
        }

        console.log("SESSION READY:", session);

        // ✅ STEP 2: Now safe to fetch user/profile
        await checkUser();

        // ✅ STEP 3: Let RouteGuard handle routing
        navigate('/find', { replace: true });

      } catch (error) {
        console.error('Callback error:', error);
        navigate('/login', { replace: true });
      }
    };

    run();
  }, [checkUser, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center gradient-pro">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      <p className="text-white ml-4">Signing you in...</p>
    </div>
  );
}