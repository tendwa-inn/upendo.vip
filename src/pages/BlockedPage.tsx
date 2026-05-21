import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const BlockedPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white p-4">
      <div className="text-center max-w-lg mx-auto">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-red-500 mb-4">{t('blocked.title')}</h1>
        <p className="text-lg text-gray-300 mb-6">
          {t('blocked.message')}
        </p>
        <div className="space-y-4">
          <p className="text-gray-400">
            {t('blocked.guidelines')}
          </p>
          <p className="text-gray-400">
            {t('blocked.appeal')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BlockedPage;
