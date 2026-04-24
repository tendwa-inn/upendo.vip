import React, { useState } from 'react';
import { Button } from '@tremor/react';
import Portal from '../Portal';
import { X, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';

interface ReportUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, details: string) => void;
}

const reportReasonKeys = [
  'report.reasons.inappropriatePhoto',
  'report.reasons.spamScam',
  'report.reasons.underage',
  'report.reasons.fakeProfile',
  'report.reasons.harassment',
  'report.reasons.other',
];

const ReportUserModal: React.FC<ReportUserModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');

  const isVip = profile?.account_type === 'vip';
  const isPro = profile?.account_type === 'pro';

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (reason) {
      onSubmit(reason, details);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className={`bg-gradient-to-br ${isVip ? 'from-black to-[#0b0b0b] border-amber-400/30' : isPro ? 'from-[#071521] to-[#0b2237] border-cyan-400/30' : 'from-[#1a0f14] to-[#2E0C13] border-pink-500/30'} rounded-2xl w-full max-w-md p-6 text-white border relative shadow-2xl`}>
          {/* Glow Effect */}
          <div className={`absolute inset-0 rounded-2xl blur-xl ${
            isVip ? 'bg-gradient-to-r from-amber-400/10 to-yellow-500/10' : isPro ? 'bg-gradient-to-r from-cyan-400/10 to-blue-500/10' : 'bg-gradient-to-r from-pink-500/10 to-purple-500/10'
          }`}></div>

          <div className="flex justify-between items-center mb-6 relative z-10">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h2 className="text-2xl font-bold text-white">{t('report.title')}</h2>
            </div>
            <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200 hover:scale-110">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6 relative z-10">
            <p className="text-gray-400 text-sm">{t('report.safetyNote')}</p>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">{t('report.reasonLabel')}</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={`w-full p-3 bg-white/5 rounded-md border border-white/10 focus:ring-2 outline-none transition-all duration-300 ${
                  isVip ? 'focus:ring-amber-400' : isPro ? 'focus:ring-cyan-400' : 'focus:ring-pink-500'
                }`}
              >
                <option value="" disabled>{t('report.selectReasonPlaceholder')}</option>
                {reportReasonKeys.map(key => {
                  const label = t(key);
                  return <option key={key} value={label} className="bg-gray-800 text-white">{label}</option>;
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">{t('report.detailsLabel')}</label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder={t('report.detailsPlaceholder')}
                className={`w-full p-3 bg-white/5 rounded-md border border-white/10 h-28 resize-none focus:ring-2 outline-none transition-all duration-300 ${
                  isVip ? 'focus:ring-amber-400' : isPro ? 'focus:ring-cyan-400' : 'focus:ring-pink-500'
                }`}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8 relative z-10">
            <Button
              onClick={onClose}
              variant="light"
              color="gray"
              className="hover:bg-white/10 transition-all duration-200 transform hover:scale-105 bg-gray-700/50 border border-gray-600/50 text-gray-300 hover:text-white"
            >
              {t('report.cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!reason}
              color="red"
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-none transition-all duration-200 transform hover:scale-105 shadow-lg shadow-red-500/25"
            >
              {t('report.submit')}
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default ReportUserModal;
