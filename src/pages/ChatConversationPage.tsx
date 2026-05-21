import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMatchStore } from '../stores/matchStore.tsx';
import ChatConversation from '../components/chat/ChatConversation';
import { useTranslation } from 'react-i18next';

const ChatConversationPage: React.FC = () => {
  const { t } = useTranslation();
  const { matchId } = useParams<{ matchId: string }>();
  const { matches, newMatches, fetchMatches, selectMatch } = useMatchStore();
  const [isLoading, setIsLoading] = useState(false);
  const fetchAttemptedRef = useRef<string | null>(null);

  const selectedMatch = useMemo(() => {
    if (!matchId) return undefined;
    return [...newMatches, ...matches].find(m => m.id === matchId);
  }, [matchId, matches, newMatches]);

  useEffect(() => {
    if (selectedMatch) {
      selectMatch(selectedMatch);
    }
    return () => selectMatch(null);
  }, [selectedMatch, selectMatch]);

  useEffect(() => {
    if (!matchId) return;
    if (selectedMatch) return;
    if (fetchAttemptedRef.current === matchId) return;

    fetchAttemptedRef.current = matchId;
    setIsLoading(true);
    fetchMatches().finally(() => setIsLoading(false));
  }, [fetchMatches, matchId, selectedMatch]);

  if (!matchId) {
    return <div>{t('chat.matchNotFound')}</div>;
  }

  if (!selectedMatch) {
    return <div>{isLoading ? t('chat.loading') : t('chat.matchNotFound')}</div>;
  }

  return <ChatConversation match={selectedMatch} />;
};

export default ChatConversationPage;
