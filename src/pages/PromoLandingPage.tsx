import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'react-hot-toast';

const PromoLandingPage: React.FC = () => {
  const { promoCode } = useParams<{ promoCode: string }>();
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(true);
  const [promoDetails, setPromoDetails] = useState<any>(null);

  useEffect(() => {
    const validatePromoCode = async () => {
      if (!promoCode) {
        toast.error('Invalid promo code');
        navigate('/login');
        return;
      }

      try {
        // Check if promo code exists and is active
        const { data: promoData, error: promoError } = await supabase
          .from('promo_codes')
          .select('*')
          .eq('code', promoCode.toUpperCase())
          .eq('is_active', true)
          .single();

        if (promoError || !promoData) {
          toast.error('This promo code is invalid or expired');
          navigate('/login');
          return;
        }

        setPromoDetails(promoData);
        
        // Store promo code in sessionStorage for auto-application during signup
        sessionStorage.setItem('pendingPromoCode', promoCode.toUpperCase());
        
        // Redirect to signup after a brief delay to show the promo details
        setTimeout(() => {
          navigate('/signup');
        }, 2000);
        
      } catch (error) {
        console.error('Error validating promo code:', error);
        toast.error('Error validating promo code');
        navigate('/login');
      } finally {
        setIsValidating(false);
      }
    };

    validatePromoCode();
  }, [promoCode, navigate]);

  const handleContinueToSignup = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-pro p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-3xl p-8 space-y-6 text-center"
      >
        {isValidating ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <h2 className="text-2xl font-bold text-white">Validating Promo Code...</h2>
          </div>
        ) : promoDetails ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="text-6xl">🎉</div>
              <h2 className="text-3xl font-bold text-white">Promo Code Valid!</h2>
              <p className="text-white/80">You're about to receive an exclusive offer</p>
            </div>
            
            <div className="bg-white/20 rounded-xl p-4 space-y-2">
              <h3 className="text-xl font-semibold text-white">{promoDetails.name}</h3>
              <p className="text-white/80 text-sm">{promoDetails.description}</p>
              {promoDetails.duration && (
                <p className="text-white/60 text-xs">
                  Duration: {promoDetails.duration} days
                </p>
              )}
            </div>
            
            <p className="text-white/70 text-sm">
              Redirecting to signup in a moment...
            </p>
            
            <button
              onClick={handleContinueToSignup}
              className="w-full bg-pink-600 text-white font-bold py-3 rounded-xl transition-all duration-300 hover:bg-pink-700 active:scale-95"
            >
              Continue to Sign Up
            </button>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
};

export default PromoLandingPage;