import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import Navigation from '@/components/Navigation';
import ManagerArtistSelector from '@/components/ManagerArtistSelector';
import ManagerSummaryDashboard from '@/components/ManagerSummaryDashboard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Music, MapPin, Users, TrendingUp, AlertCircle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ManagerDashboardPage = () => {
  const { user, managedArtistId, effectivePlan } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalShows: 0,
    totalRevenue: 0,
    avgGuarantee: 0,
    topVenue: 'N/A'
  });
  const [topVenues, setTopVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  // If managedArtistId is NULL (or 'all' conceptually), we show the summary dashboard instead
  const isSummaryView = !managedArtistId;

  useEffect(() => {
    const fetchArtistStats = async () => {
      if (!managedArtistId) return;

      setLoading(true);
      try {
        // Fetch shows for this artist
        const { data: shows, error } = await supabase
          .from('shows')
          .select('*')
          .eq('artist_id', managedArtistId);

        if (error) throw error;

        // Calculate Stats
        const totalShows = shows.length;
        const totalRevenue = shows.reduce((acc, show) => acc + (Number(show.guarantee) || 0) + (Number(show.door_split) || 0), 0);
        const avgGuarantee = totalShows > 0 ? (shows.reduce((acc, show) => acc + (Number(show.guarantee) || 0), 0) / totalShows).toFixed(0) : 0;
        
        // Simple top venue logic (most visited)
        const venueCounts = {};
        shows.forEach(s => { venueCounts[s.venue_name] = (venueCounts[s.venue_name] || 0) + 1 });
        const topVenueName = Object.keys(venueCounts).reduce((a, b) => venueCounts[a] > venueCounts[b] ? a : b, 'N/A');

        setStats({
          totalShows,
          totalRevenue,
          avgGuarantee,
          topVenue: topVenueName
        });

        // Fetch top venues with revenue
        // This is a simplified "client side" aggregation for MVP since we can't write complex SQL views easily here
        const venuesAgg = {};
        shows.forEach(s => {
            if (!venuesAgg[s.venue_name]) {
                venuesAgg[s.venue_name] = { name: s.venue_name, city: s.city, count: 0, revenue: 0 };
            }
            venuesAgg[s.venue_name].count += 1;
            venuesAgg[s.venue_name].revenue += (Number(s.guarantee) || 0) + (Number(s.door_split) || 0);
        });
        
        const sortedVenues = Object.values(venuesAgg).sort((a,b) => b.revenue - a.revenue).slice(0, 5);
        setTopVenues(sortedVenues);

      } catch (err) {
        console.error("Error loading manager dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!isSummaryView) {
        fetchArtistStats();
    }
  }, [managedArtistId]);


  if (isSummaryView) {
      return (
          <div className="min-h-screen bg-slate-950 text-white">
            <Navigation />
            <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Manager Dashboard</h1>
                        <p className="text-slate-400 mt-1">Overview of all managed talent</p>
                    </div>
                    <ManagerArtistSelector />
                </div>
                <ManagerSummaryDashboard />
            </main>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                    Artist Overview
                    {effectivePlan === 'free' && <Badge variant="outline" className="text-orange-400 border-orange-400">Free Plan</Badge>}
                </h1>
                <p className="text-slate-400 mt-1">Performance metrics for selected artist</p>
            </div>
            <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => navigate('/manager-venue-analytics')} className="border-slate-700 hover:bg-slate-800">Venue Analytics</Button>
                <ManagerArtistSelector />
            </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">Total Shows</CardTitle>
                    <Music className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">{stats.totalShows}</div>
                    <p className="text-xs text-slate-500 mt-1">Recorded to date</p>
                </CardContent>
            </Card>
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">${stats.totalRevenue.toLocaleString()}</div>
                    <p className="text-xs text-slate-500 mt-1">From guarantees & door</p>
                </CardContent>
            </Card>
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">Avg. Guarantee</CardTitle>
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">${stats.avgGuarantee}</div>
                    <p className="text-xs text-slate-500 mt-1">Per show average</p>
                </CardContent>
            </Card>
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">Top Venue</CardTitle>
                    <MapPin className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-lg font-bold text-white truncate" title={stats.topVenue}>{stats.topVenue}</div>
                    <p className="text-xs text-slate-500 mt-1">Most frequently played</p>
                </CardContent>
            </Card>
        </div>

        {/* Detailed Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Top Venues List */}
            <Card className="bg-slate-900 border-slate-800 lg:col-span-2">
                <CardHeader>
                    <CardTitle className="text-white">Top Performing Venues</CardTitle>
                    <CardDescription className="text-slate-400">Highest revenue generating locations</CardDescription>
                </CardHeader>
                <CardContent>
                    {topVenues.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">No show data available yet.</div>
                    ) : (
                        <div className="space-y-4">
                            {topVenues.map((venue, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                                    <div className="flex items-center gap-4">
                                        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-400">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-white">{venue.name}</div>
                                            <div className="text-xs text-slate-400">{venue.city}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-green-400">${venue.revenue.toLocaleString()}</div>
                                        <div className="text-xs text-slate-500">{venue.count} shows</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Actions / CTA */}
            <div className="space-y-6">
                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-blue-400" /> 
                            Management Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => navigate('/manager-artists')}>
                            Manage Artist Roster
                        </Button>
                        <Button variant="outline" className="w-full border-slate-600 hover:bg-slate-700 text-slate-200" onClick={() => navigate('/manager-route-performance')}>
                            Route Performance
                        </Button>
                    </CardContent>
                </Card>

                {effectivePlan === 'free' && (
                    <Card className="bg-gradient-to-br from-orange-900/20 to-pink-900/20 border-orange-500/30">
                        <CardHeader>
                            <CardTitle className="text-white text-lg">Go Pro for More</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-300 mb-4">
                                Manage unlimited artists, see deep analytics, and export reports with the Pro plan.
                            </p>
                            <Button className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white" onClick={() => navigate('/pricing')}>
                                Upgrade to Pro
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
      </main>
    </div>
  );
};

export default ManagerDashboardPage;