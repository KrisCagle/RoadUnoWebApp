import React from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import ManagerArtistSelector from '@/components/ManagerArtistSelector';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3 } from 'lucide-react';

const ManagerVenueAnalyticsPage = () => {
  const navigate = useNavigate();
  const { effectivePlan } = useAuth();
  
  // This page would ideally fetch detailed aggregations
  // For MVP/Demo purposes we show the structure
  
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/manager-dashboard')} className="text-slate-400 hover:text-white">
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-white">Venue Analytics</h1>
                    <p className="text-slate-400 mt-1">Deep dive into venue performance across your roster</p>
                </div>
            </div>
            <ManagerArtistSelector />
        </div>

        <div className="grid grid-cols-1 gap-6">
            <Card className="bg-slate-900 border-slate-800 h-96 flex flex-col items-center justify-center text-center p-8">
                 <div className="bg-slate-800 p-4 rounded-full mb-4">
                    <BarChart3 className="w-12 h-12 text-blue-500" />
                 </div>
                 <h2 className="text-2xl font-bold text-white mb-2">Detailed Analytics Coming Soon</h2>
                 <p className="text-slate-400 max-w-md mx-auto mb-6">
                    We're building advanced venue comparison tools, margin analysis, and regional performance heatmaps for Managers.
                 </p>
                 <Button variant="outline" className="border-slate-700 hover:bg-slate-800" onClick={() => navigate('/manager-dashboard')}>
                    Return to Dashboard
                 </Button>
            </Card>
        </div>
      </main>
    </div>
  );
};

export default ManagerVenueAnalyticsPage;