import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Check, X, Crown, Loader2, CreditCard, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import AdBanner from '@/components/AdBanner';

const PricingPage = () => {
  const { user, effectivePlan, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [billingLoading, setBillingLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) return;
    setBillingLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          user_id: user.id,
          email: user.email 
        }
      });

      if (error) {
        throw new Error(error.message || "Failed to create checkout session");
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned from server");
      }
      
    } catch (err) {
      console.error("Billing Error:", err);
      toast({ 
        variant: "destructive", 
        title: "Billing Error", 
        description: "Could not initiate checkout. Please try again later." 
      });
      setBillingLoading(false);
    }
  };

  const handleManageSubscription = async () => {
     toast({
        title: "Manage Subscription",
        description: "To cancel or update payment methods, please contact support or use the customer portal (Coming Soon).",
      });
  };

  const isPro = effectivePlan === 'pro';

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <Helmet>
        <title>Pricing - RoadUno</title>
        <meta name="description" content="Choose the right plan for your touring needs. Start free or upgrade to Pro for unlimited features." />
      </Helmet>
      
      <Navigation />

      <main className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Tour Smarter, <span className="text-orange-500">Not Harder</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Flexible plans for every stage of your career.
          </p>
        </div>

        {/* Ad Banner for users considering upgrade */}
        <div className="max-w-7xl mx-auto px-4 mb-12">
            <AdBanner />
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 px-4">
            
            {/* Anonymous Plan */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col"
            >
                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-2">Anonymous Trial</h2>
                    <p className="text-slate-400 text-sm">Try before you sign up.</p>
                    <div className="mt-4 text-3xl font-bold">Free</div>
                </div>
                <ul className="space-y-3 mb-8 flex-grow text-sm">
                    <li className="flex gap-2"><Check className="h-4 w-4 text-slate-500" /> 3 AI Route Prompts</li>
                    <li className="flex gap-2 text-slate-500"><X className="h-4 w-4" /> Save Routes</li>
                    <li className="flex gap-2 text-slate-500"><X className="h-4 w-4" /> Financial Dashboard</li>
                    <li className="flex gap-2 text-slate-500"><X className="h-4 w-4" /> Venue Leads</li>
                </ul>
                {!user ? (
                   <AuthModal trigger={<Button variant="outline" className="w-full border-slate-700 hover:bg-slate-800 text-slate-300">Get Started Free</Button>} />
                ) : (
                    <Button disabled variant="secondary" className="w-full">Already Registered</Button>
                )}
            </motion.div>

            {/* Free Plan */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`bg-slate-900 border ${!isPro && user ? 'border-green-500/50' : 'border-slate-800'} rounded-2xl p-8 flex flex-col relative`}
            >
                {!isPro && user && <div className="absolute top-0 right-0 bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-bl-xl border-l border-b border-green-500/20">CURRENT PLAN</div>}
                
                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-2">Free Account</h2>
                    <p className="text-slate-400 text-sm">Essential tools for weekend warriors.</p>
                    <div className="mt-4 text-3xl font-bold">$0 <span className="text-sm font-normal text-slate-500">/mo</span></div>
                </div>
                <ul className="space-y-3 mb-8 flex-grow text-sm">
                    <li className="flex gap-2"><Check className="h-4 w-4 text-green-400" /> 10 AI Route Prompts / mo</li>
                    <li className="flex gap-2"><Check className="h-4 w-4 text-green-400" /> Basic Financial Dashboard</li>
                    <li className="flex gap-2"><Check className="h-4 w-4 text-green-400" /> Save Venue Leads</li>
                    <li className="flex gap-2"><Check className="h-4 w-4 text-green-400" /> 1 Show History Item</li>
                    <li className="flex gap-2 text-slate-500"><X className="h-4 w-4" /> Tour Playbooks</li>
                    <li className="flex gap-2 text-slate-500"><X className="h-4 w-4" /> Advanced Analytics</li>
                </ul>
                {!user ? (
                     <AuthModal trigger={<Button className="w-full bg-slate-800 hover:bg-slate-700">Create Free Account</Button>} />
                ) : (
                    !isPro ? <Button disabled className="w-full bg-slate-800/50 text-slate-400">Current Plan</Button> : <Button variant="outline" className="w-full">Downgrade to Free</Button>
                )}
            </motion.div>

            {/* Pro Plan */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`bg-gradient-to-b from-slate-900 to-slate-900 border ${isPro ? 'border-orange-500' : 'border-orange-500/50'} rounded-2xl p-8 flex flex-col relative overflow-hidden`}
            >
                <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">MOST POPULAR</div>
                
                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-2 flex items-center gap-2">RoadUno Pro <Crown className="h-5 w-5 text-orange-400" /></h2>
                    <p className="text-slate-400 text-sm">Power tools for serious touring acts.</p>
                    <div className="mt-4 text-3xl font-bold">$9 <span className="text-sm font-normal text-slate-500">/mo</span></div>
                </div>

                <ul className="space-y-3 mb-8 flex-grow text-sm">
                    <li className="flex gap-2"><Check className="h-4 w-4 text-orange-400" /> <span className="font-bold text-white">Unlimited</span> AI Route Prompts</li>
                    <li className="flex gap-2"><Check className="h-4 w-4 text-orange-400" /> Full Financial Analytics</li>
                    <li className="flex gap-2"><Check className="h-4 w-4 text-orange-400" /> <span className="font-bold text-white">Unlimited</span> Show History</li>
                    <li className="flex gap-2"><Check className="h-4 w-4 text-orange-400" /> Tour Playbooks Access</li>
                    <li className="flex gap-2"><Check className="h-4 w-4 text-orange-400" /> Data Export (JSON/CSV)</li>
                    <li className="flex gap-2"><Check className="h-4 w-4 text-orange-400" /> Priority Support</li>
                </ul>

                {isPro ? (
                    <Button onClick={handleManageSubscription} variant="outline" className="w-full border-slate-700 hover:bg-slate-800 text-slate-300">
                        <CreditCard className="mr-2 h-4 w-4" /> Manage Subscription
                    </Button>
                ) : (
                    <Button 
                        onClick={handleUpgrade} 
                        disabled={billingLoading || authLoading} 
                        className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-lg shadow-orange-500/20"
                    >
                        {billingLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Redirecting...</> : 'Upgrade to Pro'}
                    </Button>
                )}
                <p className="text-center text-xs text-slate-500 mt-4">Secure payment via Stripe. Cancel anytime.</p>
            </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PricingPage;