import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsOfServicePage: React.FC = () => {
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
          <h1 className="text-4xl font-bold text-white">Terms of Service</h1>
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-4xl mx-auto">
          <div className="prose prose-invert prose-lg max-w-none text-white/90">
            <h2>Terms of Service</h2>
            <p>
              Upendo is built on a simple promise: your data belongs to you. We do not sell personal information to third parties. We collect only what is needed to operate the service—such as account identifiers, profile details you choose to share, and activity signals that power discovery and safety features. We use industry‑standard encryption in transit and at rest, and we segment access so that only authorized systems and personnel can view sensitive data for operational reasons. Where possible, we de‑identify analytics so that aggregate insights help improve the product without exposing individual histories.
            </p>
            <p>
              Identity and security are core to the Upendo experience. We provide tools for profile verification and signals that help you evaluate authenticity before engaging. Suspicious behavior can be reported from within the app and is reviewed in line with our community guidelines. We reserve the right to limit features, request additional verification, or take action on accounts that violate policy. To protect the community, certain safety signals—such as device checks or abuse prevention markers—may be processed automatically; these systems exist solely to keep interactions safe and respectful.
            </p>
            <p>
              You control what you share. Profile fields are opt‑in, and you may update or remove content at any time. You can limit visibility using in‑app settings, and you may request deletion of your account and associated data subject to legal or operational retention requirements (for example, fraud prevention or lawful requests). We partner with trusted infrastructure providers for hosting and storage; those partners act on our instructions and are bound by contractual, technical and organizational safeguards.
            </p>
            <p>
              By using Upendo, you agree to communicate respectfully, comply with local laws, and avoid activities that harm others or the platform. Upendo may update these terms to reflect product or legal changes; material updates will be communicated in‑app. If any provision is found unenforceable, the remaining sections remain in effect. For questions about privacy, security or account rights, contact Support through the app. Our goal is to give every member a safe, reliable and transparent environment to meet, chat and build meaningful connections.
            </p>

            <h3>Subscription Tiers</h3>
            <p>
              Upendo offers optional paid subscriptions that unlock exclusive features. Payments are processed securely through our partners and are subject to their terms.
            </p>
            <h4>Upendo Pro includes:</h4>
            <ul>
              <li>Unlimited Swipes</li>
              <li>See Who Likes You</li>
              <li>Advanced Search Filters</li>
              <li>Ad-Free Experience</li>
            </ul>
            <h4>Upendo VIP includes all Pro features, plus:</h4>
            <ul>
              <li>Monthly Profile Boost</li>
              <li>Incognito Mode</li>
              <li>Read Receipts in Chat</li>
              <li>Exclusive VIP Profile Badge</li>
            </ul>
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

export default TermsOfServicePage;