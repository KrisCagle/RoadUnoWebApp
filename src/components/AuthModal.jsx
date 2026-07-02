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
import { Users, Music2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
                <Label htmlFor="email-login">Email</Label>
                <Input 
                  id="email-login" 
                  type="email" 
                  placeholder="band@example.com" 
                  className="bg-slate-900 border-slate-700 text-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-login">Password</Label>
                <Input 
                  id="password-login" 
                  type="password" 
                  className="bg-slate-900 border-slate-700 text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={loading}>
                {loading ? 'Logging in...' : 'Log In'}
              </Button>
            </form>
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
                                className="flex flex-col items-center justify-between rounded-md border-2 border-slate-700 bg-slate-900 p-4 hover:bg-slate-800 peer-data-[state=checked]:border-orange-500 [&:has([data-state=checked])]:border-orange-500 cursor-pointer transition-all"
                            >
                                <Music2 className="mb-2 h-6 w-6 text-slate-300" />
                                <span className="font-semibold text-sm">Artist/Band</span>
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="manager" id="type-manager" className="peer sr-only" />
                            <Label
                                htmlFor="type-manager"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-slate-700 bg-slate-900 p-4 hover:bg-slate-800 peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500 cursor-pointer transition-all"
                            >
                                <Users className="mb-2 h-6 w-6 text-slate-300" />
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
                  className="bg-slate-900 border-slate-700 text-white"
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
                  className="bg-slate-900 border-slate-700 text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={loading}>
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