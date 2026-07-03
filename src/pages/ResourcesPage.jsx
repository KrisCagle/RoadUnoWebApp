import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { resources } from '@/data/resources';

const ResourcesPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Artist Resources - RoadUno</title>
        <meta name="description" content="Practical guides for indie musicians on touring on a budget, pitching venues, networking, DIY promotion, and more. Free resources to help you tour smarter." />
      </Helmet>

      <div className="min-h-screen text-paper">
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
                Artist <span className="gradient-text">Resources</span>
              </h1>
              <p className="text-xl text-paper-muted max-w-3xl mx-auto">
                Practical, no-BS guides on touring, booking, promotion, and everything in between. Built by musicians who've been there.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {resources.map((resource, index) => (
                <motion.div
                  key={resource.slug}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-asphalt-raised/50 backdrop-blur-sm border border-steel rounded-xl overflow-hidden hover:border-marquee/50 transition-all group cursor-pointer"
                  onClick={() => navigate(`/resources/${resource.slug}`)}
                >
                  <div className="aspect-video bg-gradient-to-br from-marquee/20 to-routeline/20 flex items-center justify-center">
                    <resource.icon className="h-16 w-16 text-marquee group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-3 group-hover:text-marquee transition-colors">
                      {resource.title}
                    </h2>
                    <p className="text-paper-muted mb-4">{resource.description}</p>
                    <Button
                      variant="ghost"
                      className="text-marquee hover:text-marquee-hover p-0"
                    >
                      Read Guide
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default ResourcesPage;