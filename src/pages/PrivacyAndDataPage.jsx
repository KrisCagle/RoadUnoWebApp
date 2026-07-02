import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Shield, Lock, FileText, Download, Trash2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const PrivacyAndDataPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <Helmet>
        <title>Privacy & Data - RoadUno</title>
        <meta name="description" content="Understand how RoadUno protects your data, your rights to privacy, and how to manage your information." />
      </Helmet>
      
      <Navigation />

      <main className="pt-32 pb-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-500 pb-2">
              Privacy & Data Protection
            </h1>
            <p className="text-xl text-slate-400 mt-4 max-w-2xl mx-auto">
              Transparency is our core value. Here is how we handle, store, and protect your tour data.
            </p>
          </div>

          <div className="space-y-12">
            
            {/* Data Storage Section */}
            <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Lock className="h-6 w-6 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold">How We Store Your Data</h2>
              </div>
              <div className="prose prose-invert max-w-none text-slate-300">
                <p>
                  RoadUno uses industry-standard encryption and secure cloud infrastructure to store your data. 
                  All sensitive information, including your tour routes, financial data, and personal details, 
                  is protected by strict access controls.
                </p>
                <ul className="list-disc pl-5 space-y-2 mt-4">
                  <li><strong>Encryption:</strong> Data is encrypted in transit using TLS 1.2+ and at rest using AES-256.</li>
                  <li><strong>Isolation:</strong> Your data is logically isolated. Our Row Level Security (RLS) policies ensure that only your authenticated account can access your records.</li>
                  <li><strong>Database:</strong> We utilize Supabase, a secure, open-source Firebase alternative built on PostgreSQL, known for its robustness and reliability.</li>
                </ul>
              </div>
            </section>

             {/* Data Protection Section */}
             <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-green-500/20 rounded-lg">
                    <Shield className="h-6 w-6 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold">Data Protection & Usage</h2>
              </div>
              <div className="prose prose-invert max-w-none text-slate-300">
                <p>
                  We believe your data belongs to you. We do not sell your personal data to third-party advertisers.
                </p>
                <ul className="list-disc pl-5 space-y-2 mt-4">
                  <li><strong>No Selling:</strong> We do not sell your contact lists, route plans, or financial logs.</li>
                  <li><strong>Limited Access:</strong> RoadUno staff only access your data for troubleshooting purposes with your explicit permission or if required by law.</li>
                  <li><strong>Analytics:</strong> We collect anonymized usage statistics to improve our tools, but this data cannot be traced back to your individual account.</li>
                </ul>
              </div>
            </section>

             {/* Data Options Section */}
             <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                    <FileText className="h-6 w-6 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold">Your Data Options</h2>
              </div>
              <div className="prose prose-invert max-w-none text-slate-300">
                <p>
                  You have full control over your account. You can export your data or delete your account at any time directly from your dashboard.
                </p>
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-2 mb-3">
                            <Download className="h-5 w-5 text-blue-400" />
                            <h3 className="font-bold text-lg">Export Data</h3>
                        </div>
                        <p className="text-sm text-slate-400 mb-4">Download a full JSON copy of your profile, routes, leads, and show history.</p>
                        <p className="text-xs text-slate-500">Available in Account Security settings.</p>
                    </div>
                    <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-2 mb-3">
                            <Trash2 className="h-5 w-5 text-red-400" />
                            <h3 className="font-bold text-lg">Delete Account</h3>
                        </div>
                        <p className="text-sm text-slate-400 mb-4">Permanently remove your account and all associated data from our servers.</p>
                        <p className="text-xs text-slate-500">Available in Account Security settings.</p>
                    </div>
                </div>
              </div>
            </section>

          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyAndDataPage;