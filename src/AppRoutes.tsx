import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Layout from './components/Layout';
import FindPage from './pages/FindPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import DiscoverPage from './pages/DiscoverPage';
import ConnectionsPage from './pages/ConnectionsPage';
import UserProfilePage from './pages/UserProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import SystemMessagesPage from './pages/SystemMessagesPage';
import ChatConversationPage from './pages/ChatConversationPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import CreateProfilePage from './pages/CreateProfilePage';
import CallbackPage from './pages/CallbackPage';
import HomePage from './pages/HomePage';
import TermsOfServicePage from './pages/TermsOfServicePage';
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
import AdminAdsPage from './admin/AdminAdsPage';
import AdminStorePage from './admin/AdminStorePage';
import StorePage from './pages/StorePage';
import BlockedPage from './pages/BlockedPage';
import AppealPage from './pages/AppealPage';
import CommunityGuidelines from './pages/CommunityGuidelines';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import AboutPage from './pages/AboutPage';
import ProtectedRoute from './components/ProtectedRoute';

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
      <Route path="/about" element={<AboutPage />} />

      {/* Protected Routes - The RouteGuard in App.tsx handles protection */}
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
          <Route path="ads" element={<AdminAdsPage />} />
          <Route path="store" element={<AdminStorePage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>
      ) : (
        <>
          <Route path="/chat/:matchId" element={<ChatConversationPage />} />
          <Route path="/store" element={<StorePage />} />
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

      {/* Fallback Route */}
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
