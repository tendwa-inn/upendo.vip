import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';

const LocationStep: React.FC = () => {
  const { prevStep, updateFormData, formData } = useOnboardingStore();
  const { createProfile } = useAuthStore();
  const navigate = useNavigate();
  const [location, setLocation] = useState(formData.location || '');
  const [isLoading, setIsLoading] = useState(false);
  const [showWhyModal, setShowWhyModal] = useState(false);

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      let lat = formData.latitude;
      let lon = formData.longitude;

      // If we don't have coordinates, geocode the location string
      if ((!lat || !lon) && location) {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`);
        const data = await response.json();
        if (data && data.length > 0) {
          lat = parseFloat(data[0].lat);
          lon = parseFloat(data[0].lon);
        } else {
          alert("Could not find coordinates for the location you entered. Please try again.");
          setIsLoading(false);
          return;
        }
      }

      const finalData = {
        ...formData,
        location: {
          name: location,
          coordinates: [lon, lat],
        }
      };

      await createProfile(finalData);
      navigate('/discover', { replace: true });

    } catch (error: any) {
      console.error('Failed to create profile:', error);
      alert(`An error occurred: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
            const data = await response.json();
            const { city, town, village, county, state, country } = data.address;
            const locationName = city || town || village || county || state;

            if (locationName && country) {
              const fullLocation = `${locationName}, ${country}`;
              setLocation(fullLocation);
              updateFormData({ latitude: position.coords.latitude, longitude: position.coords.longitude });
            } else if (data.display_name) {
              // As a fallback, use the full display name
              setLocation(data.display_name);
              updateFormData({ latitude: position.coords.latitude, longitude: position.coords.longitude });
            } else {
              alert('Could not determine a usable location name. Please try again.');
            }
          } catch (error) {
            console.error('Error getting location name:', error);
            alert('Could not determine your location. Please enter it manually.');
          } finally {
            setIsLoading(false);
          }
        },
        (error) => {
          console.error('Error getting current location:', error);
          alert('Could not access your location. Please ensure you have granted permission and try again.');
          setIsLoading(false);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="w-full max-w-md bg-gray-900/30 backdrop-blur-lg rounded-3xl p-8 space-y-6"
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">Where are you located?</h1>
        <p className="text-white/60 mt-1">This helps us find matches near you.</p>
      </div>
      <input
        type="text"
        value={location}
        placeholder="Your location will appear here..."
        className="w-full p-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-white disabled:bg-white/5 disabled:text-white/50"
        disabled
      />
      <div className="flex gap-4">
                <button onClick={handleUseCurrentLocation} disabled={isLoading} className="w-full font-bold py-3 px-4 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50">
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Fetching...</span>
            </>
          ) : (
            'Use Current Location'
          )}
        </button>
        <button onClick={() => setShowWhyModal(true)} className="w-auto font-bold py-3 px-4 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300">
          Why?
        </button>
      </div>
      <div className="flex gap-4">
        <button onClick={prevStep} className="w-full font-bold py-3 px-4 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300">Back</button>
        <button onClick={handleFinish} disabled={!location || isLoading} className="w-full font-bold py-3 px-4 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-all duration-300 disabled:bg-pink-800 disabled:cursor-not-allowed">
          {isLoading ? 'Finishing Up...' : 'You are all set'}
        </button>
      </div>
      {showWhyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-2xl max-w-sm text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Why do we need your location?</h2>
            <p className="text-white/80 mb-6">We use your location to find potential matches in your area. Your exact location is never shared with other users.</p>
            <button onClick={() => setShowWhyModal(false)} className="font-bold py-2 px-6 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-all duration-300">
              Got it!
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default LocationStep;
