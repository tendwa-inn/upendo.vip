import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useOnboardingStore } from './stores/onboardingStore';
import SplashScreen from './components/SplashScreen';
import { useUiStore } from './stores/uiStore';
import { wordFilterService } from './services/wordFilterService';

const RouteGuard = ({ children }) => {
  const { session, profile, isAdmin, loading } = useAuthStore();
  const { onboardingCompleted: isFlowCompleted } = useOnboardingStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { openProfileSetupModal } = useUiStore();

  useEffect(() => {
    if (loading) return; // Wait until authentication check is complete

    const checkSuspension = async () => {
      if (session && profile && !isAdmin) {
        const suspension = await wordFilterService.getCurrentUserSuspension(profile.id);
        if (suspension) {
          if (location.pathname !== '/appeal') {
            navigate(`/appeal?actionId=${suspension.id}`, { replace: true });
          }
          return true;
        }
        if ((profile as any).is_blocked) {
          if (location.pathname !== '/blocked') {
            navigate('/blocked', { replace: true });
          }
          return true;
        }
      }
      return false;
    };

    const handleRouting = async () => {
      const isSuspended = await checkSuspension();
      if (isSuspended) return;

      const isAuthPage = ['/login', '/signup', '/callback', '/appeal'].includes(location.pathname);
      const isAdminRoute = location.pathname.startsWith('/admin');
      const isAllowedAdminUserRoute = location.pathname === '/profile';

      if (!session) {
        // No session, user is not logged in.
        if (!isAuthPage) {
          navigate('/login', { replace: true });
        }
        return;
      }

      // From here, we know session exists.

      if (!profile) {
        // Session exists, but profile is not loaded yet (or doesn't exist).
        if (location.pathname !== '/create-profile') {
          navigate('/create-profile', { replace: true });
        }
        return;
      }

      // From here, we know session AND profile exist.

      if (isAdmin) {
        if (isAuthPage || (!isAdminRoute && !isAllowedAdminUserRoute)) {
          navigate('/admin/dashboard', { replace: true });
        }
        return;
      }

      if (!(profile as any).onboarding_completed && !isFlowCompleted) {
        // User is in the middle of onboarding.
        if (location.pathname !== '/create-profile') {
          navigate('/create-profile', { replace: true });
        }
        return;
      }

      // From here, we know onboarding IS completed.

      const isProfileIncomplete = !profile.bio || !profile.hereFor || !profile.photos || profile.photos.length < 1;

      if (isProfileIncomplete) {
        // Onboarding is done, but profile needs more info.
        if (location.pathname !== '/profile') {
          openProfileSetupModal();
          navigate('/profile', { replace: true });
        }
        return;
      }

      // From here, we know profile is fully complete.

      if (isAuthPage) {
        // User is fully set up but on an auth page, redirect them into the app.
        navigate('/find', { replace: true });
      }
    };

    handleRouting();
  }, [session, profile, isAdmin, loading, isFlowCompleted, navigate, location.pathname, openProfileSetupModal]);

  if (loading) {
    return <SplashScreen onComplete={() => {}} />;
  }

  return children;
};

export default RouteGuard;
