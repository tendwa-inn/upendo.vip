import React from 'react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen p-4 pb-28 bg-gradient-to-b from-[#22090E] to-[#2E0C13] text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Admin Dashboard</h1>
        <p>Welcome to the Admin Dashboard!</p>
        {/* Admin content will go here */}
      </div>
    </div>
  );
};

export default AdminDashboard;
