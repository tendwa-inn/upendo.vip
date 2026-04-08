import React, { useState } from 'react';
import { Button } from '@tremor/react';
import Portal from '../Portal';
import { X } from 'lucide-react';

const DeactivationModal = ({ onClose, onDeactivate }) => {
  const [reason, setReason] = useState('');

  const reasons = [
    'Too much time on Upendo',
    'I cannot find matches',
    'The app is not for me',
    'I met someone',
    'Other',
  ];

  const handleDeactivate = () => {
    onDeactivate(reason);
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-gradient-to-br from-[#1a0f14] to-[#2E0C13] rounded-2xl p-8 w-full max-w-lg text-white border border-pink-500/30 relative shadow-2xl">
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-2xl blur-xl"></div>

          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 transition-all duration-200 hover:scale-110 z-10">
            <X className="w-6 h-6" />
          </button>

          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-4">Deactivate your account?</h2>
            <p className="text-gray-300 mb-6">
              This will deactivate your account, making it dormant and hidden from other users.
              If you do not log back in within 30 days, your account and all its data will be permanently deleted.
              Your feedback helps us improve. Please select a reason for leaving.
            </p>
            <div className="space-y-3 mb-6">
              {reasons.map(r => (
                <button key={r} onClick={() => setReason(r)} className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                  reason === r ? 'bg-pink-600 shadow-lg shadow-pink-500/25' : 'bg-white/10 hover:bg-white/20'
                }`}>
                  {r}
                </button>
              ))}
            </div>
            <Button
              onClick={handleDeactivate}
              disabled={!reason}
              color="red"
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-none transition-all duration-200 transform hover:scale-105 shadow-lg shadow-red-500/25"
            >
              Confirm Deactivation
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default DeactivationModal;
