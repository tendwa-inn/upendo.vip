import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSignUpStore } from '../../stores/signUpStore';
import { MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const LocationStep: React.FC = () => {
  const { nextStep, updateFormData } = useSignUpStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleLocation = () => {
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // In a real app, you would use a reverse geocoding API to get the city
        updateFormData({ location: { latitude, longitude, city: 'Lusaka' } });
        toast.success('Location captured!');
        nextStep();
      },
      (error) => {
        toast.error('Could not get location. Please enable it in your browser.');
        setIsLoading(false);
      }
    );
  };

  const handleSkip = () => {
    updateFormData({ location: { latitude: 40.7128, longitude: -74.0060, city: 'New York' } });
    toast.success('Location skipped. Using default.');
    nextStep();
  };

  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full mb-6"
      >
        <MapPin className="w-10 h-10 text-white" />
      </motion.div>

      <h2 className="text-2xl font-bold text-white mb-3">Enable Location</h2>
      <p className="text-white/80 mb-8">
        We need your location to show you potential matches nearby.
      </p>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleLocation}
        disabled={isLoading}
        className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-2xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Getting Location...' : 'Allow Location'}
      </motion.button>

      <button
        onClick={handleSkip}
        className="mt-4 text-white/70 text-sm hover:text-white transition-colors"
      >
        Skip for now
      </button>
    </div>
  );
};

export default LocationStep;