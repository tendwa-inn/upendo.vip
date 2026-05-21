import React, { useState, useEffect } from 'react';
import { Switch } from '@tremor/react';
import { promoService } from '../services/promoService';
import { PromoCode } from '../types/admin';
import { ALL_THEMES, THEME_MAP } from '../styles/theme';
import { Plus, Trash2, X, Ticket, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import { useTranslation } from 'react-i18next';

const AdminPromosPage: React.FC = () => {
  const { t } = useTranslation();
  const [activePromos, setActivePromos] = useState<PromoCode[]>([]);
  const [expiredPromos, setExpiredPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; promo: PromoCode | null }>({ isOpen: false, promo: null });
  const [activeTab, setActiveTab] = useState<'active' | 'expired'>('active');
  const [newPromo, setNewPromo] = useState<any>({ type: 'message_requests', durationDays: null });

  useEffect(() => { loadPromos(); }, []);

  const loadPromos = async () => {
    try {
      setLoading(true);
      const { active, expired } = await promoService.getPromoCodes();
      setActivePromos(active);
      setExpiredPromos(expired);
    } catch { toast.error(t('admin.promos.loadFailed')); }
    finally { setLoading(false); }
  };

  const handleCreatePromo = async () => {
    try {
      if (!newPromo.code) newPromo.code = Math.random().toString(36).substring(2, 10).toUpperCase();
      await promoService.createPromoCode({ ...newPromo, durationDays: newPromo.durationDays || 30 });
      toast.success(t('admin.promos.created'));
      setShowModal(false);
      setNewPromo({ type: 'message_requests', maxUses: 100, durationDays: null, effect: {} });
      loadPromos();
    } catch (e: any) { toast.error(`Failed: ${e?.message || 'Unknown error'}`); }
  };

  const formatPromoType = (promo: PromoCode) => {
    if (promo.type === 'theme') {
      const themeId = promo.effect?.theme_id;
      return themeId ? `Theme: ${THEME_MAP[themeId]?.name || themeId}` : 'Theme';
    }
    return promo.type.replace(/_/g, ' ');
  };

  const currentList = activeTab === 'active' ? activePromos : expiredPromos;
  const inputClasses = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all";

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">Promo Codes</h1>
          <p className="text-gray-400 mt-1 text-sm">{activePromos.length} active, {expiredPromos.length} expired</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium shadow-lg shadow-pink-500/25 transition-all duration-300">
          <Plus size={18} /> Add Promo
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('active')} className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${activeTab === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'}`}>
          Active ({activePromos.length})
        </button>
        <button onClick={() => setActiveTab('expired')} className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${activeTab === 'expired' ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'}`}>
          Expired ({expiredPromos.length})
        </button>
      </div>

      {/* Table */}
      <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Code</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Type</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Uses</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Expires</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {currentList.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center"><Ticket size={40} className="mx-auto mb-3 text-gray-600" /><p className="text-gray-500">No {activeTab} promos</p></td></tr>
              ) : currentList.map(promo => (
                <tr key={promo.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-3"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">{promo.code}</span></td>
                  <td className="px-6 py-3 text-sm text-gray-300">{formatPromoType(promo)}</td>
                  <td className="px-6 py-3 text-sm text-gray-300">{promo.timesUsed} / {promo.maxUses ?? '∞'}</td>
                  <td className="px-6 py-3 text-sm text-gray-300">{promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString() : 'No expiry'}</td>
                  <td className="px-6 py-3">
                    <button onClick={() => setDeleteModal({ isOpen: true, promo })} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors">
                      <Trash2 size={12} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Create Promo Code</h3>
                <p className="text-sm text-gray-400">Set up a new promotional code</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-white/10 text-gray-400"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-sm text-gray-400 mb-1.5">Name</label><input placeholder="Promo name" className={inputClasses} onChange={e => setNewPromo(p => ({ ...p, name: e.target.value }))} /></div>
              <div><label className="block text-sm text-gray-400 mb-1.5">Description</label><input placeholder="Description" className={inputClasses} onChange={e => setNewPromo(p => ({ ...p, description: e.target.value }))} /></div>
              <div className="flex gap-2">
                <div className="flex-1"><label className="block text-sm text-gray-400 mb-1.5">Code</label><input placeholder="Auto-generate" value={newPromo.code || ''} className={inputClasses} onChange={e => setNewPromo(p => ({ ...p, code: e.target.value }))} /></div>
                <button onClick={() => setNewPromo(p => ({ ...p, code: Math.random().toString(36).substring(2, 10).toUpperCase() }))} className="self-end px-4 py-3 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 text-sm transition-colors">Generate</button>
              </div>
              <div><label className="block text-sm text-gray-400 mb-1.5">Type</label>
                <select className={inputClasses} value={newPromo.type} onChange={e => setNewPromo(p => ({ ...p, type: e.target.value }))}>
                  <option value="message_requests">Message Requests</option>
                  <option value="popularity_boost">Popularity Boost</option>
                  <option value="pro_account">Pro Account</option>
                  <option value="vip_account">VIP Account</option>
                  <option value="unlimited_swipes">Unlimited Swipes</option>
                  <option value="limited_swipes">Limited Swipes</option>
                  <option value="profile_views">Profile Views</option>
                  <option value="theme">Theme</option>
                  <option value="flares">Flares</option>
                </select>
              </div>
              <div><label className="block text-sm text-gray-400 mb-1.5">Duration</label>
                <select className={inputClasses} value={newPromo.durationDays || ''} onChange={e => setNewPromo(p => ({ ...p, durationDays: parseInt(e.target.value) }))}>
                  <option value="">Select duration</option>
                  <option value="0.0417">1 Hour</option>
                  <option value="1">1 Day</option>
                  <option value="7">1 Week</option>
                  <option value="14">2 Weeks</option>
                  <option value="30">1 Month</option>
                  <option value="365">1 Year</option>
                </select>
              </div>
              {newPromo.type === 'limited_swipes' && (
                <div><label className="block text-sm text-gray-400 mb-1.5">Bonus Swipes</label><input type="number" min={1} placeholder="e.g. 40" className={inputClasses} onChange={e => setNewPromo(p => ({ ...p, effect: { ...p.effect, swipe_count: parseInt(e.target.value) || 0 } }))} /></div>
              )}
              {newPromo.type === 'message_requests' && (
                <div><label className="block text-sm text-gray-400 mb-1.5">Extra Requests</label><input type="number" min={1} placeholder="e.g. 10" className={inputClasses} onChange={e => setNewPromo(p => ({ ...p, effect: { ...p.effect, request_count: parseInt(e.target.value) || 0 } }))} /></div>
              )}
              {newPromo.type === 'popularity_boost' && (
                <div><label className="block text-sm text-gray-400 mb-1.5">Boost Amount</label><input type="number" min={1} placeholder="e.g. 50" className={inputClasses} onChange={e => setNewPromo(p => ({ ...p, effect: { ...p.effect, boost_amount: parseInt(e.target.value) || 0 } }))} /></div>
              )}
              {newPromo.type === 'theme' && (
                <div><label className="block text-sm text-gray-400 mb-1.5">Theme</label>
                  <select className={inputClasses} onChange={e => setNewPromo(p => ({ ...p, effect: { ...p.effect, theme_id: e.target.value } }))}>
                    <option value="">Select theme</option>
                    {ALL_THEMES.map(t => <option key={t.id} value={t.id}>{t.name} ({t.tier.toUpperCase()})</option>)}
                  </select>
                </div>
              )}
              {newPromo.type === 'flares' && (
                <div><label className="block text-sm text-gray-400 mb-1.5">Flare Amount</label><input type="number" min={1} placeholder="e.g. 100" className={inputClasses} onChange={e => setNewPromo(p => ({ ...p, effect: { ...p.effect, flare_amount: parseInt(e.target.value) || 0 } }))} /></div>
              )}
            </div>
            <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 transition-colors">Cancel</button>
              <button onClick={handleCreatePromo} className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg shadow-pink-500/25">Create Promo</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ isOpen: false, promo: null })} onConfirm={async () => { if (deleteModal.promo) { await promoService.deletePromoCode(deleteModal.promo.id); toast.success('Promo deleted'); setDeleteModal({ isOpen: false, promo: null }); loadPromos(); } }} title="Delete Promo" message={`Delete promo code ${deleteModal.promo?.code}? Users will be reverted.`} confirmText="Delete" type="danger" />
    </div>
  );
};

export default AdminPromosPage;
