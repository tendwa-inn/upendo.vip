import React from 'react';
import { Check, X } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const ProfileCompletionModal = ({ profile, onClose }) => {
  const { profile: authProfile } = useAuthStore();
  const isVip = authProfile?.account_type === 'vip';
  const isPro = authProfile?.account_type === 'pro';
  const completionCriteria = {
    bio: !!profile.bio,
    photos: (profile.photos?.length || 0) >= 3,
    location: !!profile.location?.name,
    hereFor: !!profile.hereFor,
  };

  const allComplete = Object.values(completionCriteria).every(Boolean);

  const criteriaList = [
    { label: 'Write a bio', completed: completionCriteria.bio },
    { label: 'Upload at least 3 photos', completed: completionCriteria.photos },
    { label: 'Set your location', completed: completionCriteria.location },
    { label: 'Specify what you are here for', completed: completionCriteria.hereFor },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className={`bg-gradient-to-b ${isVip ? 'from-black to-[#0b0b0b]' : isPro ? 'from-[#071521] to-[#0b2237]' : 'from-[#2E0C13] to-[#22090E]'} rounded-2xl p-6 w-full max-w-md text-white border ${isVip ? 'border-amber-400/30' : isPro ? 'border-cyan-400/30' : 'border-white/10'}`}>
        <h2 className="text-2xl font-bold mb-4">Complete Your Profile</h2>
        <p className="text-gray-300 mb-6">Finish these steps to start matching with others.</p>
        
        <div className="space-y-3 mb-6">
          {criteriaList.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
              <span className={item.completed ? 'text-gray-400 line-through' : 'text-white'}>{item.label}</span>
              {item.completed ? <Check className={`w-5 h-5 ${isVip ? 'text-amber-400' : isPro ? 'text-cyan-400' : 'text-green-500'}`} /> : <X className="w-5 h-5 text-red-500" />}
            </div>
          ))}
        </div>

        {allComplete ? (
          <div className={`text-center p-4 rounded-lg ${isVip ? 'bg-amber-500/20' : isPro ? 'bg-cyan-500/20' : 'bg-green-500/20'}`}>
            <p className={`font-semibold ${isVip ? 'text-amber-400' : isPro ? 'text-cyan-400' : 'text-green-400'}`}>Your profile is complete! You can now start swiping.</p>
          </div>
        ) : (
          <div className="text-center p-4 bg-red-500/20 rounded-lg">
            <p className="font-semibold text-red-400">Please complete all items to continue.</p>
          </div>
        )}

        <button onClick={onClose} className={`mt-6 w-full font-bold py-2 px-4 rounded-xl transition-all duration-300 ${
          isVip ? 'bg-amber-400 hover:bg-amber-500 text-black' : isPro ? 'bg-cyan-400 hover:bg-cyan-500 text-white' : 'bg-pink-600 hover:bg-pink-700 text-white'
        }`}>Close</button>
      </div>
    </div>
  );
};

export default ProfileCompletionModal;
