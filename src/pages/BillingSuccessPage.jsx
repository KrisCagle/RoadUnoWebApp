import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSubscription } from '@/hooks/useSubscription';

const BillingSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { user } = useAuth();
  const { refresh, plan } = useSubscription();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    // Wait for webhook to process
    const timer = setTimeout(async () => {
        if(user) {
            await refresh();
        }
        setVerifying(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [user, refresh]);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col">
      <Helmet><title>Payment Successful - RoadUno</title></Helmet>
      <Navigation />

      <main className="flex-grow flex items-center justify-center px-4 pt-20">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
            {verifying ? (
                <div className="py-12">
                    <Loader2 className="h-16 w-16 text-orange-500 animate-spin mx-auto mb-6" />
                    <h1 className="text-2xl font-bold mb-2">Finalizing Upgrade...</h1>
                    <p className="text-slate-400">Please wait while we confirm your subscription.</p>
                </div>
            ) : (
                <div className="py-8">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="h-10 w-10 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold mb-4">You're a Pro!</h1>
                    <p className="text-slate-300 mb-8">
                        Thank you for upgrading to RoadUno Pro. Your account has been updated with unlimited access.
                    </p>
                    <div className="space-y-3">
                         <Button onClick={() => navigate('/dashboard')} className="w-full bg-orange-600 hover:bg-orange-700">
                            Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button variant="ghost" onClick={() => navigate('/pricing')} className="w-full text-slate-400 hover:text-white">
                            View Plan Details
                        </Button>
                    </div>
                </div>
            )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BillingSuccessPage;