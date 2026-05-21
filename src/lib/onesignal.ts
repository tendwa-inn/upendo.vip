// src/lib/onesignal.ts

import OneSignal from 'react-onesignal';
import { registerServiceWorker } from './serviceWorkerRegistration';

let initialized = false;

// Wrap a promise with a timeout so we fail fast instead of letting the SDK retry forever
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('OneSignal timeout')), ms);
    promise.then(
      val => { clearTimeout(timer); resolve(val); },
      err => { clearTimeout(timer); reject(err); }
    );
  });
}

export async function initOneSignal(userId?: string) {
  if (initialized) return;
  try {
    // Check if browser supports push notifications
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notifications');
      return;
    }

    // Check if service worker is supported
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Workers not supported in this browser');
      return;
    }

    // Register service worker first
    await registerServiceWorker();

    await withTimeout(OneSignal.init({
      appId: '50e17550-2a2d-4343-9135-226f4aea3d6d',
      allowLocalhostAsSecureOrigin: true,
      serviceWorkerParam: { scope: '/' },
      serviceWorkerPath: 'OneSignalSDKWorker.js',
    }), 8000);

    // Check current permission status
    const permission = await OneSignal.Notifications.permission;

    // Only request permission if not already granted
    if (permission === 'default') {
      await OneSignal.Notifications.requestPermission();
    }

    if (userId) {
      await withTimeout(OneSignal.login(userId), 8000);
    }

    initialized = true;
  } catch (error) {
    initialized = true; // Don't retry on error either
    console.warn('OneSignal init failed/slow — push notifications disabled for this session.');
  }
}