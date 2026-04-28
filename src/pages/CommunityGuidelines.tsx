import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Heart, MessageCircle, Camera, AlertTriangle, Users, DollarSign, BookOpen } from 'lucide-react';

const CommunityGuidelines: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b14] to-[#2d0f1a] text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
              <Heart className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Welcome to the Upendo Community
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            Upendo is Swahili for "Love." Our mission is to foster a space where genuine connections can bloom in an environment rooted in respect, safety, and authenticity. To ensure that everyone has a positive experience, we've established these Community Guidelines.
          </p>
          <p className="text-lg text-gray-400 mt-4">
            By using Upendo, you agree to uphold these standards. We aren't just a platform; we are a community, and your behavior directly impacts the experience of others.
          </p>
        </motion.div>

        {/* Section 1: How to Handle Yourself */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10 p-6 bg-white/5 rounded-2xl border border-white/10"
        >
          <div className="flex items-center mb-4">
            <Users className="w-8 h-8 text-pink-400 mr-3" />
            <h2 className="text-2xl font-bold">1. How to Handle Yourself on Upendo</h2>
          </div>
          <p className="text-gray-300 mb-4">
            The foundation of Upendo is respectful engagement. Whether you are looking for a lifelong partner or a meaningful conversation, the way you carry yourself matters.
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <h3 className="font-semibold text-white mb-1">Be Authentic:</h3>
                <p className="text-gray-300">Use real photos and provide accurate information about yourself. Misrepresentation or "catfishing" undermines the trust of the community and will result in account suspension.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <h3 className="font-semibold text-white mb-1">Respect Boundaries:</h3>
                <p className="text-gray-300">"No" means no. If a match isn't interested or stops responding, respect their space. Repeatedly messaging someone who has not engaged is considered harassment.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <h3 className="font-semibold text-white mb-1">Communicate with Kindness:</h3>
                <p className="text-gray-300">Treat every interaction as you would a face-to-face meeting. Be polite, patient, and empathetic.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <h3 className="font-semibold text-white mb-1">Safety First:</h3>
                <p className="text-gray-300">We encourage taking your time. Do not share sensitive personal information (like your home address, social security number, or financial details) early in the conversation.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section 2: Three-Strike Rule */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10 p-6 bg-white/5 rounded-2xl border border-white/10"
        >
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-8 h-8 text-yellow-400 mr-3" />
            <h2 className="text-2xl font-bold">2. Inappropriate Language & The "Three-Strike" Rule</h2>
          </div>
          <p className="text-gray-300 mb-4">
            At Upendo, we have a zero-tolerance policy for verbal abuse. We believe that frustration is never an excuse for cruelty.
          </p>
          <h3 className="text-lg font-semibold text-white mb-3">The Strike System</h3>
          <p className="text-gray-300 mb-4">
            To maintain a high standard of discourse, we employ an automated and human-reviewed monitoring system for foul language, hate speech, and harassment.
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-sm mr-3 mt-1 flex-shrink-0">1</div>
              <div>
                <h3 className="font-semibold text-yellow-400 mb-1">Strike One (The Warning):</h3>
                <p className="text-gray-300">If our system detects the use of slurs, aggressive profanity, or derogatory language directed at another user, you will receive a formal warning. Your account may be "shadowed" for 24 hours, limiting your visibility to others.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-black font-bold text-sm mr-3 mt-1 flex-shrink-0">2</div>
              <div>
                <h3 className="font-semibold text-orange-400 mb-1">Strike Two (The Suspension):</h3>
                <p className="text-gray-300">A second offense will result in a 72-hour account suspension. This serves as a final opportunity to review our guidelines and adjust your behavior.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 mt-1 flex-shrink-0">3</div>
              <div>
                <h3 className="font-semibold text-red-400 mb-1">Strike Three (The Permanent Ban):</h3>
                <p className="text-gray-300">We value our users' peace of mind over a "third chance." Upon the third violation of our language policy, your account will be permanently banned. This includes a hardware-level block to prevent the creation of new accounts.</p>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300 text-sm">
              <strong>Note:</strong> Hate speech—including racism, homophobia, transphobia, and misogyny—may result in an immediate permanent ban, bypassing the strike system entirely.
            </p>
          </div>
        </motion.div>

        {/* Section 3: Nudity and Sexual Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-10 p-6 bg-white/5 rounded-2xl border border-white/10"
        >
          <div className="flex items-center mb-4">
            <Camera className="w-8 h-8 text-purple-400 mr-3" />
            <h2 className="text-2xl font-bold">3. Nudity, Pornography, and Sexual Content</h2>
          </div>
          <p className="text-gray-300 mb-4">
            Upendo is a place for dating, not for the distribution of adult content. To keep the app accessible and safe for everyone, we enforce strict rules regarding imagery.
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <h3 className="font-semibold text-white mb-1">Profile Content:</h3>
                <p className="text-gray-300">Nudity is strictly prohibited in public profiles. This includes blurred images, suggestive silhouettes, or "under-clothed" photos that lean into pornography. Profiles containing such content will be removed immediately.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <h3 className="font-semibold text-white mb-1">Private Messaging:</h3>
                <p className="text-gray-300">Sending unsolicited sexual images (commonly known as "cyber-flashing") is a violation of our terms. Consent is mandatory. If a user reports receiving an unsolicited explicit photo, the sender will be banned instantly.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <h3 className="font-semibold text-white mb-1">Commercial Content:</h3>
                <p className="text-gray-300">Upendo is not a platform for promoting OnlyFans, adult webcam services, or any form of sex work. Using the app to solicit or sell sexual services will result in an immediate ban.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section 4: Harassment and Bullying */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-10 p-6 bg-white/5 rounded-2xl border border-white/10"
        >
          <div className="flex items-center mb-4">
            <MessageCircle className="w-8 h-8 text-red-400 mr-3" />
            <h2 className="text-2xl font-bold">4. Harassment and Bullying</h2>
          </div>
          <p className="text-gray-300 mb-4">
            We are committed to a "Bully-Free" zone. Harassment includes, but is not limited to:
          </p>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p className="text-gray-300">Body shaming or mocking a user's appearance.</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p className="text-gray-300">Targeted "dogpiling" or creating multiple accounts to harass a single individual.</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p className="text-gray-300">Doxing (sharing a user's private information publicly).</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-blue-300 text-sm">
              If you feel you are being bullied, use the Report tool immediately. Our safety team reviews reports 24/7.
            </p>
          </div>
        </motion.div>

        {/* Section 5: Spam and Scams */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-10 p-6 bg-white/5 rounded-2xl border border-white/10"
        >
          <div className="flex items-center mb-4">
            <DollarSign className="w-8 h-8 text-green-400 mr-3" />
            <h2 className="text-2xl font-bold">5. Spam and Scams</h2>
          </div>
          <p className="text-gray-300 mb-4">
            To protect the integrity of our matches, we prohibit:
          </p>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p className="text-gray-300"><strong>Bot Activity:</strong> Using automated scripts to like profiles or send messages.</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p className="text-gray-300"><strong>Financial Requests:</strong> Never send money to someone you met on a dating app. Users asking for "gas money," "emergency help," or "investment opportunities" (like crypto scams) should be reported immediately.</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p className="text-gray-300"><strong>External Links:</strong> Sharing suspicious links or promoting third-party products is not allowed.</p>
            </div>
          </div>
        </motion.div>

        {/* Section 6: Our Commitment */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-10 p-6 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-2xl border border-pink-500/30"
        >
          <div className="flex items-center mb-4">
            <Shield className="w-8 h-8 text-pink-400 mr-3" />
            <h2 className="text-2xl font-bold">6. Our Commitment to You</h2>
          </div>
          <p className="text-gray-300 mb-4">
            Our moderation team works tirelessly to ensure Upendo remains the premier destination for love. We use a combination of AI-driven moderation and human oversight to evaluate reports fairly.
          </p>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-white text-center">
              If you encounter someone violating these rules, <strong>Report and Block</strong>. This doesn't just protect you; it protects the entire Upendo family.
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <div className="flex justify-center mb-4">
            <Heart className="w-8 h-8 text-pink-400" />
          </div>
          <p className="text-xl text-gray-300 font-semibold">
            Let's build something beautiful together. Welcome to Upendo.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default CommunityGuidelines;