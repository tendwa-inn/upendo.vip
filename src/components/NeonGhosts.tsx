import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useMediaQuery from '../hooks/useMediaQuery';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface Ghost {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  color: string;
  size: number;
  speed: number;
  opacity: number;
  floatOffset: number;
}

interface DeathParticle {
  id: number;
  x: number;
  y: number;
  color: string;
}

interface MissFlash {
  id: number;
  x: number;
  y: number;
}

const NEON_COLORS = [
  '#ff00ff', '#00ffff', '#ffff00', '#ff0066',
  '#00ff00', '#ff6600', '#6600ff', '#00ff66',
];

const PRO_THRESHOLD = 1500;
const MILESTONES = [50, 100, 200, 500, 1000, 1500];

// Difficulty tiers — index 0 = start, increases at each milestone
const DIFFICULTY = [
  { maxGhosts: 8,  maxGhostsM: 5,  spawnMs: 3000, speedMul: 1.0 },
  { maxGhosts: 12, maxGhostsM: 7,  spawnMs: 2200, speedMul: 0.85 },
  { maxGhosts: 16, maxGhostsM: 9,  spawnMs: 1600, speedMul: 0.7 },
  { maxGhosts: 22, maxGhostsM: 12, spawnMs: 1100, speedMul: 0.55 },
  { maxGhosts: 28, maxGhostsM: 15, spawnMs: 800,  speedMul: 0.42 },
  { maxGhosts: 35, maxGhostsM: 18, spawnMs: 600,  speedMul: 0.32 },
  { maxGhosts: 45, maxGhostsM: 22, spawnMs: 400,  speedMul: 0.25 },
];

// ─── Audio ───────────────────────────────────────────────────
let audioCtx: AudioContext | null = null;
const getAudioCtx = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
};

const playPopSound = (pitch: number) => {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const freq = 300 + Math.min(pitch * 2, 900);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.6, now + 0.06);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + 0.18);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.2);
  } catch {}
};

const playMissSound = () => {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.15);
  } catch {}
};

const playMilestoneSound = (milestone: number) => {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    // Bigger milestones get richer arpeggios
    const chords: Record<number, number[]> = {
      50:   [523, 659],
      100:  [523, 659, 784],
      200:  [523, 659, 784, 1047],
      500:  [659, 784, 1047, 1319],
      1000: [784, 1047, 1319, 1568],
      1500: [1047, 1319, 1568, 2093],
    };
    const notes = chords[milestone] || [523, 659, 784];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.22, now + i * 0.1 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.5);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now + i * 0.1); osc.stop(now + i * 0.1 + 0.5);
    });
  } catch {}
};

// ─── Component ───────────────────────────────────────────────
const NeonGhosts: React.FC = () => {
  const { t } = useTranslation();
  const [ghosts, setGhosts] = useState<Ghost[]>([]);
  const [score, setScore] = useState(0);
  const [engaged, setEngaged] = useState(false);
  const [particles, setParticles] = useState<DeathParticle[]>([]);
  const [missFlashes, setMissFlashes] = useState<MissFlash[]>([]);
  const [proAwarded, setProAwarded] = useState(false);
  const [milestoneFlash, setMilestoneFlash] = useState<number | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const spawnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const proClaimedRef = useRef(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { updateUserProfile, profile } = useAuthStore();

  // Difficulty tier based on score
  const getTier = useCallback(() => {
    let tier = 0;
    for (let i = 0; i < MILESTONES.length; i++) {
      if (score >= MILESTONES[i]) tier = i + 1;
    }
    return Math.min(tier, DIFFICULTY.length - 1);
  }, [score]);

  const createGhost = useCallback((): Ghost => {
    const tier = DIFFICULTY[getTier()];
    const speedMul = tier.speedMul;
    const x = Math.random() * 85 + 5;
    const y = Math.random() * 80 + 5;
    return {
      id: Math.random(),
      x, y,
      targetX: Math.random() * 85 + 5,
      targetY: Math.random() * 80 + 5,
      color: NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)],
      size: 28 + Math.random() * 36,
      speed: (20 + Math.random() * 30) * speedMul,
      opacity: 0.7 + Math.random() * 0.3,
      floatOffset: Math.random() * Math.PI * 2,
    };
  }, [getTier]);

  // Smooth movement tick — ghosts glide toward target, pick new target on arrival
  useEffect(() => {
    tickRef.current = setInterval(() => {
      setGhosts(prev => prev.map(g => {
        const dx = g.targetX - g.x;
        const dy = g.targetY - g.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1.5) {
          // Arrived — pick new target
          return {
            ...g,
            targetX: Math.random() * 85 + 5,
            targetY: Math.random() * 80 + 5,
          };
        }
        // Ease toward target (smooth lerp)
        const ease = Math.min(0.02, 1 / g.speed);
        return {
          ...g,
          x: g.x + dx * ease,
          y: g.y + dy * ease,
        };
      }));
    }, 50); // 20fps tick for buttery smooth CSS transitions
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, []);

  // Initial spawn
  useEffect(() => {
    const count = isMobile ? 5 : 8;
    setGhosts(Array.from({ length: count }, createGhost));
  }, []);

  // Periodic spawn
  useEffect(() => {
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    const tier = DIFFICULTY[getTier()];
    const max = isMobile ? tier.maxGhostsM : tier.maxGhosts;

    spawnTimerRef.current = setInterval(() => {
      setGhosts(prev => {
        // Natural decay
        const alive = prev.filter(() => Math.random() > 0.03);
        if (alive.length < max) {
          return [...alive, createGhost()];
        }
        return alive;
      });
    }, tier.spawnMs);

    return () => { if (spawnTimerRef.current) clearInterval(spawnTimerRef.current); };
  }, [score, isMobile, getTier, createGhost]);

  // Pro award at 1500
  useEffect(() => {
    if (score >= PRO_THRESHOLD && !proClaimedRef.current && profile) {
      proClaimedRef.current = true;
      setProAwarded(true);
      playMilestoneSound(1500);

      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 3);
      updateUserProfile({
        account_type: 'pro',
        subscription_expires_at: expiry.toISOString(),
      });

      toast.success(t('ghost.proUnlocked'), {
        duration: 6000,
        style: {
          background: 'linear-gradient(135deg, #ff0066, #ff00ff)',
          color: 'white', fontWeight: 'bold', fontSize: '16px',
        },
      } as any);
    }
  }, [score, profile, updateUserProfile]);

  // ─── Handlers ──────────────────────────────────────────────
  const handleGhostClick = useCallback((ghost: Ghost, e: React.MouseEvent) => {
    e.stopPropagation();
    playPopSound(score);

    // Particles
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const px = rect.left + rect.width / 2;
    const py = rect.top + rect.height / 2;
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: Math.random() + i,
      x: px + (Math.random() - 0.5) * 50,
      y: py + (Math.random() - 0.5) * 50,
      color: ghost.color,
    }));
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      const ids = new Set(newParticles.map(p => p.id));
      setParticles(prev => prev.filter(p => !ids.has(p.id)));
    }, 600);

    // Remove ghost
    setGhosts(prev => prev.filter(g => g.id !== ghost.id));

    // Score +1
    setScore(prev => {
      const next = prev + 1;
      // Milestone check
      if (MILESTONES.includes(next)) {
        setMilestoneFlash(next);
        playMilestoneSound(next);
        setTimeout(() => setMilestoneFlash(null), 2000);
      }
      return next;
    });
    if (!engaged) setEngaged(true);

    // Quick respawn
    const tier = DIFFICULTY[getTier()];
    const max = isMobile ? tier.maxGhostsM : tier.maxGhosts;
    const respawnDelay = Math.max(100, tier.spawnMs * 0.4);
    setTimeout(() => {
      setGhosts(prev => prev.length < max ? [...prev, createGhost()] : prev);
    }, respawnDelay);
  }, [engaged, score, isMobile, getTier, createGhost]);

  const handleMiss = useCallback((e: React.MouseEvent) => {
    if (!engaged) return;
    // Only count miss if we clicked the background, not a ghost
    if ((e.target as HTMLElement).closest('.ghost-entity')) return;

    setScore(prev => Math.max(0, prev - 1));
    playMissSound();

    // Red X flash at click point
    const flash: MissFlash = { id: Math.random(), x: e.clientX, y: e.clientY };
    setMissFlashes(prev => [...prev, flash]);
    setTimeout(() => {
      setMissFlashes(prev => prev.filter(f => f.id !== flash.id));
    }, 500);
  }, [engaged]);

  // ─── Render ────────────────────────────────────────────────
  const progressPct = Math.min((score / PRO_THRESHOLD) * 100, 100);
  const tier = getTier();

  const ghostSvg = (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path
        d="M50 10 C30 10 15 25 15 45 C15 65 25 75 35 85 L50 75 L65 85 C75 75 85 65 85 45 C85 25 70 10 50 10 Z"
        fill="currentColor" opacity="0.85"
      />
      <circle cx="35" cy="40" r="3.5" fill="black" opacity="0.8" />
      <circle cx="65" cy="40" r="3.5" fill="black" opacity="0.8" />
    </svg>
  );

  return (
    <>
      {/* Milestone celebration flash */}
      <AnimatePresence>
        {milestoneFlash && (
          <motion.div
            key={milestoneFlash}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[95] flex items-center justify-center pointer-events-none"
          >
            <div className="text-5xl font-black"
              style={{
                background: 'linear-gradient(135deg, #ffff00, #ff0066, #ff00ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 40px rgba(255,0,255,0.6))',
              }}
            >
              {milestoneFlash}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pro reward overlay */}
      <AnimatePresence>
        {proAwarded && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200 }}
              className="text-center"
            >
              <div className="text-6xl font-black tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #ff0066, #ff00ff, #00ffff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 30px rgba(255,0,255,0.5))',
                }}
              >
                PRO UNLOCKED
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-white/80 text-lg mt-2"
              >
                3 days of Pro — enjoy!
              </motion.div>
            </motion.div>
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  background: NEON_COLORS[i % NEON_COLORS.length],
                  boxShadow: `0 0 10px ${NEON_COLORS[i % NEON_COLORS.length]}`,
                }}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: Math.cos((i / 12) * Math.PI * 2) * 300,
                  y: Math.sin((i / 12) * Math.PI * 2) * 300,
                  opacity: 0, scale: [1, 2, 0],
                }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Score HUD */}
      <AnimatePresence>
        {engaged && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none"
          >
            <div className="bg-black/70 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-2 flex flex-col items-center gap-1.5 min-w-[160px]">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 100 100" className="w-5 h-5 inline-block">
                  <path d="M50 10 C30 10 15 25 15 45 C15 65 25 75 35 85 L50 75 L65 85 C75 75 85 65 85 45 C85 25 70 10 50 10 Z"
                    fill="#ff0066" opacity="0.9" />
                  <circle cx="35" cy="40" r="3" fill="black" opacity="0.8" />
                  <circle cx="65" cy="40" r="3" fill="black" opacity="0.8" />
                </svg>
                <motion.span
                  key={score}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  className="text-white font-bold text-lg tabular-nums"
                >
                  {score}
                </motion.span>
                {!proAwarded && (
                  <span className="text-white/40 text-xs ml-1">/ {PRO_THRESHOLD}</span>
                )}
                {proAwarded && (
                  <span className="text-xs font-bold ml-1"
                    style={{
                      background: 'linear-gradient(135deg, #ff0066, #ff00ff)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >PRO</span>
                )}
              </div>
              {!proAwarded && (
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #ff0066, #ff00ff, #00ffff)' }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Death particles */}
      <AnimatePresence>
        {particles.map(p => (
          <motion.div key={p.id}
            className="fixed w-2 h-2 rounded-full z-40 pointer-events-none"
            style={{
              left: p.x, top: p.y,
              backgroundColor: p.color,
              boxShadow: `0 0 8px ${p.color}`,
            }}
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 0, y: -30 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

      {/* Miss flashes */}
      <AnimatePresence>
        {missFlashes.map(f => (
          <motion.div key={f.id}
            className="fixed z-40 pointer-events-none text-red-500 font-black text-2xl select-none"
            style={{ left: f.x - 10, top: f.y - 14 }}
            initial={{ opacity: 1, scale: 0.5 }}
            animate={{ opacity: 0, y: -30, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            -1
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Game area — clicking empty space = miss */}
      <div
        className="fixed inset-0 overflow-hidden z-0 cursor-crosshair"
        onClick={handleMiss}
      >
        <AnimatePresence>
          {ghosts.map(ghost => (
            <motion.div
              key={ghost.id}
              className="ghost-entity absolute cursor-pointer select-none"
              style={{
                left: `${ghost.x}%`,
                top: `${ghost.y}%`,
                width: ghost.size,
                height: ghost.size,
                // CSS transition handles the smooth movement from the tick updates
                transition: 'left 0.08s linear, top 0.08s linear',
                willChange: 'left, top',
              }}
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: ghost.opacity, scale: 1 }}
              exit={{
                opacity: 0,
                scale: 2.5,
                filter: 'brightness(3)',
                transition: { duration: 0.25 },
              }}
              onClick={(e) => handleGhostClick(ghost, e)}
              whileHover={{ scale: 1.15, filter: `drop-shadow(0 0 20px ${ghost.color})` }}
            >
              {/* Gentle float bob */}
              <motion.div
                className="w-full h-full"
                animate={{ y: [0, -6, 0, 6, 0] }}
                transition={{
                  duration: 3 + ghost.floatOffset,
                  ease: 'easeInOut',
                  repeat: Infinity,
                }}
              >
                <div
                  className="w-full h-full relative"
                  style={{
                    color: ghost.color,
                    filter: `drop-shadow(0 0 12px ${ghost.color})`,
                  }}
                >
                  {ghostSvg}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
};

export default NeonGhosts;
