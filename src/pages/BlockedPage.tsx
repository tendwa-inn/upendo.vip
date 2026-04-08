import React from 'react';

const BlockedPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-500 mb-4">Account Blocked</h1>
        <p className="text-lg">Your account has been blocked. Unable to login.</p>
      </div>
    </div>
  );
};

export default BlockedPage;
