import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAppStore } from './stores/appStore';
import SplashScreen from './components/SplashScreen';
import ErrorDisplay from './components/ErrorDisplay';
import AppRoutes from './AppRoutes';
import RouteGuard from './RouteGuard';
import PushNotificationHandler from './components/PushNotificationHandler';
import MessageNotificationBanner from './components/MessageNotificationBanner';
import { useMatchStore } from './stores/matchStore';
import { soundService } from './soundService';
import { enhanceButtonsInContainer } from './utils/buttonSound';

function App() {
  const { status, error } = useAppStore();

  useEffect(() => {
    const unsubscribe = useMatchStore.getState().initializeRealtime();
    return () => {
      unsubscribe();
    };
  }, []);

  // Global button sound enhancement (optimized)
  useEffect(() => {
    let isEnhancing = false;
    let enhanceTimeout: NodeJS.Timeout;

    const enhanceAllButtons = () => {
      // Debounce to prevent excessive calls
      if (isEnhancing) return;
      isEnhancing = true;

      clearTimeout(enhanceTimeout);
      enhanceTimeout = setTimeout(() => {
        // Only enhance buttons if sound is enabled
        if (soundService.isSoundEnabled()) {
          enhanceButtonsInContainer(document.body, 0.255, true);
        }
        isEnhancing = false;
      }, 100); // 100ms debounce
    };

    // Initial enhancement (delayed to avoid blocking initial render)
    const initialTimeout = setTimeout(() => {
      enhanceAllButtons();
    }, 500);

    // Subscribe to sound changes
    const unsubscribe = soundService.subscribeToSoundChanges((enabled) => {
      if (enabled) {
        enhanceAllButtons();
      }
    });

    // Re-enhance buttons when DOM changes (throttled)
    const observer = new MutationObserver(() => {
      enhanceAllButtons();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(enhanceTimeout);
      unsubscribe();
      observer.disconnect();
    };
  }, []);

  if (status === 'initializing' || status === 'authenticating' || status === 'loading-data') {
    return <SplashScreen visible={true} />;
  }

  if (status === 'error') {
    return <ErrorDisplay message={error || 'An unexpected error occurred.'} />;
  }

  return (
    <Router>
      <RouteGuard>
        <PushNotificationHandler>
          <div className={`min-h-screen`}>
            <AppRoutes />
            <MessageNotificationBanner />
            <Toaster position="top-center" />
          </div>
        </PushNotificationHandler>
      </RouteGuard>
    </Router>
  );
}

export default App;
