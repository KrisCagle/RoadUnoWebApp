import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calculator, ArrowRight, Waypoints, Shirt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AdInline from '@/components/AdInline';

const tools = [
  {
    slug: 'break-even-calculator',
    title: 'Show Break Even Calculator',
    description: 'Estimate your potential profit or loss for a single show. Factor in ticket sales, merch, and daily costs to see if the gig is worth it.',
    icon: Calculator,
  },
  {
    slug: 'tour-routing-planner',
    title: 'Tour Routing Planner',
    description: 'Build a tour route that makes sense and saves money. Plan each stop, calculate costs, and track your net earnings per city.',
    icon: Waypoints,
  },
  {
    slug: 'merch-profit-calculator',
    title: 'Merch Profit Calculator',
    description: 'Forecast your merchandise revenue and profit. Enter items, costs, and pricing to avoid dead stock and maximize earnings.',
    icon: Shirt,
  },
];

const ToolsPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Artist Tools - RoadUno</title>
        <meta name="description" content="Free tools for indie musicians, including calculators for show profitability, tour budgeting, and more. Make smarter decisions with RoadUno." />
      </Helmet>

      <div className="min-h-screen bg-slate-950">
        <Navigation />

        <section className="pt-32 pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Artist <span className="gradient-text">Tools</span>
              </h1>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Smart calculators and utilities to help you plan smarter, budget better, and tour with confidence.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {tools.map((tool, index) => (
                <motion.div
                  key={tool.slug}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden hover:border-pink-500/50 transition-all group cursor-pointer"
                  onClick={() => navigate(`/tools/${tool.slug}`)}
                >
                  <div className="aspect-video bg-gradient-to-br from-orange-500/20 to-pink-500/20 flex items-center justify-center">
                    <tool.icon className="h-16 w-16 text-orange-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-3 group-hover:text-pink-400 transition-colors">
                      {tool.title}
                    </h2>
                    <p className="text-slate-400 mb-4">{tool.description}</p>
                    <Button
                      variant="ghost"
                      className="text-orange-400 hover:text-orange-300 p-0"
                    >
                      Open Tool
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Ad Inline for Free Tools Users */}
            <div className="max-w-4xl mx-auto">
                <AdInline />
            </div>

          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default ToolsPage;