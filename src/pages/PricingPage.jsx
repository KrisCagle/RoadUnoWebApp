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
    <div className="min-h-screen bg-asphalt text-paper font-sans">
      <Helmet>
        <title>Pricing - RoadUno</title>
        <meta name="description" content="Choose the right plan for your touring needs. Start free or upgrade to Pro for unlimited features." />
      </Helmet>

      <Navigation />

      <main className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Tour Smarter, <span className="text-marquee">Not Harder</span>
          </h1>
          <p className="text-xl text-paper-muted max-w-2xl mx-auto">
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
            className="bg-asphalt-raised border border-steel rounded-2xl p-8 flex flex-col"
          >
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-2">Anonymous Trial</h2>
              <p className="text-paper-muted text-sm">Try before you sign up.</p>
              <div className="mt-4 text-3xl font-bold">Free</div>
            </div>
            <ul className="space-y-3 mb-8 flex-grow text-sm">
              <li className="flex gap-2"><Check className="h-4 w-4 text-paper-muted" /> 3 AI Route Prompts</li>
              <li className="flex gap-2 text-paper-muted"><X className="h-4 w-4" /> Save Routes</li>
              <li className="flex gap-2 text-paper-muted"><X className="h-4 w-4" /> Financial Dashboard</li>
              <li className="flex gap-2 text-paper-muted"><X className="h-4 w-4" /> Venue Leads</li>
            </ul>
            {!user ? (
              <AuthModal trigger={<Button variant="outline" className="w-full border-steel hover:bg-steel text-paper-muted">Get Started Free</Button>} />
            ) : (
              <Button disabled variant="secondary" className="w-full">Already Registered</Button>
            )}
          </motion.div>

          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`bg-asphalt-raised border ${!isPro && user ? 'border-routeline/50' : 'border-steel'} rounded-2xl p-8 flex flex-col relative`}
          >
            {!isPro && user && <div className="absolute top-0 right-0 bg-routeline/20 text-routeline text-xs font-bold px-3 py-1 rounded-bl-xl border-l border-b border-routeline/20">CURRENT PLAN</div>}

            <div className="mb-8">
              <h2 className="text-xl font-bold mb-2">Free Account</h2>
              <p className="text-paper-muted text-sm">Essential tools for weekend warriors.</p>
              <div className="mt-4 text-3xl font-bold">$0 <span className="text-sm font-normal text-paper-muted">/mo</span></div>
            </div>
            <ul className="space-y-3 mb-8 flex-grow text-sm">
              <li className="flex gap-2"><Check className="h-4 w-4 text-routeline" /> 10 AI Route Prompts / mo</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-routeline" /> Basic Financial Dashboard</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-routeline" /> Save Venue Leads</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-routeline" /> 1 Show History Item</li>
              <li className="flex gap-2 text-paper-muted"><X className="h-4 w-4" /> Tour Playbooks</li>
              <li className="flex gap-2 text-paper-muted"><X className="h-4 w-4" /> Advanced Analytics</li>
            </ul>
            {!user ? (
              <AuthModal trigger={<Button className="w-full bg-steel hover:bg-steel-light">Create Free Account</Button>} />
            ) : (
              !isPro ? <Button disabled className="w-full bg-steel/50 text-paper-muted">Current Plan</Button> : <Button variant="outline" className="w-full">Downgrade to Free</Button>
            )}
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`bg-asphalt-raised border ${isPro ? 'border-marquee' : 'border-marquee/50'} rounded-2xl p-8 flex flex-col relative overflow-hidden`}
          >
            <div className="absolute top-0 right-0 bg-marquee text-asphalt text-xs font-bold px-3 py-1 rounded-bl-xl">MOST POPULAR</div>

            <div className="mb-8">
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">RoadUno Pro <Crown className="h-5 w-5 text-marquee" /></h2>
              <p className="text-paper-muted text-sm">Power tools for serious touring acts.</p>
              <div className="mt-4 text-3xl font-bold">$9 <span className="text-sm font-normal text-paper-muted">/mo</span></div>
            </div>

            <ul className="space-y-3 mb-8 flex-grow text-sm">
              <li className="flex gap-2"><Check className="h-4 w-4 text-marquee" /> <span className="font-bold text-paper">Unlimited</span> AI Route Prompts</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-marquee" /> Full Financial Analytics</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-marquee" /> <span className="font-bold text-paper">Unlimited</span> Show History</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-marquee" /> Tour Playbooks Access</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-marquee" /> Data Export (JSON/CSV)</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-marquee" /> Priority Support</li>
            </ul>

            {isPro ? (
              <Button onClick={handleManageSubscription} variant="outline" className="w-full border-steel hover:bg-steel text-paper-muted">
                <CreditCard className="mr-2 h-4 w-4" /> Manage Subscription
              </Button>
            ) : (
              <Button
                onClick={handleUpgrade}
                disabled={billingLoading || authLoading}
                className="w-full bg-gradient-to-r from-marquee to-routeline hover:brightness-110 text-asphalt font-semibold shadow-lg shadow-marquee/20"
              >
                {billingLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Redirecting...</> : 'Upgrade to Pro'}
              </Button>
            )}
            <p className="text-center text-xs text-paper-muted mt-4">Secure payment via Stripe. Cancel anytime.</p>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PricingPage;