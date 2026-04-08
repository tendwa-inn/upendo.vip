import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ProfileCompletionWall = ({ missingFields }) => {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#22090E] to-[#2E0C13] flex items-center justify-center text-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Complete Your Profile</h2>
        <p className="text-white/80 mb-6">You need to complete the following steps before you can start matching:</p>
        <ul className="text-left space-y-2 mb-8">
          {missingFields.map((field, index) => (
            <li key={index} className="flex items-center gap-2 text-white">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>{field}</span>
            </li>
          ))}
        </ul>
        <Link to="/profile" className="px-6 py-3 bg-pink-600 text-white font-bold rounded-xl hover:bg-pink-700 transition-all duration-300">
          Go to My Profile
        </Link>
      </motion.div>
    </div>
  );
};

export default ProfileCompletionWall;
