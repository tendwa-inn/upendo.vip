import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useOnboardingStore } from './stores/onboardingStore';
import SplashScreen from './components/SplashScreen';
import { useUiStore } from './stores/uiStore';
import { wordFilterService } from './services/wordFilterService';

const RouteGuard = ({ children }) => {
  const { session, profile, isAdmin, loading, isSuspended, isInitialized, profileLoading } = useAuthStore();
  const { onboardingCompleted: isFlowCompleted, completeOnboarding, reset: resetOnboarding } = useOnboardingStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { openProfileSetupModal } = useUiStore();

  useEffect(() => {
    if (!loading && profile?.onboarding_completed && !isFlowCompleted) {
      completeOnboarding();
    }

    // More lenient loading check - only wait for basic auth initialization
    if (loading || !isInitialized) {
      console.log('[RouteGuard] Waiting - loading:', loading, 'isInitialized:', isInitialized);
      return;
    }

    const handleRouting = async () => {
      console.log('SESSION:', session, 'LOADING:', loading, 'IS_INITIALIZED:', isInitialized);
      console.log('[RouteGuard] Starting routing check. Path:', location.pathname, 'Session:', !!session, 'Profile:', !!profile, 'Loading:', loading, 'IsSuspended:', isSuspended, 'ProfileLoading:', profileLoading);
      
      if (isSuspended) {
        console.log('[RouteGuard] User is suspended, redirecting to appeal');
        if (location.pathname !== '/appeal') navigate('/appeal', { replace: true });
        return;
      }

      const isAuthPage = ['/', '/login', '/signup', '/callback', '/appeal', '/privacy', '/terms'].includes(location.pathname);
      console.log('[RouteGuard] Is auth page:', isAuthPage);

      if (!session) {
        console.log('[RouteGuard] No session found');
        if (!isAuthPage) navigate('/login', { replace: true });
        return;
      }

      // If we have a session but are on an auth page (except homepage), redirect to app
      if (session && isAuthPage && location.pathname !== '/') {
        console.log('[RouteGuard] User has session but on auth page, redirecting to find');
        navigate('/find', { replace: true });
        return;
      }

      console.log('[RouteGuard] Session exists, checking profile');

      // If profile is still loading, wait a bit but don't block forever
      if (profileLoading && !profile) {
        console.log('[RouteGuard] Profile still loading, waiting...');
        return;
      }

      // If no profile exists after loading, redirect to create-profile
      if (!profile && !profileLoading) {
        console.log('[RouteGuard] No profile found, redirecting to create-profile');
        resetOnboarding();
        if (location.pathname !== '/create-profile') {
          navigate('/create-profile', { replace: true });
        }
        return;
      }

      // If we have a profile, proceed with normal checks
      if (profile) {
        console.log('[RouteGuard] Profile exists, checking admin status');

        if (isAdmin) {
          console.log('[RouteGuard] User is admin, redirecting to admin dashboard');
          if (!location.pathname.startsWith('/admin')) {
            navigate('/admin/dashboard', { replace: true });
          }
          return;
        }

        console.log('[RouteGuard] Checking onboarding status');

        // Check onboarding status - use the correct property name from database
        const onboardingCompleted = (profile as any).onboarding_completed || (profile as any).onboarded || false;
        if (!onboardingCompleted) {
          console.log('[RouteGuard] Onboarding not completed, redirecting to create-profile');
          if (location.pathname !== '/create-profile') {
            navigate('/create-profile', { replace: true });
          }
          return;
        }

        console.log('[RouteGuard] Checking profile completeness');
        // Ensure profile is complete before entering the app - use safe property access
        const bio = profile.bio || (profile as any).bio || '';
        const hereFor = profile.hereFor || (profile as any).here_for || (profile as any).hereFor || [];
        const photos = profile.photos || (profile as any).photos || [];
        
        const isProfileIncomplete = !bio || !hereFor || !photos || photos.length < 3;
        console.log('[RouteGuard] Profile completeness check - Bio:', !!bio, 'HereFor:', !!hereFor, 'Photos:', photos?.length, 'IsIncomplete:', isProfileIncomplete);
        
        if (isProfileIncomplete && !['/profile', '/create-profile'].includes(location.pathname)) {
          console.log('[RouteGuard] Profile incomplete, redirecting to profile');
          navigate('/profile', { replace: true });
          return;
        }

        console.log('[RouteGuard] All checks passed, user can proceed');
        // If the user is fully onboarded, but on an auth/onboarding page (except homepage), send them into the app.
        if ((isAuthPage && location.pathname !== '/') || location.pathname === '/create-profile') {
          console.log('[RouteGuard] Redirecting to find page');
          navigate('/find', { replace: true });
        }
      }
    };

    handleRouting();
  }, [session, profile, isAdmin, loading, isSuspended, isInitialized, profileLoading, isFlowCompleted, navigate, location.pathname, openProfileSetupModal, resetOnboarding]);

  if (loading || !isInitialized) {
    return <SplashScreen onComplete={() => {}} />;
  }

  return children;
};

export default RouteGuard;
