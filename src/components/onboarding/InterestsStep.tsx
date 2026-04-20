import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient'; // Import supabase

const interestsList = [
  'Reading', 'Traveling', 'Movies', 'Music', 'Cooking', 'Dancing', 'Art', 'Photography',
  'Hiking', 'Sports', 'Gaming', 'Yoga', 'Writing', 'Fashion', 'Technology', 'History'
].sort();

const InterestsStep: React.FC = () => {
  const { prevStep, updateFormData, formData, completeOnboarding } = useOnboardingStore();
  const { updateUserProfile } = useAuthStore();
  const navigate = useNavigate();
  const [selectedInterests, setSelectedInterests] = useState<string[]>(formData.interests || []);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interest)) {
        return prev.filter(i => i !== interest);
      } else if (prev.length < 5) {
        return [...prev, interest];
      }
      return prev;
    });
  };

  const handleNext = async () => {
    const { user } = useAuthStore.getState();
    if (!user) {
      console.error("User not available");
      return;
    }

    const profileData = {
      id: user.id, // This is the crucial part
      ...formData,
      interests: selectedInterests,
      onboarding_completed: true,
    };

    // Use upsert to avoid conflicts
    const { error } = await supabase.from('profiles').upsert(profileData);

    if (error) {
      console.error(error);
    } else {
      // Manually update the profile in the store after upserting
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (updatedProfile) {
        useAuthStore.setState({ profile: updatedProfile });
      }

      completeOnboarding();
      navigate('/find', { replace: true });
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
        <h1 className="text-3xl font-bold text-white">What are your interests?</h1>
        <p className="text-white/60 mt-1">Select 3 to 5 interests to find better matches.</p>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {interestsList.map(interest => (
          <button
            key={interest}
            onClick={() => toggleInterest(interest)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${selectedInterests.includes(interest) ? 'bg-pink-600 text-white' : 'bg-white/10 text-white/80'}`}>
            {interest}
          </button>
        ))}
      </div>
      <div className="flex gap-4 pt-4">
        <button 
          type="button"
          onClick={prevStep} 
          className="w-full font-bold py-3 px-4 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300"
        >
          Back
        </button>
        <button 
          type="button"
          onClick={handleNext} 
          disabled={selectedInterests.length < 3 || selectedInterests.length > 5} 
          className="w-full font-bold py-3 px-4 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-all duration-300 disabled:bg-pink-800 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </motion.div>
  );
};

export default InterestsStep;
