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
import { Users, Music2, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";

const AuthModal = ({ trigger, defaultTab = 'login' }) => {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileType, setProfileType] = useState('artist');

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
    if (profileType === 'manager') return; // Safety check
    
    setLoading(true);
    // Pass profileType to signUp options for metadata or handle profile creation post-signup
    const { error } = await signUp(email, password, { 
        data: { profile_type: profileType }, // Store in user metadata initially
        emailRedirectTo: `${window.location.origin}/auth/callback`
    });
    setLoading(false);
    if (!error) {
        setIsOpen(false);
        // Navigate to email check page instead of auto-logging in
        navigate('/check-email', { state: { email } });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-slate-950 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Welcome to RoadUno</DialogTitle>
          <DialogDescription className="text-slate-400">
            Sign in to your account or create a new one to save your routes and profile.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue={defaultTab} className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-slate-900 text-slate-400">
            <TabsTrigger value="login" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">Log In</TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4 pt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-login" className="text-slate-300">Email</Label>
                <Input 
                  id="email-login" 
                  type="email" 
                  placeholder="band@example.com" 
                  className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-login" className="text-slate-300">Password</Label>
                <Input 
                  id="password-login" 
                  type="password" 
                  className="bg-slate-900 border-slate-700 text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold" disabled={loading}>
                {loading ? 'Logging in...' : 'Log In'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 pt-4">
            <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-3 pb-2">
                    <Label className="text-base text-slate-300">I am a...</Label>
                    <RadioGroup defaultValue="artist" value={profileType} onValueChange={setProfileType} className="grid grid-cols-2 gap-4">
                        <div>
                            <RadioGroupItem value="artist" id="type-artist" className="peer sr-only" />
                            <Label
                                htmlFor="type-artist"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-slate-700 bg-slate-900 p-4 hover:bg-slate-800 peer-data-[state=checked]:border-orange-500 [&:has([data-state=checked])]:border-orange-500 cursor-pointer transition-all"
                            >
                                <Music2 className="mb-2 h-6 w-6 text-slate-300" />
                                <span className="font-semibold text-sm">Artist/Band</span>
                            </Label>
                        </div>
                        <div className="relative group">
                            <RadioGroupItem 
                              value="manager" 
                              id="type-manager" 
                              className="peer sr-only" 
                              disabled={true}
                            />
                            <Label
                                htmlFor="type-manager"
                                className={cn(
                                  "flex flex-col items-center justify-between rounded-md border-2 border-slate-800 bg-slate-900/50 p-4 transition-all opacity-50 cursor-not-allowed",
                                  "hover:border-slate-800 hover:bg-slate-900/50" // Explicitly override hover for disabled state
                                )}
                            >
                                <Users className="mb-2 h-6 w-6 text-slate-500" />
                                <span className="font-semibold text-sm text-slate-500">Manager/Agent</span>
                                <span className="mt-1 text-[10px] font-bold bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase tracking-wider">Coming Soon</span>
                            </Label>
                            <div className="absolute -top-2 -right-2 bg-slate-800 rounded-full p-1 border border-slate-700">
                                <Lock className="h-3 w-3 text-slate-500" />
                            </div>
                        </div>
                    </RadioGroup>
                </div>

              <div className="space-y-2">
                <Label htmlFor="email-signup" className="text-slate-300">Email</Label>
                <Input 
                  id="email-signup" 
                  type="email" 
                  placeholder="band@example.com" 
                  className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signup" className="text-slate-300">Password</Label>
                <Input 
                  id="password-signup" 
                  type="password" 
                  className="bg-slate-900 border-slate-700 text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold" disabled={loading}>
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