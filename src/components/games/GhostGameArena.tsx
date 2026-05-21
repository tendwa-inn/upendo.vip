import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ghost, Flame, Trophy, X, Zap, Star, Timer, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface GhostEntity {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  color: string;
  size: number;
  speed: number;
  opacity: number;
  rotation: number;
  glowIntensity: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: number;
  life: number;
  size: number;
}

interface MissFlash {
  id: number;
  x: number;
  y: number;
}

interface GhostGameArenaProps {
  matchId: string;
  myId: string;
  opponentName: string;
  isInviter: boolean; // true = I sent the invite, false = I accepted
  opponentLastScore?: number;
  showOpponentPlayed?: boolean;
  currentRound?: number;
  roundScores?: { my: number; opp: number }[];
  onStartPlaying?: () => void;
  onTurnEnd: (myScore: number, round: number) => void;
  onTurnEndComplete?: (round: number) => void;
  onGameEnd: (myScore: number, opponentScore: number, flaresEarned: number) => void;
  onCancel: () => void;
}

const NEON_COLORS = [
  '#ff00ff', '#00ffff', '#ffff00', '#ff0066',
  '#00ff00', '#ff6600', '#6600ff', '#00ff66',
];

const ROUND_DURATION = 60;
const TOTAL_ROUNDS = 3;

// Audio
let audioCtx: AudioContext | null = null;
const getAudioCtx = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
};

const playPopSound = (combo: number) => {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const baseFreq = 400 + Math.min(combo * 40, 800);
    // Main pop
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.05);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, now + 0.15);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
    // Sparkle harmonic
    if (combo > 3) {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.value = baseFreq * 2.5;
      gain2.gain.setValueAtTime(0.15, now + 0.02);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc2.connect(gain2).connect(ctx.destination);
      osc2.start(now + 0.02);
      osc2.stop(now + 0.13);
    }
  } catch {}
};

const playMissSound = () => {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.18);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  } catch {}
};

const playComboSound = (combo: number) => {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const notes = [523, 659, 784, 1047, 1319];
    notes.slice(0, Math.min(combo, 5)).forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.2, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.06 + 0.25);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.3);
    });
  } catch {}
};

const playTimerWarning = () => {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  } catch {}
};

const GhostGameArena: React.FC<GhostGameArenaProps> = ({
  matchId, myId, opponentName, isInviter, opponentLastScore = 0, showOpponentPlayed = false, currentRound: propCurrentRound, roundScores = [], onStartPlaying, onTurnEnd, onTurnEndComplete, onGameEnd, onCancel,
}) => {
  const { t } = useTranslation();
  // Game phases: waiting → playing → turnEnd → opponentPlayed → (next round) → finished
  const [phase, setPhase] = useState<'intro' | 'waiting' | 'playing' | 'turnEnd' | 'opponentPlayed' | 'finished'>(() => {
    if (roundScores.length >= 3) return 'finished';
    if (showOpponentPlayed) return 'opponentPlayed';
    if (isInviter) return 'waiting';
    return 'playing';
  });
  const [currentRound, setCurrentRound] = useState(propCurrentRound || 1);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [ghosts, setGhosts] = useState<GhostEntity[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [misses, setMisses] = useState<MissFlash[]>([]);
  const [engaged, setEngaged] = useState(false);
  const [screenShake, setScreenShake] = useState(0);
  const [roundResults, setRoundResults] = useState<{ my: number; opp: number }[]>([]);
  const [opponentRoundScore, setOpponentRoundScore] = useState(0);
  const [myTotalScore, setMyTotalScore] = useState(0);
  const [opponentTotalScore, setOpponentTotalScore] = useState(0);

  const ghostIdRef = useRef(0);
  const particleIdRef = useRef(0);
  const missIdRef = useRef(0);
  const moveTickRef = useRef<NodeJS.Timeout | null>(null);
  const spawnTickRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const comboTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef(0);
  const currentRoundRef = useRef(propCurrentRound || 1);

  // Spawn a ghost
  const spawnGhost = useCallback(() => {
    const color = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
    const isMobile = window.innerWidth < 640;
    const baseSize = isMobile ? 36 : 48;
    const size = baseSize + Math.random() * 24;
    const speed = 15 + Math.random() * 25;
    return {
      id: ++ghostIdRef.current,
      x: Math.random() * 80 + 10,
      y: Math.random() * 65 + 18,
      targetX: Math.random() * 80 + 10,
      targetY: Math.random() * 65 + 18,
      color,
      size,
      speed,
      opacity: 0.8 + Math.random() * 0.2,
      rotation: Math.random() * 20 - 10,
      glowIntensity: 12 + Math.random() * 8,
    };
  }, []);

  // Start playing
  const startPlaying = useCallback(() => {
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTimeLeft(ROUND_DURATION);
    setGhosts([]);
    setParticles([]);
    setMisses([]);
    setEngaged(false);
    setPhase('playing');
    const isMobile = window.innerWidth < 640;
    const initial = Array.from({ length: isMobile ? 3 : 5 }, () => spawnGhost());
    setGhosts(initial);
  }, [spawnGhost]);

  // Intro countdown
  useEffect(() => {
    if (phase !== 'intro') return;
    const t = setTimeout(() => {
      if (isInviter) setPhase('waiting');
      else startPlaying();
    }, 2000);
    return () => clearTimeout(t);
  }, [phase, isInviter, startPlaying]);

  // Opponent played — no auto-start, user clicks button to begin

  // Turn end — show score, then notify parent to advance
  useEffect(() => {
    if (phase !== 'turnEnd') return;
    const round = currentRoundRef.current;
    const t = setTimeout(() => {
      onTurnEndComplete?.(round);
    }, 2500);
    return () => clearTimeout(t);
  }, [phase, onTurnEndComplete]);

  // Round timer — only depends on phase, uses refs for score/round
  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 11 && prev > 1) playTimerWarning();
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setPhase('turnEnd');
          onTurnEnd(scoreRef.current, currentRoundRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  // Keep refs in sync
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { currentRoundRef.current = currentRound; }, [currentRound]);

  // Movement tick
  useEffect(() => {
    if (phase !== 'playing') return;
    moveTickRef.current = setInterval(() => {
      setGhosts(prev => prev.map(g => {
        const ease = Math.min(0.05, 1 / g.speed);
        const dx = g.targetX - g.x;
        const dy = g.targetY - g.y;
        let nx = g.x + dx * ease;
        let ny = g.y + dy * ease;
        let ntx = g.targetX;
        let nty = g.targetY;
        if (Math.abs(dx) < 2 && Math.abs(dy) < 2) {
          ntx = Math.random() * 80 + 10;
          nty = Math.random() * 65 + 18;
        }
        return { ...g, x: nx, y: ny, targetX: ntx, targetY: nty };
      }));
    }, 50);
    return () => { if (moveTickRef.current) clearInterval(moveTickRef.current); };
  }, [phase]);

  // Spawning tick — uses scoreRef to avoid re-creating interval on every click
  useEffect(() => {
    if (phase !== 'playing') return;
    const getSpawnRate = () => {
      const s = scoreRef.current;
      return s > 40 ? 800 : s > 20 ? 1200 : s > 10 ? 1600 : 2000;
    };
    const getMaxGhosts = () => {
      const s = scoreRef.current;
      return s > 40 ? 16 : s > 20 ? 12 : s > 10 ? 9 : 6;
    };
    spawnTickRef.current = setInterval(() => {
      const maxG = getMaxGhosts();
      setGhosts(prev => {
        let filtered = prev.filter(() => Math.random() > 0.04);
        if (filtered.length < maxG) filtered = [...filtered, spawnGhost()];
        return filtered.slice(-maxG);
      });
    }, getSpawnRate());
    return () => { if (spawnTickRef.current) clearInterval(spawnTickRef.current); };
  }, [phase, spawnGhost]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (moveTickRef.current) clearInterval(moveTickRef.current);
      if (spawnTickRef.current) clearInterval(spawnTickRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    };
  }, []);

  // Screen shake effect
  useEffect(() => {
    if (screenShake > 0) {
      const t = setTimeout(() => setScreenShake(0), 150);
      return () => clearTimeout(t);
    }
  }, [screenShake]);

  // Catch ghost
  const handleGhostClick = (e: React.MouseEvent, ghostId: number) => {
    e.stopPropagation();
    if (phase !== 'playing') return;
    if (!engaged) setEngaged(true);

    const ghost = ghosts.find(g => g.id === ghostId);
    if (!ghost) return;

    const newCombo = combo + 1;
    setCombo(newCombo);
    setMaxCombo(prev => Math.max(prev, newCombo));

    // Combo bonus scoring
    let points = 1;
    if (newCombo >= 100) points = 500;
    else if (newCombo >= 50) points = 100;
    else if (newCombo >= 15) points = 20;
    else if (newCombo >= 10) points = 10;
    setScore(s => s + points);
    setScreenShake(Math.min(newCombo, 5));

    playPopSound(newCombo);
    if (newCombo > 0 && newCombo % 5 === 0) playComboSound(Math.floor(newCombo / 5));

    // Reset combo timer
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    comboTimerRef.current = setTimeout(() => setCombo(0), 2000);

    // Particles — more on combo
    const particleCount = Math.min(6 + newCombo * 2, 20);
    const newParticles: Particle[] = Array.from({ length: particleCount }, () => ({
      id: ++particleIdRef.current,
      x: ghost.x,
      y: ghost.y,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8 - 3,
      color: Math.random() * 0xffffff,
      life: 1,
      size: 3 + Math.random() * 4,
    }));
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 800);

    // Remove ghost, spawn replacement
    setGhosts(prev => {
      const filtered = prev.filter(g => g.id !== ghostId);
      setTimeout(() => {
        setGhosts(p => [...p, spawnGhost()]);
      }, 80 + Math.random() * 150);
      return filtered;
    });
  };

  // Miss
  const handleMiss = (e: React.MouseEvent) => {
    if (phase !== 'playing' || !engaged) return;
    setCombo(0);
    setScore(s => Math.max(0, s - 1));
    playMissSound();

    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const miss: MissFlash = { id: ++missIdRef.current, x, y };
    setMisses(prev => [...prev, miss]);
    setTimeout(() => setMisses(prev => prev.filter(m => m.id !== miss.id)), 600);
  };

  const timePercent = (timeLeft / ROUND_DURATION) * 100;

  // === RENDER ===

  // Intro
  if (phase === 'intro') {
    return (
      <div className="fixed inset-0 z-[100] bg-[#05000a] flex items-center justify-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.6 }}>
          <div className="text-center">
            <Ghost className="w-20 h-20 mx-auto text-purple-400 drop-shadow-[0_0_30px_rgba(168,85,247,0.6)]" />
            <h2 className="text-2xl font-black text-white mt-4">{t('game.arena.title')}</h2>
            <p className="text-white/40 text-sm mt-2">{t('game.arena.loading')}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Waiting for opponent
  if (phase === 'waiting') {
    return (
      <div className="fixed inset-0 z-[100] bg-[#05000a] flex flex-col items-center justify-center">
        <button onClick={onCancel} className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <Ghost className="w-16 h-16 text-purple-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]" />
        </motion.div>
        <h2 className="text-xl font-bold text-white mt-6">Waiting for {opponentName}</h2>
        <p className="text-white/40 text-sm mt-2">They're playing their turn...</p>
        <div className="flex items-center gap-2 mt-4 text-white/30 text-xs">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-400" />
          Round {currentRound}/{TOTAL_ROUNDS}
        </div>
        <button onClick={onCancel} className="mt-8 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white/60 text-sm">
          Leave Game
        </button>
      </div>
    );
  }

  // Turn end (brief score display before auto-advancing)
  if (phase === 'turnEnd') {
    const lastOppScore = roundScores.length > 0 ? roundScores[roundScores.length - 1]?.opp : null;
    return (
      <div className="fixed inset-0 z-[100] bg-[#05000a] flex items-center justify-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-4">Round {currentRound} Complete</p>
          <div className="flex items-center justify-center gap-8 mb-4">
            <div>
              <div className="text-4xl font-black text-white">{score}</div>
              <p className="text-white/40 text-xs">You</p>
            </div>
            {lastOppScore !== null && lastOppScore > 0 && (
              <>
                <div className="text-white/20 text-2xl">vs</div>
                <div>
                  <div className="text-4xl font-black text-purple-400">{lastOppScore}</div>
                  <p className="text-white/40 text-xs">{opponentName}</p>
                </div>
              </>
            )}
          </div>
          {maxCombo > 2 && (
            <p className="text-orange-400 text-xs">Best combo: x{maxCombo}</p>
          )}
          <p className="text-white/30 text-xs mt-4 animate-pulse">
            {currentRound >= TOTAL_ROUNDS ? 'Final results...' : 'Next round starting...'}
          </p>
        </motion.div>
      </div>
    );
  }

  // Opponent played — show their score, button to start your turn
  if (phase === 'opponentPlayed') {
    const handleStartTurn = () => {
      onStartPlaying?.();
      startPlaying();
    };
    return (
      <div className="fixed inset-0 z-[100] bg-[#05000a] flex flex-col items-center justify-center">
        <button onClick={onCancel} className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <Ghost className="w-16 h-16 mx-auto text-purple-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.5)] mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">{opponentName} played their round!</h2>
          <div className="text-5xl font-black text-purple-400 mb-2">{opponentLastScore}</div>
          <p className="text-white/40 text-sm">ghosts caught in Round {currentRound}</p>
          <button
            onClick={handleStartTurn}
            className="mt-6 px-10 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold text-lg hover:from-purple-400 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/25 animate-pulse"
          >
            Your Turn to Play
          </button>
        </motion.div>
      </div>
    );
  }

  // Finished
  if (phase === 'finished') {
    const won = myTotalScore > opponentTotalScore;
    const roundsWon = roundResults.filter(r => r.my > r.opp).length;
    const flaresEarned = won
      ? roundsWon * 15 + 25
      : roundsWon * 15 + 5 * (TOTAL_ROUNDS - roundsWon);

    return (
      <div className="fixed inset-0 z-[100] bg-[#05000a] flex flex-col items-center justify-center p-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }} className="text-center">
          <div className={`text-6xl mb-4 ${won ? 'text-yellow-400' : 'text-gray-400'}`}>
            {won ? <Trophy className="w-20 h-20 mx-auto drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]" /> : <Ghost className="w-20 h-20 mx-auto" />}
          </div>
          <h2 className={`text-3xl font-black mb-2 ${won ? 'text-yellow-400' : 'text-white'}`}>
            {won ? 'You Won!' : 'Good Game!'}
          </h2>
          <div className="text-white/60 text-lg mb-4 font-mono">
            {myTotalScore} — {opponentTotalScore}
          </div>

          <div className="flex gap-3 justify-center mb-6">
            {roundResults.map((r, i) => (
              <div key={i} className={`rounded-xl px-4 py-2 text-center ${r.my > r.opp ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                <div className="text-white/40 text-xs">R{i + 1}</div>
                <div className={`font-bold text-lg ${r.my > r.opp ? 'text-green-400' : 'text-red-400'}`}>
                  {r.my} - {r.opp}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30 rounded-2xl px-6 py-3 inline-flex items-center gap-2 mb-8">
            <Flame className="w-5 h-5 text-orange-400" />
            <span className="text-orange-400 font-black text-xl">+{flaresEarned}</span>
            <span className="text-white/40 text-sm">flares</span>
          </div>
        </motion.div>

        <button onClick={onCancel} className="flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium">
          <ArrowLeft className="w-5 h-5" />
          Back to Chat
        </button>
      </div>
    );
  }

  // === PLAYING ===
  return (
    <div
      className="fixed inset-0 z-[100] bg-[#05000a] flex flex-col"
      style={{
        transform: screenShake > 0 ? `translate(${(Math.random() - 0.5) * screenShake * 2}px, ${(Math.random() - 0.5) * screenShake * 2}px)` : undefined,
      }}
    >
      {/* HUD */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/50 backdrop-blur-md border-b border-white/5">
        <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <X className="w-5 h-5 text-white/60" />
        </button>

        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-white/30 text-[10px] uppercase tracking-wider">Round</div>
            <div className="text-white font-bold">{currentRound}/{TOTAL_ROUNDS}</div>
          </div>
          <div className="text-center">
            <div className="text-white/30 text-[10px] uppercase tracking-wider">Time</div>
            <div className={`text-2xl font-black tabular-nums ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
              {timeLeft}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Ghost className="w-5 h-5 text-purple-400" />
          <span className="text-white font-black text-xl">{score}</span>
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-1 bg-white/5">
        <motion.div
          className={`h-full ${timeLeft <= 10 ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}
          animate={{ width: `${timePercent}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Combo indicator */}
      <AnimatePresence>
        {combo > 2 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-20"
          >
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500/30 to-yellow-500/30 border border-orange-500/40 rounded-full px-4 py-1.5">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 font-black text-sm">x{combo} COMBO</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Area */}
      <div
        ref={gameAreaRef}
        className="flex-1 relative overflow-hidden cursor-crosshair"
        onClick={handleMiss}
      >
        {/* Grid lines for depth */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        {/* Ghosts */}
        {ghosts.map(ghost => (
          <motion.div
            key={ghost.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: ghost.opacity }}
            exit={{ scale: 2.5, opacity: 0, filter: 'brightness(4)' }}
            className="absolute cursor-pointer select-none"
            style={{
              left: `${ghost.x}%`,
              top: `${ghost.y}%`,
              transition: 'left 0.06s linear, top 0.06s linear',
            }}
            onClick={(e) => handleGhostClick(e, ghost.id)}
            whileHover={{ scale: 1.25 }}
          >
            <motion.div
              animate={{
                y: [0, -8, 0, 8, 0],
                rotate: [ghost.rotation, -ghost.rotation, ghost.rotation],
              }}
              transition={{ duration: 2.5 + (ghost.id % 3), repeat: Infinity }}
            >
              <svg
                width={ghost.size}
                height={ghost.size * 1.15}
                viewBox="0 0 40 46"
                fill="none"
                style={{ filter: `drop-shadow(0 0 ${ghost.glowIntensity}px ${ghost.color}) drop-shadow(0 0 ${ghost.glowIntensity * 2}px ${ghost.color}40)` }}
              >
                {/* Body */}
                <path
                  d="M20 2C10 2 4 10 4 18v18c0 2 1.5 3.5 3.5 3.5 2 0 3-2 4.5-2s2.5 2 4.5 2 3-2 4.5-2 2.5 2 4.5 2 3-2 4.5-2 2.5 2 4.5 2c2 0 3.5-1.5 3.5-3.5V18C38 10 30 2 20 2z"
                  fill={ghost.color}
                />
                {/* Eyes — glowing */}
                <circle cx="14" cy="17" r="3.5" fill="#05000a" />
                <circle cx="26" cy="17" r="3.5" fill="#05000a" />
                <circle cx="14.5" cy="16" r="1.5" fill="white" opacity="0.9" />
                <circle cx="26.5" cy="16" r="1.5" fill="white" opacity="0.9" />
                {/* Mouth */}
                <ellipse cx="20" cy="25" rx="3" ry="2" fill="#05000a" opacity="0.6" />
              </svg>
            </motion.div>
          </motion.div>
        ))}

        {/* Particles */}
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            animate={{ opacity: 0, scale: 0, x: p.vx * 20, y: p.vy * 20 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="absolute pointer-events-none rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              backgroundColor: `hsl(${p.color % 360}, 100%, 60%)`,
              boxShadow: `0 0 ${p.size * 2}px hsl(${p.color % 360}, 100%, 60%)`,
            }}
          />
        ))}

        {/* Miss flashes */}
        {misses.map(m => (
          <motion.div
            key={m.id}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -40, scale: 0.5 }}
            transition={{ duration: 0.5 }}
            className="absolute pointer-events-none"
            style={{ left: `${m.x}%`, top: `${m.y}%` }}
          >
            <span className="text-red-500 font-black text-xl drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">-1</span>
          </motion.div>
        ))}

        {/* Floating score HUD */}
        {engaged && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/70 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/10">
            <div className="flex items-center gap-2">
              <Ghost className="w-4 h-4 text-purple-400" />
              <motion.div key={score} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="text-white font-black text-2xl tabular-nums">
                {score}
              </motion.div>
            </div>
            {combo > 0 && (
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-orange-400" />
                <span className="text-orange-400 font-bold text-sm">x{combo}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom glow */}
      <div className="h-1 bg-gradient-to-r from-purple-600/50 via-pink-500/50 to-orange-500/50" />
    </div>
  );
};

export default GhostGameArena;
