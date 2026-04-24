import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabaseClient';
import { User } from '../types';
import { MapPin, Phone, Ghost } from 'lucide-react';
import toast from 'react-hot-toast';
import ConnectionCard from '../components/ConnectionCard';
import PhotoViewerModal from '../components/modals/PhotoViewerModal';

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

import { getTheme } from '../styles/theme';

const ConnectionsPage: React.FC = () => {
  const { profile } = useAuthStore();
  const { t } = useTranslation();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerPhotos, setViewerPhotos] = useState<string[]>([]);
  const [viewerStartIndex, setViewerStartIndex] = useState(0);

  const accountType = (profile as any)?.account_type || (profile as any)?.subscription || 'free';
  const theme = getTheme(accountType);

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

  const getButtonStyles = (accountType?: string) => {
    const acct = accountType || (useAuthStore.getState().profile as any)?.account_type || (useAuthStore.getState().profile as any)?.subscription;
    if (acct === 'vip') return 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-400/20 hover:from-amber-600 hover:to-orange-600';
    if (acct === 'pro') return 'bg-gradient-to-r from-sky-500 to-cyan-500 text-black shadow-lg shadow-sky-400/20 hover:from-sky-600 hover:to-cyan-600';
    return 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-400/20 hover:from-pink-600 hover:to-rose-600';
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

  const handleImageClick = (photos: string[], startIndex: number) => {
    setViewerPhotos(photos);
    setViewerStartIndex(startIndex);
    setIsViewerOpen(true);
  };

  const acct = (useAuthStore.getState().profile as any)?.account_type || (useAuthStore.getState().profile as any)?.subscription;
  const isVip = acct === 'vip';
  const isPro = acct === 'pro';
  if (loading) {
    return (
      <div className={`fixed inset-0 overflow-hidden text-white ${isVip ? 'bg-gradient-to-b from-black to-[#0b0b0b]' : isPro ? 'bg-gradient-to-b from-[#071521] to-[#0b2237]' : 'bg-gradient-to-b from-[#22090E] to-[#2E0C13]'} flex flex-col items-center justify-center min-h-[100dvh]`}>
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
            <Ghost className="w-14 h-14 text-pink-500 animate-spin mb-4 drop-shadow-[0_0_12px_rgba(236,72,153,0.9)]" />
            <p className="text-white/70 text-sm">{t('loadingConnections')}</p>
          </>
        )}
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className="p-4 text-white">
        <div className={cn("sticky top-0 z-20 py-4", theme.stickyHeader)}>
          <h1 className="text-3xl font-bold text-center">{t('connections')}</h1>
        </div>
        <div className="text-center text-gray-400 mt-8">
          <p>{t('noConnections')}</p>
          <p className="text-sm mt-2">{t('checkBackLater')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 text-white">
      <div className={cn("sticky top-0 z-20 py-4", theme.stickyHeader)}>
        <h1 className="text-3xl font-bold text-center">{t('connections')}</h1>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {connections.map((connection) => (
          <ConnectionCard 
            key={connection.id} 
            connection={connection} 
            onImageClick={handleImageClick} 
            onConnect={() => handleConnect(connection)}
          />
        ))}
      </div>

      {isViewerOpen && (
        <PhotoViewerModal
          photos={viewerPhotos}
          startIndex={viewerStartIndex}
          onClose={() => setIsViewerOpen(false)}
          isReadOnly={true}
        />
      )}
    </div>
  );
};

export default ConnectionsPage;
