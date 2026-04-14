import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, TrendingUp, Users, DollarSign } from 'lucide-react';

const ManagerSummaryDashboard = () => {
    const { user } = useAuth();
    const [artistStats, setArtistStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                // Get all managed artists
                const { data: artists, error: artistError } = await supabase
                    .from('manager_artists')
                    .select(`
                        artist_user_id,
                        artist_profiles!inner(id, stage_name, home_city)
                    `)
                    .eq('manager_user_id', user.id);
                
                if (artistError) throw artistError;

                // For each artist, fetch summary stats
                // Note: In a real prod app, you'd use a postgres function/view for this to avoid N+1 queries
                const statsPromises = artists.map(async (a) => {
                    const { count: showCount, data: showData } = await supabase
                        .from('shows')
                        .select('guarantee, door_split', { count: 'exact' })
                        .eq('artist_id', a.artist_user_id);
                    
                    const totalRev = showData?.reduce((acc, s) => acc + (Number(s.guarantee) || 0) + (Number(s.door_split) || 0), 0) || 0;
                    
                    return {
                        id: a.artist_profiles.id,
                        name: a.artist_profiles.stage_name,
                        city: a.artist_profiles.home_city,
                        shows: showCount || 0,
                        revenue: totalRev
                    };
                });

                const results = await Promise.all(statsPromises);
                setArtistStats(results);

            } catch (err) {
                console.error("Error loading summary:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-500" /></div>;

    if (artistStats.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-900 rounded-lg border border-slate-800">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white">No Artists Managed Yet</h3>
                <p className="text-slate-400 mt-2 mb-6">Start by adding an artist to your roster.</p>
                {/* Could add button to link artist here */}
            </div>
        );
    }

    const totalPortfolioRevenue = artistStats.reduce((acc, curr) => acc + curr.revenue, 0);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Total Portfolio Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">${totalPortfolioRevenue.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Active Artists</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{artistStats.length}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white">Artist Performance Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-800 hover:bg-slate-900/50">
                                <TableHead className="text-slate-400">Artist</TableHead>
                                <TableHead className="text-slate-400">Home City</TableHead>
                                <TableHead className="text-slate-400 text-right">Shows</TableHead>
                                <TableHead className="text-slate-400 text-right">Revenue</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {artistStats.map((artist) => (
                                <TableRow key={artist.id} className="border-slate-800 hover:bg-slate-800/50">
                                    <TableCell className="font-medium text-white">{artist.name}</TableCell>
                                    <TableCell className="text-slate-400">{artist.city}</TableCell>
                                    <TableCell className="text-right text-slate-300">{artist.shows}</TableCell>
                                    <TableCell className="text-right font-bold text-green-400">${artist.revenue.toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default ManagerSummaryDashboard;