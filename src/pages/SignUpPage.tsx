import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { Link, useNavigate } from 'react-router-dom';

const SignUpPage: React.FC = () => {
  const { user, signInWithGoogle, signUpWithEmail, loading: isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleGoogleSignUp = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google Sign-Up Error:', error);
      alert('Failed to sign up with Google. Please try again.');
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signUpWithEmail(email, password);
      // User will be redirected to onboarding after sign up
    } catch (error) {
      console.error('Email Sign-Up Error:', error);
      // The error toast is already handled in the store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-pro p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-3xl p-8 space-y-6 text-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Create an Account</h1>
          <p className="text-white/80 mt-2">Join Upendo today to find your match.</p>
        </div>

        <form onSubmit={handleEmailSignUp} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-white"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-white"
            required
          />
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-pink-600 text-white font-bold py-3 rounded-xl transition-all duration-300 hover:bg-pink-700 active:scale-95 disabled:bg-pink-800"
          >
            {isLoading ? 'Signing up...' : 'Create Account'}
          </button>
        </form>

        <div className="flex items-center justify-center space-x-2">
          <div className="flex-grow h-px bg-white/20"></div>
          <span className="text-white/60 text-sm">OR</span>
          <div className="flex-grow h-px bg-white/20"></div>
        </div>

        <button 
          onClick={handleGoogleSignUp}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white/20 text-white font-bold py-3 rounded-xl transition-all duration-300 hover:bg-white/30 active:scale-95 disabled:opacity-50"
        >
          <img src="/google-logo.svg" alt="Google" className="w-6 h-6" />
          Sign up with Google
        </button>

        <div className="text-center">
          <p className="text-white/60">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-white hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
