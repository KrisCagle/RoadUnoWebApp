import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LayoutDashboard, Shield, Zap, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { usePromptUsage } from '@/hooks/usePromptUsage';
import ManagerArtistSelector from '@/components/ManagerArtistSelector';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut, effectivePlan, profileType, loading } = useAuth();
  const { remaining } = usePromptUsage();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getPlanBadge = () => {
    if (loading) return null;
    if (effectivePlan === 'pro') return <span className="text-[10px] bg-gradient-to-r from-orange-500 to-pink-500 text-white px-1.5 py-0.5 rounded font-bold ml-2">PRO</span>;
    if (effectivePlan === 'free') return <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-bold ml-2">FREE</span>;
    return null;
  };

  const isManager = user && profileType === 'manager';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <img src="https://horizons-cdn.hostinger.com/e8d3bde6-aa39-4953-99f8-9b210820c7eb/5dcace8ae19bc988b699c36707bf550a.png" alt="RoadUno Logo" className="h-8 md:h-9" />
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => navigate('/tour-assistant-v2')} className="text-slate-300 hover:text-white font-medium text-sm lg:text-base">Tour Assistant</button>
            <button onClick={() => navigate('/resources')} className="text-slate-300 hover:text-white font-medium text-sm lg:text-base">Resources</button>
            <button onClick={() => navigate('/tools')} className="text-slate-300 hover:text-white font-medium text-sm lg:text-base">Tools</button>
            
            {!user && <button onClick={() => navigate('/pricing')} className="text-slate-300 hover:text-white font-medium text-sm lg:text-base">Pricing</button>}
            
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger className="text-slate-300 hover:text-white font-medium text-sm lg:text-base outline-none flex items-center gap-1">
                    {isManager ? 'Manager Tools' : 'Manage Tour'}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-900 border-slate-800 text-white">
                  {isManager ? (
                     <>
                        <DropdownMenuItem onClick={() => navigate('/manager-dashboard')} className="font-bold text-blue-400"><LayoutDashboard className="h-4 w-4 mr-2" /> Manager Dashboard</DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-800" />
                        <DropdownMenuItem onClick={() => navigate('/manager-artists')}><Users className="h-4 w-4 mr-2" /> Manage Roster</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/manager-venue-analytics')}>Venue Analytics</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/manager-route-performance')}>Route Performance</DropdownMenuItem>
                     </>
                  ) : (
                     <>
                        <DropdownMenuItem onClick={() => navigate('/dashboard')} className="font-bold text-orange-400"><LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard</DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-800" />
                        <DropdownMenuItem onClick={() => navigate('/venue-leads')}>Venue Leads</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/show-history')}>Show History</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/tour-playbooks')}>Playbooks</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/route-templates')}>Saved Routes</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/artist-settings')}>Routing Preferences</DropdownMenuItem>
                     </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
             {isManager && <div className="hidden lg:block"><ManagerArtistSelector /></div>}

            {user ? (
              <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="max-w-[150px] truncate">{user.email}</span>
                        {getPlanBadge()}
                    </Button>
                  </DropdownMenuTrigger>
                   <DropdownMenuContent className="bg-slate-900 border-slate-800 text-white" align="end">
                        <DropdownMenuItem onClick={() => navigate('/profile')}>{isManager ? 'Manager Profile' : 'Artist Profile'}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/account-security')}><Shield className="h-4 w-4 mr-2" /> Security & Team</DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-800" />
                        <DropdownMenuItem onClick={handleSignOut} className="text-red-400 hover:text-red-300">Log Out</DropdownMenuItem>
                   </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
                <div className="flex items-center gap-4">
                     {remaining <= 3 && remaining > 0 && <span className="text-xs text-orange-400 font-medium hidden lg:inline">Trial: {remaining} prompts left - for more please create an account.</span>}
                    <AuthModal trigger={<Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white">Log In / Sign Up</Button>} />
                </div>
            )}
          </div>

          <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="md:hidden mt-4 pb-4 space-y-4 border-t border-slate-800 pt-4">
            <button onClick={() => { navigate('/tour-assistant-v2'); setMobileMenuOpen(false); }} className="block w-full text-left text-lg py-2 text-slate-300">Tour Assistant</button>
            <button onClick={() => { navigate('/resources'); setMobileMenuOpen(false); }} className="block w-full text-left text-lg py-2 text-slate-300">Resources</button>
            <button onClick={() => { navigate('/tools'); setMobileMenuOpen(false); }} className="block w-full text-left text-lg py-2 text-slate-300">Tools</button>
            
            {user && (
              <>
                <div className="border-t border-slate-800 pt-2 mb-2">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-2">{isManager ? 'Manager Tools' : 'Artist Tools'}</p>
                  
                  {isManager ? (
                      <>
                        <button onClick={() => { navigate('/manager-dashboard'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-blue-400 font-bold flex items-center gap-2"><LayoutDashboard className="h-4 w-4" /> Dashboard</button>
                        <button onClick={() => { navigate('/manager-artists'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-slate-300">Manage Roster</button>
                        <button onClick={() => { navigate('/manager-venue-analytics'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-slate-300">Venue Analytics</button>
                      </>
                  ) : (
                      <>
                         <button onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-orange-400 font-bold flex items-center gap-2"><LayoutDashboard className="h-4 w-4" /> Dashboard</button>
                         <button onClick={() => { navigate('/venue-leads'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-slate-300">Venue Leads</button>
                         <button onClick={() => { navigate('/show-history'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-slate-300">Show History</button>
                      </>
                  )}
                  
                </div>
                <div className="pt-4 border-t border-slate-800">
                    <Button onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }} className="w-full bg-slate-800 hover:bg-slate-700 mb-2 flex items-center justify-center gap-2">Profile {getPlanBadge()}</Button>
                    <Button onClick={() => { handleSignOut(); setMobileMenuOpen(false); }} variant="outline" className="w-full border-slate-700 text-slate-300">Log Out</Button>
                </div>
              </>
            )}
            {!user && <AuthModal trigger={<Button className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">Log In / Sign Up</Button>} />}
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;