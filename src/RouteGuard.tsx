import React, { useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import usePresenceStore from './stores/presenceStore';
import SplashScreen from './components/SplashScreen';

const ALLOWED_INCOMPLETE = ['/profile', '/login', '/signup', '/callback', '/appeal', '/privacy', '/terms', '/about'];

const RouteGuard = ({ children }) => {
  const { session, profile, isInitialized, loading, profileLoading, isSuspended, hasAllRequiredFields } = useAuthStore();
  const { initializePresence } = usePresenceStore();
  const location = useLocation();
  const navigate = useNavigate();
  const navigatedRef = useRef(false);

  useEffect(() => {
    if (session && profile) {
      try { initializePresence(); } catch {}
    }
  }, [session, profile, initializePresence]);

  useEffect(() => {
    if (!isInitialized || loading || profileLoading) return;

    const path = location.pathname;
    const isAdminRoute = path.startsWith('/admin') || path === '/admin-login';
    if (isAdminRoute) return;

    navigatedRef.current = false;

    // Suspended users -> appeal
    if (isSuspended && path !== '/appeal') {
      navigate('/appeal', { replace: true });
      navigatedRef.current = true;
      return;
    }

    // No session -> login (except public pages)
    const isPublic = ['/', '/login', '/signup', '/callback', '/appeal', '/privacy', '/terms', '/about'].includes(path);
    if (!session && !isPublic) {
      navigate('/login', { replace: true });
      navigatedRef.current = true;
      return;
    }

    // Authenticated but no profile -> create-profile
    if (session && !profile && path !== '/create-profile') {
      navigate('/create-profile', { replace: true });
      navigatedRef.current = true;
      return;
    }

    // Incomplete profile -> profile page
    if (profile && !hasAllRequiredFields && !ALLOWED_INCOMPLETE.includes(path)) {
      navigate('/profile', { replace: true });
      navigatedRef.current = true;
      return;
    }

    // Complete profile on auth/landing pages -> find
    if (session && profile && hasAllRequiredFields && (path === '/' || path === '/create-profile' || path === '/login' || path === '/signup')) {
      navigate('/find', { replace: true });
      navigatedRef.current = true;
      return;
    }
  }, [isInitialized, loading, profileLoading, session, profile, isSuspended, hasAllRequiredFields, location.pathname, navigate]);

  // Loading
  if (!isInitialized || loading || profileLoading) {
    return <SplashScreen visible={true} />;
  }

  // Admin bypass
  if (location.pathname.startsWith('/admin') || location.pathname === '/admin-login') {
    return children;
  }

  // No session on protected page - show splash while navigate kicks in
  if (!session && !['/', '/login', '/signup', '/callback', '/appeal', '/privacy', '/terms', '/about'].includes(location.pathname)) {
    return <SplashScreen visible={true} />;
  }

  // No profile on protected page
  if (session && !profile && location.pathname !== '/create-profile') {
    return <SplashScreen visible={true} />;
  }

  return children;
};

export default RouteGuard;