import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import { Ticket, Crown, Shield, XCircle } from 'lucide-react';
import ConfirmationModal from './modals/ConfirmationModal';

const SavedPromos = () => {
  const { user } = useAuthStore();
  const [promos, setPromos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [promoToCancel, setPromoToCancel] = useState<string | null>(null);

  const fetchUserPromos = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_promos')
        .select(`
          id,
          expires_at,
          promo_codes (
            name,
            description,
            type
          )
        `)
        .eq('user_id', user.id)
        .not('expires_at', 'is', null)
        .gt('expires_at', new Date().toISOString());

      if (error) throw error;
      setPromos(data || []);
    } catch (error) {
      console.error('Error fetching user promos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!promoToCancel) return;

    const promo = promos.find(p => p.id === promoToCancel);
    console.log('Canceling promo:', { promoToCancel, foundPromo: promo });

    try {
      // If it's a subscription promo, revert user to free and reset premium features
      if (promo && (promo.promo_codes.type === 'pro_account' || promo.promo_codes.type === 'vip_account')) {
        console.log('Downgrading user to free account and resetting premium features.');
        await useAuthStore.getState().updateUserProfile({ 
          accountType: 'free',
          ghostModeEnabled: false
        });
      } else if (promo && promo.promo_codes.type === 'profile_views') {
        console.log('Removing profile view privileges.');
        await useAuthStore.getState().updateUserProfile({ 
          canViewProfilesExpiresAt: null as any
        });
      }

      // Delete the promo record
      const { error } = await supabase.from('user_promos').delete().eq('id', promoToCancel);
      if (error) throw error;

      // Add notification for promo deletion
      if (promo) {
        const promoName = promo.promo_codes.name;
        const promoType = promo.promo_codes.type;
        const accountType = promoType === 'pro_account' ? 'Pro' : promoType === 'vip_account' ? 'VIP' : promoType === 'profile_views' ? 'Profile Views' : 'Premium';
        const messageText = promoType === 'profile_views' 
          ? `Your "${promoName}" promotion has been removed. You can no longer view who liked/viewed your profile.`
          : `Your ${accountType} promotion "${promoName}" has been removed. Your account has been downgraded to free tier.`;

        await supabase.from('notifications').insert({
          user_id: user.id,
          title: 'Promotion Removed',
          message: messageText,
          type: 'system',
          created_at: new Date().toISOString()
        });
      }

      // Refresh UI
      fetchUserPromos();
      useAuthStore.getState().checkUser();

    } catch (error) {
      console.error('Error canceling promo:', error);
    } finally {
      setPromoToCancel(null);
    }
  };

  const handleOpenConfirm = (promoId: string) => {
    setPromoToCancel(promoId);
    setIsConfirmModalOpen(true);
  };

  useEffect(() => {
    fetchUserPromos();

    // Listen for profile updates to refresh promos
    const unsubscribe = useAuthStore.subscribe(
      (state, prevState) => {
        if (state.profile?.accountType !== prevState.profile?.accountType) {
          fetchUserPromos();
        }
      }
    );

    return () => unsubscribe();

  }, [user]);

  if (isLoading) {
    return (
      <div className="text-center p-4">
        <p className="text-white/50">Loading your promos...</p>
      </div>
    );
  }

  if (promos.length === 0) {
    return null; // Don't render anything if there are no active promos
  }

  const getPromoIcon = (type) => {
    switch (type) {
      case 'VIP':
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 'PRO':
        return <Shield className="w-6 h-6 text-blue-400" />;
      default:
        return <Ticket className="w-6 h-6 text-green-400" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white/10 backdrop-blur-lg rounded-3xl p-6"
    >
      <h3 className="text-xl font-bold text-white mb-4">Active Promotions</h3>
      <div className="space-y-4">
        {promos.map((promo) => (
          <div key={promo.id} className="p-4 bg-white/10 rounded-2xl flex items-center gap-4">
            <div>{getPromoIcon(promo.promo_codes.type)}</div>
            <div className="flex-1">
              <h4 className="font-semibold text-white">{promo.promo_codes.name}</h4>
              <p className="text-sm text-white/70">{promo.promo_codes.description}</p>
            </div>
            <div>
              <p className="text-xs text-white/50">Expires</p>
              <p className="text-sm font-medium text-white">{new Date(promo.expires_at).toLocaleDateString()}</p>
            </div>
            <button onClick={() => handleOpenConfirm(promo.id)} className="text-red-500 hover:text-red-400">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleCancel}
        title="Cancel Promotion"
        message="Are you sure you want to remove this promotion? This cannot be undone."
      />
    </motion.div>
  );
};

export default SavedPromos;
