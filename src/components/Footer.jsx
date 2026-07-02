import React from 'react';
import { Facebook, Instagram } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const Footer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleEmailSignup = () => {
    toast({
      title: '🚧 Email Signup Coming Soon!',
      description: 'We\'re building an awesome newsletter. Stay tuned!'
    });
  };

  return (
    <footer className="bg-asphalt-raised border-t border-steel py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="https://horizons-cdn.hostinger.com/e8d3bde6-aa39-4953-99f8-9b210820c7eb/5dcace8ae19bc988b699c36707bf550a.png" alt="RoadUno Logo" className="h-7" />
            </div>
            <p className="text-paper-muted text-sm">One road to connect us all.</p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-paper">Product</h3>
            <ul className="space-y-2 text-sm text-paper-muted">
              <li><button onClick={() => navigate('/tour-assistant')} className="hover:text-paper transition-colors">Tour Assistant</button></li>
              <li><button onClick={() => navigate('/resources')} className="hover:text-paper transition-colors">Resources</button></li>
              <li><button onClick={() => navigate('/pricing')} className="hover:text-paper transition-colors">Pricing</button></li>
              <li><button onClick={() => navigate('/contact')} className="hover:text-paper transition-colors">Contact Us</button></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-paper">Resources</h3>
            <ul className="space-y-2 text-sm text-paper-muted">
              <li><button onClick={() => navigate('/resources/touring-on-budget')} className="hover:text-paper transition-colors">Touring on a Budget</button></li>
              <li><button onClick={() => navigate('/touring-safety-tips')} className="hover:text-paper transition-colors">Touring Safety Tips</button></li>
              <li><button onClick={() => navigate('/resources/pitching-venues')} className="hover:text-paper transition-colors">Pitching Venues</button></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-paper">Legal & Data</h3>
            <ul className="space-y-2 text-sm text-paper-muted">
              <li><button onClick={() => navigate('/privacy-policy')} className="hover:text-paper transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => navigate('/privacy-and-data')} className="hover:text-paper transition-colors">Privacy & Data Protection</button></li>
              <li><button onClick={() => navigate('/terms-of-use')} className="hover:text-paper transition-colors">Terms of Use</button></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-steel text-center text-sm text-paper-muted">
          <p>© 2026 RoadUno. Built for indie artists, by touring musicians.</p>
          <div className="flex justify-center space-x-4 mt-4">
            <a href="https://www.facebook.com/RoadUno1" target="_blank" rel="noopener noreferrer" aria-label="RoadUno on Facebook" className="text-paper-muted hover:text-paper transition-colors">
              <Facebook size={24} />
            </a>
            <a href="https://www.instagram.com/roaduno1/" target="_blank" rel="noopener noreferrer" aria-label="RoadUno on Instagram" className="text-paper-muted hover:text-paper transition-colors">
              <Instagram size={24} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;