import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2 } from 'lucide-react';

const AuthCallbackPage = () => {
  const [errorMsg, setErrorMsg] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          
          navigate('/dashboard');
        } else {
          // Fallback for implicit flow if session is already established
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            navigate('/dashboard');
          } else {
            throw new Error("No confirmation code found in the URL.");
          }
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        setErrorMsg(error.message);
        navigate(`/check-email?error=${encodeURIComponent(error.message)}`);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-neutral-900 border border-orange-500 rounded-xl p-8 max-w-md w-full text-center shadow-lg">
        <Loader2 className="h-10 w-10 text-orange-500 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-bold text-neutral-200 mb-2">Confirming your email...</h2>
        <p className="text-neutral-400">Please wait while we verify your account.</p>
        
        {errorMsg && (
          <div className="mt-4 p-3 bg-red-950/50 border border-red-500/50 rounded text-red-400 text-sm">
            Error: {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallbackPage;