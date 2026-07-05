
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/customSupabaseClient';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('checking'); // checking, form, success, error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Supabase typically automatically parses the URL hash containing the recovery token
        // and establishes a temporary session.
        const { data: { session }, error } = await supabase.auth.getSession();
        
        // Also check if we just got a recovery event
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'PASSWORD_RECOVERY') {
            setStatus('form');
          }
        });

        if (error) throw error;
        
        if (session) {
          setStatus('form');
        } else {
          // If no session and no hash, they probably shouldn't be here
          const hash = location.hash;
          if (!hash || !hash.includes('type=recovery')) {
            // Might have already been processed, or invalid link
            setStatus('error');
            setErrorMessage('Invalid or expired password reset link. Please request a new one.');
          } else {
            // Waiting for Supabase to process the hash
            setTimeout(() => {
              supabase.auth.getSession().then(({ data }) => {
                if (data.session) {
                  setStatus('form');
                } else {
                  setStatus('error');
                  setErrorMessage('Failed to establish a secure session for password reset.');
                }
              });
            }, 1000);
          }
        }
      } catch (err) {
        console.error('Session check error:', err);
        setStatus('error');
        setErrorMessage(err.message || 'An error occurred while verifying your reset link.');
      }
    };

    checkSession();
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setStatus('success');
    } catch (err) {
      console.error('Password update error:', err);
      setErrorMessage(err.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-asphalt text-paper flex flex-col">
      <Helmet>
        <title>Reset Password | RoadUno</title>
      </Helmet>
      
      <Navigation />

      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-4">
        <div className="w-full max-w-md ru-card p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-12 h-12 bg-steel/30 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-marquee" />
            </div>
            <h1 className="text-2xl font-display font-bold text-white mb-2">
              Reset Your Password
            </h1>
            <p className="text-paper-muted text-sm">
              Create a new password for your account.
            </p>
          </div>

          {status === 'checking' && (
            <div className="flex flex-col items-center justify-center py-8 text-paper-muted">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-marquee" />
              <p>Verifying secure link...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="bg-taillight/10 text-taillight p-4 rounded-md flex flex-col items-center mb-6">
                <AlertCircle className="w-8 h-8 mb-2" />
                <p className="text-sm font-medium">{errorMessage}</p>
              </div>
              <Button 
                variant="outline" 
                className="w-full border-steel text-paper hover:bg-steel/50"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Home
              </Button>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="bg-routeline/10 text-routeline p-4 rounded-md flex flex-col items-center mb-6">
                <CheckCircle2 className="w-8 h-8 mb-2" />
                <p className="text-sm font-medium">Password successfully updated!</p>
              </div>
              <p className="text-paper-muted text-sm mb-6">
                Your password has been changed. You can now access your account with your new credentials.
              </p>
              <Button 
                className="w-full bg-marquee hover:bg-marquee-hover text-asphalt font-semibold"
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </Button>
            </div>
          )}

          {status === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-asphalt/50 border-steel text-white"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-asphalt/50 border-steel text-white"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>

              {errorMessage && (
                <div className="p-3 bg-taillight/10 border border-taillight/20 rounded text-sm text-taillight flex items-start">
                  <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <p>{errorMessage}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-marquee hover:bg-marquee-hover text-asphalt font-semibold mt-6"
                disabled={loading || !password || !confirmPassword}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ResetPasswordPage;
