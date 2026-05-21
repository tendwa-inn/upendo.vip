import React, { useState, useEffect } from 'react';
import { Trash, UserX, Users, Search } from 'lucide-react';
import { profileService } from '../services/profileService';
import { useTranslation } from 'react-i18next';

interface User {
  id: string;
  name: string;
  dob: string;
  photos: string[];
  account_type: 'free' | 'pro' | 'vip';
  is_blocked: boolean;
}

const AdminUsersPage: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [paginatedUsers, setPaginatedUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [accountTypes, setAccountTypes] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    let newFilteredUsers = users;
    if (searchTerm) {
      newFilteredUsers = newFilteredUsers.filter(user => user.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (accountTypes.length > 0) {
      newFilteredUsers = newFilteredUsers.filter(user => user.account_type && accountTypes.includes(user.account_type));
    }
    setFilteredUsers(newFilteredUsers);
    setCurrentPage(1);
  }, [users, searchTerm, accountTypes]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    setPaginatedUsers(filteredUsers.slice(startIndex, startIndex + itemsPerPage));
  }, [filteredUsers, currentPage]);

  const fetchUsers = async () => {
    const allUsers = await profileService.getAllProfiles();
    setUsers(allUsers || []);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm(t('admin.users.deleteConfirm'))) {
      await profileService.deleteProfile(userId);
      fetchUsers();
    }
  };

  const handleBlockUser = async (userId: string) => {
    await profileService.blockProfile(userId);
    fetchUsers();
  };

  const handleUnblockUser = async (userId: string) => {
    await profileService.unblockProfile(userId);
    fetchUsers();
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const tierBadge = (tier: string) => {
    const styles = { free: 'bg-gray-500/10 text-gray-400 border-gray-500/20', pro: 'bg-blue-500/10 text-blue-400 border-blue-500/20', vip: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    return styles[tier as keyof typeof styles] || styles.free;
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
          User Management
        </h1>
        <p className="text-gray-400 mt-1 text-sm">{filteredUsers.length} users found</p>
      </div>

      {/* Filters */}
      <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder={t('admin.users.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {['free', 'pro', 'vip'].map(tier => (
              <button
                key={tier}
                type="button"
                onClick={() => setAccountTypes(prev => prev.includes(tier) ? prev.filter(t => t !== tier) : [...prev, tier])}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${accountTypes.includes(tier) ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'}`}
              >
                {tier.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Profile</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Name</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Age</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Tier</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedUsers.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No users found</td></tr>
              ) : paginatedUsers.map(user => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-3">
                    <img src={user.photos[0] || '/logo-splash.png'} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                  </td>
                  <td className="px-6 py-3 text-sm text-white font-medium">{user.name}</td>
                  <td className="px-6 py-3 text-sm text-gray-300">{calculateAge(user.dob)}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${tierBadge(user.account_type || 'free')}`}>
                      {(user.account_type || 'free').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex gap-2">
                      {user.is_blocked ? (
                        <button onClick={() => handleUnblockUser(user.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
                          Unblock
                        </button>
                      ) : (
                        <button onClick={() => handleBlockUser(user.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors">
                          <UserX size={12} /> Block
                        </button>
                      )}
                      <button onClick={() => handleDeleteUser(user.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors">
                        <Trash size={12} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-white/10">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg text-sm bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-400">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg text-sm bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
