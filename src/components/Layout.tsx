import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, User, Compass, Bell, Users } from 'lucide-react';
import { cn } from '../lib/utils';

import { useThemeStore } from '../stores/themeStore';

interface LayoutProps {
  children: React.ReactNode;
}

import { useAuthStore } from '../stores/authStore';
import { useUiStore } from '../stores/uiStore';
import { useMatchStore } from '../stores/matchStore.tsx';
import { useNotificationStore } from '../stores/notificationStore';
import ProfileSetupModal from './modals/ProfileSetupModal';
import NotificationPermissionPrompt from './common/NotificationPermissionPrompt';


import { getTheme } from '../styles/theme';

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isUserProfilePage = location.pathname.startsWith('/user/');
  const isNotificationsPage = location.pathname === '/notifications';
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const { isProfileSetupModalOpen, closeProfileSetupModal } = useUiStore();
  const navigate = useNavigate();

  const handleRedirectToProfile = () => {
    navigate('/profile');
    closeProfileSetupModal();
  };
  const { hasNewMatches, markMatchesAsViewed } = useMatchStore();
  const isConversationPage = location.pathname.startsWith('/chat/');
  const isSystemMessagePage = location.pathname === '/system-messages';
  const hideNav = isConversationPage || isSystemMessagePage;

  const accountType = (profile as any)?.account_type || (profile as any)?.subscription || 'free';
  const theme = getTheme(accountType);

  const navItems = [
    {
      path: '/find',
      icon: Heart,
      label: t('find'),
      color: theme.nav.find,
    },
    {
      path: '/discover',
      icon: Compass,
      label: t('discover'),
      color: theme.nav.discover,
    },
    {
      path: '/chat',
      icon: MessageCircle,
      label: t('chat'),
      color: theme.nav.chat,
    },
    {
      path: '/connections',
      icon: Users,
      label: t('connect'),
      color: theme.nav.connections,
    },
    {
      path: '/profile',
      icon: User,
      label: t('profile'),
      color: theme.nav.profile,
    },
  ];

  return (
    <div className={cn("relative min-h-[100dvh] text-white", theme.background)}>
      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-[100dvh]">
        {/* Main Content */}
        <main className={cn("flex-1", !hideNav && !isUserProfilePage && !isNotificationsPage && "pb-24")}>
          {children}
        </main>

        <NotificationPermissionPrompt />

        {isProfileSetupModalOpen && (
          <ProfileSetupModal
            onClose={closeProfileSetupModal}
            onRedirect={handleRedirectToProfile}
          />
        )}

        {/* Bottom Navigation */}
        <nav className={cn("fixed bottom-0 left-0 right-0 pb-safe-area-bottom z-50 bg-black/20 backdrop-blur-lg border-t border-white/10", hideNav && "hidden")}>
          <div className="flex justify-center items-center h-14 px-2">
            {/* Centered nav items */}
            <div className="flex justify-center items-center gap-1 w-full max-w-md mx-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        'relative flex flex-col items-center justify-center flex-1 h-12 rounded-lg transition-all duration-300 max-w-16',
                        'hover:bg-white/20 active:scale-95',
                        isActive ? 'shadow-lg scale-105' : 'bg-transparent opacity-60'
                      )}
                      onClick={() => {
                        if (item.path === '/chat') {
                          markMatchesAsViewed();
                        }
                      }}
                    >
                    <Icon
                      className={cn(
                        'w-4 h-4 mb-1 transition-all duration-300',
                        isActive ? item.color : theme.nav.inactive,
                        isActive && 'drop-shadow-lg'
                      )}
                    />
                    <span
                      className={cn(
                        'text-[10px] font-bold transition-all duration-300',
                        isActive ? item.color : theme.nav.inactive
                      )}
                    >
                      {item.label}
                    </span>
                    {item.path === '/chat' && hasNewMatches && (
                      <div className={cn("absolute top-0.5 right-0.5 w-2 h-2 rounded-full", theme.primary)}></div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Layout;
