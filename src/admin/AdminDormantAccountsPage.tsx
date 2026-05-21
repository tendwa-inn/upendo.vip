import React, { useState, useEffect } from 'react';
import { profileService } from '../services/profileService';
import { Trash, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface DormantUser {
  id: string;
  name: string;
  deactivated_at: string;
  photos: string[];
}

const AdminDormantAccountsPage: React.FC = () => {
  const { t } = useTranslation();
  const [dormantUsers, setDormantUsers] = useState<DormantUser[]>([]);
  const [scheduledForDeletion, setScheduledForDeletion] = useState<DormantUser[]>([]);
  const [activeTab, setActiveTab] = useState<'deactivated' | 'deletion'>('deactivated');

  useEffect(() => { fetchDormantUsers(); }, []);

  const fetchDormantUsers = async () => {
    const allDormantUsers = await profileService.getDormantProfiles();
    if (allDormantUsers) {
      setDormantUsers(allDormantUsers);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      setScheduledForDeletion(allDormantUsers.filter(user => new Date(user.deactivated_at) < thirtyDaysAgo));
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm(t('admin.dormant.deleteConfirm'))) {
      const success = await profileService.deleteProfile(userId);
      if (success) {
        toast.success(t('admin.dormant.userDeleted'));
        fetchDormantUsers();
      }
    }
  };

  const currentList = activeTab === 'deactivated' ? dormantUsers : scheduledForDeletion;

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
          {t('admin.dormant.title')}
        </h1>
        <p className="text-gray-400 mt-1 text-sm">{t('admin.dormant.desc')}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('deactivated')}
          className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${activeTab === 'deactivated' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'}`}
        >
          {t('admin.dormant.deactivated')} ({dormantUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('deletion')}
          className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${activeTab === 'deletion' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'}`}
        >
          {t('admin.dormant.scheduled')} ({scheduledForDeletion.length})
        </button>
      </div>

      {/* Table */}
      <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">{t('admin.dormant.profile')}</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">{t('admin.dormant.name')}</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">{t('admin.dormant.deactivatedAt')}</th>
                {activeTab === 'deletion' && <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">{t('admin.dormant.actions')}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {currentList.length === 0 ? (
                <tr><td colSpan={activeTab === 'deletion' ? 4 : 3} className="px-6 py-12 text-center text-gray-500">
                  <UserX size={40} className="mx-auto mb-3 text-gray-600" />
                  {t('admin.dormant.noAccounts')}
                </td></tr>
              ) : currentList.map(user => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-3">
                    <img src={user.photos[0] || '/logo-splash.png'} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                  </td>
                  <td className="px-6 py-3 text-sm text-white font-medium">{user.name}</td>
                  <td className="px-6 py-3 text-sm text-gray-300">{new Date(user.deactivated_at).toLocaleString()}</td>
                  {activeTab === 'deletion' && (
                    <td className="px-6 py-3">
                      <button onClick={() => handleDelete(user.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors">
                        <Trash size={12} /> {t('admin.dormant.delete')}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDormantAccountsPage;
