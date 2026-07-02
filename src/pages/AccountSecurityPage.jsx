import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Download, Trash2, AlertTriangle, Key, Loader2, Check, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useSubscription } from '@/hooks/useSubscription';

const AccountSecurityPage = () => {
  const { user, signOut } = useAuth();
  const { plan } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  if (!user) {
    navigate('/');
    return null;
  }

  const handleExportData = async () => {
    if (plan === 'free') {
        toast({
            title: "Pro Feature Locked",
            description: "Upgrade to Pro to export your data in JSON format.",
            variant: "destructive"
        });
        navigate('/pricing');
        return;
    }

    setIsExporting(true);
    try {
      const tables = ['artist_profiles', 'tour_routes', 'venue_leads', 'artist_settings', 'shows', 'route_templates'];
      const exportData = {};

      for (const table of tables) {
        const queryField = table === 'artist_profiles' ? 'id' : (table === 'artist_settings' ? 'user_id' : 'artist_id');
        const { data, error } = await supabase.from(table).select('*');
        if (error) console.error(`Error fetching ${table}:`, error);
        exportData[table] = data || [];
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `roaduno-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({ title: "Export Complete", description: "Your data has been downloaded successfully." });

    } catch (error) {
      console.error(error);
      toast({ title: "Export Failed", description: "An error occurred.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
        toast({ title: "Incorrect Confirmation", description: "Please type DELETE to confirm.", variant: "destructive" });
        return;
    }

    setIsDeleting(true);
    try {
        await supabase.from('tour_routes').delete().eq('artist_id', user.id);
        await supabase.from('venue_leads').delete().eq('artist_id', user.id);
        await supabase.from('shows').delete().eq('artist_id', user.id);
        await supabase.from('route_templates').delete().eq('artist_id', user.id);
        await supabase.from('artist_settings').delete().eq('user_id', user.id);
        await supabase.from('artist_profiles').delete().eq('id', user.id);

        await signOut();
        toast({ title: "Account Data Deleted", description: "Your account data has been wiped and you have been signed out." });
        navigate('/');
    } catch (error) {
        console.error(error);
         toast({ title: "Delete Failed", description: "An error occurred.", variant: "destructive" });
    } finally {
        setIsDeleting(false);
        setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <Helmet><title>Account Security - RoadUno</title></Helmet>
      <Navigation />

      <main className="pt-32 pb-20 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
             <div className="p-3 bg-purple-500/20 rounded-xl">
                <Shield className="h-8 w-8 text-purple-400" />
             </div>
             <div>
                <h1 className="text-3xl font-bold">Account Security</h1>
                <p className="text-slate-400">Manage your login details and data privacy.</p>
             </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
                
                {/* Team & Collaboration (Pro) */}
                <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Users className="h-5 w-5 text-orange-400" />
                        Team & Collaboration
                    </h2>
                    {plan === 'free' ? (
                        <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-lg text-center backdrop-blur-sm">
                            <Lock className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                            <h3 className="font-bold text-white">Pro Feature</h3>
                            <p className="text-slate-400 text-sm mb-4">Invite your manager or bandmates to collaborate on your tour.</p>
                            <Button onClick={() => navigate('/pricing')} className="bg-orange-600 hover:bg-orange-700">Upgrade to Pro</Button>
                        </div>
                    ) : (
                        <div className="p-4 text-center border-2 border-dashed border-slate-700 rounded-lg">
                            <p className="text-slate-400">Collaborator invites coming soon!</p>
                        </div>
                    )}
                </section>

                {/* Login Details */}
                <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Key className="h-5 w-5 text-blue-400" /> Login Details</h2>
                    <div className="space-y-4">
                        <div><Label className="text-slate-500 text-xs uppercase font-bold tracking-wider">Email Address</Label><div className="text-lg text-white font-mono mt-1">{user.email}</div></div>
                        <div><Label className="text-slate-500 text-xs uppercase font-bold tracking-wider">User ID</Label><div className="text-sm text-slate-400 font-mono mt-1">{user.id}</div></div>
                    </div>
                </section>

                {/* Data Export */}
                <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2"><Download className="h-5 w-5 text-green-400" /> Export Your Data</h2>
                            <p className="text-slate-400 text-sm mt-1">Download a copy of all your RoadUno data in JSON format.</p>
                        </div>
                    </div>
                    <Button onClick={handleExportData} disabled={isExporting} className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700">
                        {plan === 'free' ? <><Lock className="mr-2 h-4 w-4" /> Upgrade to Export</> : <>{isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />} Download Archive</>}
                    </Button>
                </section>

                 {/* Danger Zone */}
                 <section className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-red-500/10 rounded-lg"><AlertTriangle className="h-6 w-6 text-red-500" /></div>
                        <div>
                            <h2 className="text-xl font-bold text-red-500 mb-1">Danger Zone</h2>
                            <p className="text-slate-400 text-sm mb-4">Permanently delete your account.</p>
                            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                                <DialogTrigger asChild><Button variant="destructive">Delete Account</Button></DialogTrigger>
                                <DialogContent className="bg-slate-900 border-slate-800 text-white">
                                    <DialogHeader><DialogTitle className="text-red-500">Delete Account Permanently?</DialogTitle><DialogDescription className="text-slate-300">Irreversible action.</DialogDescription></DialogHeader>
                                    <div className="py-4"><Label className="mb-2 block">Type <span className="font-bold text-white">DELETE</span> to confirm:</Label><Input value={deleteConfirmation} onChange={(e) => setDeleteConfirmation(e.target.value)} className="bg-slate-950 border-red-900/50 focus:border-red-500" placeholder="DELETE"/></div>
                                    <DialogFooter><Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDeleteAccount} disabled={deleteConfirmation !== 'DELETE' || isDeleting}>{isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />} Delete</Button></DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </section>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default AccountSecurityPage;