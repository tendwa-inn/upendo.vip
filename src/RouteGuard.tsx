import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useOnboardingStore } from './stores/onboardingStore';
import SplashScreen from './components/SplashScreen';
import { useUiStore } from './stores/uiStore';
import { wordFilterService } from './services/wordFilterService';

const RouteGuard = ({ children }) => {
  const { session, profile, isAdmin, loading, isSuspended } = useAuthStore();
  const { onboardingCompleted: isFlowCompleted, completeOnboarding, reset: resetOnboarding } = useOnboardingStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { openProfileSetupModal } = useUiStore();

  useEffect(() => {
    if (!loading && profile?.onboarding_completed && !isFlowCompleted) {
      completeOnboarding();
    }

    if (loading) return; // Wait until authentication check is complete

    const handleRouting = async () => {
      if (isSuspended) {
        if (location.pathname !== '/appeal') navigate('/appeal', { replace: true });
        return;
      }

      const isAuthPage = ['/login', '/signup', '/callback', '/appeal'].includes(location.pathname);

      if (!session) {
        if (!isAuthPage) navigate('/login', { replace: true });
        return;
      }

      // From here, we know a session exists.

      if (!profile) {
        // If profile is not yet loaded, or doesn't exist in DB, the only safe place is onboarding.
        // This handles new users and corrupted accounts that need to re-onboard.
        // Reset onboarding store for new users to ensure they start from the beginning
        resetOnboarding();
        if (location.pathname !== '/create-profile') {
          navigate('/create-profile', { replace: true });
        }
        return;
      }

      // From here, we know the profile object exists.

      if (isAdmin) {
        if (!location.pathname.startsWith('/admin')) {
          navigate('/admin/dashboard', { replace: true });
        }
        return;
      }

      if (!profile.onboarding_completed) {
        if (location.pathname !== '/create-profile') {
          navigate('/create-profile', { replace: true });
        }
        return;
      }

      // Ensure profile is complete before entering the app
      const isProfileIncomplete = !profile.bio || !profile.hereFor || !profile.photos || profile.photos.length < 3;
      if (isProfileIncomplete && !['/profile', '/create-profile'].includes(location.pathname)) {
        navigate('/profile', { replace: true });
        return;
      }

      // From here, we know onboarding is complete according to the database.
      // This is the single source of truth.

      // If the user is fully onboarded, but on an auth/onboarding page, send them into the app.
      if (isAuthPage || location.pathname === '/create-profile') {
        navigate('/find', { replace: true });
      }
    };

    handleRouting();
  }, [session, profile, isAdmin, loading, isFlowCompleted, navigate, location.pathname, openProfileSetupModal, resetOnboarding]);

  if (loading) {
    return <SplashScreen onComplete={() => {}} />;
  }

  return children;
};

export default RouteGuard;
