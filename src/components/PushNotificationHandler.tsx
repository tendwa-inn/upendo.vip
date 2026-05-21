import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OneSignal from 'react-onesignal';
import { useNotificationStore } from '../stores/notificationStore';
import { useAuthStore } from '../stores/authStore';

interface PushNotificationHandlerProps {
  children: React.ReactNode;
}

const PushNotificationHandler: React.FC<PushNotificationHandlerProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (!user) return;

    const handleNotificationClick = (event: any) => {
      try {
        const notificationData = event?.notification?.data || event?.data;
        
        if (notificationData) {
          const { action, notificationType, actorId, notificationId } = notificationData;
          
          // Handle different notification actions
          switch (action) {
            case 'open_chat':
              if (actorId) {
                navigate(`/chat/${actorId}`);
              }
              break;
            case 'open_user_profile':
              if (actorId) {
                navigate(`/user/${actorId}`);
              }
              break;
            case 'open_notifications':
              navigate('/notifications');
              break;
            case 'open_profile':
              navigate('/profile');
              break;
            case 'open_swipe':
              navigate('/swipe');
              break;
            default:
              // Default action based on notification type
              switch (notificationType) {
                case 'new-like':
                case 'profile-view':
                  if (actorId) {
                    navigate(`/user/${actorId}`);
                  }
                  break;
                case 'new-message':
                case 'message-request':
                  if (actorId) {
                    navigate(`/chat/${actorId}`);
                  }
                  break;
                case 'match':
                  if (actorId) {
                    navigate(`/chat/${actorId}`);
                  }
                  break;
                case 'system-message':
                case 'account-issue':
                case 'report-feedback':
                  navigate('/notifications');
                  break;
                case 'swipe-refresh':
                  navigate('/swipe');
                  break;
                case 'promo-redemption':
                  navigate('/profile');
                  break;
                default:
                  navigate('/notifications');
              }
          }
        }
      } catch (error) {
        console.error('Error handling push notification click:', error);
        // Fallback to notifications page
        navigate('/notifications');
      }
    };

    // Set up OneSignal event listeners
    const setupOneSignalListeners = async () => {
      try {
        // Handle notification clicks when app is open
        OneSignal.Notifications.addEventListener('click', handleNotificationClick);

        // Handle notification foreground display
        OneSignal.Notifications.addEventListener('foregroundWillDisplay', () => {
          // You can customize the display behavior here if needed
        });
      } catch (error) {
        console.error('Error setting up OneSignal listeners:', error);
      }
    };

    setupOneSignalListeners();

    // Cleanup function
    return () => {
      try {
        OneSignal.Notifications.removeEventListener('click', handleNotificationClick);
      } catch (error) {
        console.error('Error removing OneSignal listeners:', error);
      }
    };
  }, [navigate, user]);

  return <>{children}</>;
};

export default PushNotificationHandler;