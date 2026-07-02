import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const BillingCancelledPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col">
      <Helmet><title>Payment Cancelled - RoadUno</title></Helmet>
      <Navigation />

      <main className="flex-grow flex items-center justify-center px-4 pt-20">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-xl">
            <div className="py-8">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="h-10 w-10 text-slate-400" />
                </div>
                <h1 className="text-2xl font-bold mb-4">Payment Cancelled</h1>
                <p className="text-slate-400 mb-8">
                    The checkout process was cancelled. No charges were made to your card. You can try upgrading again whenever you're ready.
                </p>
                <div className="space-y-3">
                        <Button onClick={() => navigate('/pricing')} className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Return to Pricing
                    </Button>
                </div>
            </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BillingCancelledPage;