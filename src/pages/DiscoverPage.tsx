import React from 'react';
import Stories from '../components/discover/Stories';

import DiscoverGrid from '../components/discover/DiscoverGrid';
import { useAuthStore } from '../stores/authStore';

const DiscoverPage: React.FC = () => {
  const { profile, user } = useAuthStore();
  const acct = (profile as any)?.accountType || (profile as any)?.subscription || user?.role;
  const isVip = acct === 'vip';
  const isPro = acct === 'pro';

  return (
    <div className={`p-4 ${isVip ? 'bg-gradient-to-b from-black to-[#0b0b0b]' : isPro ? 'bg-gradient-to-b from-[#071521] to-[#0b2237]' : 'bg-gradient-to-b from-[#22090E] to-[#2E0C13]'} min-h-screen text-white`}>
      {/* <Stories /> */}
      <DiscoverGrid />
    </div>
  );
};

export default DiscoverPage;
