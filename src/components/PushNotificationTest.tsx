import React, { useState } from 'react';
import { onesignalService } from '../services/onesignalService';
import { notificationService } from '../services/notificationService';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabaseClient';

const PushNotificationTest: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>('');

  const testPushNotification = async (type: string) => {
    if (!user) {
      setTestResult('User not logged in');
      return;
    }

    setLoading(true);
    setTestResult('');

    try {
      switch (type) {
        case 'like':
          await onesignalService.sendLikeNotification(user.id, 'Test User');
          setTestResult('Like push notification sent successfully!');
          break;
        case 'view':
          await onesignalService.sendViewNotification(user.id, 'Test User');
          setTestResult('View push notification sent successfully!');
          break;
        case 'match':
          await onesignalService.sendMatchNotification(user.id, 'Test Match');
          setTestResult('Match push notification sent successfully!');
          break;
        case 'message':
          await onesignalService.sendMessageNotification(user.id, 'Test Sender', 'This is a test message');
          setTestResult('Message push notification sent successfully!');
          break;
        case 'system':
          await onesignalService.sendSystemNotification(user.id, 'Test System Message', 'This is a system test notification');
          setTestResult('System push notification sent successfully!');
          break;
        case 'account':
          await onesignalService.sendAccountNotification(user.id, 'Account Update', 'Your account has been updated');
          setTestResult('Account push notification sent successfully!');
          break;
        case 'promo':
          await onesignalService.sendPromoNotification(user.id, 'Promo Code!', 'You have a new promo code: TEST123');
          setTestResult('Promo push notification sent successfully!');
          break;
        case 'swipe':
          await onesignalService.sendSwipeRefreshNotification(user.id);
          setTestResult('Swipe refresh push notification sent successfully!');
          break;
        case 'report':
          await onesignalService.sendReportFeedbackNotification(user.id, 'Resolved', 'inappropriate_content');
          setTestResult('Report feedback push notification sent successfully!');
          break;
        case 'db_notification':
          // Test database notification with push
          await notificationService.createNotification({
            user_id: user.id,
            actor_id: user.id,
            type: 'new-like',
            message: 'Someone liked your profile!',
            title: 'New Like!',
            target: 'user',
          });
          setTestResult('Database notification with push sent successfully!');
          break;
        case 'system_message':
          // Test system message with push
          await notificationService.sendSystemMessage(user.id, 'Test System Message', 'This is a test system message with push notification');
          setTestResult('System message with push sent successfully!');
          break;
        default:
          setTestResult('Unknown test type');
      }
    } catch (error) {
      console.error('Push notification test failed:', error);
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const checkPermissionStatus = async () => {
    try {
      if ('Notification' in window) {
        const permission = Notification.permission;
        setTestResult(`Notification permission: ${permission}`);
      } else {
        setTestResult('Notifications not supported in this browser');
      }
    } catch (error) {
      setTestResult(`Error checking permission: ${error}`);
    }
  };

  const requestPermission = async () => {
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        setTestResult(`Permission requested: ${permission}`);
      } else {
        setTestResult('Notifications not supported in this browser');
      }
    } catch (error) {
      setTestResult(`Error requesting permission: ${error}`);
    }
  };

  if (!user) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 rounded-lg">
        <p className="text-red-700">Please log in to test push notifications</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Push Notification Testing</h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">User ID: {user.id}</p>
        <div className="flex gap-2 mb-2">
          <button
            onClick={checkPermissionStatus}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Check Permission
          </button>
          <button
            onClick={requestPermission}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
          >
            Request Permission
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => testPushNotification('like')}
          disabled={loading}
          className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 disabled:opacity-50"
        >
          Test Like
        </button>
        <button
          onClick={() => testPushNotification('view')}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test View
        </button>
        <button
          onClick={() => testPushNotification('match')}
          disabled={loading}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
        >
          Test Match
        </button>
        <button
          onClick={() => testPushNotification('message')}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Message
        </button>
        <button
          onClick={() => testPushNotification('system')}
          disabled={loading}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
        >
          Test System
        </button>
        <button
          onClick={() => testPushNotification('account')}
          disabled={loading}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          Test Account
        </button>
        <button
          onClick={() => testPushNotification('promo')}
          disabled={loading}
          className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50"
        >
          Test Promo
        </button>
        <button
          onClick={() => testPushNotification('swipe')}
          disabled={loading}
          className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 disabled:opacity-50"
        >
          Test Swipe
        </button>
      </div>

      <div className="mb-4">
        <button
          onClick={() => testPushNotification('db_notification')}
          disabled={loading}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 mr-2"
        >
          Test DB Notification
        </button>
        <button
          onClick={() => testPushNotification('system_message')}
          disabled={loading}
          className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50"
        >
          Test System Message
        </button>
      </div>

      {testResult && (
        <div className="mt-4 p-3 bg-gray-100 rounded border">
          <p className="text-sm font-medium">Result:</p>
          <p className="text-sm text-gray-700">{testResult}</p>
        </div>
      )}

      {loading && (
        <div className="mt-4 p-3 bg-blue-100 rounded border">
          <p className="text-sm text-blue-700">Sending notification...</p>
        </div>
      )}
    </div>
  );
};

export default PushNotificationTest;