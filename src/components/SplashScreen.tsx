import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useColorThemeStore, getCurrentTheme } from '../stores/colorThemeStore';
import { THEME_MAP, getTheme, resolveTheme } from '../styles/theme';

const GhostSVG = ({ color, size = 64 }: { color: string; size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} style={{ color }} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <mask id="splashGhostEyes">
        <rect width="24" height="24" fill="white"/>
        <circle cx="9" cy="10" r="1.4" fill="black"/>
        <circle cx="15" cy="10" r="1.4" fill="black"/>
      </mask>
    </defs>
    <path d="M12 2c-4.418 0-8 3.582-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10c0-4.418-3.582-8-8-8z" fill="currentColor" mask="url(#splashGhostEyes)" />
  </svg>
);

interface SplashScreenProps { visible: boolean; }

const SplashScreen: React.FC<SplashScreenProps> = ({ visible }) => {
  const { profile } = useAuthStore();
  const selectedThemeId = useColorThemeStore(state => state.selectedThemeId);
  const accountType = profile?.account_type || profile?.subscription || 'free';
  const currentTheme = (() => {
    if (selectedThemeId && THEME_MAP[selectedThemeId]) return resolveTheme(THEME_MAP[selectedThemeId]);
    return resolveTheme(getTheme(accountType));
  })();
  const { splash } = currentTheme;
  const anim = currentTheme.splashAnimation || 'default';

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={currentTheme.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{ background: splash.bg }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
        >
          {/* Background effects per animation type */}
          <AnimBackground anim={anim} splash={splash} />

          {/* Central ghost */}
          <motion.div className="relative w-40 h-40 flex items-center justify-center">
            <AnimGhost anim={anim} splash={splash} />
            <AnimGlow anim={anim} splash={splash} />
          </motion.div>

          {/* App name */}
          <motion.div
            className="absolute bottom-20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <span className="text-lg font-semibold tracking-wider" style={{ color: splash.text }}>UPENDO</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============ BACKGROUND EFFECTS ============
const AnimBackground: React.FC<{ anim: string; splash: any }> = ({ anim, splash }) => {
  switch (anim) {
    case 'glitch-multiply': return <GlitchScanlines />;
    case 'float-petals': return <FloatingPetals color={splash.spinner} />;
    case 'neon-pulse': return <NeonRings color={splash.spinner} />;
    case 'aurora-wave': return <AuroraWaves color={splash.spinner} />;
    case 'orbit': return <OrbitDots color={splash.spinner} />;
    case 'drip': return <DripBars color={splash.spinner} />;
    case 'sink-bubbles': return <SinkBubbles color={splash.spinner} />;
    case 'sandstorm': return <SandParticles color={splash.spinner} />;
    case 'breathe': return <BreatheCircles color={splash.spinner} />;
    case 'shatter': return <ShatterFragments color={splash.spinner} />;
    case 'radial-burst': return <RadialLines color={splash.spinner} />;
    case 'mirror': return <MirrorReflection color={splash.spinner} />;
    case 'flame': return <FlameParticles color={splash.spinner} />;
    case 'spark': return <ElectricSparks color={splash.spinner} />;
    case 'bloom': return <BloomPetals color={splash.spinner} />;
    case 'matrix-rain': return <MatrixRain color={splash.spinner} />;
    case 'cascade': return <CascadeBeams color={splash.spinner} />;
    case 'heartbeat': return <HeartbeatRings color={splash.spinner} />;
    case 'vortex': return <VortexSpiral color={splash.spinner} />;
    case 'toxic-bubbles': return <ToxicBubbles color={splash.spinner} />;
    case 'petal-fall': return <PetalFall color={splash.spinner} />;
    default: return null;
  }
};

// ============ GHOST ANIMATIONS ============
const AnimGhost: React.FC<{ anim: string; splash: any }> = ({ anim, splash }) => {
  switch (anim) {
    case 'glitch-multiply': return <GlitchGhost color={splash.spinner} glow={splash.logoGlow} />;
    case 'float-petals': return <FloatGhost color={splash.spinner} glow={splash.logoGlow} />;
    case 'neon-pulse': return <PulseGhost color={splash.spinner} glow={splash.logoGlow} />;
    case 'aurora-wave': return <WaveGhost color={splash.spinner} glow={splash.logoGlow} />;
    case 'orbit': return <OrbitGhost color={splash.spinner} glow={splash.logoGlow} />;
    case 'drip': return <DripGhost color={splash.spinner} glow={splash.logoGlow} />;
    case 'sink-bubbles': return <SinkGhost color={splash.spinner} glow={splash.logoGlow} />;
    case 'sandstorm': return <SandGhost color={splash.spinner} glow={splash.logoGlow} />;
    case 'breathe': return <BreatheGhost color={splash.spinner} glow={splash.logoGlow} />;
    case 'shatter': return <ShatterGhost color={splash.spinner} glow={splash.logoGlow} />;
    case 'radial-burst': return <BurstGhost color={splash.spinner} glow={splash.logoGlow} />;
    case 'mirror': return <MirrorGhost color={splash.spinner} glow={splash.logoGlow} />;
    case 'flame': return <FlameGhost color={splash.spinner} glow={splash.logoGlow} />;
    case 'spark': return <SparkGhost color={splash.spinner} glow={splash.logoGlow} />;
    case 'bloom': return <BloomGhost color={splash.spinner} glow={splash.logoGlow} />;
    case 'matrix-rain': return <MatrixGhost color={splash.spinner} glow={splash.logoGlow} />;
    case 'cascade': return <CascadeGhost color={splash.spinner} glow={splash.logoGlow} />;
    case 'heartbeat': return <HeartbeatGhost color={splash.spinner} glow={splash.logoGlow} />;
    case 'vortex': return <VortexGhost color={splash.spinner} glow={splash.logoGlow} />;
    case 'toxic-bubbles': return <ToxicGhost color={splash.spinner} glow={splash.logoGlow} />;
    case 'petal-fall': return <PetalGhost color={splash.spinner} glow={splash.logoGlow} />;
    default: return <DefaultGhost color={splash.spinner} glow={splash.logoGlow} />;
  }
};

// ============ GLOW EFFECTS ============
const AnimGlow: React.FC<{ anim: string; splash: any }> = ({ anim, splash }) => {
  if (['breathe', 'heartbeat'].includes(anim)) return null; // has its own glow
  return (
    <motion.div
      className="absolute inset-0 rounded-full"
      style={{ background: `radial-gradient(circle, ${splash.spinner}20 0%, transparent 70%)` }}
      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
};

// ============ INDIVIDUAL ANIMATIONS ============

// 1. GLITCH MULTIPLY — Cyberpunk 2077
const GlitchScanlines: React.FC = () => (
  <>
    <div className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(234,179,8,0.03) 2px, rgba(234,179,8,0.03) 4px)' }} />
    {[...Array(5)].map((_, i) => (
      <motion.div key={i} className="absolute w-full" style={{ height: 2 + Math.random() * 4, background: `rgba(234,179,8,${0.05 + Math.random() * 0.08})`, top: `${Math.random() * 100}%` }}
        animate={{ x: [0, (Math.random() - 0.5) * 30, 0], opacity: [0, 0.5, 0] }}
        transition={{ duration: 0.12, repeat: Infinity, delay: Math.random() * 2, repeatDelay: 1 + Math.random() * 2 }} />
    ))}
  </>
);
const GlitchGhost: React.FC<{ color: string; glow: string }> = ({ color, glow }) => (
  <>
    {[-1, 0, 1].map((offset) => (
      <motion.div key={offset} className="absolute" style={{ filter: offset !== 0 ? 'blur(1px)' : 'none', mixBlendMode: 'screen' }}
        animate={{ x: [0, offset * 3, offset * -2, offset * 1, 0], opacity: offset !== 0 ? [0, 0.4, 0, 0.3, 0] : [1, 1, 0.8, 1, 0.6, 1] }}
        transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 1.5, delay: offset * 0.03 }}>
        <div style={{ filter: `drop-shadow(${glow})`, color: offset === -1 ? '#ef4444' : offset === 1 ? '#22d3ee' : color }}>
          <GhostSVG color="currentColor" size={64} />
        </div>
      </motion.div>
    ))}
  </>
);

// 2. FLOAT PETALS — Sakura Blossom
const FloatingPetals: React.FC<{ color: string }> = ({ color }) => (
  <div className="absolute inset-0">
    {[...Array(15)].map((_, i) => (
      <motion.div key={i} className="absolute rounded-full" style={{ width: 4 + Math.random() * 6, height: 4 + Math.random() * 6, background: `${color}60`, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
        animate={{ y: [0, -30, 10, -20, 0], x: [0, 15, -10, 20, 0], opacity: [0, 0.7, 0.5, 0.7, 0], rotate: [0, 180, 360] }}
        transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 3, ease: 'easeInOut' }} />
    ))}
  </div>
);
const FloatGhost: React.FC<{ color: string; glow: string }> = ({ color, glow }) => (
  <motion.div animate={{ y: [0, -15, 5, -10, 0], rotate: [0, 3, -3, 2, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} style={{ filter: `drop-shadow(${glow})` }}>
    <GhostSVG color={color} size={64} />
  </motion.div>
);

// 3. NEON PULSE — Miami Vice
const NeonRings: React.FC<{ color: string }> = ({ color }) => (
  <>
    {[...Array(3)].map((_, i) => (
      <motion.div key={i} className="absolute rounded-full" style={{ width: 100 + i * 60, height: 100 + i * 60, border: `2px solid ${color}30` }}
        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }} />
    ))}
  </>
);
const PulseGhost: React.FC<{ color: string; glow: string }> = ({ color, glow }) => (
  <motion.div animate={{ scale: [1, 1.08, 1, 1.05, 1] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }} style={{ filter: `drop-shadow(${glow})` }}>
    <GhostSVG color={color} size={64} />
  </motion.div>
);

// 4. AURORA WAVE — Aurora Borealis
const AuroraWaves: React.FC<{ color: string }> = ({ color }) => (
  <div className="absolute inset-0">
    {[...Array(3)].map((_, i) => (
      <motion.div key={i} className="absolute w-full" style={{ height: '30%', bottom: `${i * 15}%`, background: `linear-gradient(90deg, transparent, ${color}15, ${color}25, ${color}15, transparent)` }}
        animate={{ x: ['-100%', '100%'] }} transition={{ duration: 6 + i * 2, repeat: Infinity, ease: 'linear' }} />
    ))}
  </div>
);
const WaveGhost: React.FC<{ color: string; glow: string }> = ({ color, glow }) => (
  <motion.div animate={{ y: [0, -8, 4, -6, 0], x: [0, 5, -3, 4, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} style={{ filter: `drop-shadow(${glow})` }}>
    <GhostSVG color={color} size={64} />
  </motion.div>
);

// 5. ORBIT — Cosmic Purple
const OrbitDots: React.FC<{ color: string }> = ({ color }) => (
  <>
    {[...Array(6)].map((_, i) => {
      const angle = (i / 6) * Math.PI * 2;
      return (
        <motion.div key={i} className="absolute rounded-full" style={{ width: 4, height: 4, background: color }}
          animate={{ x: [Math.cos(angle) * 80, Math.cos(angle + Math.PI * 2) * 80], y: [Math.sin(angle) * 80, Math.sin(angle + Math.PI * 2) * 80] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear', delay: i * 0.1 }} />
      );
    })}
  </>
);
const OrbitGhost: React.FC<{ color: string; glow: string }> = ({ color, glow }) => (
  <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} style={{ filter: `drop-shadow(${glow})` }}>
    <GhostSVG color={color} size={64} />
  </motion.div>
);

// 6. DRIP — Blood Moon
const DripBars: React.FC<{ color: string }> = ({ color }) => (
  <>
    {[...Array(8)].map((_, i) => (
      <motion.div key={i} className="absolute" style={{ width: 2 + Math.random() * 3, background: `${color}40`, left: `${10 + i * 11}%`, top: 0, borderRadius: '0 0 4px 4px' }}
        animate={{ height: ['0%', '60%', '0%'], opacity: [0, 0.6, 0] }}
        transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2, ease: 'easeIn' }} />
    ))}
  </>
);
const DripGhost: React.FC<{ color: string; glow: string }> = ({ color, glow }) => (
  <motion.div animate={{ y: [0, 5, 8, 3, 0], opacity: [1, 0.9, 0.8, 0.95, 1] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} style={{ filter: `drop-shadow(${glow})` }}>
    <GhostSVG color={color} size={64} />
  </motion.div>
);

// 7. SINK BUBBLES — Ocean Deep
const SinkBubbles: React.FC<{ color: string }> = ({ color }) => (
  <>
    {[...Array(12)].map((_, i) => (
      <motion.div key={i} className="absolute rounded-full" style={{ width: 3 + Math.random() * 8, height: 3 + Math.random() * 8, border: `1px solid ${color}40`, left: `${Math.random() * 100}%`, bottom: '-5%' }}
        animate={{ y: [0, -(window.innerHeight * 1.1)], opacity: [0, 0.6, 0.6, 0] }}
        transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 3, ease: 'easeOut' }} />
    ))}
  </>
);
const SinkGhost: React.FC<{ color: string; glow: string }> = ({ color, glow }) => (
  <motion.div animate={{ y: [0, 10, 15, 8, 0], scale: [1, 0.98, 0.96, 0.99, 1] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} style={{ filter: `drop-shadow(${glow})` }}>
    <GhostSVG color={color} size={64} />
  </motion.div>
);

// 8. SANDSTORM — Desert Sand
const SandParticles: React.FC<{ color: string }> = ({ color }) => (
  <>
    {[...Array(25)].map((_, i) => (
      <motion.div key={i} className="absolute rounded-full" style={{ width: 1 + Math.random() * 2, height: 1 + Math.random() * 2, background: `${color}50`, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
        animate={{ x: [0, (Math.random() - 0.5) * 100], y: [0, (Math.random() - 0.5) * 60], opacity: [0, 0.6, 0] }}
        transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }} />
    ))}
  </>
);
const SandGhost: React.FC<{ color: string; glow: string }> = ({ color, glow }) => (
  <motion.div animate={{ x: [0, 3, -2, 4, 0], rotate: [0, 2, -2, 1, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} style={{ filter: `drop-shadow(${glow})` }}>
    <GhostSVG color={color} size={64} />
  </motion.div>
);

// 9. BREATHE — Lavender Dream
const BreatheCircles: React.FC<{ color: string }> = ({ color }) => (
  <>
    {[...Array(3)].map((_, i) => (
      <motion.div key={i} className="absolute rounded-full" style={{ width: 80 + i * 40, height: 80 + i * 40, border: `1px solid ${color}20` }}
        animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 3, repeat: Infinity, delay: i * 0.5, ease: 'easeInOut' }} />
    ))}
  </>
);
const BreatheGhost: React.FC<{ color: string; glow: string }> = ({ color, glow }) => (
  <motion.div animate={{ scale: [1, 1.12, 1, 1.08, 1] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} style={{ filter: `drop-shadow(${glow})` }}>
    <GhostSVG color={color} size={64} />
  </motion.div>
);

// 10. SHATTER — Frozen Lime
const ShatterFragments: React.FC<{ color: string }> = ({ color }) => (
  <>
    {[...Array(8)].map((_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      return (
        <motion.div key={i} className="absolute" style={{ width: 6, height: 12, background: `${color}30`, clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}
          initial={{ x: 0, y: 0, opacity: 0, rotate: 0 }}
          animate={{ x: Math.cos(angle) * 100, y: Math.sin(angle) * 100, opacity: [0, 0.7, 0], rotate: Math.random() * 360 }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 + i * 0.1, ease: 'easeOut' }} />
      );
    })}
  </>
);
const ShatterGhost: React.FC<{ color: string; glow: string }> = ({ color, glow }) => (
  <motion.div animate={{ opacity: [1, 1, 0.3, 1, 1], scale: [1, 1, 0.95, 1, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} style={{ filter: `drop-shadow(${glow})` }}>
    <GhostSVG color={color} size={64} />
  </motion.div>
);

// 11. RADIAL BURST — Starburst
const RadialLines: React.FC<{ color: string }> = ({ color }) => (
  <>
    {[...Array(12)].map((_, i) => {
      const angle = (i / 12) * 360;
      return (
        <motion.div key={i} className="absolute" style={{ width: 2, height: 40, background: `linear-gradient(to bottom, ${color}60, transparent)`, transformOrigin: 'top center', left: '50%', top: '50%', rotate: `${angle}deg` }}
          animate={{ scaleY: [0, 1, 0], opacity: [0, 0.8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.08, ease: 'easeOut' }} />
      );
    })}
  </>
);
const BurstGhost: React.FC<{ color: string; glow: string }> = ({ color, glow }) => (
  <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }} style={{ filter: `drop-shadow(${glow})` }}>
    <GhostSVG color={color} size={64} />
  </motion.div>
);

// 12. MIRROR — Platinum Ice
const MirrorReflection: React.FC<{ color: string }> = ({ color }) => (
  <motion.div className="absolute" style={{ width: 200, height: 200, background: `linear-gradient(180deg, ${color}05, ${color}15, ${color}05)`, borderRadius: '50%' }}
    animate={{ scaleY: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />
);
const MirrorGhost: React.FC<{ color: string; glow: string }> = ({ color, glow }) => (
  <>
    <motion.div style={{ filter: `drop-shadow(${glow})` }}><GhostSVG color={color} size={64} /></motion.div>
    <motion.div className="absolute" style={{ opacity: 0.2, transform: 'scaleY(-1) translateY(10px)', filter: 'blur(2px)' }}
      animate={{ opacity: [0.1, 0.25, 0.1] }} transition={{ duration: 3, repeat: Infinity }}>
      <GhostSVG color={color} size={64} />
    </motion.div>
  </>
);

// 13. FLAME — Magma Core
const FlameParticles: React.FC<{ color: string }> = ({ color }) => (
  <>
    {[...Array(15)].map((_, i) => (
      <motion.div key={i} className="absolute rounded-full" style={{ width: 3 + Math.random() * 5, height: 3 + Math.random() * 5, background: `${color}80`, left: `${30 + Math.random() * 40}%`, bottom: '30%' }}
        animate={{ y: [0, -(100 + Math.random() * 100)], x: [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 50], opacity: [0, 0.8, 0], scale: [1, 0.5, 0] }}
        transition={{ duration: 1 + Math.random() * 1.5, repeat: Infinity, delay: Math.random() * 1.5, ease: 'easeOut' }} />
    ))}
  </>
);
const FlameGhost: React.FC<{ color: string; glow: string }> = ({ color, glow }) => (
  <motion.div animate={{ y: [0, -3, 0, -2, 0], scale: [1, 1.02, 1, 1.01, 1] }} transition={{ duration: 0.8, repeat: Infinity }} style={{ filter: `drop-shadow(${glow})` }}>
    <GhostSVG color={color} size={64} />
  </motion.div>
);

// 14. SPARK — Electric Blue
const ElectricSparks: React.FC<{ color: string }> = ({ color }) => (
  <>
    {[...Array(8)].map((_, i) => {
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      return (
        <motion.div key={i} className="absolute" style={{ width: 2, height: 2, background: color, left: `${x}%`, top: `${y}%`, boxShadow: `0 0 6px ${color}` }}
          animate={{ opacity: [0, 1, 0, 1, 0], scale: [0, 1.5, 0, 1, 0] }}
          transition={{ duration: 0.3, repeat: Infinity, delay: Math.random() * 2, repeatDelay: 1 + Math.random() * 2 }} />
      );
    })}
  </>
);
const SparkGhost: React.FC<{ color: string; glow: string }> = ({ color, glow }) => (
  <motion.div animate={{ filter: [`drop-shadow(${glow})`, `drop-shadow(${glow}) brightness(1.5)`, `drop-shadow(${glow})`] }}
    transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 1.5 }}>
    <GhostSVG color={color} size={64} />
  </motion.div>
);

// 15. BLOOM — Velvet Rose
const BloomPetals: React.FC<{ color: string }> = ({ color }) => (
  <>
    {[...Array(6)].map((_, i) => {
      const angle = (i / 6) * 360;
      return (
        <motion.div key={i} className="absolute rounded-full" style={{ width: 20, height: 30, background: `${color}20`, left: '50%', top: '50%' }}
          initial={{ x: 0, y: 0, scale: 0, rotate: angle }}
          animate={{ x: Math.cos(angle * Math.PI / 180) * 50, y: Math.sin(angle * Math.PI / 180) * 50, scale: [0, 1, 0.8, 1] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }} />
      );
    })}
  </>
);
const BloomGhost: React.FC<{ color: string; glow: string }> = ({ color, glow }) => (
  <motion.div animate={{ scale: [0.95, 1.05, 0.95], rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} style={{ filter: `drop-shadow(${glow})` }}>
    <GhostSVG color={color} size={64} />
  </motion.div>
);

// 16. MATRIX RAIN — Matrix
const MatrixRain: React.FC<{ color: string }> = ({ color }) => (
  <>
    {[...Array(15)].map((_, i) => (
      <motion.div key={i} className="absolute" style={{ width: 1, background: `linear-gradient(to bottom, transparent, ${color}60, transparent)`, left: `${5 + i * 6.5}%`, top: '-20%', height: 40 + Math.random() * 60 }}
        animate={{ y: [0, window.innerHeight * 1.2], opacity: [0, 0.7, 0.7, 0] }}
        transition={{ duration: 1.5 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2, ease: 'linear' }} />
    ))}
  </>
);
const MatrixGhost: React.FC<{ color: string; glow: string }> = ({ color, glow }) => (
  <motion.div animate={{ opacity: [1, 0.7, 1, 0.8, 1], y: [0, 2, -1, 1, 0] }} transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }} style={{ filter: `drop-shadow(${glow})` }}>
    <GhostSVG color={color} size={64} />
  </motion.div>
);

// 17. CASCADE — Sunset Tropical
const CascadeBeams: React.FC<{ color: string }> = ({ color }) => (
  <>
    {[...Array(5)].map((_, i) => (
      <motion.div key={i} className="absolute" style={{ width: '120%', height: 3, background: `linear-gradient(90deg, transparent, ${color}30, transparent)`, left: '-10%', top: `${20 + i * 15}%` }}
        animate={{ x: ['-100%', '100%'], opacity: [0, 0.6, 0] }}
        transition={{ duration: 3, repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }} />
    ))}
  </>
);
const CascadeGhost: React.FC<{ color: string; glow: string }> = ({ color, glow }) => (
  <motion.div animate={{ y: [0, -5, 3, -3, 0], x: [0, 3, -2, 1, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} style={{ filter: `drop-shadow(${glow})` }}>
    <GhostSVG color={color} size={64} />
  </motion.div>
);

// 18. HEARTBEAT — Neon Pink
const HeartbeatRings: React.FC<{ color: string }> = ({ color }) => (
  <>
    {[...Array(2)].map((_, i) => (
      <motion.div key={i} className="absolute rounded-full" style={{ width: 80, height: 80, border: `2px solid ${color}40` }}
        animate={{ scale: [1, 1.8, 1, 1.5, 1], opacity: [0.5, 0, 0.5, 0, 0.5] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.6, ease: 'easeOut' }} />
    ))}
  </>
);
const HeartbeatGhost: React.FC<{ color: string; glow: string }> = ({ color, glow }) => (
  <motion.div animate={{ scale: [1, 1.15, 1, 1.1, 1] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }} style={{ filter: `drop-shadow(${glow})` }}>
    <GhostSVG color={color} size={64} />
  </motion.div>
);

// 19. VORTEX — Midnight Gold
const VortexSpiral: React.FC<{ color: string }> = ({ color }) => (
  <>
    {[...Array(10)].map((_, i) => {
      const angle = (i / 10) * Math.PI * 2;
      const radius = 40 + i * 5;
      return (
        <motion.div key={i} className="absolute rounded-full" style={{ width: 3, height: 3, background: color }}
          animate={{ x: [Math.cos(angle) * radius, Math.cos(angle + Math.PI * 2) * radius], y: [Math.sin(angle) * radius, Math.sin(angle + Math.PI * 2) * radius], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: i * 0.1 }} />
      );
    })}
  </>
);
const VortexGhost: React.FC<{ color: string; glow: string }> = ({ color, glow }) => (
  <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }} style={{ filter: `drop-shadow(${glow})` }}>
    <GhostSVG color={color} size={64} />
  </motion.div>
);

// 20. TOXIC BUBBLES — Toxic Waste
const ToxicBubbles: React.FC<{ color: string }> = ({ color }) => (
  <>
    {[...Array(10)].map((_, i) => (
      <motion.div key={i} className="absolute rounded-full" style={{ width: 5 + Math.random() * 10, height: 5 + Math.random() * 10, border: `1px solid ${color}50`, left: `${Math.random() * 100}%`, bottom: '-10%' }}
        animate={{ y: [0, -(window.innerHeight * 1.1)], scale: [0.5, 1, 0.3], opacity: [0, 0.7, 0] }}
        transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 3, ease: 'easeOut' }} />
    ))}
  </>
);
const ToxicGhost: React.FC<{ color: string; glow: string }> = ({ color, glow }) => (
  <motion.div animate={{ y: [0, -5, 5, -3, 0], filter: [`drop-shadow(${glow})`, `drop-shadow(${glow}) hue-rotate(20deg)`, `drop-shadow(${glow})`] }}
    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
    <GhostSVG color={color} size={64} />
  </motion.div>
);

// 21. PETAL FALL — Cherry Blossom
const PetalFall: React.FC<{ color: string }> = ({ color }) => (
  <>
    {[...Array(12)].map((_, i) => (
      <motion.div key={i} className="absolute rounded-full" style={{ width: 4 + Math.random() * 4, height: 6 + Math.random() * 6, background: `${color}50`, left: `${Math.random() * 100}%`, top: '-5%' }}
        animate={{ y: [0, window.innerHeight * 1.1], x: [0, (Math.random() - 0.5) * 80], rotate: [0, 360 + Math.random() * 360], opacity: [0, 0.6, 0.6, 0] }}
        transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 4, ease: 'easeIn' }} />
    ))}
  </>
);
const PetalGhost: React.FC<{ color: string; glow: string }> = ({ color, glow }) => (
  <motion.div animate={{ y: [0, -8, 0], rotate: [0, 3, -3, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} style={{ filter: `drop-shadow(${glow})` }}>
    <GhostSVG color={color} size={64} />
  </motion.div>
);

// DEFAULT — rotating glow ring (existing themes)
const DefaultGhost: React.FC<{ color: string; glow: string }> = ({ color, glow }) => (
  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: 'linear' }} style={{ filter: `drop-shadow(${glow})` }}>
    <GhostSVG color={color} size={64} />
  </motion.div>
);

export default SplashScreen;
