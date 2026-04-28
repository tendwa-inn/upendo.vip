import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import privacyPolicyContent from '../data/privacyPolicy.md?raw';

const PrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-white/80 hover:text-white transition-colors mr-4"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-4xl mx-auto">
          <div className="prose prose-invert prose-lg max-w-none text-white/90">
            <ReactMarkdown>
              {privacyPolicyContent}
            </ReactMarkdown>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/60 text-sm">
            Last updated: April 28, 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;