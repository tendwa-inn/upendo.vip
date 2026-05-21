import React, { useState } from 'react';
import { systemMessengerService } from '../services/systemMessengerService';
import { supabase } from '../lib/supabaseClient';

const SystemMessageTest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>('');
  const [title, setTitle] = useState('Test System Message');
  const [message, setMessage] = useState('This is a test system message with push notification');
  const [target, setTarget] = useState('all');
  const [specificUserId, setSpecificUserId] = useState('');

  const sendSystemMessage = async () => {
    setLoading(true);
    setTestResult('');

    try {
      const systemMessage = {
        title,
        message,
        type: 'test',
        target: target === 'specific' ? specificUserId : target,
        photo_url: '/icons/pink_ghost_icon.png',
      };

      await systemMessengerService.sendSystemMessage(systemMessage);
      setTestResult('System message sent successfully! Push notifications will be sent to users.');
    } catch (error) {
      console.error('System message test failed:', error);
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const sendTestToSelf = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setTestResult('Please log in first');
        return;
      }

      setLoading(true);
      const systemMessage = {
        title: 'Test Message to Yourself',
        message: 'This is a test system message sent only to you',
        type: 'personal_test',
        target: user.id,
        photo_url: '/icons/pink_ghost_icon.png',
      };

      await systemMessengerService.sendSystemMessage(systemMessage);
      setTestResult('Personal test message sent successfully!');
    } catch (error) {
      console.error('Personal test failed:', error);
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">System Message Testing</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="Enter message title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            rows={3}
            placeholder="Enter message content"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="all">All Users</option>
            <option value="specific">Specific User</option>
          </select>
        </div>

        {target === 'specific' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
            <input
              type="text"
              value={specificUserId}
              onChange={(e) => setSpecificUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Enter specific user ID"
            />
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={sendSystemMessage}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Send System Message
          </button>
          <button
            onClick={sendTestToSelf}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Send to Myself
          </button>
        </div>
      </div>

      {testResult && (
        <div className="mt-4 p-3 bg-gray-100 rounded border">
          <p className="text-sm font-medium">Result:</p>
          <p className="text-sm text-gray-700">{testResult}</p>
        </div>
      )}

      {loading && (
        <div className="mt-4 p-3 bg-blue-100 rounded border">
          <p className="text-sm text-blue-700">Sending system message...</p>
        </div>
      )}
    </div>
  );
};

export default SystemMessageTest;