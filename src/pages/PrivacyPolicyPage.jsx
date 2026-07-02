import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <Helmet>
        <title>Privacy Policy - RoadUno</title>
        <meta name="description" content="Read the Privacy Policy for RoadUno to understand how we collect, use, and protect your data." />
      </Helmet>
      
      <Navigation />

      <main className="pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto px-4"
        >
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500 pb-2">
              Privacy Policy
            </h1>
            <p className="text-slate-400 mt-2">Last updated: August 14, 2025</p>
          </div>

          <div className="prose prose-invert prose-lg max-w-none text-slate-300 space-y-6">
            <p>
              This Privacy Policy describes how RoadUNO (“we,” “us,” or “our”) collects, uses, and discloses your information when you use our website, roaduno.com (the “Service”). Your privacy is important to us, and we are committed to protecting it.
            </p>

            <h2 className="text-2xl font-bold text-white border-b border-slate-700 pb-2">Information We Collect</h2>
            <p>We collect information in the following ways:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Information You Provide to Us:</strong> We collect personal information you provide when you register for an account (such as your name and email address), submit a message through our contact form, or otherwise communicate with us.
              </li>
              <li>
                <strong>Usage Data:</strong> Like most websites, we automatically collect information when you access the Service, such as your IP address, browser type, operating system, pages viewed, and the dates/times of your visits.
              </li>
              <li>
                <strong>Cookies:</strong> We use cookies to operate and improve our Service. Cookies are small files stored on your device. You can instruct your browser to refuse all cookies, but some parts of our Service may not function properly.
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-white border-b border-slate-700 pb-2">How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, operate, and maintain our Service.</li>
              <li>Create and manage your user account.</li>
              <li>Respond to your comments, questions, and requests.</li>
              <li>Monitor and analyze usage and trends to improve the Service.</li>
              <li>Display relevant third-party advertisements.</li>
            </ul>
            
            <h2 className="text-2xl font-bold text-white border-b border-slate-700 pb-2">Advertising, Cookies, and Third-Party Partners</h2>
            <p>
              We may use third-party advertising companies, such as Google AdSense, to serve ads when you visit our website. These companies may use information (not including your name, address, email address, or telephone number) about your visits to this and other websites in order to provide advertisements about goods and services of interest to you.
            </p>
            <p>
              Specifically, Google, as a third-party vendor, uses cookies to serve ads on RoadUNO. Google’s use of the DART cookie enables it to serve ads to our users based on their visit to our site and other sites on the Internet. Users may opt out of the use of the DART cookie by visiting the Google ad and content network privacy policy. We encourage you to review their policies for more information.
            </p>

            <h2 className="text-2xl font-bold text-white border-b border-slate-700 pb-2">Data Security</h2>
            <p>
              We take reasonable measures to help protect your personal information from loss, theft, misuse, and unauthorized access. However, no electronic transmission or storage is 100% secure.
            </p>

            <h2 className="text-2xl font-bold text-white border-b border-slate-700 pb-2">Your Data Rights</h2>
            <p>
              If you have an account on this site, you can request to receive an exported file of the personal data we hold about you. You can also request that we erase any personal data we hold about you. This does not include any data we are obliged to keep for administrative, legal, or security purposes.
            </p>
            
            <h2 className="text-2xl font-bold text-white border-b border-slate-700 pb-2">Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
            </p>
            
            <h2 className="text-2xl font-bold text-white border-b border-slate-700 pb-2">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, you can contact us at: kriscagle@roaduno.com
            </p>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;