import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { User } from '../../types';

interface ProfileDetailModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProfileDetailModal: React.FC<ProfileDetailModalProps> = ({ user, isOpen, onClose }) => {
  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            className="bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto text-white border border-gray-700 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold">{user.name}, {user.age}</h2>
                  <p className="text-gray-400">{user.location.name}</p>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {user.photos.map((photo, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden">
                    <img src={photo} alt={`${user.name} photo ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">About Me</h3>
                <p className="text-gray-300">{user.bio}</p>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {user.interests.map(interest => (
                    <span key={interest} className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Here For</h3>
                <div className="flex flex-wrap gap-2">
                  {user.hereFor.map(purpose => (
                    <span key={purpose} className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm">
                      {purpose}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mt-8 grid grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="font-semibold text-gray-400">Height</p>
                  <p>{user.height ? `${user.height} cm` : 'Not specified'}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-400">Education</p>
                  <p className="capitalize">{user.education || 'Not specified'}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-400">Religion</p>
                  <p>{user.religion || 'Not specified'}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-400">First Date</p>
                  <p className="capitalize">{user.firstDate?.replace('-',' ') || 'Not specified'}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-400">Drinking</p>
                  <p className="capitalize">{user.drinking || 'Not specified'}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-400">Smoking</p>
                  <p className="capitalize">{user.smoking || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfileDetailModal;