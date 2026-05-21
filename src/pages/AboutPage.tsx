import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Zap, Gem } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#22090E] to-[#2E0C13] text-white p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-bold text-center text-pink-400 mb-8">About Upendo</h1>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-pink-300 mb-4">The No-Ghost Dating App</h2>
          <p className="text-base leading-relaxed">
            Upendo is a revolutionary dating app designed to combat the frustrating phenomenon of ghosting. We believe that everyone deserves clear communication and respectful interactions when searching for a meaningful connection. Our platform is built on the principles of transparency and accountability, creating a safer and more positive dating experience for singles in Africa and beyond.
          </p>
          <p className="text-base leading-relaxed mt-4">
            Our unique features are designed to encourage active participation and discourage flaky behavior. From our visibility scores to our read receipts, every aspect of Upendo is crafted to help you find a genuine partner who is as serious about finding love as you are.
          </p>
        </div>

        <h2 className="text-4xl font-bold text-center text-pink-400 mb-8">Our Tiers</h2>

        <div className="grid md:grid-cols-3 gap-8 text-center">
          {/* Free Tier */}
          <motion.div whileHover={{ y: -10 }} className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <Heart className="mx-auto w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-2xl font-bold mb-2">Free</h3>
            <p className="text-gray-400 mb-4">Get started and see who's out there.</p>
            <ul className="text-left space-y-2">
              <li>35 Swipes/day</li>
              <li>4 Rewinds/day</li>
              <li>1 Daily Vibe change</li>
              <li>3 Message Requests/day</li>
              <li>50% Visibility</li>
            </ul>
          </motion.div>

          {/* Pro Tier */}
          <motion.div whileHover={{ y: -10 }} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border-2 border-pink-500 shadow-lg shadow-pink-500/20">
            <Zap className="mx-auto w-12 h-12 text-pink-500 mb-4" />
            <h3 className="text-2xl font-bold text-pink-400 mb-2">Pro</h3>
            <p className="text-pink-300 mb-4">Unlock powerful features to boost your search.</p>
            <ul className="text-left space-y-2">
              <li>150 Swipes/day</li>
              <li>10 Rewinds/day</li>
              <li>5 Daily Vibe changes</li>
              <li>7 Message Requests/day</li>
              <li>75% Visibility</li>
              <li>Ghost Mode</li>
              <li>Read Receipts</li>
              <li>International Dating</li>
            </ul>
          </motion.div>

          {/* VIP Tier */}
          <motion.div whileHover={{ y: -10 }} className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <Gem className="mx-auto w-12 h-12 text-yellow-400 mb-4" />
            <h3 className="text-2xl font-bold text-yellow-300 mb-2">VIP</h3>
            <p className="text-yellow-200 mb-4">The ultimate experience for serious daters.</p>
            <ul className="text-left space-y-2">
              <li>300 Swipes/day</li>
              <li>Unlimited Rewinds</li>
              <li>10 Daily Vibe changes</li>
              <li>15 Message Requests/day</li>
              <li>100% Visibility</li>
              <li>Ghost Mode</li>
              <li>Read Receipts</li>
              <li>International Dating</li>
              <li>Unlimited Message Requests</li>
            </ul>
          </motion.div>
        </div>

      </motion.div>
    </div>
  );
};

export default AboutPage;
