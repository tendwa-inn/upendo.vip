import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';
import { wordFilterService } from './services/wordFilterService';
import { useAppSettingsStore } from './stores/appSettingsStore';
import { useMatchStore } from './stores/matchStore.tsx';
import { useNotificationStore } from './stores/notificationStore';

import { supabase } from './lib/supabaseClient';
import { useNetworkStore } from './stores/networkStore';
import SplashScreen from './components/SplashScreen';
import Layout from './components/Layout';
import FindPage from './pages/FindPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import DiscoverPage from './pages/DiscoverPage';
import ConnectionsPage from './pages/ConnectionsPage';
import UserProfilePage from './pages/UserProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import SystemMessagesPage from './pages/SystemMessagesPage'; // Import the new page
import ChatConversationPage from './pages/ChatConversationPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import CreateProfilePage from './pages/CreateProfilePage';
import CallbackPage from './pages/CallbackPage';
import HomePage from './pages/HomePage';
import TermsOfServicePage from './pages/TermsOfServicePage';
// Admin Imports
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminUsersPage from './admin/AdminUsersPage';
import AdminPromosPage from './admin/AdminPromosPage';
import AdminReportsPage from './admin/AdminReportsPage';
import AdminDormantAccountsPage from './admin/AdminDormantAccountsPage';
import AdminSettingsPage from './admin/AdminSettingsPage';
import AdminLoginPage from './admin/AdminLoginPage';
import WordFilterManagement from './admin/WordFilterManagement';
import AdminGifsPage from './admin/AdminGifsPage';
import SystemMessenger from './admin/SystemMessenger';
import AdminConnectionsPage from './admin/AdminConnectionsPage';
import BlockedPage from './pages/BlockedPage';
import AppealPage from './pages/AppealPage';
import CommunityGuidelines from './pages/CommunityGuidelines';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import OfflineNotifier from './components/common/OfflineNotifier';
import './index.css';

import RouteGuard from './RouteGuard';
import ProtectedRoute from './components/ProtectedRoute';

import usePresenceStore from './stores/presenceStore';
import i18n from 'i18next';
import './lib/i18n';

import { resetAllStores } from './stores/reset';

import { useLikeStore } from './stores/likeStore';

function App() {
  const { checkUser, user, loading } = useAuthStore(); // Use loading state
  const { getSettings } = useAppSettingsStore();

  useEffect(() => {
    const initializeApp = async () => {
      await checkUser();
      // Only load filtered words after auth is complete to avoid race conditions
      wordFilterService.loadFilteredWords();
    };
    
    initializeApp();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        resetAllStores();
      } else if (session) {
        useAuthStore.getState().setSession(session);
      }
      checkUser();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [checkUser]);

  useEffect(() => {
    if (!user) return;

    getSettings();

    const unsubscribeMatches = useMatchStore.getState().initializeRealtime?.();
    usePresenceStore.getState().initializePresence();
    useLikeStore.getState().fetchLikedUsers(user.id);

    const store = useMatchStore.getState();
    let profileChangesChannel: any;
    if (typeof store.subscribeToProfileChanges === "function") {
      profileChangesChannel = store.subscribeToProfileChanges();
    }

    // Correctly subscribe to user-specific notifications
    const notificationsChannel = supabase
      .channel(`notifications:${user.id}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          const notification = payload.new as any;
          useNotificationStore.getState().addNotification({
            id: notification.id,
            type: notification.type,
            isRead: notification.isRead || false,
            timestamp: new Date(notification.created_at),
            message: notification.message,
            relatedUser: notification.relatedUser,
            link: notification.link,
            photo_url: notification.photo_url
          });
          toast.success('You have a new notification!');
        }
      )
      .subscribe();

    const profileUpdateChannel = supabase
      .channel(`profile-updates:${user.id}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        (payload) => {
          const oldStrikes = useAuthStore.getState().profile?.strikes || 0;
          const newStrikes = payload.new.strikes;
          if (newStrikes > oldStrikes) {
            toast.error('You have received a new strike!', { icon: '⚠️' });
          }
          // Re-fetch user profile to get all latest data
          useAuthStore.getState().checkUser();
        }
      )
      .subscribe();

    return () => {
      unsubscribeMatches?.();
      usePresenceStore.getState().unsubscribePresence();
      if (profileChangesChannel) {
        supabase.removeChannel(profileChangesChannel);
      }
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(profileUpdateChannel);
    };
  }, [user, getSettings]);

  useEffect(() => {
    const { setOnline, setOffline } = useNetworkStore.getState();

    const handleOnline = () => setOnline();
    const handleOffline = () => setOffline();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    try {
      const supported = ['en','fr','ar','zh','bem','sw','ny','xh','af'];
      const saved = localStorage.getItem('lang') || 'en';
      const lang = supported.includes(saved) ? saved : 'en';
      if (saved !== lang) localStorage.setItem('lang', lang);
      if (i18n.language !== lang) i18n.changeLanguage(lang);
    } catch {}
  }, []);

  return (
    <Router>
      <SplashScreen visible={loading} />
      <OfflineNotifier />
      {!loading && (
        <RouteGuard>
          <div className={`min-h-screen`}>
            <AppRoutes />
            <Toaster position="top-center" />
          </div>
        </RouteGuard>
      )}
    </Router>
  );
}

const AppRoutes = () => {
  const { isAdmin } = useAuthStore();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/callback" element={<CallbackPage />} />
      <Route path="/admin-login" element={<AdminLoginPage />} />
      <Route path="/appeal" element={<AppealPage />} />
      <Route path="/blocked" element={<BlockedPage />} />
      <Route path="/community-guidelines" element={<CommunityGuidelines />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsOfServicePage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        {isAdmin ? (
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="promos" element={<AdminPromosPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="word-filter" element={<WordFilterManagement />} />
            <Route path="system-messenger" element={<SystemMessenger />} />
            <Route path="gifs" element={<AdminGifsPage />} />
            <Route path="connections" element={<AdminConnectionsPage />} />
            <Route path="dormant" element={<AdminDormantAccountsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>
        ) : (
          <>
            <Route path="/chat/:matchId" element={<ChatConversationPage />} />
            <Route path="/create-profile" element={<CreateProfilePage />} />
            <Route path="/*" element={
              <Layout>
                <Routes>
                  <Route path="/find" element={<FindPage />} />
                  <Route path="/discover" element={<DiscoverPage />} />
                  <Route path="/connections" element={<ConnectionsPage />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/user/:userId" element={<UserProfilePage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/system-messages" element={<SystemMessagesPage />} />
                  <Route path="/*" element={<Navigate to="/find" replace />} />
                </Routes>
              </Layout>
            } />
          </>
        )}
      </Route>

      {/* Fallback Route */}
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
