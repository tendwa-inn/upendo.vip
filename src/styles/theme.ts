// Theme definitions for Upendo
// Each theme has the same structure with different color palettes

// Helper to generate swipe button, chat, and transition styles from a theme's core colors
const genSwipe = (likeColor: string, nopeColor: string, rewindColor: string, shape: 'circle' | 'rounded' | 'pill' | 'square' = 'circle') => {
  const shapes = {
    circle: 'rounded-full',
    rounded: 'rounded-2xl',
    pill: 'rounded-full px-4',
    square: 'rounded-xl',
  };
  return {
    like: `bg-gradient-to-br ${likeColor} shadow-lg`,
    nope: `bg-gradient-to-br ${nopeColor} shadow-lg`,
    rewind: `bg-gradient-to-br ${rewindColor} shadow-lg`,
    shape: shapes[shape],
  };
};

const genChat = (senderHex: string, receiverHex: string, accentHex: string) => ({
  inputBg: 'bg-white/10',
  inputBorder: 'border-white/20',
  inputText: 'text-white',
  bubbleSenderShadow: `shadow-[0_2px_12px_${accentHex}40]`,
  bubbleReceiverShadow: 'shadow-[0_2px_8px_rgba(0,0,0,0.3)]',
  headerBg: 'bg-black/40 backdrop-blur-md',
  timestamp: 'text-white/40',
});

const genTransition = (speed: 'fast' | 'normal' | 'slow' = 'normal', style: 'smooth' | 'bouncy' | 'snappy' = 'smooth') => {
  const speeds = { fast: '150ms', normal: '200ms', slow: '300ms' };
  const styles = {
    smooth: `transition-all duration-[${speeds[speed]}] ease-in-out`,
    bouncy: `transition-all duration-[${speeds[speed]}] ease-[cubic-bezier(0.34,1.56,0.64,1)]`,
    snappy: `transition-all duration-[${speeds[speed]}] ease-out`,
  };
  return { page: styles[style], card: styles[style], button: styles[style] };
};

export interface ThemeDefinition {
  id: string;
  name: string;
  tier: 'free' | 'pro' | 'vip';
  storeExclusive?: boolean;
  background: string;
  text: string;
  primary: string;
  stickyHeader: string;
  bubble: {
    sender: string;
    receiver: string;
  };
  nav: {
    find: string;
    discover: string;
    chat: string;
    connections: string;
    profile: string;
    inactive: string;
  };
  button: {
    primary: string;
    primaryHover: string;
    secondary: string;
    danger: string;
    success: string;
  };
  accent: {
    glow: string;
    border: string;
    ring: string;
    loading: string;
    toggle: string;
    toggleRing: string;
  };
  preview: {
    bg: string;
    accent: string;
    bubble: string;
  };
  splash: {
    bg: string;
    logoGlow: string;
    spinner: string;
    text: string;
  };
  swipeButton?: {
    like: string;
    nope: string;
    rewind: string;
    shape: string;
  };
  chat?: {
    inputBg: string;
    inputBorder: string;
    inputText: string;
    bubbleSenderShadow: string;
    bubbleReceiverShadow: string;
    headerBg: string;
    timestamp: string;
  };
  transition?: {
    page: string;
    card: string;
    button: string;
  };
  splashAnimation?: string;
}

// ============ FREE THEMES ============

const upendoOriginal: ThemeDefinition = {
  id: 'upendo-original',
  name: 'Upendo Original',
  tier: 'free',
  background: 'bg-gradient-to-b from-[#22090E] to-[#2E0C13]',
  text: 'text-white',
  primary: 'text-pink-400',
  stickyHeader: 'bg-[#22090E]',
  bubble: {
    sender: 'bg-gradient-to-b from-pink-500 to-pink-700',
    receiver: 'bg-gradient-to-b from-[#3a1a22] to-[#2E0C13]',
  },
  nav: {
    find: 'text-pink-300',
    discover: 'text-pink-300',
    chat: 'text-orange-300',
    connections: 'text-blue-300',
    profile: 'text-blue-300',
    inactive: 'text-white',
  },
  button: {
    primary: 'bg-gradient-to-r from-pink-500 to-pink-700',
    primaryHover: 'hover:from-pink-600 hover:to-pink-800',
    secondary: 'bg-white/10 hover:bg-white/20',
    danger: 'bg-red-500 hover:bg-red-600',
    success: 'bg-green-500 hover:bg-green-600',
  },
  accent: {
    glow: 'shadow-pink-500/20',
    border: 'border-pink-500/30',
    ring: 'ring-pink-500/50',
    loading: 'text-pink-500',
    toggle: 'peer-checked:bg-pink-500',
    toggleRing: 'peer-focus:ring-pink-500/50',
  },
  preview: {
    bg: '#22090E',
    accent: '#ec4899',
    bubble: '#db2777',
  },
  splash: {
    bg: 'linear-gradient(to bottom, #22090E, #2E0C13)',
    logoGlow: '0 0 60px rgba(236, 72, 153, 0.8)',
    spinner: '#ec4899',
    text: '#f472b6',
  },
};

// ============ PRO THEMES ============

const midnightOcean: ThemeDefinition = {
  id: 'midnight-ocean',
  name: 'Midnight Ocean',
  tier: 'pro',
  background: 'bg-gradient-to-b from-[#071521] to-[#0b2237]',
  text: 'text-white',
  primary: 'text-sky-400',
  stickyHeader: 'bg-[#071521]',
  bubble: {
    sender: 'bg-gradient-to-b from-sky-500 to-sky-700',
    receiver: 'bg-gradient-to-b from-[#0e2030] to-[#091522]',
  },
  nav: {
    find: 'text-sky-400',
    discover: 'text-sky-400',
    chat: 'text-sky-400',
    connections: 'text-sky-400',
    profile: 'text-sky-400',
    inactive: 'text-white/60',
  },
  button: {
    primary: 'bg-gradient-to-r from-sky-500 to-sky-700',
    primaryHover: 'hover:from-sky-600 hover:to-sky-800',
    secondary: 'bg-white/10 hover:bg-white/20',
    danger: 'bg-red-500 hover:bg-red-600',
    success: 'bg-green-500 hover:bg-green-600',
  },
  accent: {
    glow: 'shadow-sky-500/20',
    border: 'border-sky-500/30',
    ring: 'ring-sky-500/50',
    loading: 'text-sky-500',
    toggle: 'peer-checked:bg-sky-400',
    toggleRing: 'peer-focus:ring-sky-400/50',
  },
  preview: {
    bg: '#071521',
    accent: '#38bdf8',
    bubble: '#0284c7',
  },
  splash: {
    bg: 'linear-gradient(to bottom, #071521, #0b2237)',
    logoGlow: '0 0 60px rgba(56, 189, 248, 0.8)',
    spinner: '#38bdf8',
    text: '#7dd3fc',
  },
};

const arcticFrost: ThemeDefinition = {
  id: 'arctic-frost',
  name: 'Arctic Frost',
  tier: 'pro',
  background: 'bg-gradient-to-b from-[#0c1929] to-[#1a2942]',
  text: 'text-white',
  primary: 'text-cyan-300',
  stickyHeader: 'bg-[#0c1929]',
  bubble: {
    sender: 'bg-gradient-to-b from-cyan-400 to-cyan-600',
    receiver: 'bg-gradient-to-b from-[#1e3a5f] to-[#0f2744]',
  },
  nav: {
    find: 'text-cyan-300',
    discover: 'text-cyan-300',
    chat: 'text-cyan-300',
    connections: 'text-cyan-300',
    profile: 'text-cyan-300',
    inactive: 'text-white/60',
  },
  button: {
    primary: 'bg-gradient-to-r from-cyan-400 to-cyan-600',
    primaryHover: 'hover:from-cyan-500 hover:to-cyan-700',
    secondary: 'bg-white/10 hover:bg-white/20',
    danger: 'bg-red-500 hover:bg-red-600',
    success: 'bg-green-500 hover:bg-green-600',
  },
  accent: {
    glow: 'shadow-cyan-500/20',
    border: 'border-cyan-500/30',
    ring: 'ring-cyan-500/50',
    loading: 'text-cyan-500',
    toggle: 'peer-checked:bg-cyan-400',
    toggleRing: 'peer-focus:ring-cyan-400/50',
  },
  preview: {
    bg: '#0c1929',
    accent: '#67e8f9',
    bubble: '#06b6d4',
  },
  splash: {
    bg: 'linear-gradient(to bottom, #0c1929, #1a2942)',
    logoGlow: '0 0 60px rgba(103, 232, 249, 0.8)',
    spinner: '#67e8f9',
    text: '#a5f3fc',
  },
};

const sunsetBlaze: ThemeDefinition = {
  id: 'sunset-blaze',
  name: 'Sunset Blaze',
  tier: 'pro',
  background: 'bg-gradient-to-b from-[#1a0a05] to-[#2d1508]',
  text: 'text-white',
  primary: 'text-orange-400',
  stickyHeader: 'bg-[#1a0a05]',
  bubble: {
    sender: 'bg-gradient-to-b from-orange-500 to-red-600',
    receiver: 'bg-gradient-to-b from-[#3d1f0a] to-[#1a0f05]',
  },
  nav: {
    find: 'text-orange-400',
    discover: 'text-orange-400',
    chat: 'text-orange-400',
    connections: 'text-orange-400',
    profile: 'text-orange-400',
    inactive: 'text-white/60',
  },
  button: {
    primary: 'bg-gradient-to-r from-orange-500 to-red-600',
    primaryHover: 'hover:from-orange-600 hover:to-red-700',
    secondary: 'bg-white/10 hover:bg-white/20',
    danger: 'bg-red-500 hover:bg-red-600',
    success: 'bg-green-500 hover:bg-green-600',
  },
  accent: {
    glow: 'shadow-orange-500/20',
    border: 'border-orange-500/30',
    ring: 'ring-orange-500/50',
    loading: 'text-orange-500',
    toggle: 'peer-checked:bg-orange-400',
    toggleRing: 'peer-focus:ring-orange-400/50',
  },
  preview: {
    bg: '#1a0a05',
    accent: '#fb923c',
    bubble: '#ea580c',
  },
  splash: {
    bg: 'linear-gradient(to bottom, #1a0a05, #2d1508)',
    logoGlow: '0 0 60px rgba(251, 146, 60, 0.8)',
    spinner: '#fb923c',
    text: '#fdba74',
  },
};

const emeraldForest: ThemeDefinition = {
  id: 'emerald-forest',
  name: 'Emerald Forest',
  tier: 'pro',
  background: 'bg-gradient-to-b from-[#051a0e] to-[#0a2918]',
  text: 'text-white',
  primary: 'text-emerald-400',
  stickyHeader: 'bg-[#051a0e]',
  bubble: {
    sender: 'bg-gradient-to-b from-emerald-500 to-emerald-700',
    receiver: 'bg-gradient-to-b from-[#0f3d24] to-[#071f12]',
  },
  nav: {
    find: 'text-emerald-400',
    discover: 'text-emerald-400',
    chat: 'text-emerald-400',
    connections: 'text-emerald-400',
    profile: 'text-emerald-400',
    inactive: 'text-white/60',
  },
  button: {
    primary: 'bg-gradient-to-r from-emerald-500 to-emerald-700',
    primaryHover: 'hover:from-emerald-600 hover:to-emerald-800',
    secondary: 'bg-white/10 hover:bg-white/20',
    danger: 'bg-red-500 hover:bg-red-600',
    success: 'bg-green-500 hover:bg-green-600',
  },
  accent: {
    glow: 'shadow-emerald-500/20',
    border: 'border-emerald-500/30',
    ring: 'ring-emerald-500/50',
    loading: 'text-emerald-500',
    toggle: 'peer-checked:bg-emerald-400',
    toggleRing: 'peer-focus:ring-emerald-400/50',
  },
  preview: {
    bg: '#051a0e',
    accent: '#34d399',
    bubble: '#10b981',
  },
  splash: {
    bg: 'linear-gradient(to bottom, #051a0e, #0a2918)',
    logoGlow: '0 0 60px rgba(52, 211, 153, 0.8)',
    spinner: '#34d399',
    text: '#6ee7b7',
  },
};

const purpleHaze: ThemeDefinition = {
  id: 'purple-haze',
  name: 'Purple Haze',
  tier: 'pro',
  background: 'bg-gradient-to-b from-[#150a24] to-[#1e0f35]',
  text: 'text-white',
  primary: 'text-purple-400',
  stickyHeader: 'bg-[#150a24]',
  bubble: {
    sender: 'bg-gradient-to-b from-purple-500 to-purple-700',
    receiver: 'bg-gradient-to-b from-[#2d1554] to-[#150a2e]',
  },
  nav: {
    find: 'text-purple-400',
    discover: 'text-purple-400',
    chat: 'text-purple-400',
    connections: 'text-purple-400',
    profile: 'text-purple-400',
    inactive: 'text-white/60',
  },
  button: {
    primary: 'bg-gradient-to-r from-purple-500 to-purple-700',
    primaryHover: 'hover:from-purple-600 hover:to-purple-800',
    secondary: 'bg-white/10 hover:bg-white/20',
    danger: 'bg-red-500 hover:bg-red-600',
    success: 'bg-green-500 hover:bg-green-600',
  },
  accent: {
    glow: 'shadow-purple-500/20',
    border: 'border-purple-500/30',
    ring: 'ring-purple-500/50',
    loading: 'text-purple-500',
    toggle: 'peer-checked:bg-purple-400',
    toggleRing: 'peer-focus:ring-purple-400/50',
  },
  preview: {
    bg: '#150a24',
    accent: '#c084fc',
    bubble: '#9333ea',
  },
  splash: {
    bg: 'linear-gradient(to bottom, #150a24, #1e0f35)',
    logoGlow: '0 0 60px rgba(192, 132, 252, 0.8)',
    spinner: '#c084fc',
    text: '#d8b4fe',
  },
};

// ============ VIP THEMES ============

const royalGold: ThemeDefinition = {
  id: 'royal-gold',
  name: 'Royal Gold',
  tier: 'vip',
  background: 'bg-gradient-to-b from-black to-[#0b0b0b]',
  text: 'text-white',
  primary: 'text-amber-400',
  stickyHeader: 'bg-black',
  bubble: {
    sender: 'bg-gradient-to-b from-amber-500 to-amber-700',
    receiver: 'bg-gradient-to-b from-[#1a1a1a] to-[#0b0b0b]',
  },
  nav: {
    find: 'text-amber-400',
    discover: 'text-amber-400',
    chat: 'text-amber-400',
    connections: 'text-amber-400',
    profile: 'text-amber-400',
    inactive: 'text-amber-400/60',
  },
  button: {
    primary: 'bg-gradient-to-r from-amber-500 to-amber-700',
    primaryHover: 'hover:from-amber-600 hover:to-amber-800',
    secondary: 'bg-white/10 hover:bg-white/20',
    danger: 'bg-red-500 hover:bg-red-600',
    success: 'bg-green-500 hover:bg-green-600',
  },
  accent: {
    glow: 'shadow-amber-500/20',
    border: 'border-amber-500/30',
    ring: 'ring-amber-500/50',
    loading: 'text-amber-500',
    toggle: 'peer-checked:bg-amber-400',
    toggleRing: 'peer-focus:ring-amber-400/50',
  },
  preview: {
    bg: '#000000',
    accent: '#fbbf24',
    bubble: '#d97706',
  },
  splash: {
    bg: 'linear-gradient(to bottom, #000000, #0b0b0b)',
    logoGlow: '0 0 60px rgba(251, 191, 36, 0.8)',
    spinner: '#fbbf24',
    text: '#fcd34d',
  },
};

const neonCyber: ThemeDefinition = {
  id: 'neon-cyber',
  name: 'Neon Cyber',
  tier: 'vip',
  background: 'bg-gradient-to-b from-[#0a0014] to-[#140028]',
  text: 'text-white',
  primary: 'text-fuchsia-400',
  stickyHeader: 'bg-[#0a0014]',
  bubble: {
    sender: 'bg-gradient-to-b from-fuchsia-500 to-violet-600',
    receiver: 'bg-gradient-to-b from-[#1a002e] to-[#0a0014]',
  },
  nav: {
    find: 'text-fuchsia-400',
    discover: 'text-cyan-400',
    chat: 'text-lime-400',
    connections: 'text-pink-400',
    profile: 'text-violet-400',
    inactive: 'text-white/40',
  },
  button: {
    primary: 'bg-gradient-to-r from-fuchsia-500 to-violet-600',
    primaryHover: 'hover:from-fuchsia-600 hover:to-violet-700',
    secondary: 'bg-white/10 hover:bg-white/20',
    danger: 'bg-red-500 hover:bg-red-600',
    success: 'bg-lime-500 hover:bg-lime-600',
  },
  accent: {
    glow: 'shadow-fuchsia-500/30',
    border: 'border-fuchsia-500/30',
    ring: 'ring-fuchsia-500/50',
    loading: 'text-fuchsia-500',
    toggle: 'peer-checked:bg-fuchsia-400',
    toggleRing: 'peer-focus:ring-fuchsia-400/50',
  },
  preview: {
    bg: '#0a0014',
    accent: '#e879f9',
    bubble: '#d946ef',
  },
  splash: {
    bg: 'linear-gradient(to bottom, #0a0014, #140028)',
    logoGlow: '0 0 80px rgba(232, 121, 249, 0.9), 0 0 120px rgba(34, 211, 238, 0.4)',
    spinner: '#e879f9',
    text: '#f0abfc',
  },
};

const roseGold: ThemeDefinition = {
  id: 'rose-gold',
  name: 'Rose Gold',
  tier: 'vip',
  background: 'bg-gradient-to-b from-[#1a0f14] to-[#2a1520]',
  text: 'text-white',
  primary: 'text-rose-300',
  stickyHeader: 'bg-[#1a0f14]',
  bubble: {
    sender: 'bg-gradient-to-b from-rose-400 to-rose-600',
    receiver: 'bg-gradient-to-b from-[#3d1f2e] to-[#1a0f14]',
  },
  nav: {
    find: 'text-rose-300',
    discover: 'text-rose-300',
    chat: 'text-rose-300',
    connections: 'text-rose-300',
    profile: 'text-rose-300',
    inactive: 'text-rose-300/60',
  },
  button: {
    primary: 'bg-gradient-to-r from-rose-400 to-rose-600',
    primaryHover: 'hover:from-rose-500 hover:to-rose-700',
    secondary: 'bg-white/10 hover:bg-white/20',
    danger: 'bg-red-500 hover:bg-red-600',
    success: 'bg-green-500 hover:bg-green-600',
  },
  accent: {
    glow: 'shadow-rose-500/20',
    border: 'border-rose-500/30',
    ring: 'ring-rose-500/50',
    loading: 'text-rose-400',
    toggle: 'peer-checked:bg-rose-400',
    toggleRing: 'peer-focus:ring-rose-400/50',
  },
  preview: {
    bg: '#1a0f14',
    accent: '#fda4af',
    bubble: '#f43f5e',
  },
  splash: {
    bg: 'linear-gradient(to bottom, #1a0f14, #2a1520)',
    logoGlow: '0 0 60px rgba(253, 164, 175, 0.8)',
    spinner: '#fda4af',
    text: '#fecdd3',
  },
};

const neonGhost: ThemeDefinition = {
  id: 'neon-ghost',
  name: 'Neon Ghost',
  tier: 'vip',
  background: 'bg-gradient-to-b from-[#020d02] to-[#0a1a0a]',
  text: 'text-white',
  primary: 'text-lime-400',
  stickyHeader: 'bg-[#020d02]',
  bubble: {
    sender: 'bg-gradient-to-b from-lime-500 to-green-700',
    receiver: 'bg-gradient-to-b from-[#0f2a0f] to-[#051205]',
  },
  nav: {
    find: 'text-lime-400',
    discover: 'text-cyan-400',
    chat: 'text-lime-400',
    connections: 'text-emerald-400',
    profile: 'text-green-400',
    inactive: 'text-white/30',
  },
  button: {
    primary: 'bg-gradient-to-r from-lime-500 to-green-600',
    primaryHover: 'hover:from-lime-600 hover:to-green-700',
    secondary: 'bg-white/10 hover:bg-white/20',
    danger: 'bg-red-500 hover:bg-red-600',
    success: 'bg-lime-500 hover:bg-lime-600',
  },
  accent: {
    glow: 'shadow-lime-500/30',
    border: 'border-lime-500/30',
    ring: 'ring-lime-500/50',
    loading: 'text-lime-500',
    toggle: 'peer-checked:bg-lime-400',
    toggleRing: 'peer-focus:ring-lime-500/50',
  },
  preview: {
    bg: '#020d02',
    accent: '#84cc16',
    bubble: '#22c55e',
  },
  splash: {
    bg: 'linear-gradient(to bottom, #020d02, #0a1a0a)',
    logoGlow: '0 0 80px rgba(132, 204, 22, 0.9), 0 0 140px rgba(34, 197, 94, 0.4)',
    spinner: '#84cc16',
    text: '#a3e635',
  },
};

const bubbleGum: ThemeDefinition = {
  id: 'bubble-gum',
  name: 'Bubble Gum',
  tier: 'vip',
  background: 'bg-gradient-to-b from-[#1a0a12] to-[#2a0f1e]',
  text: 'text-white',
  primary: 'text-pink-400',
  stickyHeader: 'bg-[#1a0a12]',
  bubble: {
    sender: 'bg-gradient-to-b from-pink-400 to-fuchsia-600',
    receiver: 'bg-gradient-to-b from-[#3d1a2e] to-[#1a0a12]',
  },
  nav: {
    find: 'text-pink-400',
    discover: 'text-fuchsia-400',
    chat: 'text-pink-300',
    connections: 'text-rose-400',
    profile: 'text-pink-400',
    inactive: 'text-pink-300/40',
  },
  button: {
    primary: 'bg-gradient-to-r from-pink-400 to-fuchsia-500',
    primaryHover: 'hover:from-pink-500 hover:to-fuchsia-600',
    secondary: 'bg-white/10 hover:bg-white/20',
    danger: 'bg-red-500 hover:bg-red-600',
    success: 'bg-green-500 hover:bg-green-600',
  },
  accent: {
    glow: 'shadow-pink-500/30',
    border: 'border-pink-500/30',
    ring: 'ring-pink-500/50',
    loading: 'text-pink-500',
    toggle: 'peer-checked:bg-pink-400',
    toggleRing: 'peer-focus:ring-pink-500/50',
  },
  preview: {
    bg: '#1a0a12',
    accent: '#f472b6',
    bubble: '#ec4899',
  },
  splash: {
    bg: 'linear-gradient(to bottom, #1a0a12, #2a0f1e)',
    logoGlow: '0 0 80px rgba(244, 114, 182, 0.9), 0 0 120px rgba(217, 70, 239, 0.4)',
    spinner: '#f472b6',
    text: '#f9a8d4',
  },
};

const cyber: ThemeDefinition = {
  id: 'cyber',
  name: 'Cyber',
  tier: 'vip',
  background: 'bg-gradient-to-b from-black to-[#0a0000]',
  text: 'text-white',
  primary: 'text-red-500',
  stickyHeader: 'bg-black',
  bubble: {
    sender: 'bg-gradient-to-b from-red-500 to-red-800',
    receiver: 'bg-gradient-to-b from-[#1a0505] to-[#0a0000]',
  },
  nav: {
    find: 'text-red-500',
    discover: 'text-red-400',
    chat: 'text-red-500',
    connections: 'text-red-400',
    profile: 'text-red-500',
    inactive: 'text-red-500/40',
  },
  button: {
    primary: 'bg-gradient-to-r from-red-600 to-red-800',
    primaryHover: 'hover:from-red-700 hover:to-red-900',
    secondary: 'bg-white/10 hover:bg-white/20',
    danger: 'bg-red-700 hover:bg-red-800',
    success: 'bg-green-600 hover:bg-green-700',
  },
  accent: {
    glow: 'shadow-red-600/30',
    border: 'border-red-600/30',
    ring: 'ring-red-600/50',
    loading: 'text-red-600',
    toggle: 'peer-checked:bg-red-500',
    toggleRing: 'peer-focus:ring-red-600/50',
  },
  preview: {
    bg: '#000000',
    accent: '#dc2626',
    bubble: '#991b1b',
  },
  splash: {
    bg: 'linear-gradient(to bottom, #000000, #0a0000)',
    logoGlow: '0 0 80px rgba(220, 38, 38, 0.9), 0 0 120px rgba(185, 28, 28, 0.4)',
    spinner: '#dc2626',
    text: '#fca5a5',
  },
};

// ============ STORE EXCLUSIVE THEMES ============

const cyberpunk2077: ThemeDefinition = {
  id: 'cyberpunk-2077', name: 'Cyberpunk 2077', tier: 'free', storeExclusive: true,
  background: 'bg-gradient-to-b from-[#0a0a1a] to-[#1a0a2e]',
  text: 'text-white', primary: 'text-yellow-400',
  stickyHeader: 'bg-[#0a0a1a]',
  bubble: { sender: 'bg-gradient-to-b from-yellow-500 to-orange-600', receiver: 'bg-gradient-to-b from-[#1a1a3a] to-[#0f0f2a]' },
  nav: { find: 'text-yellow-400', discover: 'text-cyan-400', chat: 'text-pink-400', connections: 'text-green-400', profile: 'text-purple-400', inactive: 'text-gray-500' },
  button: { primary: 'bg-gradient-to-r from-yellow-500 to-orange-500', primaryHover: 'hover:from-yellow-400 hover:to-orange-400', secondary: 'bg-yellow-500/10 hover:bg-yellow-500/20', danger: 'bg-red-600 hover:bg-red-700', success: 'bg-green-500 hover:bg-green-600' },
  accent: { glow: 'shadow-yellow-500/30', border: 'border-yellow-500/30', ring: 'ring-yellow-500/50', loading: 'text-yellow-500', toggle: 'peer-checked:bg-yellow-500', toggleRing: 'peer-focus:ring-yellow-500/50' },
  preview: { bg: '#0a0a1a', accent: '#eab308', bubble: '#f59e0b' },
  splash: { bg: 'linear-gradient(135deg, #0a0a1a, #1a0a2e, #0a0a1a)', logoGlow: '0 0 60px rgba(234,179,8,0.8), 0 0 120px rgba(234,179,8,0.3)', spinner: '#eab308', text: '#fde047' },
  swipeButton: genSwipe('from-yellow-500 to-orange-500', 'from-red-600 to-red-800', 'from-cyan-500 to-blue-600', 'square'),
  chat: { inputBg: 'bg-yellow-500/10', inputBorder: 'border-yellow-500/30', inputText: 'text-yellow-100', bubbleSenderShadow: 'shadow-[0_2px_16px_rgba(234,179,8,0.3)]', bubbleReceiverShadow: 'shadow-[0_2px_12px_rgba(0,0,0,0.4)]', headerBg: 'bg-[#0a0a1a]/90 backdrop-blur-md', timestamp: 'text-yellow-500/50' },
  transition: genTransition('fast', 'snappy'),
  splashAnimation: 'glitch-multiply',
};

const sakuraBlossom: ThemeDefinition = {
  id: 'sakura-blossom', name: 'Sakura Blossom', tier: 'free', storeExclusive: true,
  background: 'bg-gradient-to-b from-[#1a0f15] to-[#2a1520]',
  text: 'text-white', primary: 'text-pink-300',
  stickyHeader: 'bg-[#1a0f15]',
  bubble: { sender: 'bg-gradient-to-b from-pink-400 to-rose-500', receiver: 'bg-gradient-to-b from-[#2a1520] to-[#1f1018]' },
  nav: { find: 'text-pink-300', discover: 'text-rose-300', chat: 'text-pink-400', connections: 'text-fuchsia-300', profile: 'text-pink-300', inactive: 'text-gray-500' },
  button: { primary: 'bg-gradient-to-r from-pink-400 to-rose-500', primaryHover: 'hover:from-pink-300 hover:to-rose-400', secondary: 'bg-pink-400/10 hover:bg-pink-400/20', danger: 'bg-red-500 hover:bg-red-600', success: 'bg-emerald-500 hover:bg-emerald-600' },
  accent: { glow: 'shadow-pink-400/30', border: 'border-pink-400/30', ring: 'ring-pink-400/50', loading: 'text-pink-400', toggle: 'peer-checked:bg-pink-400', toggleRing: 'peer-focus:ring-pink-400/50' },
  preview: { bg: '#1a0f15', accent: '#f472b6', bubble: '#fb7185' },
  splash: { bg: 'linear-gradient(135deg, #1a0f15, #2a1520, #1a0f15)', logoGlow: '0 0 60px rgba(244,114,182,0.8), 0 0 100px rgba(251,113,133,0.3)', spinner: '#f472b6', text: '#fbcfe8' },
  swipeButton: genSwipe('from-pink-400 to-rose-500', 'from-red-400 to-rose-600', 'from-fuchsia-400 to-pink-500', 'pill'),
  chat: { inputBg: 'bg-pink-400/10', inputBorder: 'border-pink-400/30', inputText: 'text-pink-100', bubbleSenderShadow: 'shadow-[0_2px_16px_rgba(244,114,182,0.25)]', bubbleReceiverShadow: 'shadow-[0_2px_8px_rgba(0,0,0,0.25)]', headerBg: 'bg-[#1a0f15]/90 backdrop-blur-md', timestamp: 'text-pink-400/50' },
  transition: genTransition('slow', 'bouncy'),
  splashAnimation: 'float-petals',
};

const miamiVice: ThemeDefinition = {
  id: 'miami-vice', name: 'Miami Vice', tier: 'free', storeExclusive: true,
  background: 'bg-gradient-to-b from-[#1a0a2e] to-[#0a1a2e]',
  text: 'text-white', primary: 'text-pink-400',
  stickyHeader: 'bg-[#1a0a2e]',
  bubble: { sender: 'bg-gradient-to-b from-pink-500 to-cyan-500', receiver: 'bg-gradient-to-b from-[#1f1040] to-[#0f1a30]' },
  nav: { find: 'text-pink-400', discover: 'text-cyan-400', chat: 'text-pink-300', connections: 'text-cyan-300', profile: 'text-purple-400', inactive: 'text-gray-500' },
  button: { primary: 'bg-gradient-to-r from-pink-500 to-cyan-500', primaryHover: 'hover:from-pink-400 hover:to-cyan-400', secondary: 'bg-pink-500/10 hover:bg-pink-500/20', danger: 'bg-red-500 hover:bg-red-600', success: 'bg-emerald-500 hover:bg-emerald-600' },
  accent: { glow: 'shadow-pink-500/30', border: 'border-pink-500/30', ring: 'ring-pink-500/50', loading: 'text-pink-500', toggle: 'peer-checked:bg-pink-500', toggleRing: 'peer-focus:ring-pink-500/50' },
  preview: { bg: '#1a0a2e', accent: '#ec4899', bubble: '#06b6d4' },
  splash: { bg: 'linear-gradient(135deg, #1a0a2e, #0a1a2e)', logoGlow: '0 0 60px rgba(236,72,153,0.7), 0 0 60px rgba(6,182,212,0.7)', spinner: '#ec4899', text: '#f9a8d4' },
  swipeButton: genSwipe('from-pink-500 to-cyan-500', 'from-red-500 to-pink-600', 'from-cyan-400 to-blue-500', 'rounded'),
  chat: { inputBg: 'bg-pink-500/10', inputBorder: 'border-pink-500/20', inputText: 'text-pink-100', bubbleSenderShadow: 'shadow-[0_2px_16px_rgba(236,72,153,0.3)]', bubbleReceiverShadow: 'shadow-[0_2px_12px_rgba(6,182,212,0.2)]', headerBg: 'bg-[#1a0a2e]/90 backdrop-blur-md', timestamp: 'text-pink-400/40' },
  transition: genTransition('normal', 'smooth'),
  splashAnimation: 'neon-pulse',
};

const auroraBorealis: ThemeDefinition = {
  id: 'aurora-borealis', name: 'Aurora Borealis', tier: 'free', storeExclusive: true,
  background: 'bg-gradient-to-b from-[#0a1a0f] to-[#0f0a1a]',
  text: 'text-white', primary: 'text-green-400',
  stickyHeader: 'bg-[#0a1a0f]',
  bubble: { sender: 'bg-gradient-to-b from-green-500 to-teal-600', receiver: 'bg-gradient-to-b from-[#0f1a15] to-[#0a0f1a]' },
  nav: { find: 'text-green-400', discover: 'text-teal-400', chat: 'text-emerald-400', connections: 'text-cyan-400', profile: 'text-green-300', inactive: 'text-gray-500' },
  button: { primary: 'bg-gradient-to-r from-green-500 to-teal-500', primaryHover: 'hover:from-green-400 hover:to-teal-400', secondary: 'bg-green-500/10 hover:bg-green-500/20', danger: 'bg-red-500 hover:bg-red-600', success: 'bg-emerald-500 hover:bg-emerald-600' },
  accent: { glow: 'shadow-green-500/30', border: 'border-green-500/30', ring: 'ring-green-500/50', loading: 'text-green-500', toggle: 'peer-checked:bg-green-500', toggleRing: 'peer-focus:ring-green-500/50' },
  preview: { bg: '#0a1a0f', accent: '#22c55e', bubble: '#14b8a6' },
  splash: { bg: 'linear-gradient(135deg, #0a1a0f, #0f0a1a, #0a1a0f)', logoGlow: '0 0 60px rgba(34,197,94,0.8), 0 0 100px rgba(20,184,166,0.4)', spinner: '#22c55e', text: '#86efac' },
  swipeButton: genSwipe('from-green-500 to-teal-500', 'from-red-500 to-red-700', 'from-teal-400 to-cyan-500', 'circle'),
  chat: { inputBg: 'bg-green-500/10', inputBorder: 'border-green-500/20', inputText: 'text-green-100', bubbleSenderShadow: 'shadow-[0_2px_20px_rgba(34,197,94,0.25)]', bubbleReceiverShadow: 'shadow-[0_2px_10px_rgba(0,0,0,0.3)]', headerBg: 'bg-[#0a1a0f]/90 backdrop-blur-md', timestamp: 'text-green-400/40' },
  transition: genTransition('slow', 'smooth'),
  splashAnimation: 'aurora-wave',
};

const cosmicPurple: ThemeDefinition = {
  id: 'cosmic-purple', name: 'Cosmic Purple', tier: 'free', storeExclusive: true,
  background: 'bg-gradient-to-b from-[#0f0a1a] to-[#1a0f2e]',
  text: 'text-white', primary: 'text-violet-400',
  stickyHeader: 'bg-[#0f0a1a]',
  bubble: { sender: 'bg-gradient-to-b from-violet-500 to-purple-600', receiver: 'bg-gradient-to-b from-[#150f25] to-[#0f0a1a]' },
  nav: { find: 'text-violet-400', discover: 'text-purple-400', chat: 'text-fuchsia-400', connections: 'text-indigo-400', profile: 'text-violet-300', inactive: 'text-gray-500' },
  button: { primary: 'bg-gradient-to-r from-violet-500 to-purple-600', primaryHover: 'hover:from-violet-400 hover:to-purple-500', secondary: 'bg-violet-500/10 hover:bg-violet-500/20', danger: 'bg-red-500 hover:bg-red-600', success: 'bg-emerald-500 hover:bg-emerald-600' },
  accent: { glow: 'shadow-violet-500/30', border: 'border-violet-500/30', ring: 'ring-violet-500/50', loading: 'text-violet-500', toggle: 'peer-checked:bg-violet-500', toggleRing: 'peer-focus:ring-violet-500/50' },
  preview: { bg: '#0f0a1a', accent: '#8b5cf6', bubble: '#a855f7' },
  splash: { bg: 'linear-gradient(135deg, #0f0a1a, #1a0f2e)', logoGlow: '0 0 60px rgba(139,92,246,0.8), 0 0 120px rgba(168,85,247,0.3)', spinner: '#8b5cf6', text: '#c4b5fd' },
  swipeButton: genSwipe('from-violet-500 to-purple-600', 'from-red-500 to-rose-600', 'from-indigo-500 to-violet-600', 'rounded'),
  chat: { inputBg: 'bg-violet-500/10', inputBorder: 'border-violet-500/20', inputText: 'text-violet-100', bubbleSenderShadow: 'shadow-[0_2px_16px_rgba(139,92,246,0.3)]', bubbleReceiverShadow: 'shadow-[0_2px_10px_rgba(0,0,0,0.3)]', headerBg: 'bg-[#0f0a1a]/90 backdrop-blur-md', timestamp: 'text-violet-400/40' },
  transition: genTransition('normal', 'bouncy'),
  splashAnimation: 'orbit',
};

const bloodMoon: ThemeDefinition = {
  id: 'blood-moon', name: 'Blood Moon', tier: 'free', storeExclusive: true,
  background: 'bg-gradient-to-b from-[#1a0505] to-[#2e0a0a]',
  text: 'text-white', primary: 'text-red-500',
  stickyHeader: 'bg-[#1a0505]',
  bubble: { sender: 'bg-gradient-to-b from-red-600 to-red-800', receiver: 'bg-gradient-to-b from-[#2a0f0f] to-[#1a0505]' },
  nav: { find: 'text-red-400', discover: 'text-red-500', chat: 'text-orange-400', connections: 'text-red-400', profile: 'text-rose-400', inactive: 'text-gray-500' },
  button: { primary: 'bg-gradient-to-r from-red-600 to-red-800', primaryHover: 'hover:from-red-500 hover:to-red-700', secondary: 'bg-red-500/10 hover:bg-red-500/20', danger: 'bg-red-700 hover:bg-red-800', success: 'bg-emerald-600 hover:bg-emerald-700' },
  accent: { glow: 'shadow-red-600/30', border: 'border-red-600/30', ring: 'ring-red-600/50', loading: 'text-red-600', toggle: 'peer-checked:bg-red-600', toggleRing: 'peer-focus:ring-red-600/50' },
  preview: { bg: '#1a0505', accent: '#dc2626', bubble: '#b91c1c' },
  splash: { bg: 'linear-gradient(135deg, #1a0505, #2e0a0a)', logoGlow: '0 0 80px rgba(220,38,38,0.9), 0 0 140px rgba(185,28,28,0.4)', spinner: '#dc2626', text: '#fca5a5' },
  swipeButton: genSwipe('from-red-600 to-red-800', 'from-red-800 to-red-950', 'from-rose-600 to-red-700', 'square'),
  chat: { inputBg: 'bg-red-600/10', inputBorder: 'border-red-600/30', inputText: 'text-red-100', bubbleSenderShadow: 'shadow-[0_2px_20px_rgba(220,38,38,0.35)]', bubbleReceiverShadow: 'shadow-[0_2px_12px_rgba(0,0,0,0.4)]', headerBg: 'bg-[#1a0505]/90 backdrop-blur-md', timestamp: 'text-red-400/50' },
  transition: genTransition('fast', 'snappy'),
  splashAnimation: 'drip',
};

const oceanDeep: ThemeDefinition = {
  id: 'ocean-deep', name: 'Ocean Deep', tier: 'free', storeExclusive: true,
  background: 'bg-gradient-to-b from-[#041424] to-[#0a2040]',
  text: 'text-white', primary: 'text-teal-400',
  stickyHeader: 'bg-[#041424]',
  bubble: { sender: 'bg-gradient-to-b from-teal-500 to-cyan-700', receiver: 'bg-gradient-to-b from-[#0a1a30] to-[#041424]' },
  nav: { find: 'text-teal-400', discover: 'text-cyan-400', chat: 'text-teal-300', connections: 'text-blue-400', profile: 'text-teal-400', inactive: 'text-gray-500' },
  button: { primary: 'bg-gradient-to-r from-teal-500 to-cyan-600', primaryHover: 'hover:from-teal-400 hover:to-cyan-500', secondary: 'bg-teal-500/10 hover:bg-teal-500/20', danger: 'bg-red-500 hover:bg-red-600', success: 'bg-emerald-500 hover:bg-emerald-600' },
  accent: { glow: 'shadow-teal-500/30', border: 'border-teal-500/30', ring: 'ring-teal-500/50', loading: 'text-teal-500', toggle: 'peer-checked:bg-teal-500', toggleRing: 'peer-focus:ring-teal-500/50' },
  preview: { bg: '#041424', accent: '#14b8a6', bubble: '#0d9488' },
  splash: { bg: 'linear-gradient(135deg, #041424, #0a2040)', logoGlow: '0 0 60px rgba(20,184,166,0.8), 0 0 100px rgba(13,148,136,0.4)', spinner: '#14b8a6', text: '#99f6e4' },
  swipeButton: genSwipe('from-teal-500 to-cyan-600', 'from-red-500 to-red-700', 'from-cyan-400 to-teal-500', 'circle'),
  chat: { inputBg: 'bg-teal-500/10', inputBorder: 'border-teal-500/20', inputText: 'text-teal-100', bubbleSenderShadow: 'shadow-[0_2px_18px_rgba(20,184,166,0.3)]', bubbleReceiverShadow: 'shadow-[0_2px_10px_rgba(0,0,0,0.35)]', headerBg: 'bg-[#041424]/90 backdrop-blur-md', timestamp: 'text-teal-400/40' },
  transition: genTransition('slow', 'smooth'),
  splashAnimation: 'sink-bubbles',
};

const desertSand: ThemeDefinition = {
  id: 'desert-sand', name: 'Desert Sand', tier: 'free', storeExclusive: true,
  background: 'bg-gradient-to-b from-[#1a150a] to-[#2e2010]',
  text: 'text-white', primary: 'text-amber-400',
  stickyHeader: 'bg-[#1a150a]',
  bubble: { sender: 'bg-gradient-to-b from-amber-500 to-orange-600', receiver: 'bg-gradient-to-b from-[#2a2015] to-[#1a150a]' },
  nav: { find: 'text-amber-400', discover: 'text-orange-400', chat: 'text-yellow-400', connections: 'text-amber-300', profile: 'text-orange-300', inactive: 'text-gray-500' },
  button: { primary: 'bg-gradient-to-r from-amber-500 to-orange-500', primaryHover: 'hover:from-amber-400 hover:to-orange-400', secondary: 'bg-amber-500/10 hover:bg-amber-500/20', danger: 'bg-red-500 hover:bg-red-600', success: 'bg-emerald-500 hover:bg-emerald-600' },
  accent: { glow: 'shadow-amber-500/30', border: 'border-amber-500/30', ring: 'ring-amber-500/50', loading: 'text-amber-500', toggle: 'peer-checked:bg-amber-500', toggleRing: 'peer-focus:ring-amber-500/50' },
  preview: { bg: '#1a150a', accent: '#f59e0b', bubble: '#d97706' },
  splash: { bg: 'linear-gradient(135deg, #1a150a, #2e2010)', logoGlow: '0 0 60px rgba(245,158,11,0.8), 0 0 100px rgba(217,119,6,0.4)', spinner: '#f59e0b', text: '#fcd34d' },
  swipeButton: genSwipe('from-amber-500 to-orange-500', 'from-red-500 to-orange-700', 'from-yellow-400 to-amber-500', 'pill'),
  chat: { inputBg: 'bg-amber-500/10', inputBorder: 'border-amber-500/20', inputText: 'text-amber-100', bubbleSenderShadow: 'shadow-[0_2px_14px_rgba(245,158,11,0.25)]', bubbleReceiverShadow: 'shadow-[0_2px_8px_rgba(0,0,0,0.25)]', headerBg: 'bg-[#1a150a]/90 backdrop-blur-md', timestamp: 'text-amber-400/40' },
  transition: genTransition('normal', 'smooth'),
  splashAnimation: 'sandstorm',
};

const lavenderDream: ThemeDefinition = {
  id: 'lavender-dream', name: 'Lavender Dream', tier: 'free', storeExclusive: true,
  background: 'bg-gradient-to-b from-[#15101f] to-[#1f1530]',
  text: 'text-white', primary: 'text-purple-300',
  stickyHeader: 'bg-[#15101f]',
  bubble: { sender: 'bg-gradient-to-b from-purple-400 to-indigo-500', receiver: 'bg-gradient-to-b from-[#1f1530] to-[#15101f]' },
  nav: { find: 'text-purple-300', discover: 'text-indigo-300', chat: 'text-violet-300', connections: 'text-purple-300', profile: 'text-fuchsia-300', inactive: 'text-gray-500' },
  button: { primary: 'bg-gradient-to-r from-purple-400 to-indigo-500', primaryHover: 'hover:from-purple-300 hover:to-indigo-400', secondary: 'bg-purple-400/10 hover:bg-purple-400/20', danger: 'bg-red-500 hover:bg-red-600', success: 'bg-emerald-500 hover:bg-emerald-600' },
  accent: { glow: 'shadow-purple-400/30', border: 'border-purple-400/30', ring: 'ring-purple-400/50', loading: 'text-purple-400', toggle: 'peer-checked:bg-purple-400', toggleRing: 'peer-focus:ring-purple-400/50' },
  preview: { bg: '#15101f', accent: '#c084fc', bubble: '#818cf8' },
  splash: { bg: 'linear-gradient(135deg, #15101f, #1f1530)', logoGlow: '0 0 60px rgba(192,132,252,0.8), 0 0 100px rgba(129,140,248,0.4)', spinner: '#c084fc', text: '#ddd6fe' },
  swipeButton: genSwipe('from-purple-400 to-indigo-500', 'from-fuchsia-500 to-purple-600', 'from-indigo-400 to-violet-500', 'rounded'),
  chat: { inputBg: 'bg-purple-400/10', inputBorder: 'border-purple-400/20', inputText: 'text-purple-100', bubbleSenderShadow: 'shadow-[0_2px_16px_rgba(192,132,252,0.25)]', bubbleReceiverShadow: 'shadow-[0_2px_8px_rgba(0,0,0,0.2)]', headerBg: 'bg-[#15101f]/90 backdrop-blur-md', timestamp: 'text-purple-300/40' },
  transition: genTransition('slow', 'bouncy'),
  splashAnimation: 'breathe',
};

const frozenLime: ThemeDefinition = {
  id: 'frozen-lime', name: 'Frozen Lime', tier: 'free', storeExclusive: true,
  background: 'bg-gradient-to-b from-[#0a1a0a] to-[#102010]',
  text: 'text-white', primary: 'text-lime-400',
  stickyHeader: 'bg-[#0a1a0a]',
  bubble: { sender: 'bg-gradient-to-b from-lime-500 to-green-600', receiver: 'bg-gradient-to-b from-[#101a10] to-[#0a1a0a]' },
  nav: { find: 'text-lime-400', discover: 'text-green-400', chat: 'text-lime-300', connections: 'text-emerald-400', profile: 'text-lime-400', inactive: 'text-gray-500' },
  button: { primary: 'bg-gradient-to-r from-lime-500 to-green-500', primaryHover: 'hover:from-lime-400 hover:to-green-400', secondary: 'bg-lime-500/10 hover:bg-lime-500/20', danger: 'bg-red-500 hover:bg-red-600', success: 'bg-emerald-500 hover:bg-emerald-600' },
  accent: { glow: 'shadow-lime-500/30', border: 'border-lime-500/30', ring: 'ring-lime-500/50', loading: 'text-lime-500', toggle: 'peer-checked:bg-lime-500', toggleRing: 'peer-focus:ring-lime-500/50' },
  preview: { bg: '#0a1a0a', accent: '#84cc16', bubble: '#65a30d' },
  splash: { bg: 'linear-gradient(135deg, #0a1a0a, #102010)', logoGlow: '0 0 60px rgba(132,204,22,0.8), 0 0 100px rgba(101,163,13,0.4)', spinner: '#84cc16', text: '#d9f99d' },
  swipeButton: genSwipe('from-lime-500 to-green-500', 'from-red-500 to-red-700', 'from-green-400 to-lime-500', 'circle'),
  chat: { inputBg: 'bg-lime-500/10', inputBorder: 'border-lime-500/20', inputText: 'text-lime-100', bubbleSenderShadow: 'shadow-[0_2px_18px_rgba(132,204,22,0.3)]', bubbleReceiverShadow: 'shadow-[0_2px_10px_rgba(0,0,0,0.3)]', headerBg: 'bg-[#0a1a0a]/90 backdrop-blur-md', timestamp: 'text-lime-400/40' },
  transition: genTransition('fast', 'snappy'),
  splashAnimation: 'shatter',
};

const starburst: ThemeDefinition = {
  id: 'starburst', name: 'Starburst', tier: 'free', storeExclusive: true,
  background: 'bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e]',
  text: 'text-white', primary: 'text-orange-400',
  stickyHeader: 'bg-[#0a0a1a]',
  bubble: { sender: 'bg-gradient-to-b from-orange-500 to-red-500', receiver: 'bg-gradient-to-b from-[#15152a] to-[#0a0a1a]' },
  nav: { find: 'text-orange-400', discover: 'text-red-400', chat: 'text-yellow-400', connections: 'text-pink-400', profile: 'text-orange-300', inactive: 'text-gray-500' },
  button: { primary: 'bg-gradient-to-r from-orange-500 to-red-500', primaryHover: 'hover:from-orange-400 hover:to-red-400', secondary: 'bg-orange-500/10 hover:bg-orange-500/20', danger: 'bg-red-600 hover:bg-red-700', success: 'bg-emerald-500 hover:bg-emerald-600' },
  accent: { glow: 'shadow-orange-500/30', border: 'border-orange-500/30', ring: 'ring-orange-500/50', loading: 'text-orange-500', toggle: 'peer-checked:bg-orange-500', toggleRing: 'peer-focus:ring-orange-500/50' },
  preview: { bg: '#0a0a1a', accent: '#f97316', bubble: '#ef4444' },
  splash: { bg: 'linear-gradient(135deg, #0a0a1a, #1a1a2e)', logoGlow: '0 0 60px rgba(249,115,22,0.8), 0 0 100px rgba(239,68,68,0.4)', spinner: '#f97316', text: '#fed7aa' },
  swipeButton: genSwipe('from-orange-500 to-red-500', 'from-red-600 to-rose-700', 'from-amber-400 to-orange-500', 'square'),
  chat: { inputBg: 'bg-orange-500/10', inputBorder: 'border-orange-500/20', inputText: 'text-orange-100', bubbleSenderShadow: 'shadow-[0_2px_16px_rgba(249,115,22,0.3)]', bubbleReceiverShadow: 'shadow-[0_2px_10px_rgba(0,0,0,0.3)]', headerBg: 'bg-[#0a0a1a]/90 backdrop-blur-md', timestamp: 'text-orange-400/40' },
  transition: genTransition('normal', 'smooth'),
  splashAnimation: 'radial-burst',
};

const platinumIce: ThemeDefinition = {
  id: 'platinum-ice', name: 'Platinum Ice', tier: 'free', storeExclusive: true,
  background: 'bg-gradient-to-b from-[#121218] to-[#1a1a24]',
  text: 'text-white', primary: 'text-slate-300',
  stickyHeader: 'bg-[#121218]',
  bubble: { sender: 'bg-gradient-to-b from-slate-400 to-slate-600', receiver: 'bg-gradient-to-b from-[#1a1a24] to-[#121218]' },
  nav: { find: 'text-slate-300', discover: 'text-gray-300', chat: 'text-slate-400', connections: 'text-zinc-300', profile: 'text-slate-300', inactive: 'text-gray-600' },
  button: { primary: 'bg-gradient-to-r from-slate-400 to-slate-600', primaryHover: 'hover:from-slate-300 hover:to-slate-500', secondary: 'bg-slate-400/10 hover:bg-slate-400/20', danger: 'bg-red-500 hover:bg-red-600', success: 'bg-emerald-500 hover:bg-emerald-600' },
  accent: { glow: 'shadow-slate-400/20', border: 'border-slate-400/30', ring: 'ring-slate-400/50', loading: 'text-slate-400', toggle: 'peer-checked:bg-slate-400', toggleRing: 'peer-focus:ring-slate-400/50' },
  preview: { bg: '#121218', accent: '#94a3b8', bubble: '#64748b' },
  splash: { bg: 'linear-gradient(135deg, #121218, #1a1a24)', logoGlow: '0 0 60px rgba(148,163,184,0.6), 0 0 100px rgba(100,116,139,0.3)', spinner: '#94a3b8', text: '#e2e8f0' },
  swipeButton: genSwipe('from-slate-400 to-slate-600', 'from-gray-500 to-gray-700', 'from-zinc-400 to-slate-500', 'rounded'),
  chat: { inputBg: 'bg-slate-400/10', inputBorder: 'border-slate-400/20', inputText: 'text-slate-200', bubbleSenderShadow: 'shadow-[0_2px_12px_rgba(148,163,184,0.2)]', bubbleReceiverShadow: 'shadow-[0_2px_8px_rgba(0,0,0,0.2)]', headerBg: 'bg-[#121218]/90 backdrop-blur-md', timestamp: 'text-slate-400/40' },
  transition: genTransition('fast', 'snappy'),
  splashAnimation: 'mirror',
};

const magmaCore: ThemeDefinition = {
  id: 'magma-core', name: 'Magma Core', tier: 'free', storeExclusive: true,
  background: 'bg-gradient-to-b from-[#1a0800] to-[#2e1000]',
  text: 'text-white', primary: 'text-orange-500',
  stickyHeader: 'bg-[#1a0800]',
  bubble: { sender: 'bg-gradient-to-b from-orange-600 to-red-700', receiver: 'bg-gradient-to-b from-[#2a1000] to-[#1a0800]' },
  nav: { find: 'text-orange-500', discover: 'text-red-500', chat: 'text-orange-400', connections: 'text-amber-400', profile: 'text-orange-400', inactive: 'text-gray-500' },
  button: { primary: 'bg-gradient-to-r from-orange-600 to-red-600', primaryHover: 'hover:from-orange-500 hover:to-red-500', secondary: 'bg-orange-600/10 hover:bg-orange-600/20', danger: 'bg-red-700 hover:bg-red-800', success: 'bg-emerald-600 hover:bg-emerald-700' },
  accent: { glow: 'shadow-orange-600/30', border: 'border-orange-600/30', ring: 'ring-orange-600/50', loading: 'text-orange-600', toggle: 'peer-checked:bg-orange-600', toggleRing: 'peer-focus:ring-orange-600/50' },
  preview: { bg: '#1a0800', accent: '#ea580c', bubble: '#c2410c' },
  splash: { bg: 'linear-gradient(135deg, #1a0800, #2e1000)', logoGlow: '0 0 80px rgba(234,88,12,0.9), 0 0 140px rgba(194,65,12,0.4)', spinner: '#ea580c', text: '#ffedd5' },
  swipeButton: genSwipe('from-orange-600 to-red-600', 'from-red-800 to-red-950', 'from-amber-500 to-orange-600', 'square'),
  chat: { inputBg: 'bg-orange-600/10', inputBorder: 'border-orange-600/30', inputText: 'text-orange-100', bubbleSenderShadow: 'shadow-[0_2px_20px_rgba(234,88,12,0.35)]', bubbleReceiverShadow: 'shadow-[0_2px_12px_rgba(0,0,0,0.4)]', headerBg: 'bg-[#1a0800]/90 backdrop-blur-md', timestamp: 'text-orange-500/50' },
  transition: genTransition('fast', 'snappy'),
  splashAnimation: 'flame',
};

const electricBlue: ThemeDefinition = {
  id: 'electric-blue', name: 'Electric Blue', tier: 'free', storeExclusive: true,
  background: 'bg-gradient-to-b from-[#000a1a] to-[#001a3a]',
  text: 'text-white', primary: 'text-blue-400',
  stickyHeader: 'bg-[#000a1a]',
  bubble: { sender: 'bg-gradient-to-b from-blue-500 to-blue-700', receiver: 'bg-gradient-to-b from-[#001030] to-[#000a1a]' },
  nav: { find: 'text-blue-400', discover: 'text-sky-400', chat: 'text-blue-300', connections: 'text-cyan-400', profile: 'text-blue-400', inactive: 'text-gray-500' },
  button: { primary: 'bg-gradient-to-r from-blue-500 to-blue-700', primaryHover: 'hover:from-blue-400 hover:to-blue-600', secondary: 'bg-blue-500/10 hover:bg-blue-500/20', danger: 'bg-red-500 hover:bg-red-600', success: 'bg-emerald-500 hover:bg-emerald-600' },
  accent: { glow: 'shadow-blue-500/30', border: 'border-blue-500/30', ring: 'ring-blue-500/50', loading: 'text-blue-500', toggle: 'peer-checked:bg-blue-500', toggleRing: 'peer-focus:ring-blue-500/50' },
  preview: { bg: '#000a1a', accent: '#3b82f6', bubble: '#2563eb' },
  splash: { bg: 'linear-gradient(135deg, #000a1a, #001a3a)', logoGlow: '0 0 60px rgba(59,130,246,0.8), 0 0 120px rgba(37,99,235,0.4)', spinner: '#3b82f6', text: '#93c5fd' },
  swipeButton: genSwipe('from-blue-500 to-blue-700', 'from-red-500 to-red-700', 'from-sky-400 to-blue-500', 'circle'),
  chat: { inputBg: 'bg-blue-500/10', inputBorder: 'border-blue-500/20', inputText: 'text-blue-100', bubbleSenderShadow: 'shadow-[0_2px_18px_rgba(59,130,246,0.3)]', bubbleReceiverShadow: 'shadow-[0_2px_10px_rgba(0,0,0,0.3)]', headerBg: 'bg-[#000a1a]/90 backdrop-blur-md', timestamp: 'text-blue-400/40' },
  transition: genTransition('normal', 'smooth'),
  splashAnimation: 'spark',
};

const velvetRose: ThemeDefinition = {
  id: 'velvet-rose', name: 'Velvet Rose', tier: 'free', storeExclusive: true,
  background: 'bg-gradient-to-b from-[#1a0a10] to-[#2e1018]',
  text: 'text-white', primary: 'text-rose-400',
  stickyHeader: 'bg-[#1a0a10]',
  bubble: { sender: 'bg-gradient-to-b from-rose-500 to-pink-700', receiver: 'bg-gradient-to-b from-[#2a1018] to-[#1a0a10]' },
  nav: { find: 'text-rose-400', discover: 'text-pink-400', chat: 'text-rose-300', connections: 'text-fuchsia-400', profile: 'text-rose-400', inactive: 'text-gray-500' },
  button: { primary: 'bg-gradient-to-r from-rose-500 to-pink-600', primaryHover: 'hover:from-rose-400 hover:to-pink-500', secondary: 'bg-rose-500/10 hover:bg-rose-500/20', danger: 'bg-red-500 hover:bg-red-600', success: 'bg-emerald-500 hover:bg-emerald-600' },
  accent: { glow: 'shadow-rose-500/30', border: 'border-rose-500/30', ring: 'ring-rose-500/50', loading: 'text-rose-500', toggle: 'peer-checked:bg-rose-500', toggleRing: 'peer-focus:ring-rose-500/50' },
  preview: { bg: '#1a0a10', accent: '#f43f5e', bubble: '#e11d48' },
  splash: { bg: 'linear-gradient(135deg, #1a0a10, #2e1018)', logoGlow: '0 0 60px rgba(244,63,94,0.8), 0 0 100px rgba(225,29,72,0.4)', spinner: '#f43f5e', text: '#fecdd3' },
  swipeButton: genSwipe('from-rose-500 to-pink-600', 'from-red-500 to-rose-700', 'from-pink-400 to-rose-500', 'pill'),
  chat: { inputBg: 'bg-rose-500/10', inputBorder: 'border-rose-500/20', inputText: 'text-rose-100', bubbleSenderShadow: 'shadow-[0_2px_16px_rgba(244,63,94,0.3)]', bubbleReceiverShadow: 'shadow-[0_2px_10px_rgba(0,0,0,0.3)]', headerBg: 'bg-[#1a0a10]/90 backdrop-blur-md', timestamp: 'text-rose-400/40' },
  transition: genTransition('slow', 'bouncy'),
  splashAnimation: 'bloom',
};

const matrixGreen: ThemeDefinition = {
  id: 'matrix-green', name: 'Matrix', tier: 'free', storeExclusive: true,
  background: 'bg-gradient-to-b from-[#000a00] to-[#001a00]',
  text: 'text-green-300', primary: 'text-green-500',
  stickyHeader: 'bg-[#000a00]',
  bubble: { sender: 'bg-gradient-to-b from-green-600 to-green-800', receiver: 'bg-gradient-to-b from-[#001500] to-[#000a00]' },
  nav: { find: 'text-green-400', discover: 'text-green-500', chat: 'text-green-300', connections: 'text-emerald-400', profile: 'text-green-400', inactive: 'text-green-900' },
  button: { primary: 'bg-gradient-to-r from-green-600 to-green-800', primaryHover: 'hover:from-green-500 hover:to-green-700', secondary: 'bg-green-600/10 hover:bg-green-600/20', danger: 'bg-red-600 hover:bg-red-700', success: 'bg-green-500 hover:bg-green-600' },
  accent: { glow: 'shadow-green-500/30', border: 'border-green-500/30', ring: 'ring-green-500/50', loading: 'text-green-500', toggle: 'peer-checked:bg-green-500', toggleRing: 'peer-focus:ring-green-500/50' },
  preview: { bg: '#000a00', accent: '#22c55e', bubble: '#16a34a' },
  splash: { bg: 'linear-gradient(135deg, #000a00, #001a00)', logoGlow: '0 0 60px rgba(34,197,94,0.9), 0 0 120px rgba(22,163,74,0.4)', spinner: '#22c55e', text: '#bbf7d0' },
  swipeButton: genSwipe('from-green-600 to-green-800', 'from-green-900 to-black', 'from-green-500 to-emerald-600', 'square'),
  chat: { inputBg: 'bg-green-500/10', inputBorder: 'border-green-500/30', inputText: 'text-green-200', bubbleSenderShadow: 'shadow-[0_2px_20px_rgba(34,197,94,0.35)]', bubbleReceiverShadow: 'shadow-[0_2px_12px_rgba(0,0,0,0.4)]', headerBg: 'bg-[#000a00]/90 backdrop-blur-md', timestamp: 'text-green-500/50' },
  transition: genTransition('fast', 'snappy'),
  splashAnimation: 'matrix-rain',
};

const sunsetTropical: ThemeDefinition = {
  id: 'sunset-tropical', name: 'Sunset Tropical', tier: 'free', storeExclusive: true,
  background: 'bg-gradient-to-b from-[#1a0f05] to-[#2e1a0a]',
  text: 'text-white', primary: 'text-yellow-400',
  stickyHeader: 'bg-[#1a0f05]',
  bubble: { sender: 'bg-gradient-to-b from-yellow-500 via-orange-500 to-pink-500', receiver: 'bg-gradient-to-b from-[#2a1a0a] to-[#1a0f05]' },
  nav: { find: 'text-yellow-400', discover: 'text-orange-400', chat: 'text-pink-400', connections: 'text-red-400', profile: 'text-amber-400', inactive: 'text-gray-500' },
  button: { primary: 'bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500', primaryHover: 'hover:from-yellow-400 hover:via-orange-400 hover:to-pink-400', secondary: 'bg-yellow-500/10 hover:bg-yellow-500/20', danger: 'bg-red-500 hover:bg-red-600', success: 'bg-emerald-500 hover:bg-emerald-600' },
  accent: { glow: 'shadow-orange-500/30', border: 'border-orange-500/30', ring: 'ring-orange-500/50', loading: 'text-orange-500', toggle: 'peer-checked:bg-orange-500', toggleRing: 'peer-focus:ring-orange-500/50' },
  preview: { bg: '#1a0f05', accent: '#f59e0b', bubble: '#ec4899' },
  splash: { bg: 'linear-gradient(135deg, #1a0f05, #2e1a0a)', logoGlow: '0 0 60px rgba(245,158,11,0.7), 0 0 60px rgba(236,72,153,0.7)', spinner: '#f59e0b', text: '#fef3c7' },
  swipeButton: genSwipe('from-yellow-500 via-orange-500 to-pink-500', 'from-red-500 to-rose-600', 'from-amber-400 to-yellow-500', 'pill'),
  chat: { inputBg: 'bg-orange-500/10', inputBorder: 'border-orange-500/20', inputText: 'text-orange-100', bubbleSenderShadow: 'shadow-[0_2px_16px_rgba(245,158,11,0.3)]', bubbleReceiverShadow: 'shadow-[0_2px_10px_rgba(0,0,0,0.25)]', headerBg: 'bg-[#1a0f05]/90 backdrop-blur-md', timestamp: 'text-orange-400/40' },
  transition: genTransition('normal', 'bouncy'),
  splashAnimation: 'cascade',
};

const neonPink: ThemeDefinition = {
  id: 'neon-pink', name: 'Neon Pink', tier: 'free', storeExclusive: true,
  background: 'bg-gradient-to-b from-[#1a0015] to-[#2e0025]',
  text: 'text-white', primary: 'text-pink-500',
  stickyHeader: 'bg-[#1a0015]',
  bubble: { sender: 'bg-gradient-to-b from-pink-500 to-fuchsia-700', receiver: 'bg-gradient-to-b from-[#2a0020] to-[#1a0015]' },
  nav: { find: 'text-pink-500', discover: 'text-fuchsia-500', chat: 'text-pink-400', connections: 'text-rose-400', profile: 'text-pink-400', inactive: 'text-gray-500' },
  button: { primary: 'bg-gradient-to-r from-pink-500 to-fuchsia-600', primaryHover: 'hover:from-pink-400 hover:to-fuchsia-500', secondary: 'bg-pink-500/10 hover:bg-pink-500/20', danger: 'bg-red-500 hover:bg-red-600', success: 'bg-emerald-500 hover:bg-emerald-600' },
  accent: { glow: 'shadow-pink-500/40', border: 'border-pink-500/30', ring: 'ring-pink-500/50', loading: 'text-pink-500', toggle: 'peer-checked:bg-pink-500', toggleRing: 'peer-focus:ring-pink-500/50' },
  preview: { bg: '#1a0015', accent: '#ec4899', bubble: '#d946ef' },
  splash: { bg: 'linear-gradient(135deg, #1a0015, #2e0025)', logoGlow: '0 0 80px rgba(236,72,153,0.9), 0 0 140px rgba(217,70,239,0.4)', spinner: '#ec4899', text: '#f9a8d4' },
  swipeButton: genSwipe('from-pink-500 to-fuchsia-600', 'from-fuchsia-700 to-purple-800', 'from-pink-400 to-rose-500', 'rounded'),
  chat: { inputBg: 'bg-pink-500/10', inputBorder: 'border-pink-500/30', inputText: 'text-pink-100', bubbleSenderShadow: 'shadow-[0_2px_20px_rgba(236,72,153,0.4)]', bubbleReceiverShadow: 'shadow-[0_2px_12px_rgba(0,0,0,0.35)]', headerBg: 'bg-[#1a0015]/90 backdrop-blur-md', timestamp: 'text-pink-400/50' },
  transition: genTransition('fast', 'snappy'),
  splashAnimation: 'heartbeat',
};

const midnightGold: ThemeDefinition = {
  id: 'midnight-gold', name: 'Midnight Gold', tier: 'free', storeExclusive: true,
  background: 'bg-gradient-to-b from-[#0a0a00] to-[#1a1a05]',
  text: 'text-white', primary: 'text-yellow-500',
  stickyHeader: 'bg-[#0a0a00]',
  bubble: { sender: 'bg-gradient-to-b from-yellow-500 to-amber-700', receiver: 'bg-gradient-to-b from-[#151505] to-[#0a0a00]' },
  nav: { find: 'text-yellow-500', discover: 'text-amber-500', chat: 'text-yellow-400', connections: 'text-orange-400', profile: 'text-yellow-400', inactive: 'text-gray-600' },
  button: { primary: 'bg-gradient-to-r from-yellow-500 to-amber-600', primaryHover: 'hover:from-yellow-400 hover:to-amber-500', secondary: 'bg-yellow-500/10 hover:bg-yellow-500/20', danger: 'bg-red-500 hover:bg-red-600', success: 'bg-emerald-500 hover:bg-emerald-600' },
  accent: { glow: 'shadow-yellow-500/30', border: 'border-yellow-500/30', ring: 'ring-yellow-500/50', loading: 'text-yellow-500', toggle: 'peer-checked:bg-yellow-500', toggleRing: 'peer-focus:ring-yellow-500/50' },
  preview: { bg: '#0a0a00', accent: '#eab308', bubble: '#d97706' },
  splash: { bg: 'linear-gradient(135deg, #0a0a00, #1a1a05)', logoGlow: '0 0 60px rgba(234,179,8,0.9), 0 0 120px rgba(217,119,6,0.4)', spinner: '#eab308', text: '#fef9c3' },
  swipeButton: genSwipe('from-yellow-500 to-amber-600', 'from-amber-700 to-red-800', 'from-yellow-400 to-gold-500', 'circle'),
  chat: { inputBg: 'bg-yellow-500/10', inputBorder: 'border-yellow-500/20', inputText: 'text-yellow-100', bubbleSenderShadow: 'shadow-[0_2px_18px_rgba(234,179,8,0.35)]', bubbleReceiverShadow: 'shadow-[0_2px_10px_rgba(0,0,0,0.3)]', headerBg: 'bg-[#0a0a00]/90 backdrop-blur-md', timestamp: 'text-yellow-500/50' },
  transition: genTransition('normal', 'smooth'),
  splashAnimation: 'vortex',
};

const toxicWaste: ThemeDefinition = {
  id: 'toxic-waste', name: 'Toxic Waste', tier: 'free', storeExclusive: true,
  background: 'bg-gradient-to-b from-[#0a1a00] to-[#152e00]',
  text: 'text-white', primary: 'text-lime-500',
  stickyHeader: 'bg-[#0a1a00]',
  bubble: { sender: 'bg-gradient-to-b from-lime-500 to-green-700', receiver: 'bg-gradient-to-b from-[#102500] to-[#0a1a00]' },
  nav: { find: 'text-lime-500', discover: 'text-green-500', chat: 'text-lime-400', connections: 'text-emerald-400', profile: 'text-lime-400', inactive: 'text-gray-500' },
  button: { primary: 'bg-gradient-to-r from-lime-500 to-green-600', primaryHover: 'hover:from-lime-400 hover:to-green-500', secondary: 'bg-lime-500/10 hover:bg-lime-500/20', danger: 'bg-red-500 hover:bg-red-600', success: 'bg-green-500 hover:bg-green-600' },
  accent: { glow: 'shadow-lime-500/30', border: 'border-lime-500/30', ring: 'ring-lime-500/50', loading: 'text-lime-500', toggle: 'peer-checked:bg-lime-500', toggleRing: 'peer-focus:ring-lime-500/50' },
  preview: { bg: '#0a1a00', accent: '#84cc16', bubble: '#65a30d' },
  splash: { bg: 'linear-gradient(135deg, #0a1a00, #152e00)', logoGlow: '0 0 80px rgba(132,204,22,0.9), 0 0 140px rgba(101,163,13,0.4)', spinner: '#84cc16', text: '#d9f99d' },
  swipeButton: genSwipe('from-lime-500 to-green-600', 'from-green-800 to-lime-900', 'from-lime-400 to-green-500', 'square'),
  chat: { inputBg: 'bg-lime-500/10', inputBorder: 'border-lime-500/30', inputText: 'text-lime-100', bubbleSenderShadow: 'shadow-[0_2px_20px_rgba(132,204,22,0.35)]', bubbleReceiverShadow: 'shadow-[0_2px_12px_rgba(0,0,0,0.35)]', headerBg: 'bg-[#0a1a00]/90 backdrop-blur-md', timestamp: 'text-lime-500/50' },
  transition: genTransition('fast', 'snappy'),
  splashAnimation: 'toxic-bubbles',
};

const cherryBlossom: ThemeDefinition = {
  id: 'cherry-blossom', name: 'Cherry Blossom', tier: 'free', storeExclusive: true,
  background: 'bg-gradient-to-b from-[#1f0a15] to-[#351020]',
  text: 'text-white', primary: 'text-rose-300',
  stickyHeader: 'bg-[#1f0a15]',
  bubble: { sender: 'bg-gradient-to-b from-rose-400 to-pink-600', receiver: 'bg-gradient-to-b from-[#2a1018] to-[#1f0a15]' },
  nav: { find: 'text-rose-300', discover: 'text-pink-300', chat: 'text-rose-400', connections: 'text-fuchsia-300', profile: 'text-rose-300', inactive: 'text-gray-500' },
  button: { primary: 'bg-gradient-to-r from-rose-400 to-pink-500', primaryHover: 'hover:from-rose-300 hover:to-pink-400', secondary: 'bg-rose-400/10 hover:bg-rose-400/20', danger: 'bg-red-500 hover:bg-red-600', success: 'bg-emerald-500 hover:bg-emerald-600' },
  accent: { glow: 'shadow-rose-400/30', border: 'border-rose-400/30', ring: 'ring-rose-400/50', loading: 'text-rose-400', toggle: 'peer-checked:bg-rose-400', toggleRing: 'peer-focus:ring-rose-400/50' },
  preview: { bg: '#1f0a15', accent: '#fb7185', bubble: '#f472b6' },
  splash: { bg: 'linear-gradient(135deg, #1f0a15, #351020)', logoGlow: '0 0 60px rgba(251,113,133,0.8), 0 0 100px rgba(244,114,182,0.4)', spinner: '#fb7185', text: '#fecdd3' },
  swipeButton: genSwipe('from-rose-400 to-pink-500', 'from-red-400 to-rose-600', 'from-pink-300 to-rose-400', 'pill'),
  chat: { inputBg: 'bg-rose-400/10', inputBorder: 'border-rose-400/20', inputText: 'text-rose-100', bubbleSenderShadow: 'shadow-[0_2px_16px_rgba(251,113,133,0.25)]', bubbleReceiverShadow: 'shadow-[0_2px_8px_rgba(0,0,0,0.2)]', headerBg: 'bg-[#1f0a15]/90 backdrop-blur-md', timestamp: 'text-rose-300/40' },
  transition: genTransition('slow', 'bouncy'),
  splashAnimation: 'petal-fall',
};

// ============ THEME REGISTRY ============

export const ALL_THEMES: ThemeDefinition[] = [
  upendoOriginal,
  midnightOcean,
  arcticFrost,
  sunsetBlaze,
  emeraldForest,
  purpleHaze,
  royalGold,
  neonCyber,
  roseGold,
  neonGhost,
  bubbleGum,
  cyber,
  // Store exclusive themes
  cyberpunk2077,
  sakuraBlossom,
  miamiVice,
  auroraBorealis,
  cosmicPurple,
  bloodMoon,
  oceanDeep,
  desertSand,
  lavenderDream,
  frozenLime,
  starburst,
  platinumIce,
  magmaCore,
  electricBlue,
  velvetRose,
  matrixGreen,
  sunsetTropical,
  neonPink,
  midnightGold,
  toxicWaste,
  cherryBlossom,
];

// Fill in defaults for optional style properties
export const resolveTheme = (t: ThemeDefinition) => ({
  ...t,
  swipeButton: t.swipeButton || genSwipe(
    t.button.primary.replace('bg-gradient-to-r', ''),
    'from-red-500 to-red-600',
    'from-blue-500 to-blue-600',
  ),
  chat: t.chat || genChat(t.preview.accent, t.preview.bg, t.preview.accent),
  transition: t.transition || genTransition(),
});

export const THEME_MAP: Record<string, ThemeDefinition> = {};
ALL_THEMES.forEach(t => { THEME_MAP[t.id] = t; });

const getDefaultThemeId = (accountType: string): string => {
  switch (accountType) {
    case 'vip': return 'royal-gold';
    case 'pro': return 'midnight-ocean';
    default: return 'upendo-original';
  }
};

export const getAvailableThemes = (accountType: string): ThemeDefinition[] => {
  // Store-exclusive themes are only available via promo purchase, never by tier
  const nonStore = ALL_THEMES.filter(t => !t.storeExclusive);
  switch (accountType) {
    case 'vip': return nonStore;
    case 'pro': return nonStore.filter(t => t.tier === 'free' || t.tier === 'pro');
    default: return nonStore.filter(t => t.tier === 'free');
  }
};

export const getTheme = (accountTypeOrThemeId?: string, accountType?: string): ThemeDefinition => {
  if (accountType && accountTypeOrThemeId && THEME_MAP[accountTypeOrThemeId]) {
    const theme = THEME_MAP[accountTypeOrThemeId];
    const available = getAvailableThemes(accountType);
    if (available.some(t => t.id === accountTypeOrThemeId)) {
      return theme;
    }
    return THEME_MAP[getDefaultThemeId(accountType)];
  }

  const acctType = accountTypeOrThemeId;
  switch (acctType) {
    case 'vip': return THEME_MAP['royal-gold'];
    case 'pro': return THEME_MAP['midnight-ocean'];
    default: return THEME_MAP['upendo-original'];
  }
};

export const themes = {
  free: upendoOriginal,
  pro: midnightOcean,
  vip: royalGold,
};
