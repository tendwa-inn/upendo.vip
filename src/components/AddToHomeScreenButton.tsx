import React, { useState, useEffect } from 'react';
import { Download, Share } from 'lucide-react';
import toast from 'react-hot-toast';

const AddToHomeScreenButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppleDevice, setIsAppleDevice] = useState(false);

  useEffect(() => {
    // Detect if the user is on an Apple device
    const isApple = /iPhone|iPad|iPod/.test(navigator.userAgent);
    setIsAppleDevice(isApple);

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };

    // Only add the event listener if it's not an Apple device
    if (!isApple) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }

    return () => {
      if (!isApple) {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      }
    };
  }, []);

  const handleInstallClick = () => {
    if (isAppleDevice) {
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-gray-800 text-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <Share className="h-6 w-6 text-pink-500" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">
                  To install Upendo:
                </p>
                <p className="mt-1 text-sm text-gray-300">
                  Tap the 'Share' icon and then 'Add to Home Screen'.
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-700">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-pink-500 hover:text-pink-400 focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      ), { duration: 6000 });
    } else if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setDeferredPrompt(null);
      });
    } else {
        toast.error("Your browser doesn't support adding to the home screen, or the app is already installed.");
    }
  };
  
  // Only show the button if it's a potential PWA install target on non-Apple devices, or if it's an Apple device.
  if (!deferredPrompt && !isAppleDevice) {
      return null;
  }

  return (
    <button
      onClick={handleInstallClick}
      className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors md:hidden"
      aria-label="Add to Home Screen"
      title="Add to Home Screen"
    >
      <Download className="w-5 h-5 text-white" />
    </button>
  );
};

export default AddToHomeScreenButton;
