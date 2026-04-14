import React from 'react';
import { MapPin, ExternalLink, BookmarkPlus, Mail, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

const decodeHtmlEntities = (str) => {
  if (!str) return '';
  const textarea = document.createElement('textarea');
  textarea.innerHTML = str;
  return textarea.value;
};

const cleanEmail = (raw) => {
  if (!raw) return '';
  const decoded = decodeHtmlEntities(raw);
  const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/;
  const match = decoded.match(emailRegex);
  return match ? match[0] : '';
};

const VenueCard = ({ venue, index, onSaveLead }) => {
  return (
    <div className="bg-neutral-900/50 rounded-lg border border-neutral-700 hover:border-orange-500/50 overflow-hidden flex flex-col md:flex-row transition-colors duration-200">
      <div className="w-full md:w-48 h-48 md:h-auto relative bg-neutral-800 flex-shrink-0">
        {venue.photoUrl ? (
          <img src={venue.photoUrl} alt={venue.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-neutral-700">
            <span className="text-4xl font-bold opacity-20">{venue.name.charAt(0)}</span>
          </div>
        )}
        <div className="absolute top-2 left-2 bg-orange-500 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lg text-sm">
          {index + 1}
        </div>
      </div>
      
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-white">{venue.name}</h3>
            <Button 
              onClick={() => onSaveLead(venue)} 
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-6 rounded-lg transition h-auto"
            >
              <BookmarkPlus className="h-4 w-4 mr-2" /> Save Lead
            </Button>
          </div>
          
          <div className="flex items-center text-neutral-400 text-sm mt-1 mb-3">
            <MapPin className="h-3.5 w-3.5 mr-1" /> {venue.city} {venue.address && `• ${venue.address}`}
          </div>

          {venue.description && (
            <div className="flex items-start gap-2 mb-3">
              <span className="sr-only">Description</span>
              <Info className="h-4 w-4 text-neutral-500 mt-0.5 flex-shrink-0" />
              <p className="text-neutral-300 text-sm italic">"{venue.description}"</p>
            </div>
          )}

          {venue.email && (
             <div className="flex items-center gap-2 mb-3">
               <span className="sr-only">Email</span>
               <Mail className="h-4 w-4 text-neutral-500 flex-shrink-0" />
               <p className="text-orange-500 text-sm">
                 <span className="text-neutral-500 mr-1">Booking:</span>
                 <a href={`mailto:${cleanEmail(venue.email)}`} className="hover:text-orange-400 hover:underline">
                   {cleanEmail(venue.email)}
                 </a>
               </p>
             </div>
          )}
        </div>
        
        <div className="flex flex-wrap items-center justify-between text-xs text-neutral-500 border-t border-neutral-800 pt-3 gap-2">
          <span className="truncate max-w-[200px]" title={venue.contact_info}>
            {venue.contact_info && !venue.email && `Contact: ${venue.contact_info}`}
          </span>
          
          {venue.website && (
            <a 
              href={venue.website} 
              target="_blank" 
              rel="noreferrer" 
              className="text-orange-400 flex items-center gap-1 hover:text-orange-300"
            >
              Visit Website <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default VenueCard;