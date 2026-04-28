
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const ConnectionCard = ({ connection, onImageClick, onConnect }) => {
  const { t } = useTranslation();
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [isBioTruncated, setIsBioTruncated] = useState(false);
  const bioRef = useRef<HTMLParagraphElement>(null);
  const { profile, isPro, isVip } = useAuthStore();


  useEffect(() => {
    if (bioRef.current) {
      // Check if the text is visually truncated (scrollHeight > clientHeight)
      setIsBioTruncated(bioRef.current.scrollHeight > bioRef.current.clientHeight);
    }
  }, [connection.bio]);

  const handleConnect = () => {
    const message = connection.whatsapp_message || `Hi ${connection.name}, I found you on Upendo and would like to connect with you!`;
    const whatsappUrl = `https://wa.me/${connection.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 flex flex-col">
      <div className="mb-4">
        {connection.photos && connection.photos.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {connection.photos.slice(0, 4).map((photo, index) => (
              <div 
                key={index} 
                className={`aspect-square rounded-lg overflow-hidden cursor-pointer ${
                  connection.photos.length === 1 ? 'col-span-2' : 
                  connection.photos.length === 3 && index === 0 ? 'col-span-2' : ''
                }`}
                onClick={() => onImageClick(connection.photos, index)}
              >
                <img 
                  src={photo} 
                  alt={`${connection.name} - Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {connection.photos.length > 4 && (
              <div className="aspect-square rounded-lg overflow-hidden bg-black/50 flex items-center justify-center">
                <span className="text-white text-sm">+{connection.photos.length - 4}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-square rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
            <span className="text-white text-4xl font-bold">{connection.name.charAt(0)}</span>
          </div>
        )}
      </div>
      
      <div className="flex-grow">
        <h3 className="text-xl font-semibold mb-2">{connection.name}, {connection.age}</h3>
        
        <div className="flex items-center gap-1 text-white/70 mb-3">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{connection.location.name}</span>
        </div>
        
        <div className="text-white/80 text-sm mb-4">
          <p ref={bioRef} className={!isBioExpanded ? 'line-clamp-3' : ''}>
            {connection.bio}
          </p>
          {isBioTruncated && (
            <button 
              onClick={() => setIsBioExpanded(!isBioExpanded)} 
              className="text-pink-400 hover:underline text-sm mt-1"
            >
              {isBioExpanded ? t('seeLess') : t('seeMore')}
            </button>
          )}
        </div>
      </div>
      
      <button
        onClick={onConnect}
        className={`w-full mt-auto py-2 rounded-full font-bold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 ${
          isVip 
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-400/20 hover:from-amber-600 hover:to-orange-600'
            : isPro
              ? 'bg-gradient-to-r from-[#ff7f50] to-[#ff5e57] text-white shadow-lg shadow-orange-500/20 hover:from-[#ff8c66] hover:to-[#ff6a62]'
              : 'bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow-lg shadow-pink-500/20 hover:from-pink-700 hover:to-pink-600'
        }`}
      >
        <Phone className="w-5 h-5" />
        {t('connect')}
      </button>
    </div>
  );
};

export default ConnectionCard;
