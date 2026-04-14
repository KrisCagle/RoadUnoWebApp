import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Activity, Loader2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

const RecentActivityPage = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchLogs();
  }, [user]);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      setLogs(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    // You could map different icons to different action types
    return <Activity className="h-5 w-5 text-orange-400" />;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Helmet><title>Recent Activity | RoadUno</title></Helmet>
      <Navigation />
      
      <main className="pt-32 pb-20 px-4 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Recent Activity</h1>
        
        {loading ? <Loader2 className="animate-spin mx-auto text-orange-500" /> : (
          <div className="relative border-l border-slate-800 ml-3 space-y-8">
            {logs.map(log => (
              <div key={log.id} className="relative pl-8">
                <div className="absolute -left-[9px] top-1 bg-slate-950 p-1 rounded-full border border-slate-800">
                  <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                    <p className="font-medium text-slate-200">{log.description}</p>
                    <p className="text-xs text-slate-500 mt-2">{new Date(log.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {logs.length === 0 && <p className="pl-8 text-slate-500">No recent activity logged.</p>}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default RecentActivityPage;