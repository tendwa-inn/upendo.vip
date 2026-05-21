// src/lib/serviceWorkerRegistration.ts

export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      // Check if service worker is already registered
      const existingRegistration = await navigator.serviceWorker.getRegistration('/');

      if (existingRegistration) {
        // Trigger update check so stale SWs don't linger
        existingRegistration.update().catch(() => {});
        return existingRegistration;
      }

      // Register the service worker
      const registration = await navigator.serviceWorker.register('/OneSignalSDKWorker.js', {
        scope: '/'
      });

      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      throw error;
    }
  } else {
    return null;
  }
}

export async function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.unregister();
      }
    } catch (error) {
      console.error('Service worker unregistration failed:', error);
    }
  }
}