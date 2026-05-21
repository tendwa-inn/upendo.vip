import React from 'react';
import { Ghost, Swords, Flame } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface GameInviteMessageProps {
  type: 'invite' | 'accepted' | 'result';
  senderName?: string;
  myScore?: number;
  theirScore?: number;
  flaresEarned?: number;
  onAccept?: () => void;
  isSender: boolean;
}

const GameInviteMessage: React.FC<GameInviteMessageProps> = ({
  type, senderName, myScore, theirScore, flaresEarned, onAccept, isSender,
}) => {
  const { t } = useTranslation();

  if (type === 'invite') {
    return (
      <div className="mx-auto my-2 max-w-[280px]">
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Ghost className="w-5 h-5 text-purple-400" />
            <Swords className="w-5 h-5 text-pink-400" />
            <Ghost className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-white font-bold text-sm mb-1">
            {isSender ? t('game.inviteSent') : t('game.challengeFrom', { name: senderName })}
          </p>
          <p className="text-white/50 text-xs mb-3">
            {t('game.rounds')}
          </p>
          {!isSender && onAccept && (
            <button
              onClick={onAccept}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold text-sm hover:from-purple-400 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/25"
            >
              {t('game.accept')}
            </button>
          )}
          {isSender && (
            <div className="text-white/30 text-xs">{t('game.waiting')}</div>
          )}
        </div>
      </div>
    );
  }

  if (type === 'result') {
    const won = (myScore || 0) > (theirScore || 0);
    return (
      <div className="mx-auto my-2 max-w-[280px]">
        <div className={`bg-gradient-to-br ${won ? 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30' : 'from-gray-500/20 to-gray-600/20 border-gray-500/30'} border rounded-2xl p-4 text-center`}>
          <div className="text-3xl mb-2">{won ? <Trophy /> : <Ghost className="w-8 h-8 mx-auto text-gray-400" />}</div>
          <p className="text-white font-bold text-sm mb-1">
            {won ? t('game.victory') : t('game.goodGame')}
          </p>
          <p className="text-white/60 text-lg font-black mb-1">
            {myScore} - {theirScore}
          </p>
          {flaresEarned && flaresEarned > 0 && (
            <div className="flex items-center justify-center gap-1 mt-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 font-bold text-sm">{t('game.flaresEarned', { count: flaresEarned })}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

// Need Trophy icon for result
const Trophy: React.FC = () => (
  <svg className="w-8 h-8 mx-auto text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C9.38 2 7.25 4.13 7.25 6.75c0 .96.29 1.86.79 2.6L5.5 12H2v3c0 1.1.9 2 2 2h2.5c0 1.66 1.34 3 3 3h5c1.66 0 3-1.34 3-3H20c1.1 0 2-.9 2-2v-3h-3.5l-2.54-2.65c.5-.74.79-1.64.79-2.6C16.75 4.13 14.62 2 12 2zm-3 15c0 .55.45 1 1 1h4c.55 0 1-.45 1-1s-.45-1-1-1h-4c-.55 0-1 .45-1 1zm3-10c1.38 0 2.5 1.12 2.5 2.5S13.38 12 12 12s-2.5-1.12-2.5-2.5S10.62 7 12 7z" />
  </svg>
);

export default GameInviteMessage;
