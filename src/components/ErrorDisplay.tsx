import React from 'react';
import { useTranslation } from 'react-i18next';

interface ErrorDisplayProps {
  message: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center h-screen bg-red-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-700">{t('error.occurred')}</h1>
        <p className="text-red-600">{message}</p>
      </div>
    </div>
  );
};

export default ErrorDisplay;
