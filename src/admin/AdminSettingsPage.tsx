import React, { useState, useEffect } from 'react';
import { Switch } from '@tremor/react';
import { adminSettingsService, AppSettings } from '../services/adminSettingsService';
import toast from 'react-hot-toast';
import { useAppSettingsStore } from '../stores/appSettingsStore';
import EditableCell from '../components/EditableCell';
import { Settings, Save, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdminSettingsPage: React.FC = () => {
  const { settings, getSettings, setSettings } = useAppSettingsStore();
  const { t } = useTranslation();
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try { await getSettings(); }
      catch { toast.error(t('admin.settings.loadFailed')); }
      finally { setLoading(false); }
    };
    loadSettings();
  }, [getSettings]);

  const handleSettingChange = (settingId: number, feature: keyof AppSettings, value: any) => {
    setSettings(settings.map(s => s.id === settingId ? { ...s, [feature]: value } : s));
    setIsDirty(true);
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      await Promise.all(settings.map(s => adminSettingsService.updateAppSettings(s)));
      toast.success(t('admin.settings.saved'));
      await getSettings();
      setIsDirty(false);
    } catch { toast.error(t('admin.settings.saveFailed')); }
    finally { setLoading(false); }
  };

  const features = ['swipes_per_day', 'rewind_count', 'visibility_rate', 'message_requests', 'profile_views', 'daily_vibe_changes', 'connection_limit', 'connection_requests', 'ghost_mode', 'read_receipts'];
  const tiers = ['free', 'pro', 'vip'];
  const tierColors = { free: 'text-gray-400', pro: 'text-blue-400', vip: 'text-amber-400' };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="mb-8">
          <div className="h-8 w-48 bg-white/10 rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-white/5 rounded mt-2 animate-pulse" />
        </div>
        <div className="rounded-2xl bg-white/5 border border-white/10 h-96 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">{t('admin.settings.title')}</h1>
        <p className="text-gray-400 mt-1 text-sm">{t('admin.settings.desc')}</p>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">{t('admin.settings.feature')}</th>
                {tiers.map(t => (
                  <th key={t} className={`text-left text-xs font-medium uppercase tracking-wider px-6 py-4 ${tierColors[t as keyof typeof tierColors]}`}>{t}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {features.map(feature => (
                <tr key={feature} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-3 text-sm text-white font-medium">
                    {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </td>
                  {tiers.map(tier => {
                    const setting = settings.find(s => s.account_type === tier);
                    if (!setting) return <td key={tier} className="px-6 py-3 text-gray-500">-</td>;
                    const value = setting[feature as keyof AppSettings];
                    const displayValue = feature === 'daily_vibe_changes' && (value === undefined || value === null)
                      ? (tier === 'free' ? 1 : tier === 'pro' ? 5 : 10) : value;
                    return (
                      <td key={`${feature}-${tier}`} className="px-6 py-3">
                        <EditableCell value={displayValue as number | boolean} onChange={v => handleSettingChange(setting.id, feature as keyof AppSettings, v)} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sticky Save Bar */}
      {isDirty && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-xl border-t border-white/10 px-6 py-3 flex justify-end gap-3">
          <button onClick={() => { getSettings(); setIsDirty(false); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 transition-colors">
            <X size={16} /> {t('admin.settings.cancel')}
          </button>
          <button onClick={handleSaveChanges} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg shadow-pink-500/25">
            <Save size={16} /> {t('admin.settings.save')}
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminSettingsPage;
