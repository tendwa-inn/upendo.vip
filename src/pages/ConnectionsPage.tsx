import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabaseClient';
import { User } from '../types';
import { MapPin, Phone, Ghost } from 'lucide-react';
import toast from 'react-hot-toast';

interface Connection {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  bio: string;
  photos: string[];
  whatsapp_number: string;
  whatsapp_message: string;
  is_active: boolean;
  created_at: string;
}

const ConnectionsPage: React.FC = () => {
  const { profile } = useAuthStore();
  const { t } = useTranslation();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      
      // Fetch connections based on user's gender (opposite gender)
      const targetGender = profile?.gender === 'male' ? 'female' : 'male';
      
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .eq('gender', targetGender)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setConnections(data || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (connection: Connection) => {
    // Format WhatsApp message
    const message = connection.whatsapp_message || 
      `Hi ${connection.name}, I found you on Upendo and would like to connect with you!`;
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${connection.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
  };

  const acct = (useAuthStore.getState().profile as any)?.accountType || (useAuthStore.getState().profile as any)?.subscription;
  const isVip = acct === 'vip';
  const isPro = acct === 'pro';
  if (loading) {
    return (
      <div className={`fixed inset-0 overflow-hidden text-white ${isVip ? 'bg-gradient-to-b from-black to-[#0b0b0b]' : isPro ? 'bg-gradient-to-b from-[#071521] to-[#0b2237]' : 'bg-gradient-to-b from-[#22090E] to-[#2E0C13]'} flex flex-col items-center justify-center`}>
        {isVip ? (
          <>
            <Ghost className="w-14 h-14 text-amber-300 animate-spin mb-4 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]" />
            <p className="text-white/70 text-sm">{t('loadingConnections')}</p>
          </>
        ) : isPro ? (
          <>
            <Ghost className="w-14 h-14 text-sky-300 animate-spin mb-4 drop-shadow-[0_0_12px_rgba(125,211,252,0.9)]" />
            <p className="text-white/70 text-sm">{t('loadingConnections')}</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mb-4"></div>
            <p className="text-white/70 text-sm">{t('loadingConnections')}</p>
          </>
        )}
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className={`p-4 ${isVip ? 'bg-gradient-to-b from-black to-[#0b0b0b]' : isPro ? 'bg-gradient-to-b from-[#071521] to-[#0b2237]' : 'bg-gradient-to-b from-[#22090E] to-[#2E0C13]'} min-h-screen text-white`}>
        <h1 className="text-3xl font-bold mb-6 text-center">{t('connections')}</h1>
        <div className="text-center text-gray-400 mt-8">
          <p>{t('noConnections')}</p>
          <p className="text-sm mt-2">{t('checkBackLater')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 ${isVip ? 'bg-gradient-to-b from-black to-[#0b0b0b]' : isPro ? 'bg-gradient-to-b from-[#071521] to-[#0b2237]' : 'bg-gradient-to-b from-[#22090E] to-[#2E0C13]'} min-h-screen text-white`}>
      <h1 className="text-3xl font-bold mb-6 text-center">{t('connections')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {connections.map((connection) => (
          <div key={connection.id} className="bg-white/10 backdrop-blur-lg rounded-2xl p-4">
            {/* Profile Photos Gallery */}
            <div className="mb-4">
              {connection.photos && connection.photos.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {connection.photos.slice(0, 4).map((photo, index) => (
                    <div key={index} className={`aspect-square rounded-lg overflow-hidden ${
                      connection.photos.length === 1 ? 'col-span-2' : 
                      connection.photos.length === 3 && index === 0 ? 'col-span-2' : ''
                    }`}>
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
            
            {/* Name and Age */}
            <h3 className="text-xl font-semibold mb-2">{connection.name}, {connection.age}</h3>
            
            {/* Location */}
            <div className="flex items-center gap-1 text-white/70 mb-3">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{connection.location.name}</span>
            </div>
            
            {/* Bio */}
            <p className="text-white/80 text-sm mb-4 line-clamp-3">{connection.bio}</p>
            
            {/* Connect Button */}
            <button
              onClick={() => handleConnect(connection)}
              className={`w-full py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
                isVip ? 'bg-amber-400 text-black hover:bg-amber-500' : ((useAuthStore.getState().profile as any)?.accountType === 'pro' ? 'bg-sky-500 text-black hover:bg-sky-400' : 'bg-pink-500 hover:bg-pink-600 text-white')
              }`}
            >
              <Phone className="w-5 h-5" />
              {t('connect')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConnectionsPage;
