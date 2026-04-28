import React from 'react';
import Stories from '../components/discover/Stories';

import DiscoverGrid from '../components/discover/DiscoverGrid';
import { useAuthStore } from '../stores/authStore';

const DiscoverPage: React.FC = () => {
  const { profile, user } = useAuthStore();
  const acct = user?.role || (profile as any)?.account_type || (profile as any)?.accountType || (profile as any)?.subscription;
  const isVip = acct === 'vip';
  const isPro = acct === 'pro';

  return (
    <div className="p-4 text-white">
      {/* <Stories /> */}
      <DiscoverGrid />
    </div>
  );
};

export default DiscoverPage;
