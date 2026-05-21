import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabaseClient';
import { User } from '../types';
import { Menu, Ghost, X } from 'lucide-react';
import toast from 'react-hot-toast';
import ConnectionCard from '../components/ConnectionCard';
import PhotoViewerModal from '../components/modals/PhotoViewerModal';
import ConnectionApplicationModal from '../components/modals/ConnectionApplicationModal';
import { connectionApplicationService } from '../services/connectionApplicationService';
import { useNavigate } from 'react-router-dom';
import { useAppSettingsStore } from '../stores/appSettingsStore';

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
  is_user_applied?: boolean;
  applicant_user_id?: string;
  created_at: string;
}

import { getTheme } from '../styles/theme';
import { useCurrentTheme } from '../stores/colorThemeStore';

const ConnectionsPage: React.FC = () => {
  const { profile, user } = useAuthStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerPhotos, setViewerPhotos] = useState<string[]>([]);
  const [viewerStartIndex, setViewerStartIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const accountType = (profile as any)?.account_type || (profile as any)?.subscription || 'free';
  const theme = useCurrentTheme(accountType);

  useEffect(() => {
    fetchConnections();
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

      // Fetch connection requests the current user has already sent (any status: pending/accepted/denied)
      const { data: sentRequests } = await supabase
        .from('connection_requests')
        .select('connection_id, status')
        .eq('requester_id', user?.id);

      const sentConnectionIds = new Set((sentRequests || []).map(r => r.connection_id));

      // Also fetch matches where current user matched with a connection applicant
      // so connections that became matches also vanish
      const { data: userMatches } = await supabase
        .from('matches')
        .select('user1_id, user2_id')
        .or(`user1_id.eq.${user?.id},user2_id.eq.${user?.id}`);

      const matchedUserIds = new Set<string>();
      (userMatches || []).forEach(m => {
        matchedUserIds.add(m.user1_id);
        matchedUserIds.add(m.user2_id);
      });

      // Filter out expired user-applied connections, already-requested connections,
      // and connections whose applicant already matched with current user
      const now = new Date();
      const filtered = (data || []).filter(conn => {
        // Remove connections user already sent a request to (any status)
        if (sentConnectionIds.has(conn.id)) return false;
        // Remove user-applied connections where applicant already matched with current user
        if (conn.is_user_applied && conn.applicant_user_id && matchedUserIds.has(conn.applicant_user_id)) return false;
        // Remove expired user-applied connections
        if (conn.is_user_applied && conn.expires_at) {
          return new Date(conn.expires_at) > now;
        }
        return true;
      });

      // Shuffle so users don't always appear in the same order
      for (let i = filtered.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
      }

      setConnections(filtered);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast.error(t('toast.connectionsLoadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (connection: Connection) => {
    if (!user) return;

    // User-applied connections: send a connection request instead of WhatsApp
    if (connection.is_user_applied && connection.applicant_user_id) {
      // Check connection limit from app settings
      const tier = (profile as any)?.account_type || (profile as any)?.subscription || 'free';
      const tierSettings = useAppSettingsStore.getState().getSettingForTier(tier);
      const connectionLimit = tierSettings?.connection_limit ?? 3;

      if (connectionLimit !== -1) {
        // Count how many connections the user has already applied to
        const { count } = await supabase
          .from('connection_requests')
          .select('*', { count: 'exact', head: true })
          .eq('requester_id', user.id)
          .eq('status', 'pending');

        if ((count || 0) >= connectionLimit) {
          toast.error(`You've reached your connection limit (${connectionLimit}). Upgrade for more!`);
          return;
        }
      }

      try {
        await connectionApplicationService.sendConnectionRequest(
          connection.id,
          user.id,
          connection.applicant_user_id
        );
        toast.success(t('toast.connectionRequestSent'));
        // Remove from list after successful connection
        setConnections(prev => prev.filter(c => c.id !== connection.id));
      } catch (error: any) {
        if (error.message?.includes('already')) {
          toast('You have already sent a request to this user.');
        } else if (error.message?.includes('maximum')) {
          toast.error(t('toast.maxSuitors'));
        } else {
          console.error('Error sending connection request:', error);
          toast.error(t('toast.connectionRequestFailed'));
        }
      }
      return;
    }

    // Admin-added connections: open WhatsApp
    const message = connection.whatsapp_message ||
      `Hi ${connection.name}, I found you on Upendo and would like to connect with you!`;

    const whatsappUrl = `https://wa.me/${connection.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
  };

  const handleImageClick = (photos: string[], startIndex: number) => {
    setViewerPhotos(photos);
    setViewerStartIndex(startIndex);
    setIsViewerOpen(true);
  };

  const dropdownBg = theme.stickyHeader;
  const dropdownBorder = theme.accent.border;
  const dropdownHover = theme.button.secondary;
  const dropdownAccent = theme.primary;

  if (loading) {
    return (
      <div className={`fixed inset-0 overflow-hidden text-white ${theme.background} flex flex-col items-center justify-center min-h-[100dvh]`}>
        <div className={`animate-spin mb-4 ${theme.accent.loading}`}>
          <Ghost className="w-14 h-14" />
        </div>
        <p className="text-white/70 text-sm">{t('loadingConnections')}</p>
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className="p-4 text-white">
        <div className={cn("sticky top-0 z-20 py-4 flex items-center justify-between", theme.stickyHeader)}>
          <div className="w-10" />
          <h1 className="text-3xl font-bold text-center">{t('connections')}</h1>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
              <Menu className="w-6 h-6 text-white" />
            </button>
            {isMenuOpen && (
              <div className={`absolute right-0 top-12 ${dropdownBg} backdrop-blur-lg border ${dropdownBorder} rounded-lg shadow-xl min-w-[200px] z-50`}>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsApplicationModalOpen(true);
                  }}
                  className={`w-full text-left px-4 py-3 ${dropdownAccent} ${dropdownHover} transition-colors rounded-lg font-medium`}
                >
                  {t('connections.applyForConnection')}
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsAboutModalOpen(true);
                  }}
                  className={`w-full text-left px-4 py-3 ${dropdownAccent} ${dropdownHover} transition-colors rounded-lg font-medium`}
                >
                  {t('connections.aboutConnections')}
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="text-center text-gray-400 mt-8">
          <p>{t('noConnections')}</p>
          <p className="text-sm mt-2">{t('checkBackLater')}</p>
        </div>
        <ConnectionApplicationModal
          isOpen={isApplicationModalOpen}
          onClose={() => setIsApplicationModalOpen(false)}
          onSuccess={() => {
            toast.success(t('toast.applicationSubmitted'));
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-4 text-white">
      <div className={cn("sticky top-0 z-20 py-4 flex items-center justify-between", theme.stickyHeader)}>
        <div className="w-10" />
        <h1 className="text-3xl font-bold text-center">{t('connections')}</h1>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
          {isMenuOpen && (
            <div className={`absolute right-0 top-12 ${dropdownBg} backdrop-blur-lg border ${dropdownBorder} rounded-lg shadow-xl min-w-[200px] z-50`}>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsApplicationModalOpen(true);
                }}
                className={`w-full text-left px-4 py-3 ${dropdownAccent} ${dropdownHover} transition-colors rounded-lg font-medium`}
              >
                {t('connections.applyForConnection')}
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsAboutModalOpen(true);
                }}
                className={`w-full text-left px-4 py-3 ${dropdownAccent} ${dropdownHover} transition-colors rounded-lg font-medium`}
              >
                {t('connections.aboutConnections')}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white/70 text-center">
        <p>{t('connections.connectionFeeNotice')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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

      <ConnectionApplicationModal
        isOpen={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
        onSuccess={() => {
          toast.success(t('connection.submitted'));
        }}
      />

      {/* About Connections Modal */}
      {isAboutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className={`${dropdownBg} backdrop-blur-lg border ${dropdownBorder} rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto`}>
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">{t('connections.aboutTitle')}</h2>
              <button onClick={() => setIsAboutModalOpen(false)} className="text-white/50 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-white/80 text-sm leading-relaxed">
              <section>
                <h3 className={`font-semibold text-base mb-2 ${dropdownAccent}`}>{t('connections.whatAreTitle')}</h3>
                <p>{t('connections.whatAreDesc')}</p>
              </section>

              <section>
                <h3 className={`font-semibold text-base mb-2 ${dropdownAccent}`}>{t('connections.howItWorksTitle')}</h3>
                <p>{t('connections.howItWorksDesc')}</p>
              </section>

              <section>
                <h3 className={`font-semibold text-base mb-2 ${dropdownAccent}`}>{t('connections.benefitsTitle')}</h3>
                <p>{t('connections.benefitsDesc')}</p>
              </section>

              <section>
                <h3 className={`font-semibold text-base mb-2 ${dropdownAccent}`}>{t('connections.durationTitle')}</h3>
                <p dangerouslySetInnerHTML={{ __html: t('connections.durationDesc') }} />
              </section>

              <section>
                <h3 className={`font-semibold text-base mb-2 ${dropdownAccent}`}>{t('connections.limitsTitle')}</h3>
                <p dangerouslySetInnerHTML={{ __html: t('connections.limitsDesc') }} />
              </section>

              <section>
                <h3 className={`font-semibold text-base mb-2 ${dropdownAccent}`}>{t('connections.oneAtATitle')}</h3>
                <p>{t('connections.oneAtADesc')}</p>
              </section>

              <section>
                <h3 className={`font-semibold text-base mb-2 ${dropdownAccent}`}>{t('connections.reviewTitle')}</h3>
                <p>{t('connections.reviewDesc')}</p>
              </section>

              <section>
                <h3 className={`font-semibold text-base mb-2 ${dropdownAccent}`}>{t('connections.conductTitle')}</h3>
                <p>{t('connections.conductDesc')}</p>
              </section>

              <section>
                <h3 className={`font-semibold text-base mb-2 ${dropdownAccent}`}>{t('connections.feesTitle')}</h3>
                <p>{t('connections.feesDesc')}</p>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionsPage;
