import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Shield, MapPin, Share2, AlertTriangle, Info } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const TouringSafetyTipsPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <Helmet>
        <title>Touring Safety Tips - RoadUno</title>
        <meta name="description" content="Essential safety tips for indie artists on the road. Learn how to verify venues, travel safely, and protect your gear and team." />
      </Helmet>
      
      <Navigation />

      <main className="pt-32 pb-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Touring <span className="text-orange-500">Safety Tips</span></h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              The road can be unpredictable. Here is how to keep your band, your gear, and yourself safe while touring.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl">
                <div className="p-3 bg-orange-500/20 rounded-lg w-fit mb-4">
                    <MapPin className="h-6 w-6 text-orange-400" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Verifying Venues</h2>
                <ul className="space-y-3 text-slate-300">
                    <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span> Check recent reviews on Google Maps and social media to verify the venue is active and safe.</li>
                    <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span> Look for photos of the stage and load-in area so you aren't surprised by unsafe conditions.</li>
                    <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span> Always have a contact name and phone number before you arrive.</li>
                </ul>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl">
                <div className="p-3 bg-blue-500/20 rounded-lg w-fit mb-4">
                    <Shield className="h-6 w-6 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Safe Travel Practices</h2>
                <ul className="space-y-3 text-slate-300">
                    <li className="flex gap-2"><span className="text-blue-500 font-bold">•</span> Share your itinerary with a trusted person back home.</li>
                    <li className="flex gap-2"><span className="text-blue-500 font-bold">•</span> Avoid driving exhausted. Swap drivers every 2-3 hours.</li>
                    <li className="flex gap-2"><span className="text-blue-500 font-bold">•</span> Park your van in well-lit areas, preferably backed against a wall to prevent door opening.</li>
                </ul>
            </div>

             <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl">
                <div className="p-3 bg-purple-500/20 rounded-lg w-fit mb-4">
                    <Share2 className="h-6 w-6 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Sharing Info Safely</h2>
                <ul className="space-y-3 text-slate-300">
                    <li className="flex gap-2"><span className="text-purple-500 font-bold">•</span> Don't post "we are leaving now" with your exact location in real-time.</li>
                    <li className="flex gap-2"><span className="text-purple-500 font-bold">•</span> Be careful sharing specific hotel names on public social media.</li>
                    <li className="flex gap-2"><span className="text-purple-500 font-bold">•</span> Use RoadUno to plan privately, and only share final public dates with fans.</li>
                </ul>
            </div>

             <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl">
                <div className="p-3 bg-yellow-500/20 rounded-lg w-fit mb-4">
                    <AlertTriangle className="h-6 w-6 text-yellow-400" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Gear Security</h2>
                <ul className="space-y-3 text-slate-300">
                    <li className="flex gap-2"><span className="text-yellow-500 font-bold">•</span> Never leave gear visible in the van overnight if possible.</li>
                    <li className="flex gap-2"><span className="text-yellow-500 font-bold">•</span> Use AirTags or Tile trackers hidden in cases and the van itself.</li>
                    <li className="flex gap-2"><span className="text-yellow-500 font-bold">•</span> Insure your equipment. Renter's insurance often doesn't cover business/tour use.</li>
                </ul>
            </div>

          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex gap-4 items-start">
            <Info className="h-6 w-6 text-slate-400 flex-shrink-0 mt-1" />
            <div>
                <h3 className="font-bold text-white mb-1">Disclaimer</h3>
                <p className="text-slate-400 text-sm">
                    RoadUno is a planning tool designed to help you organize your tour. While we provide resources and route suggestions, 
                    we cannot guarantee the safety of any specific venue, city, or route. Always use your best judgment, trust your instincts, 
                    and prioritize your safety over a gig.
                </p>
            </div>
          </div>

        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default TouringSafetyTipsPage;