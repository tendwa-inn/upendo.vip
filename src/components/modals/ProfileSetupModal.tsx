import React from 'react';

interface ProfileSetupModalProps {
  onClose: () => void;
  onRedirect: () => void;
}

const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({ onClose, onRedirect }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#1a0f14] p-5 text-white shadow-2xl">
        <h3 className="mb-2 text-lg font-semibold">Complete your profile</h3>
        <p className="mb-5 text-sm text-white/70">
          Add your details and photos to unlock the full Upendo experience.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
          >
            Later
          </button>
          <button
            onClick={onRedirect}
            className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium hover:bg-pink-500"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupModal;
