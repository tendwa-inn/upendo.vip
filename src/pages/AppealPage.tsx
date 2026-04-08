import React, { useState } from 'react';
import { Card, Title, Button, Textarea } from '@tremor/react';
import { useAuthStore } from '../stores/authStore';
import { wordFilterService } from '../services/wordFilterService';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

const AppealPage: React.FC = () => {
  const { profile } = useAuthStore();
  const [appealReason, setAppealReason] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const actionId = new URLSearchParams(location.search).get('actionId');

  const handleSubmitAppeal = async () => {
    if (!appealReason.trim()) {
      toast.error('Please provide a reason for your appeal.');
      return;
    }
    if (!actionId) {
      toast.error('Invalid action ID.');
      return;
    }

    setLoading(true);
    try {
      await wordFilterService.submitAppeal(parseInt(actionId), appealReason);
      toast.success('Your appeal has been submitted and will be reviewed.');
      // Optionally, you can redirect the user or update the UI
    } catch (error) {
      toast.error('Failed to submit your appeal. Please try again.');
      console.error('Error submitting appeal:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <Title>Submit an Appeal</Title>
        <p className="mt-2 text-tremor-content">
          Your account has been suspended. If you believe this was a mistake, please submit an appeal for review.
        </p>
        <Textarea
          value={appealReason}
          onChange={(e) => setAppealReason(e.target.value)}
          placeholder="Explain why you believe your account should be reinstated..."
          className="mt-6"
          rows={6}
        />
        <Button onClick={handleSubmitAppeal} loading={loading} className="mt-6 w-full">
          Submit Appeal
        </Button>
      </Card>
    </div>
  );
};

export default AppealPage;
