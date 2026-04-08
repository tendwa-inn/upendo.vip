import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';
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
import OfflineNotifier from './components/common/OfflineNotifier';
import './index.css';

import RouteGuard from './RouteGuard';

import usePresenceStore from './stores/presenceStore';
import i18n from 'i18next';
import './lib/i18n';

function App() {
  const { checkUser, user } = useAuthStore();
  const { getSettings } = useAppSettingsStore();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    checkUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      checkUser();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [checkUser]);

  useEffect(() => {
    if (user) {
      getSettings();
      useNotificationStore.getState().fetchNotifications();
      const unsubscribeMatches = useMatchStore.getState().initializeRealtime();
      usePresenceStore.getState().initializePresence();

      return () => {
        unsubscribeMatches();
        usePresenceStore.getState().unsubscribePresence();
      };
    }
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

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <SplashScreen visible={showSplash} />
      <OfflineNotifier />
      <RouteGuard>
        <div className={`min-h-screen`}>
          <AppRoutes />
          <Toaster position="top-center" />
        </div>
      </RouteGuard>
    </Router>
  );
}

const AppRoutes = () => {
    const { session, isAdmin } = useAuthStore();

    if (session) {
      if (isAdmin) {
        return (
          <Routes>
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
            <Route path="/profile" element={
              <Layout>
                <ProfilePage />
              </Layout>
            } />
            <Route path="/*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        );
      } else {
        return (
          <Routes>
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
          </Routes>
        );
      }
    } else {
      // Not authenticated
      return (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          <Route path="/callback" element={<CallbackPage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} /> {/* Admin specific login route */}
          <Route path="/appeal" element={<AppealPage />} />
          <Route path="/blocked" element={<BlockedPage />} />
          <Route path="/*" element={<Navigate to="/login" replace />} />
        </Routes>
      );
    }
  };

export default App;
