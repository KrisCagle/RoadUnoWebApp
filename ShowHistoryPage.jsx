import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, DollarSign, Wallet, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

const TourRouteDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [route, setRoute] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && id) {
      fetchRouteDetails();
    }
  }, [user, id]);

  const fetchRouteDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch Route
      const { data: routeData, error: routeError } = await supabase
        .from('tour_routes')
        .select('*')
        .eq('id', id)
        .eq('artist_id', user.id)
        .single();
      
      if (routeError) throw routeError;
      setRoute(routeData);

      // Fetch Associated Shows
      const { data: showsData, error: showsError } = await supabase
        .from('shows')
        .select('*')
        .eq('tour_route_id', id)
        .eq('artist_id', user.id)
        .order('date', { ascending: true });

      if (showsError) throw showsError;
      setShows(showsData || []);

    } catch (error) {
      console.error('Error fetching route details:', error);
    } finally {
      setLoading(false);
    }
  };

  const financials = useMemo(() => {
    return shows.reduce((acc, show) => {
        const guarantee = show.guarantee || 0;
        const door = show.door_split || 0;
        const merch = show.merch_sales || 0;
        const expenses = show.expenses || 0;
        const net = (guarantee + door + merch) - expenses;

        return {
            totalShows: acc.totalShows + 1,
            totalGuarantee: acc.totalGuarantee + guarantee,
            totalDoor: acc.totalDoor + door,
            totalMerch: acc.totalMerch + merch,
            totalExpenses: acc.totalExpenses + expenses,
            totalNet: acc.totalNet + net
        };
    }, { totalShows: 0, totalGuarantee: 0, totalDoor: 0, totalMerch: 0, totalExpenses: 0, totalNet: 0 });
  }, [shows]);

  if (loading) {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
        </div>
    );
  }

  if (!route) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center flex-col text-white">
            <h1 className="text-2xl font-bold mb-4">Route Not Found</h1>
            <Button onClick={() => navigate('/dashboard')}>Go Back to Dashboard</Button>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <Helmet>
        <title>{route.name || 'Tour Route'} - Financial Overview</title>
      </Helmet>
      
      <Navigation />

      <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 pl-0 hover:bg-transparent hover:text-orange-400">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        <div className="mb-10">
            <h1 className="text-4xl font-bold mb-2">{route.name}</h1>
            <p className="text-slate-400 flex items-center gap-2">
                <MapPin className="h-4 w-4" /> {route.origin_city} 
                <span className="mx-2">•</span> 
                {new Date(route.created_at).toLocaleDateString()}
            </p>
        </div>

        {/* Financial Overview Cards */}
        <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Wallet className="h-6 w-6 text-green-400" />
                Financial Overview
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <p className="text-slate-500 text-xs font-bold uppercase">Total Shows</p>
                    <p className="text-2xl font-bold text-white">{financials.totalShows}</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <p className="text-slate-500 text-xs font-bold uppercase">Total Guarantee</p>
                    <p className="text-2xl font-bold text-blue-400">${financials.totalGuarantee.toLocaleString()}</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <p className="text-slate-500 text-xs font-bold uppercase">Total Door</p>
                    <p className="text-2xl font-bold text-blue-300">${financials.totalDoor.toLocaleString()}</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <p className="text-slate-500 text-xs font-bold uppercase">Merch Gross</p>
                    <p className="text-2xl font-bold text-purple-400">${financials.totalMerch.toLocaleString()}</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <p className="text-slate-500 text-xs font-bold uppercase">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-400">${financials.totalExpenses.toLocaleString()}</p>
                </div>
                 <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
                    <p className="text-slate-400 text-xs font-bold uppercase">Net Profit</p>
                    <p className={`text-2xl font-bold ${financials.totalNet >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${financials.totalNet.toLocaleString()}
                    </p>
                </div>
            </div>
        </section>

        {/* Shows Table */}
        <section>
             <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-orange-400" />
                Route Shows
            </h2>
             <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">City</th>
                                <th className="p-4">Venue</th>
                                <th className="p-4 text-right">Guarantee</th>
                                <th className="p-4 text-right">Door Deal</th>
                                <th className="p-4 text-right">Merch</th>
                                <th className="p-4 text-right">Expenses</th>
                                <th className="p-4 text-right pr-6">Net</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {shows.length > 0 ? shows.map(show => {
                                const net = (show.guarantee || 0) + (show.door_split || 0) + (show.merch_sales || 0) - (show.expenses || 0);
                                return (
                                    <tr key={show.id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="p-4">{new Date(show.date).toLocaleDateString()}</td>
                                        <td className="p-4 text-white font-medium">{show.city}</td>
                                        <td className="p-4 text-slate-300">{show.venue_name}</td>
                                        <td className="p-4 text-right text-slate-300">${(show.guarantee || 0).toLocaleString()}</td>
                                        <td className="p-4 text-right text-slate-300">${(show.door_split || 0).toLocaleString()}</td>
                                        <td className="p-4 text-right text-purple-400">${(show.merch_sales || 0).toLocaleString()}</td>
                                        <td className="p-4 text-right text-red-400">-${(show.expenses || 0).toLocaleString()}</td>
                                        <td className={`p-4 text-right pr-6 font-bold ${net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            ${net.toLocaleString()}
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-slate-500 italic">
                                        No shows logged for this route yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        {shows.length > 0 && (
                            <tfoot className="bg-slate-900 font-bold text-white border-t border-slate-800">
                                <tr>
                                    <td colSpan="3" className="p-4 text-right">Totals:</td>
                                    <td className="p-4 text-right">${financials.totalGuarantee.toLocaleString()}</td>
                                    <td className="p-4 text-right">${financials.totalDoor.toLocaleString()}</td>
                                    <td className="p-4 text-right">${financials.totalMerch.toLocaleString()}</td>
                                    <td className="p-4 text-right text-red-400">-${financials.totalExpenses.toLocaleString()}</td>
                                    <td className={`p-4 text-right pr-6 ${financials.totalNet >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        ${financials.totalNet.toLocaleString()}
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default TourRouteDetailPage;