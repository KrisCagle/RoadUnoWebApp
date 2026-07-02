import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Mail, Send, User, MessageSquare } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const ContactPage = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: 'Uh oh!',
        description: 'Please fill out all fields before sending.',
        variant: 'destructive',
      });
      return;
    }

    // Simulate sending email and show toast
    toast({
      title: 'Message Sent! (Simulation)',
      description: "We've received your message and will get back to you shortly.",
    });

    // To use a real email service, you would replace the toast with an API call.
    // For now, this provides immediate user feedback.
    
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <Helmet>
        <title>Contact Us - RoadUno</title>
        <meta name="description" content="Get in touch with the RoadUno team. We're here to help with your touring needs and answer any questions." />
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
              Get in Touch
            </h1>
            <p className="text-lg md:text-xl text-slate-400 mt-4 max-w-2xl mx-auto">
              Have a question, feedback, or a partnership idea? We'd love to hear from you.
            </p>
          </div>

          <div className="max-w-2xl mx-auto bg-slate-900/50 border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-slate-950/50">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2 text-slate-300"><User className="h-4 w-4" /> Your Name</Label>
                  <Input 
                    id="name" 
                    type="text"
                    placeholder="Jane Doe" 
                    className="bg-slate-800 border-slate-700 focus:ring-orange-500" 
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2 text-slate-300"><Mail className="h-4 w-4" /> Your Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="jane.d@example.com" 
                    className="bg-slate-800 border-slate-700 focus:ring-orange-500" 
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="flex items-center gap-2 text-slate-300"><MessageSquare className="h-4 w-4" /> Your Message</Label>
                <Textarea 
                  id="message" 
                  placeholder="Tell us what's on your mind..." 
                  className="bg-slate-800 border-slate-700 focus:ring-orange-500 min-h-[150px]"
                  value={formData.message}
                  onChange={handleInputChange}
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-lg py-6 flex items-center gap-2">
                <Send className="h-5 w-5" />
                Send Message
              </Button>
            </form>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;