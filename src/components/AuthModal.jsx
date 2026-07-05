import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Users, Music2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AuthModal = ({ trigger, defaultTab = 'login' }) => {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileType, setProfileType] = useState('artist');

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSending, setResetSending] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (!error) {
      setIsOpen(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(email, password, { 
        data: { profile_type: profileType },
        emailRedirectTo: `${window.location.origin}/auth/callback`
    });
    setLoading(false);
    if (!error) {
        setIsOpen(false);
        navigate('/check-email', { state: { email } });
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setResetSending(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setResetSent(true);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setResetSending(false);
    }
  };

  const resetForgotPasswordState = () => {
    setShowForgotPassword(false);
    setResetSent(false);
    setResetEmail('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForgotPasswordState(); }}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-asphalt-raised border-steel text-paper">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Welcome to RoadUno</DialogTitle>
          <DialogDescription className="text-paper-muted">
            Sign in to your account or create a new one to save your routes and profile.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue={defaultTab} className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-asphalt text-paper-muted">
            <TabsTrigger value="login" className="data-[state=active]:bg-steel data-[state=active]:text-paper">Log In</TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-steel data-[state=active]:text-paper">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4 pt-4">
            {showForgotPassword ? (
              resetSent ? (
                <div className="text-center py-4 space-y-3">
                  <p className="text-paper">Check your email for a reset link.</p>
                  <p className="text-paper-muted text-sm">Sent to {resetEmail}</p>
                  <Button variant="ghost" onClick={resetForgotPasswordState} className="text-marquee">
                    Back to login
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <p className="text-sm text-paper-muted">Enter your email and we'll send you a link to reset your password.</p>
                  <div className="space-y-2">
                    <Label htmlFor="email-reset">Email</Label>
                    <Input
                      id="email-reset"
                      type="email"
                      placeholder="band@example.com"
                      className="bg-asphalt border-steel text-paper"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-marquee hover:bg-marquee-hover text-asphalt font-semibold" disabled={resetSending}>
                    {resetSending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : 'Send Reset Link'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={resetForgotPasswordState} className="w-full text-paper-muted">
                    Back to login
                  </Button>
                </form>
              )
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-login">Email</Label>
                  <Input 
                    id="email-login" 
                    type="email" 
                    placeholder="band@example.com" 
                    className="bg-asphalt border-steel text-paper"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password-login">Password</Label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-xs text-marquee hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input 
                    id="password-login" 
                    type="password" 
                    className="bg-asphalt border-steel text-paper"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-marquee hover:bg-marquee-hover text-asphalt font-semibold" disabled={loading}>
                  {loading ? 'Logging in...' : 'Log In'}
                </Button>
              </form>
            )}
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 pt-4">
            <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-3 pb-2">
                    <Label className="text-base">I am a...</Label>
                    <RadioGroup defaultValue="artist" value={profileType} onValueChange={setProfileType} className="grid grid-cols-2 gap-4">
                        <div>
                            <RadioGroupItem value="artist" id="type-artist" className="peer sr-only" />
                            <Label
                                htmlFor="type-artist"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-steel bg-asphalt p-4 hover:bg-steel/30 peer-data-[state=checked]:border-marquee [&:has([data-state=checked])]:border-marquee cursor-pointer transition-all"
                            >
                                <Music2 className="mb-2 h-6 w-6 text-paper-muted" />
                                <span className="font-semibold text-sm">Artist/Band</span>
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="manager" id="type-manager" className="peer sr-only" />
                            <Label
                                htmlFor="type-manager"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-steel bg-asphalt p-4 hover:bg-steel/30 peer-data-[state=checked]:border-routeline [&:has([data-state=checked])]:border-routeline cursor-pointer transition-all"
                            >
                                <Users className="mb-2 h-6 w-6 text-paper-muted" />
                                <span className="font-semibold text-sm">Manager/Agent</span>
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

              <div className="space-y-2">
                <Label htmlFor="email-signup">Email</Label>
                <Input 
                  id="email-signup" 
                  type="email" 
                  placeholder="band@example.com" 
                  className="bg-asphalt border-steel text-paper"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signup">Password</Label>
                <Input 
                  id="password-signup" 
                  type="password" 
                  className="bg-asphalt border-steel text-paper"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-marquee hover:bg-marquee-hover text-asphalt font-semibold" disabled={loading}>
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;