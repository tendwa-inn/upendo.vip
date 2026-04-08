import React from 'react';

const CallbackPage: React.FC = () => {
  // This page's only purpose is to be a temporary landing spot
  // while the Supabase client processes the auth callback from the URL.
  // The onAuthStateChange listener in authStore.ts will handle all redirection logic.

  return (
    <div className="min-h-screen flex items-center justify-center gradient-pro">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
    </div>
  );
};

export default CallbackPage;
