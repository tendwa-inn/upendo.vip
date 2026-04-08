import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Shield } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const AdminLoginPage: React.FC = () => {
  const [passcode, setPasscode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setProfile, setSession } = useAuthStore();

  const ADMIN_PASSCODE = 'NLG36QM4FYR';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (passcode === ADMIN_PASSCODE) {
      // For bypass, we need to mock a session and a profile to satisfy RouteGuard
      const mockAdminProfile = {
        id: 'bypass-admin-id',
        name: 'Bypass Admin',
        email: 'admin@upendo.com',
        role: 'admin',
        avatar_url: '',
        onboarded: true,
        gender: 'male',
        age: 30,
        bio: 'Bypass Administrator',
        location: 'Virtual',
        subscription: 'admin',
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        is_online: true,
        last_active: new Date().toISOString(),
        photos: [],
        interests: [],
        looking_for: [],
      };

      const mockAdminSession = {
        access_token: 'mock-admin-token',
        token_type: 'Bearer',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        refresh_token: 'mock-refresh-token',
        user: {
          id: 'bypass-admin-id',
          aud: 'authenticated',
          role: 'authenticated',
          email: 'admin@upendo.com',
          email_confirmed_at: new Date().toISOString(),
          phone: '',
          confirmed_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
          app_metadata: { provider: 'email' },
          user_metadata: mockAdminProfile,
          identities: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };

      setSession(mockAdminSession);
      setProfile(mockAdminProfile);
      toast.success('Admin access granted!');
      navigate('/admin/dashboard', { replace: true });
    } else {
      toast.error('Invalid passcode.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-pro">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full mb-4"
          >
            <Shield className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold text-white mb-2"
          >
            Admin Login
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-white/80 text-lg"
          >
            Enter passcode to access admin panel
          </motion.p>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          onSubmit={handleSubmit}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 space-y-6"
        >
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Admin Passcode
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                placeholder="Enter 11-digit passcode"
                required
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-2xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verifying...' : 'Access Admin Panel'}
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
