import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Music, MapPin, DollarSign, Users, ArrowRight, BookOpen, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';

const HomePage = () => {
  const navigate = useNavigate();
  const features = [{
    icon: MapPin,
    title: 'Smart Routing',
    description: 'Get pitch-ready tour routes with venue leads that actually book your vibe'
  }, {
    icon: DollarSign,
    title: 'Budget Smarter',
    description: 'Cut costs through intelligent clustering and real-world budget watch-outs'
  }, {
    icon: Users,
    title: 'Build Connections',
    description: 'With helpful resources to learn how to find promoters in every market'
  }, {
    icon: BookOpen,
    title: 'Artist Resources',
    description: 'Practical guides on touring, pitching, networking, and DIY promotion'
  }];
  const testimonials = [{
    name: 'Alex Rivera',
    role: 'Indie Rock Artist',
    content: 'RoadUno helped me plan my first regional tour in under an hour. The venue leads were spot-on.',
    rating: 5
  }, {
    name: 'Jordan Chen',
    role: 'DIY Manager',
    content: 'Finally, a tool that understands what touring indie artists actually need.',
    rating: 5
  }, {
    name: 'Sam Martinez',
    role: 'Folk Musician',
    content: 'The budget clustering saved me hundreds on gas. This is a game-changer for small tours.',
    rating: 5
  }];
  
  return (
    <>
      <Helmet>
        <title>RoadUno - Tour Smarter, Waste Less, Play to Fans</title>
        <meta name="description" content="RoadUno is an AI tour assistant for independent musicians. Get smart tour routes, venue leads, booking contacts, and practical touring resources, all designed to help you tour smarter and waste less." />
      </Helmet>

      <div className="min-h-screen bg-slate-950">
        <Navigation />

        <section className="relative overflow-hidden pt-32 pb-28 px-4">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-pink-500/10 to-purple-500/10" />
          
          <div className="max-w-6xl mx-auto relative z-10 ru-soft-glow rounded-3xl py-12 px-6">
            <motion.div initial={{
              opacity: 0,
              y: 30
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.6
            }} className="text-center space-y-10">
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                Tour smarter,<br />
                <span className="gradient-text">waste less</span>,<br />
                play to fans.
              </h1>

              <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto py-4">
                The tour assistant built for indie artists who want to route better tours, find real venue leads, and stop wasting money on the road.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center py-6">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/tour-assistant-v2')} 
                  className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-8 py-6 h-auto rounded-lg shadow-lg hover:shadow-xl transition text-lg transition-all duration-200 hover:brightness-110 hover:-translate-y-[1px] hover:shadow-lg active:translate-y-0 active:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                >
                  Try the Tour Assistant
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate('/resources')} 
                  className="border-2 border-orange-500 text-orange-500 bg-transparent px-8 py-6 h-auto rounded-lg hover:bg-orange-500/10 transition text-lg"
                >
                  Explore Resources
                  <BookOpen className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </motion.div>

            <motion.div initial={{
              opacity: 0,
              y: 50
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.6,
              delay: 0.3
            }} className="mt-24">
              <img className="w-full rounded-2xl shadow-2xl border border-slate-800" alt="Tour routing dashboard showing venue recommendations and route planning" src="https://images.unsplash.com/photo-1529477134574-5289b7ee6635" />
            </motion.div>
          </div>
        </section>

        <div className="ru-divider my-4"></div>

        <section className="py-24 px-4 bg-slate-900/50">
          <div className="max-w-6xl mx-auto">
            <motion.div initial={{
              opacity: 0
            }} whileInView={{
              opacity: 1
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.6
            }} className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Everything you need to <span className="gradient-text">tour smarter</span>
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                Built by touring musicians, for touring musicians. No gatekeepers, just tools that work.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <motion.div key={index} initial={{
                  opacity: 0,
                  y: 30
                }} whileInView={{
                  opacity: 1,
                  y: 0
                }} viewport={{
                  once: true
                }} transition={{
                  duration: 0.5,
                  delay: index * 0.1
                }} className="ru-card p-8 group">
                  <div className="bg-gradient-to-br from-orange-500/20 to-pink-500/20 w-14 h-14 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-7 w-7 text-orange-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-slate-400 text-lg">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div initial={{
              opacity: 0
            }} whileInView={{
              opacity: 1
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.6
            }} className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Trusted by <span className="gradient-text">indie artists</span> everywhere
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div key={index} initial={{
                  opacity: 0,
                  y: 30
                }} whileInView={{
                  opacity: 1,
                  y: 0
                }} viewport={{
                  once: true
                }} transition={{
                  duration: 0.5,
                  delay: index * 0.1
                }} className="ru-card p-8">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="h-5 w-5 fill-orange-400 text-orange-400" />)}
                  </div>
                  <p className="text-slate-300 mb-6 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-slate-400">{testimonial.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{
              opacity: 0
            }} whileInView={{
              opacity: 1
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.6
            }}>
              <h2 className="text-3xl md:text-4xl font-bold mb-8">
                The touring problem RoadUno solves
              </h2>
              <div className="text-lg text-slate-300 space-y-6 leading-relaxed">
                <p>Touring as an independent artist is hard. You're juggling routing logistics, cold emailing promoters that may never respond, navigating cities you've never been to, playing to empty rooms and watching your budget evaporate on poorly planned drives.</p>
                <p>
                  Most booking tools are built for established acts with agents and tour managers. They're expensive, overcomplicated, and assume you already know the venues and promoters in every market. But if you're DIY or just starting to tour regionally, you're stuck piecing together routes from Reddit threads, outdated blogs, and guesswork.
                </p>
                <p>RoadUno changes that. Our Tour Assistant takes your tour dates, genre, and budget, then delivers a pitch ready routing plan with real venue leads, booking contacts, and budget saving advice, all in plain text you can actually use. Fast, readable results that help you book smarter and waste less time and money on the road.</p>
                <p>Plus, our Artist Resources section gives you practical, SEO friendly guides on everything from pitching venues to networking on social media, touring on a budget, and DIY promotion. We're here to help you tour like you've done it before, even if this is your first time out.</p>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{
              opacity: 0,
              y: 30
            }} whileInView={{
              opacity: 1
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.6
            }} className="ru-card p-12 ru-soft-glow">
              <Music className="h-16 w-16 text-orange-400 mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to route your next tour?
              </h2>
              <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                Join indie artists who are touring smarter with RoadUno. Get your first routing plan in minutes.
              </p>
              <Button 
                size="lg" 
                onClick={() => navigate('/tour-assistant-v2')} 
                className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-10 py-6 h-auto rounded-lg shadow-lg hover:shadow-xl transition text-lg"
              >
                Try the Tour Assistant Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </section>
        
        {/* Ad Banner for non-pro users */}
        <div className="max-w-6xl mx-auto px-4 pb-16">
            <AdBanner />
        </div>

        <Footer />
      </div>
    </>
  );
};

export default HomePage;