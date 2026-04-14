import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet';

const CheckEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [resending, setResending] = useState(false);
  
  // Get email from location state or fallback
  const email = location.state?.email || '';

  const handleResendEmail = async () => {
    if (!email) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "No email address found to resend to.",
        });
        return;
    }

    setResending(true);
    try {
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email,
        });
        
        if (error) throw error;
        
        toast({
            title: "Email Resent",
            description: "Check your inbox for the confirmation link.",
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Failed to resend",
            description: error.message,
        });
    } finally {
        setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-50">
      <Helmet>
        <title>Verify Your Email - RoadUno</title>
      </Helmet>
      <Navigation />
      
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md relative z-10">
            {/* Ambient background effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-orange-500/10 blur-[100px] rounded-full pointer-events-none" />
            
            <Card className="bg-slate-900/50 backdrop-blur-md border-slate-800 text-slate-100 shadow-2xl">
                <CardHeader className="text-center space-y-4 pb-2">
                    <div className="mx-auto w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 shadow-inner">
                        <Mail className="w-8 h-8 text-orange-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
                        Check your email
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-base">
                        Thanks for signing up for RoadUno!
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-slate-300 leading-relaxed">
                        We've sent a confirmation email via Supabase to <span className="font-semibold text-white">{email}</span>.
                    </p>
                    <p className="text-slate-400 text-sm">
                        Please click the link in that email to verify your address, then return here and log in.
                    </p>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 pt-2">
                     <Button 
                        variant="outline" 
                        className="w-full border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:text-white"
                        onClick={handleResendEmail}
                        disabled={resending || !email}
                    >
                        {resending ? (
                            <div className="flex items-center">
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </div>
                        ) : (
                            "Resend Confirmation Email"
                        )}
                    </Button>
                    <Button 
                        variant="ghost" 
                        className="w-full text-slate-400 hover:text-white"
                        onClick={() => navigate('/')}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Login
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckEmailPage;