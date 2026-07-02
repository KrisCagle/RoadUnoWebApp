import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Users, MapPin, DollarSign, ArrowRight, Download, Wallet, CreditCard, Lock, Zap, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { canAccessDashboard, isDashboardFull } from '@/lib/featureGates';
import AdInline from '@/components/AdInline';

const DashboardPage = () => {
  const { user, effectivePlan, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('30days');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const [shows, setShows] = useState([]);
  const [leads, setLeads] = useState([]);
  const [profileData, setProfileData] = useState(null);

  const hasFullDashboard = isDashboardFull(effectivePlan);
  const canAccess = canAccessDashboard(effectivePlan);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/');
      return;
    }
    fetchDashboardData();
  }, [user, authLoading]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`[Dashboard] Fetching data for user: ${user.id}`);

      // Fetch Profile
      try {
        const { data: profile, error: profileError } = await supabase
          .from('artist_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profileError) {
          console.error('[Dashboard] Error fetching profile:', profileError);
        } else {
          setProfileData(profile || {});
        }
      } catch (err) {
        console.error('[Dashboard] Exception fetching profile:', err);
      }

      // Fetch Shows
      let fetchedShows = [];
      try {
        const { data: showData, error: showError } = await supabase
          .from('shows')
          .select('*')
          .eq('artist_id', user.id)
          .order('date', { ascending: false });
        
        if (showError) {
          console.error('[Dashboard] Error fetching shows:', showError);
          toast({ variant: 'destructive', title: 'Error loading shows', description: showError.message });
        } else {
          fetchedShows = showData || [];
        }
      } catch (err) {
        console.error('[Dashboard] Exception fetching shows:', err);
      }
      setShows(fetchedShows);

      // Fetch Leads
      let fetchedLeads = [];
      try {
        const { data: leadData, error: leadError } = await supabase
          .from('venue_leads')
          .select('*')
          .eq('artist_id', user.id)
          .order('created_at', { ascending: false });
        
        if (leadError) {
          console.error('[Dashboard] Error fetching leads:', leadError);
        } else {
          fetchedLeads = leadData || [];
        }
      } catch (err) {
        console.error('[Dashboard] Exception fetching leads:', err);
      }
      setLeads(fetchedLeads);

      // We could fetch tour_routes here if needed for stats, but currently they aren't used in dashboard metrics directly.
      // Example implementation for Task 3:
      try {
         const { data: routes, error: routesError } = await supabase
          .from('tour_routes')
          .select('*')
          .eq('artist_id', user.id);
         if (routesError) console.error('[Dashboard] Error fetching routes:', routesError);
      } catch (err) {
         console.error('[Dashboard] Exception fetching routes:', err);
      }

    } catch (globalError) {
      console.error('[Dashboard] Global fetch error:', globalError);
      setError("Failed to load dashboard data. Please try refreshing the page.");
    } finally {
      setLoading(false);
    }
  };

  const filteredShows = useMemo(() => {
    const now = new Date();
    return shows.filter(show => {
      const showDate = new Date(show.date);
      if (dateRange === '30days') return (now - showDate) / (1000 * 60 * 60 * 24) <= 30;
      if (dateRange === '90days') return (now - showDate) / (1000 * 60 * 60 * 24) <= 90;
      if (dateRange === 'year') return showDate.getFullYear() === now.getFullYear();
      return true;
    });
  }, [shows, dateRange]);

  const stats = useMemo(() => {
    return filteredShows.reduce((acc, show) => {
      const guarantee = (show.guarantee || 0);
      const door = (show.door_split || 0);
      const merch = (show.merch_sales || 0);
      const expenses = (show.expenses || 0);
      
      const revenue = guarantee + door + merch;
      const net = revenue - expenses;
      
      return {
        totalShows: acc.totalShows + 1,
        totalRevenue: acc.totalRevenue + revenue,
        totalNet: acc.totalNet + net,
        totalMerch: acc.totalMerch + merch,
        totalExpenses: acc.totalExpenses + expenses
      };
    }, { totalShows: 0, totalRevenue: 0, totalNet: 0, totalMerch: 0, totalExpenses: 0 });
  }, [filteredShows]);

  const topCities = useMemo(() => {
    if (!hasFullDashboard) return [];
    
    const cityMap = {};
    filteredShows.forEach(show => {
        if (!show.city) return;
        const revenue = (show.guarantee || 0) + (show.door_split || 0) + (show.merch_sales || 0);
        const net = revenue - (show.expenses || 0);
        
        if (!cityMap[show.city]) {
            cityMap[show.city] = { name: show.city, shows: 0, net: 0 };
        }
        cityMap[show.city].shows += 1;
        cityMap[show.city].net += net;
    });
    
    return Object.values(cityMap)
        .map(city => ({ ...city, avgNet: city.net / city.shows }))
        .sort((a, b) => b.net - a.net)
        .slice(0, 5);
  }, [filteredShows, hasFullDashboard]);

  const leadsSummary = useMemo(() => {
      const counts = { 'To Contact': 0, 'Contacted': 0, 'Booked': 0, 'Rejected': 0 };
      leads.forEach(lead => {
          if (counts[lead.status] !== undefined) counts[lead.status]++;
      });
      return counts;
  }, [leads]);

  const nextLeads = leads.filter(l => l.status === 'To Contact').slice(0, 5);

  if (authLoading || loading) {
      return (
          <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center">
              <Navigation />
              <Loader2 className="h-10 w-10 text-orange-500 animate-spin mb-4" />
              <p className="text-slate-400">Loading your dashboard...</p>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <Helmet>
        <title>Artist Dashboard - RoadUno</title>
        <meta name="description" content="Your central hub for tour management, analytics, and insights." />
      </Helmet>
      <Navigation />

      <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
        
        {error && (
            <div className="bg-red-950/50 border border-red-500/50 text-red-400 p-4 rounded-xl mb-8 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>{error}</p>
            </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                    <LayoutDashboard className="h-8 w-8 text-orange-500" />
                    Artist Dashboard
                </h1>
                <p className="text-slate-400 mt-2">
                    {effectivePlan === 'pro' ? <span className="text-orange-400 font-bold flex items-center gap-1"><Zap className="h-4 w-4"/> Pro Plan</span> : 'Free Plan'} 
                    {' • '} Welcome back, {profileData?.stage_name || user?.email?.split('@')[0] || 'Artist'}.
                </p>
            </motion.div>
            <div className="flex gap-2">
                 {effectivePlan !== 'pro' && (
                    <Button onClick={() => setShowUpgradeModal(true)} className="bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0">
                        Upgrade to Pro
                    </Button>
                )}
                <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-[180px] bg-slate-900 border-slate-800">
                        <SelectValue placeholder="Date Range" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700 text-white">
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                        <SelectItem value="90days">Last 90 Days</SelectItem>
                        <SelectItem value="30days">Last 30 Days</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        <div className="mb-10 relative">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
             <Wallet className="h-5 w-5 text-green-400" /> Money Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                  <p className="text-slate-500 text-xs font-bold uppercase mb-1">Total Shows</p>
                  <p className="text-2xl md:text-3xl font-bold text-white">{stats.totalShows}</p>
              </div>
              
              <div className={`bg-slate-900/50 p-6 rounded-xl border border-slate-800 relative overflow-hidden`}>
                   <p className="text-slate-500 text-xs font-bold uppercase mb-1">Total Net Income</p>
                   <p className={`text-2xl md:text-3xl font-bold text-green-400`}>
                       ${stats.totalNet.toLocaleString()}
                   </p>
              </div>
              
              {/* Gated Stats for Free Plan */}
              <div className={`bg-slate-900/50 p-6 rounded-xl border border-slate-800 relative overflow-hidden`}>
                  <p className="text-slate-500 text-xs font-bold uppercase mb-1">Merch Gross</p>
                   <p className={`text-2xl md:text-3xl font-bold text-purple-400 ${!hasFullDashboard ? 'blur-sm select-none' : ''}`}>
                        {!hasFullDashboard ? '$1,234' : `$${stats.totalMerch.toLocaleString()}`}
                   </p>
                   {!hasFullDashboard && <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 z-10"><Lock className="h-6 w-6 text-slate-400" /></div>}
              </div>
              <div className={`bg-slate-900/50 p-6 rounded-xl border border-slate-800 relative overflow-hidden`}>
                  <p className="text-slate-500 text-xs font-bold uppercase mb-1">Total Expenses</p>
                  <p className={`text-2xl md:text-3xl font-bold text-orange-400 ${!hasFullDashboard ? 'blur-sm select-none' : ''}`}>
                        {!hasFullDashboard ? '$1,234' : `$${stats.totalExpenses.toLocaleString()}`}
                   </p>
                   {!hasFullDashboard && <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 z-10"><Lock className="h-6 w-6 text-slate-400" /></div>}
              </div>
          </div>
        </div>

        {hasFullDashboard ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              <div className={`bg-slate-900/50 border border-slate-800 rounded-xl p-6 lg:col-span-2 relative overflow-hidden min-h-[300px]`}>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-400" />
                      Top 5 Cities by Net
                  </h2>
                  <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                          <thead className="text-slate-500 font-bold border-b border-slate-800">
                              <tr>
                                  <th className="pb-3 pl-2">City</th>
                                  <th className="pb-3 text-center">Shows</th>
                                  <th className="pb-3 text-right">Avg Net / Show</th>
                                  <th className="pb-3 text-right pr-2">Total Net</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                              {topCities.length > 0 ? topCities.map((city, i) => (
                                  <tr key={i} className="hover:bg-slate-800/50">
                                      <td className="py-3 pl-2 font-medium text-slate-200">{city.name}</td>
                                      <td className="py-3 text-center text-slate-400">{city.shows}</td>
                                      <td className="py-3 text-right text-slate-400">${city.avgNet.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                      <td className="py-3 text-right pr-2 font-bold text-green-400">+${city.net.toLocaleString()}</td>
                                  </tr>
                              )) : (
                                  <tr><td colSpan="4" className="py-8 text-center text-slate-500 italic">No show data available.</td></tr>
                              )}
                          </tbody>
                      </table>
                  </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-red-400" />
                      Where Your Money Goes
                  </h2>
                  <div className="flex flex-col items-center justify-center py-6">
                       <div className="w-32 h-32 rounded-full border-8 border-slate-800 border-t-red-500 border-r-red-400 flex items-center justify-center mb-4 relative">
                          <span className={`text-xl font-bold text-white`}>${stats.totalExpenses.toLocaleString()}</span>
                      </div>
                      <p className="text-slate-400 text-sm text-center">Total Expenses</p>
                  </div>
              </div>
          </div>
        ) : (
          <div className="w-full bg-gradient-to-r from-slate-900 to-slate-900 border border-slate-800 rounded-xl p-8 mb-8 text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-pink-500/10 opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex flex-col items-center">
                  <Lock className="h-12 w-12 text-slate-500 mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Unlock Advanced Analytics</h3>
                  <p className="text-slate-400 max-w-lg mb-6">Pro users get deep insights into merchandise sales, expense breakdowns, and top performing cities.</p>
                  <Button onClick={() => navigate('/pricing')} className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white border-0 px-8 py-6 text-lg">Upgrade to Pro</Button>
              </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 lg:col-span-2">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-400" />
                    Pipeline Overview
                </h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-950 p-3 rounded-lg text-center border border-slate-800">
                        <span className="block text-2xl font-bold text-white">{leadsSummary['Contacted']}</span>
                        <span className="text-xs text-slate-500 uppercase">Contacted</span>
                    </div>
                     <div className="bg-slate-950 p-3 rounded-lg text-center border border-slate-800">
                        <span className="block text-2xl font-bold text-white">{leadsSummary['Booked']}</span>
                        <span className="text-xs text-slate-500 uppercase">Booked</span>
                    </div>
                </div>
                 <div className="space-y-3">
                    {nextLeads.map(lead => (
                        <div key={lead.id} className="flex justify-between items-center text-sm"><span className="text-slate-300 truncate">{lead.name}</span><span className="text-slate-500 text-xs">{lead.city}</span></div>
                    ))}
                    {nextLeads.length === 0 && <p className="text-slate-500 text-sm text-center py-2">No pending leads to contact.</p>}
                </div>
                 <Button variant="link" onClick={() => navigate('/venue-leads')} className="mt-4 p-0 text-orange-400">Manage Leads <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </div>

             <div className="bg-gradient-to-br from-orange-500/10 to-pink-500/10 border border-slate-800 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-400" />
                    Quick Actions
                </h2>
                <div className="space-y-3">
                    <Button onClick={() => navigate('/tour-assistant-v2')} className="w-full justify-start bg-slate-900 hover:bg-slate-800 border border-slate-700">
                        <MapPin className="mr-2 h-4 w-4 text-orange-400" />
                        Plan New Route
                    </Button>
                    <Button onClick={() => navigate('/show-history')} className="w-full justify-start bg-slate-900 hover:bg-slate-800 border border-slate-700">
                        <DollarSign className="mr-2 h-4 w-4 text-green-400" />
                        Log Recent Show
                    </Button>
                     <Button onClick={() => !hasFullDashboard ? setShowUpgradeModal(true) : navigate('/account-security')} className="w-full justify-start bg-slate-900 hover:bg-slate-800 border border-slate-700">
                        {!hasFullDashboard ? <Lock className="mr-2 h-4 w-4 text-slate-500" /> : <Download className="mr-2 h-4 w-4 text-blue-400" />}
                        Export Data
                    </Button>
                    <Button onClick={() => navigate('/tour-playbooks')} className="w-full justify-start bg-slate-900 hover:bg-slate-800 border border-slate-700">
                         <Zap className="mr-2 h-4 w-4 text-purple-400" />
                        Tour Playbooks
                    </Button>
                </div>
            </div>
        </div>
        
        {effectivePlan !== 'pro' && (
            <div className="mt-8">
                <AdInline />
            </div>
        )}

        <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
            <DialogContent className="bg-slate-900 border-slate-800 text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">Unlock Pro Features <Zap className="h-5 w-5 text-orange-400" /></DialogTitle>
                    <DialogDescription className="text-slate-300 pt-2">
                        Get unlimited routes, advanced analytics, data export, and more.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <div className="flex gap-2 items-center text-sm"><Lock className="h-4 w-4 text-orange-400" /> Advanced Money Analytics</div>
                    <div className="flex gap-2 items-center text-sm"><Lock className="h-4 w-4 text-orange-400" /> Unlimited Routes & Shows</div>
                    <div className="flex gap-2 items-center text-sm"><Lock className="h-4 w-4 text-orange-400" /> Data Export (JSON)</div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setShowUpgradeModal(false)}>Close</Button>
                    <Button onClick={() => navigate('/pricing')} className="bg-orange-600 hover:bg-orange-700">View Plans</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;