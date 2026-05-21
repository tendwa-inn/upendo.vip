import { useNetworkStore } from '../../stores/networkStore';
import { WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const OfflineNotifier = () => {
  const { isOnline } = useNetworkStore();
  const { t } = useTranslation();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white p-2 text-center text-sm z-50 flex items-center justify-center">
      <WifiOff className="w-4 h-4 mr-2" />
      {t('offline.message')}
    </div>
  );
};

export default OfflineNotifier;
