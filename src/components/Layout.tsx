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


const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const { isProfileSetupModalOpen, closeProfileSetupModal } = useUiStore();
  const navigate = useNavigate();



  const handleRedirectToProfile = () => {
    navigate('/profile');
    closeProfileSetupModal();
  };
  const { selectedMatch, matches, hasNewMatches, markMatchesAsViewed } = useMatchStore();
  const isConversationPage = location.pathname.startsWith('/chat/');
  const isSystemMessagePage = location.pathname === '/system-messages';
  const hideNav = isConversationPage || isSystemMessagePage;



  const getNavColors = () => {
    const acct = (useAuthStore.getState().profile as any)?.accountType || (useAuthStore.getState().profile as any)?.subscription || user?.role;
    if (acct === 'vip') {
      return {
        find: 'text-amber-400',
        discover: 'text-amber-400',
        chat: 'text-amber-400',
        profile: 'text-amber-400',
      };
    }
    if (acct === 'pro') {
      return {
        find: 'text-[#ff7f50]',
        discover: 'text-[#ff7f50]',
        chat: 'text-[#ff7f50]',
        profile: 'text-[#ff7f50]',
      };
    }
    if (theme === 'dark') {
      return {
        find: 'text-gray-300',
        discover: 'text-gray-300',
        chat: 'text-gray-400',
        profile: 'text-white',
      };
    }
    return {
      find: 'text-pink-500',
      discover: 'text-pink-500',
      chat: 'text-purple-500',
      profile: 'text-indigo-500',
    };
  };

  const navItems = [
    {
      path: '/find',
      icon: Heart,
      label: t('find'),
      color: getNavColors().find,
    },
    {
      path: '/discover',
      icon: Compass,
      label: t('discover'),
      color: getNavColors().discover,
    },
    {
      path: '/chat',
      icon: MessageCircle,
      label: t('chat'),
      color: getNavColors().chat,
    },
    {
      path: '/connections',
      icon: Users,
      label: t('connect'),
      color: getNavColors().discover,
    },
    {
      path: '/profile',
      icon: User,
      label: t('profile'),
      color: getNavColors().profile,
    },
  ];

  const getThemeClass = () => {
    const acct = (useAuthStore.getState().profile as any)?.accountType || (useAuthStore.getState().profile as any)?.subscription || user?.role;
    if (acct === 'vip') {
      return 'bg-gradient-to-b from-black to-[#0b0b0b]';
    }
    if (acct === 'pro') {
      return 'bg-gradient-to-b from-[#071521] to-[#0b2237]';
    }
    return theme === 'dark' ? 'gradient-pro' : 'gradient-romantic';
  };

  const isChatPage = location.pathname === '/chat';
  const isVip =
    ((useAuthStore.getState().profile as any)?.accountType === 'vip') ||
    ((useAuthStore.getState().profile as any)?.subscription === 'vip') ||
    user?.role === 'vip';

  const acct = (useAuthStore.getState().profile as any)?.accountType || (useAuthStore.getState().profile as any)?.subscription || user?.role;
  const isPro = acct === 'pro';
  return (
    <div className={cn("relative min-h-screen text-white", isChatPage ? (isVip ? "bg-gradient-to-b from-black to-[#0b0b0b]" : isPro ? "bg-gradient-to-b from-[#071521] to-[#0b2237]" : "bg-gradient-to-b from-[#22090E] to-[#2E0C13]") : getThemeClass())}>
      {/* Background */}
      {!isChatPage && (
        <>
          <div className="absolute inset-0 bg-stone-900" />
          <div
            className="absolute inset-0"
            style={{
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: 0.1,
            }}
          />
        </>
      )}
      
      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Main Content */}
        <main className={cn("flex-1", !hideNav && "pb-24")}>
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
                        isActive ? 'shadow-lg scale-105' : 'bg-transparent'
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
                        isActive ? item.color : ((useAuthStore.getState().profile as any)?.accountType === 'vip' || user?.role === 'vip') ? 'text-amber-400' : (acct === 'pro' ? 'text-[#ff7f50]' : (theme === 'dark' ? 'text-gray-400' : 'text-gray-600')),
                        isActive && 'drop-shadow-lg'
                      )}
                    />
                    <span
                      className={cn(
                        'text-[10px] font-bold transition-all duration-300',
                        isActive ? item.color : ((useAuthStore.getState().profile as any)?.accountType === 'vip' || user?.role === 'vip') ? 'text-amber-400' : (acct === 'pro' ? 'text-[#ff7f50]' : (theme === 'dark' ? 'text-gray-400' : 'text-gray-600'))
                      )}
                    >
                      {item.label}
                    </span>
                    {item.path === '/chat' && hasNewMatches && (
                      <div className={cn("absolute top-0.5 right-0.5 w-2 h-2 rounded-full", isVip ? "bg-amber-400" : (acct === 'pro' ? "bg-[#ff7f50]" : "bg-pink-500"))}></div>
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
