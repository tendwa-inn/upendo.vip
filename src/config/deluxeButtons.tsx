import React from 'react';
import { Heart, X, Undo2, RotateCcw, FastForward, Rewind, Play, MoreHorizontal, Shield, Star, Zap, Triangle, Circle, Square, Diamond, Hexagon, Octagon, Pentagon, Plus, Minus, ChevronUp, ChevronDown, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { btnI } from '../components/swipe/SwipeCard';

type BtnDef = React.ReactNode;

interface SeekStyle {
  height?: string;
  rounded?: string;
  color: string;
  trackColor?: string;
  glow?: string;
}

export interface DeluxeConfig {
  layout: string;
  layoutClass: string;
  btnClass: string;
  seek: SeekStyle;
  overlay?: string;
  like: BtnDef;
  nope: BtnDef;
  rewind: BtnDef;
}

export const DELUXE_BUTTONS: Record<string, DeluxeConfig> = {
  // ════════════════════════════════════════════════════════
  //  ROW BOTTOM — horizontal strip along bottom
  // ════════════════════════════════════════════════════════

  'deluxe-neon-outline': {
    layout: 'row-bottom',
    layoutClass: 'absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-5 z-40',
    btnClass: '',
    seek: { height: 'h-1', rounded: 'rounded-full', color: 'bg-white' },
    like: <div {...btnI('#f472b6')} className="w-12 h-12 border-2 border-pink-400/70 rounded-full flex items-center justify-center bg-pink-500/10 shadow-[0_0_15px_rgba(244,114,182,0.35)] backdrop-blur-sm"><Heart className="w-5 h-5 text-pink-300" fill="currentColor" /></div>,
    nope: <div {...btnI('#f87171')} className="w-12 h-12 border-2 border-red-400/70 rounded-full flex items-center justify-center bg-red-500/10 shadow-[0_0_15px_rgba(248,113,113,0.35)] backdrop-blur-sm"><X className="w-5 h-5 text-red-300" /></div>,
    rewind: <div {...btnI('#60a5fa')} className="w-12 h-12 border-2 border-blue-400/70 rounded-full flex items-center justify-center bg-blue-500/10 shadow-[0_0_15px_rgba(96,165,250,0.35)] backdrop-blur-sm"><Undo2 className="w-5 h-5 text-blue-300" /></div>,
  },

  'deluxe-spinner-ring': {
    layout: 'row-bottom',
    layoutClass: 'absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-5 z-40',
    btnClass: '',
    seek: { height: 'h-1', rounded: 'rounded-full', color: 'bg-cyan-400' },
    like: <div {...btnI('#22d3ee')} className="w-12 h-12 rounded-full flex items-center justify-center bg-transparent" style={{ border: '3px solid transparent', borderImage: 'linear-gradient(#22d3ee,#a78bfa) 1', borderImageSlice: 1, borderRadius: '50%', background: 'linear-gradient(#0f172a,#0f172a) padding-box, linear-gradient(135deg,#22d3ee,#a78bfa) border-box' }}><Heart className="w-5 h-5 text-cyan-400" /></div>,
    nope: <div {...btnI('#22d3ee')} className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(#0f172a,#0f172a) padding-box, linear-gradient(135deg,#f87171,#fb923c) border-box', border: '3px solid transparent', borderRadius: '50%' }}><X className="w-5 h-5 text-red-400" /></div>,
    rewind: <div {...btnI('#22d3ee')} className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(#0f172a,#0f172a) padding-box, linear-gradient(135deg,#60a5fa,#34d399) border-box', border: '3px solid transparent', borderRadius: '50%' }}><Undo2 className="w-5 h-5 text-blue-400" /></div>,
  },

  'deluxe-rounded-pill': {
    layout: 'row-bottom',
    layoutClass: 'absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-3 z-40',
    btnClass: '',
    seek: { height: 'h-1.5', rounded: 'rounded-full', color: 'bg-orange-400' },
    like: <div {...btnI('#fb923c')} className="px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center gap-2 shadow-lg"><Heart className="w-4 h-4 text-white" fill="white" /><span className="text-white text-xs font-bold">Like</span></div>,
    nope: <div {...btnI('#fb923c')} className="px-5 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-red-700 flex items-center gap-2 shadow-lg"><X className="w-4 h-4 text-white" /><span className="text-white text-xs font-bold">Nope</span></div>,
    rewind: <div {...btnI('#fb923c')} className="px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center gap-2 shadow-lg"><Undo2 className="w-4 h-4 text-white" /><span className="text-white text-xs font-bold">Undo</span></div>,
  },

  'deluxe-square-solid': {
    layout: 'row-bottom',
    layoutClass: 'absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-4 z-40',
    btnClass: '',
    seek: { height: 'h-1', rounded: 'rounded-sm', color: 'bg-white' },
    like: <div {...btnI('#ec4899')} className="w-11 h-11 rounded-lg bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/25 border border-pink-300/20"><Heart className="w-5 h-5 text-white drop-shadow" fill="white" /></div>,
    nope: <div {...btnI('#ec4899')} className="w-11 h-11 rounded-lg bg-gradient-to-br from-red-400 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/25 border border-red-300/20"><X className="w-5 h-5 text-white drop-shadow" /></div>,
    rewind: <div {...btnI('#ec4899')} className="w-11 h-11 rounded-lg bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-blue-300/20"><Undo2 className="w-5 h-5 text-white drop-shadow" /></div>,
  },

  'deluxe-diamond': {
    layout: 'row-bottom',
    layoutClass: 'absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-6 z-40',
    btnClass: '',
    seek: { height: 'h-1', rounded: 'rounded-full', color: 'bg-pink-400' },
    like: <div {...btnI('#a855f7')} className="w-10 h-10 rotate-45 bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg"><Heart className="w-4 h-4 text-white -rotate-45" fill="white" /></div>,
    nope: <div {...btnI('#a855f7')} className="w-10 h-10 rotate-45 bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg"><X className="w-4 h-4 text-white -rotate-45" /></div>,
    rewind: <div {...btnI('#a855f7')} className="w-10 h-10 rotate-45 bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg"><Undo2 className="w-4 h-4 text-white -rotate-45" /></div>,
  },

  'deluxe-morphing': {
    layout: 'row-bottom',
    layoutClass: 'absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-5 z-40',
    btnClass: '',
    seek: { height: 'h-1.5', rounded: 'rounded-full', color: 'bg-violet-400' },
    like: <div {...btnI('#c084fc')} className="w-11 h-11 bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center shadow-lg" style={{ borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%', animation: 'morph 3s ease-in-out infinite' }}><Heart className="w-5 h-5 text-white" fill="white" /></div>,
    nope: <div {...btnI('#c084fc')} className="w-11 h-11 bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg" style={{ borderRadius: '70% 30% 30% 70% / 70% 70% 30% 30%', animation: 'morph 3s ease-in-out infinite reverse' }}><X className="w-5 h-5 text-white" /></div>,
    rewind: <div {...btnI('#c084fc')} className="w-11 h-11 bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center shadow-lg" style={{ borderRadius: '50% 50% 30% 70% / 60% 40% 60% 40%', animation: 'morph 4s ease-in-out infinite' }}><Undo2 className="w-5 h-5 text-white" /></div>,
  },

  'deluxe-capsule': {
    layout: 'row-bottom',
    layoutClass: 'absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2 z-40',
    btnClass: '',
    seek: { height: 'h-2', rounded: 'rounded-full', color: 'bg-emerald-400' },
    like: <div {...btnI('#34d399')} className="w-20 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center gap-1"><Heart className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" /><span className="text-emerald-400 text-[10px] font-bold">YES</span></div>,
    nope: <div {...btnI('#34d399')} className="w-20 h-9 rounded-full bg-red-500/20 border border-red-400/40 flex items-center justify-center gap-1"><X className="w-3.5 h-3.5 text-red-400" /><span className="text-red-400 text-[10px] font-bold">NO</span></div>,
    rewind: <div {...btnI('#34d399')} className="w-20 h-9 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center gap-1"><Undo2 className="w-3.5 h-3.5 text-blue-400" /><span className="text-blue-400 text-[10px] font-bold">UNDO</span></div>,
  },

  'deluxe-torch': {
    layout: 'row-bottom',
    layoutClass: 'absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-5 z-40',
    btnClass: '',
    seek: { height: 'h-1', rounded: 'rounded-full', color: 'bg-amber-400', glow: 'shadow-[0_0_8px_rgba(251,191,36,0.5)]' },
    like: <div {...btnI('#f59e0b')} className="w-11 h-11 rounded-full bg-black/60 border border-amber-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.2)]"><Heart className="w-5 h-5 text-amber-400" fill="currentColor" /></div>,
    nope: <div {...btnI('#f59e0b')} className="w-11 h-11 rounded-full bg-black/60 border border-red-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.2)]"><X className="w-5 h-5 text-red-400" /></div>,
    rewind: <div {...btnI('#f59e0b')} className="w-11 h-11 rounded-full bg-black/60 border border-blue-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.2)]"><Undo2 className="w-5 h-5 text-blue-400" /></div>,
  },

  'deluxe-ripple': {
    layout: 'row-bottom',
    layoutClass: 'absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-5 z-40',
    btnClass: '',
    seek: { height: 'h-1', rounded: 'rounded-full', color: 'bg-sky-400' },
    like: <div {...btnI('#38bdf8')} className="w-12 h-12 rounded-full bg-pink-500/15 border border-pink-400/30 flex items-center justify-center relative"><div className="absolute inset-0 rounded-full border border-pink-400/20 animate-ping" /><Heart className="w-5 h-5 text-pink-400 relative z-10" fill="currentColor" /></div>,
    nope: <div {...btnI('#38bdf8')} className="w-12 h-12 rounded-full bg-red-500/15 border border-red-400/30 flex items-center justify-center relative"><div className="absolute inset-0 rounded-full border border-red-400/20 animate-ping" style={{ animationDelay: '0.5s' }} /><X className="w-5 h-5 text-red-400 relative z-10" /></div>,
    rewind: <div {...btnI('#38bdf8')} className="w-12 h-12 rounded-full bg-blue-500/15 border border-blue-400/30 flex items-center justify-center relative"><div className="absolute inset-0 rounded-full border border-blue-400/20 animate-ping" style={{ animationDelay: '1s' }} /><Undo2 className="w-5 h-5 text-blue-400 relative z-10" /></div>,
  },

  // ════════════════════════════════════════════════════════
  //  CENTER CLUSTER — centered arrangement
  // ════════════════════════════════════════════════════════

  'deluxe-cluster': {
    layout: 'center-cluster',
    layoutClass: 'absolute bottom-20 left-1/2 -translate-x-1/2 flex items-end gap-3 z-40',
    btnClass: '',
    seek: { height: 'h-1.5', rounded: 'rounded-full', color: 'bg-pink-400' },
    like: <div {...btnI('#ec4899')} className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-xl shadow-pink-500/30"><Heart className="w-6 h-6 text-white" fill="white" /></div>,
    nope: <div {...btnI('#ec4899')} className="w-11 h-11 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/20"><X className="w-5 h-5 text-white" /></div>,
    rewind: <div {...btnI('#ec4899')} className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20"><Undo2 className="w-5 h-5 text-white" /></div>,
  },

  'deluxe-tiered': {
    layout: 'center-cluster',
    layoutClass: 'absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-3 z-40',
    btnClass: '',
    seek: { height: 'h-1', rounded: 'rounded-full', color: 'bg-emerald-400' },
    like: <div {...btnI('#10b981')} className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 border border-emerald-300/20"><Heart className="w-5 h-5 text-white drop-shadow" fill="white" /></div>,
    nope: <div {...btnI('#10b981')} className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-400 to-red-700 flex items-center justify-center shadow-md shadow-red-500/20 border border-red-300/20"><X className="w-4 h-4 text-white drop-shadow" /></div>,
    rewind: <div {...btnI('#10b981')} className="w-9 h-9 rounded-md bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center shadow-sm border border-blue-300/20"><Undo2 className="w-4 h-4 text-white drop-shadow" /></div>,
  },

  // ════════════════════════════════════════════════════════
  //  SIDE RIGHT — right side (original position)
  // ════════════════════════════════════════════════════════

  'deluxe-gothic': {
    layout: 'side-right',
    layoutClass: 'absolute bottom-12 right-4 flex flex-col items-center gap-6 z-40',
    btnClass: '',
    seek: { height: 'h-1', rounded: 'rounded-none', color: 'bg-gray-300' },
    like: <div {...btnI('#d1d5db')} className="w-10 h-12 flex items-center justify-center shadow-lg shadow-gray-500/20" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', background: 'linear-gradient(180deg, #1f2937, #111827, #030712)' }}><Heart className="w-4 h-4 text-gray-300" fill="currentColor" style={{ filter: 'drop-shadow(0 0 3px rgba(209,213,219,0.3))' }} /></div>,
    nope: <div {...btnI('#d1d5db')} className="w-10 h-12 flex items-center justify-center shadow-lg shadow-gray-500/20" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', background: 'linear-gradient(180deg, #1f2937, #111827, #030712)' }}><X className="w-4 h-4 text-gray-300" style={{ filter: 'drop-shadow(0 0 3px rgba(209,213,219,0.3))' }} /></div>,
    rewind: <div {...btnI('#d1d5db')} className="w-10 h-12 flex items-center justify-center shadow-lg shadow-gray-500/20" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', background: 'linear-gradient(180deg, #1f2937, #111827, #030712)' }}><Undo2 className="w-4 h-4 text-gray-300" style={{ filter: 'drop-shadow(0 0 3px rgba(209,213,219,0.3))' }} /></div>,
  },

  'deluxe-chrome-ring': {
    layout: 'side-right',
    layoutClass: 'absolute bottom-12 right-4 flex flex-col items-center gap-6 z-40',
    btnClass: '',
    seek: { height: 'h-1', rounded: 'rounded-full', color: 'bg-gray-300' },
    like: <div {...btnI('#e5e7eb')} className="w-11 h-11 rounded-full bg-gradient-to-b from-gray-200 to-gray-400 flex items-center justify-center shadow-md"><div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center"><Heart className="w-4 h-4 text-gray-200" fill="currentColor" /></div></div>,
    nope: <div {...btnI('#e5e7eb')} className="w-11 h-11 rounded-full bg-gradient-to-b from-gray-200 to-gray-400 flex items-center justify-center shadow-md"><div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center"><X className="w-4 h-4 text-gray-200" /></div></div>,
    rewind: <div {...btnI('#e5e7eb')} className="w-11 h-11 rounded-full bg-gradient-to-b from-gray-200 to-gray-400 flex items-center justify-center shadow-md"><div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center"><Undo2 className="w-4 h-4 text-gray-200" /></div></div>,
  },

  'deluxe-sketch': {
    layout: 'side-right',
    layoutClass: 'absolute bottom-12 right-4 flex flex-col items-center gap-6 z-40',
    btnClass: '',
    seek: { height: 'h-0.5', rounded: 'rounded-full', color: 'bg-white' },
    like: <div {...btnI('rgba(255,255,255,0.5)')} className="w-10 h-10 flex items-center justify-center bg-white/5 backdrop-blur-sm shadow-md" style={{ border: '2px dashed rgba(255,255,255,0.5)', borderRadius: '4px 12px 4px 12px' }}><Heart className="w-5 h-5 text-white/80" fill="currentColor" /></div>,
    nope: <div {...btnI('rgba(255,255,255,0.5)')} className="w-10 h-10 flex items-center justify-center bg-white/5 backdrop-blur-sm shadow-md" style={{ border: '2px dashed rgba(255,255,255,0.5)', borderRadius: '12px 4px 12px 4px' }}><X className="w-5 h-5 text-white/80" /></div>,
    rewind: <div {...btnI('rgba(255,255,255,0.5)')} className="w-10 h-10 flex items-center justify-center bg-white/5 backdrop-blur-sm shadow-md" style={{ border: '2px dashed rgba(255,255,255,0.5)', borderRadius: '4px 12px 4px 12px' }}><Undo2 className="w-5 h-5 text-white/80" /></div>,
  },

  'deluxe-tape': {
    layout: 'side-right',
    layoutClass: 'absolute bottom-12 right-4 flex flex-col items-center gap-6 z-40',
    btnClass: '',
    seek: { height: 'h-1.5', rounded: 'rounded-sm', color: 'bg-orange-300' },
    like: <div {...btnI('#fb923c')} className="px-3 py-2 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-400/40 rounded-sm flex items-center gap-1.5 shadow-md backdrop-blur-sm"><Heart className="w-4 h-4 text-orange-300" fill="currentColor" /><span className="text-orange-300 text-[10px] font-bold">LIKE</span></div>,
    nope: <div {...btnI('#fb923c')} className="px-3 py-2 bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-400/40 rounded-sm flex items-center gap-1.5 shadow-md backdrop-blur-sm"><X className="w-4 h-4 text-red-300" /><span className="text-red-300 text-[10px] font-bold">NOPE</span></div>,
    rewind: <div {...btnI('#fb923c')} className="px-3 py-2 bg-gradient-to-r from-blue-500/20 to-sky-500/20 border border-blue-400/40 rounded-sm flex items-center gap-1.5 shadow-md backdrop-blur-sm"><Undo2 className="w-4 h-4 text-blue-300" /><span className="text-blue-300 text-[10px] font-bold">UNDO</span></div>,
  },

  'deluxe-pearl': {
    layout: 'side-right',
    layoutClass: 'absolute bottom-12 right-4 flex flex-col items-center gap-6 z-40',
    btnClass: '',
    seek: { height: 'h-1', rounded: 'rounded-full', color: 'bg-pink-200' },
    like: <div {...btnI('#f9a8d4')} className="w-10 h-10 rounded-full flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_2px_8px_rgba(0,0,0,0.2)]" style={{ background: 'linear-gradient(135deg, #fce7f3, #fbcfe8, #f9a8d4)' }}><Heart className="w-4 h-4 text-pink-600" fill="currentColor" /></div>,
    nope: <div {...btnI('#f9a8d4')} className="w-10 h-10 rounded-full flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_2px_8px_rgba(0,0,0,0.2)]" style={{ background: 'linear-gradient(135deg, #fee2e2, #fecaca, #fca5a5)' }}><X className="w-4 h-4 text-red-600" /></div>,
    rewind: <div {...btnI('#f9a8d4')} className="w-10 h-10 rounded-full flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_2px_8px_rgba(0,0,0,0.2)]" style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe, #93c5fd)' }}><Undo2 className="w-4 h-4 text-blue-600" /></div>,
  },

  'deluxe-morse': {
    layout: 'side-right',
    layoutClass: 'absolute bottom-12 right-4 flex flex-col items-center gap-6 z-40',
    btnClass: '',
    seek: { height: 'h-1', rounded: 'rounded-full', color: 'bg-amber-400' },
    like: <div {...btnI('#fbbf24')} className="w-10 h-10 rounded-full border border-amber-400/40 bg-black/50 flex items-center justify-center" style={{ animation: 'morseFlicker 2s infinite' }}><Heart className="w-4 h-4 text-amber-400" fill="currentColor" /></div>,
    nope: <div {...btnI('#fbbf24')} className="w-10 h-10 rounded-full border border-red-400/40 bg-black/50 flex items-center justify-center" style={{ animation: 'morseFlicker 2s infinite 0.3s' }}><X className="w-4 h-4 text-red-400" /></div>,
    rewind: <div {...btnI('#fbbf24')} className="w-10 h-10 rounded-full border border-blue-400/40 bg-black/50 flex items-center justify-center" style={{ animation: 'morseFlicker 2s infinite 0.6s' }}><Undo2 className="w-4 h-4 text-blue-400" /></div>,
  },

  'deluxe-underwater': {
    layout: 'side-right',
    layoutClass: 'absolute bottom-12 right-4 flex flex-col items-center gap-6 z-40',
    btnClass: '',
    seek: { height: 'h-1.5', rounded: 'rounded-full', color: 'bg-cyan-300' },
    like: <div {...btnI('#22d3ee')} className="w-11 h-11 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center shadow-[0_0_12px_rgba(34,211,238,0.2)]" style={{ animation: 'bubbleFloat 3s ease-in-out infinite' }}><Heart className="w-4 h-4 text-cyan-300" fill="currentColor" /></div>,
    nope: <div {...btnI('#22d3ee')} className="w-11 h-11 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shadow-[0_0_12px_rgba(96,165,250,0.2)]" style={{ animation: 'bubbleFloat 3s ease-in-out infinite 0.5s' }}><X className="w-4 h-4 text-blue-300" /></div>,
    rewind: <div {...btnI('#22d3ee')} className="w-11 h-11 rounded-full bg-teal-500/20 border border-teal-400/30 flex items-center justify-center shadow-[0_0_12px_rgba(45,212,191,0.2)]" style={{ animation: 'bubbleFloat 3s ease-in-out infinite 1s' }}><Undo2 className="w-4 h-4 text-teal-300" /></div>,
  },

  'deluxe-stealth': {
    layout: 'side-right',
    layoutClass: 'absolute bottom-12 right-4 flex flex-col items-center gap-6 z-40',
    btnClass: '',
    seek: { height: 'h-0.5', rounded: 'rounded-full', color: 'bg-white/40' },
    like: <div {...btnI('rgba(255,255,255,0.3)')} className="w-9 h-9 rounded-full bg-white/8 border border-white/10 flex items-center justify-center shadow-sm backdrop-blur-sm"><Heart className="w-4 h-4 text-white/50" /></div>,
    nope: <div {...btnI('rgba(255,255,255,0.3)')} className="w-9 h-9 rounded-full bg-white/8 border border-white/10 flex items-center justify-center shadow-sm backdrop-blur-sm"><X className="w-4 h-4 text-white/50" /></div>,
    rewind: <div {...btnI('rgba(255,255,255,0.3)')} className="w-9 h-9 rounded-full bg-white/8 border border-white/10 flex items-center justify-center shadow-sm backdrop-blur-sm"><Undo2 className="w-4 h-4 text-white/50" /></div>,
  },

  'deluxe-lava': {
    layout: 'side-right',
    layoutClass: 'absolute bottom-12 right-4 flex flex-col items-center gap-6 z-40',
    btnClass: '',
    seek: { height: 'h-2', rounded: 'rounded-full', color: 'bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500' },
    like: <div {...btnI('#ef4444')} className="w-11 h-11 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.4)]" style={{ background: 'linear-gradient(135deg, #dc2626, #ea580c, #f59e0b)' }}><Heart className="w-5 h-5 text-white" fill="white" /></div>,
    nope: <div {...btnI('#ef4444')} className="w-11 h-11 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(185,28,28,0.4)]" style={{ background: 'linear-gradient(135deg, #991b1b, #dc2626, #ea580c)' }}><X className="w-5 h-5 text-white" /></div>,
    rewind: <div {...btnI('#ef4444')} className="w-11 h-11 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)]" style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316, #ef4444)' }}><Undo2 className="w-5 h-5 text-white" /></div>,
  },

  // ════════════════════════════════════════════════════════
  //  SIDE LEFT — left side
  // ════════════════════════════════════════════════════════

  'deluxe-typewriter': {
    layout: 'side-left',
    layoutClass: 'absolute bottom-12 left-4 flex flex-col items-center gap-5 z-40',
    btnClass: '',
    seek: { height: 'h-1', rounded: 'rounded-sm', color: 'bg-gray-300' },
    like: <div {...btnI('#d1d5db')} className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center shadow-md active:translate-y-0.5 active:shadow-sm transition-all"><Heart className="w-4 h-4 text-gray-700" fill="currentColor" /></div>,
    nope: <div {...btnI('#d1d5db')} className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center shadow-md active:translate-y-0.5 active:shadow-sm transition-all"><X className="w-4 h-4 text-gray-700" /></div>,
    rewind: <div {...btnI('#d1d5db')} className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center shadow-md active:translate-y-0.5 active:shadow-sm transition-all"><Undo2 className="w-4 h-4 text-gray-700" /></div>,
  },

  'deluxe-sapphire': {
    layout: 'side-left',
    layoutClass: 'absolute bottom-12 left-4 flex flex-col items-center gap-6 z-40',
    btnClass: '',
    seek: { height: 'h-1', rounded: 'rounded-full', color: 'bg-blue-400' },
    like: <div {...btnI('#3b82f6')} className="w-10 h-10 flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #1e3a5f, #2563eb, #1e40af)', clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}><Heart className="w-4 h-4 text-white" fill="white" /></div>,
    nope: <div {...btnI('#3b82f6')} className="w-10 h-10 flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #7f1d1d, #dc2626, #991b1b)', clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}><X className="w-4 h-4 text-white" /></div>,
    rewind: <div {...btnI('#3b82f6')} className="w-10 h-10 flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #065f46, #059669, #047857)', clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}><Undo2 className="w-4 h-4 text-white" /></div>,
  },

  'deluxe-stamp': {
    layout: 'side-left',
    layoutClass: 'absolute bottom-12 left-4 flex flex-col items-center gap-5 z-40',
    btnClass: '',
    seek: { height: 'h-1', rounded: 'rounded-full', color: 'bg-red-400' },
    like: <div {...btnI('#f472b6')} className="w-11 h-11 rounded-full border-4 border-double border-pink-400/70 flex items-center justify-center bg-gradient-to-br from-pink-500/15 to-rose-600/15 shadow-lg shadow-pink-500/15 backdrop-blur-sm"><Heart className="w-4 h-4 text-pink-300" fill="currentColor" style={{ filter: 'drop-shadow(0 0 4px rgba(244,114,182,0.4))' }} /></div>,
    nope: <div {...btnI('#f472b6')} className="w-11 h-11 rounded-full border-4 border-double border-red-400/70 flex items-center justify-center bg-gradient-to-br from-red-500/15 to-rose-600/15 shadow-lg shadow-red-500/15 backdrop-blur-sm"><X className="w-4 h-4 text-red-300" style={{ filter: 'drop-shadow(0 0 4px rgba(248,113,113,0.4))' }} /></div>,
    rewind: <div {...btnI('#f472b6')} className="w-11 h-11 rounded-full border-4 border-double border-blue-400/70 flex items-center justify-center bg-gradient-to-br from-blue-500/15 to-indigo-600/15 shadow-lg shadow-blue-500/15 backdrop-blur-sm"><Undo2 className="w-4 h-4 text-blue-300" style={{ filter: 'drop-shadow(0 0 4px rgba(96,165,250,0.4))' }} /></div>,
  },

  'deluxe-crown': {
    layout: 'side-left',
    layoutClass: 'absolute bottom-12 left-4 flex flex-col items-center gap-6 z-40',
    btnClass: '',
    seek: { height: 'h-1.5', rounded: 'rounded-full', color: 'bg-yellow-400' },
    like: <div {...btnI('#fbbf24')} className="w-11 h-11 rounded-full bg-gradient-to-b from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20"><Heart className="w-5 h-5 text-white" fill="white" /></div>,
    nope: <div {...btnI('#fbbf24')} className="w-11 h-11 rounded-full bg-gradient-to-b from-purple-400 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/20"><X className="w-5 h-5 text-white" /></div>,
    rewind: <div {...btnI('#fbbf24')} className="w-11 h-11 rounded-full bg-gradient-to-b from-blue-400 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20"><Undo2 className="w-5 h-5 text-white" /></div>,
  },

  'deluxe-shield': {
    layout: 'side-left',
    layoutClass: 'absolute bottom-12 left-4 flex flex-col items-center gap-6 z-40',
    btnClass: '',
    seek: { height: 'h-1', rounded: 'rounded-sm', color: 'bg-amber-400' },
    like: <div {...btnI('#f59e0b')} className="w-10 h-12 flex items-center justify-center bg-gradient-to-b from-amber-600 to-amber-800 shadow-lg" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 65%, 50% 100%, 0% 65%)' }}><Heart className="w-4 h-4 text-white" fill="white" /></div>,
    nope: <div {...btnI('#f59e0b')} className="w-10 h-12 flex items-center justify-center bg-gradient-to-b from-red-600 to-red-900 shadow-lg" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 65%, 50% 100%, 0% 65%)' }}><X className="w-4 h-4 text-white" /></div>,
    rewind: <div {...btnI('#f59e0b')} className="w-10 h-12 flex items-center justify-center bg-gradient-to-b from-slate-500 to-slate-800 shadow-lg" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 65%, 50% 100%, 0% 65%)' }}><Undo2 className="w-4 h-4 text-white" /></div>,
  },

  'deluxe-compass': {
    layout: 'side-left',
    layoutClass: 'absolute bottom-12 left-4 flex flex-col items-center gap-6 z-40',
    btnClass: '',
    seek: { height: 'h-1', rounded: 'rounded-full', color: 'bg-blue-300' },
    like: <div {...btnI('#60a5fa')} className="w-11 h-11 rounded-full border-2 border-blue-400/50 bg-gradient-to-br from-blue-500/15 to-cyan-500/15 flex items-center justify-center shadow-lg shadow-blue-500/15 backdrop-blur-sm"><ArrowUp className="w-5 h-5 text-blue-300" style={{ filter: 'drop-shadow(0 0 4px rgba(96,165,250,0.5))' }} /></div>,
    nope: <div {...btnI('#60a5fa')} className="w-11 h-11 rounded-full border-2 border-red-400/50 bg-gradient-to-br from-red-500/15 to-rose-500/15 flex items-center justify-center shadow-lg shadow-red-500/15 backdrop-blur-sm"><ArrowDown className="w-5 h-5 text-red-300" style={{ filter: 'drop-shadow(0 0 4px rgba(248,113,113,0.5))' }} /></div>,
    rewind: <div {...btnI('#60a5fa')} className="w-11 h-11 rounded-full border-2 border-emerald-400/50 bg-gradient-to-br from-emerald-500/15 to-teal-500/15 flex items-center justify-center shadow-lg shadow-emerald-500/15 backdrop-blur-sm"><ArrowLeft className="w-5 h-5 text-emerald-300" style={{ filter: 'drop-shadow(0 0 4px rgba(52,211,153,0.5))' }} /></div>,
  },

  // ════════════════════════════════════════════════════════
  //  RADIAL — arranged around a center point
  // ════════════════════════════════════════════════════════

  'deluxe-sunburst': {
    layout: 'radial',
    layoutClass: 'absolute bottom-16 right-3 z-40',
    btnClass: '',
    seek: { height: 'h-1', rounded: 'rounded-full', color: 'bg-yellow-300' },
    like: <div {...btnI('#f59e0b')} className="absolute -top-12 left-0 w-11 h-11 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30"><Heart className="w-5 h-5 text-white" fill="white" /></div>,
    nope: <div {...btnI('#f59e0b')} className="absolute top-0 left-0 w-11 h-11 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg shadow-red-500/30"><X className="w-5 h-5 text-white" /></div>,
    rewind: <div {...btnI('#f59e0b')} className="absolute top-0 -left-6 w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30"><Undo2 className="w-5 h-5 text-white" /></div>,
  },

  'deluxe-atom': {
    layout: 'radial',
    layoutClass: 'absolute bottom-16 right-3 z-40',
    btnClass: '',
    seek: { height: 'h-1', rounded: 'rounded-full', color: 'bg-cyan-400' },
    like: <div {...btnI('#22d3ee')} className="absolute -top-10 left-1 w-9 h-9 rounded-full border border-pink-400/50 bg-gradient-to-br from-pink-500/20 to-rose-600/20 flex items-center justify-center shadow-lg shadow-pink-500/20 backdrop-blur-sm"><Heart className="w-3.5 h-3.5 text-pink-300" fill="currentColor" style={{ filter: 'drop-shadow(0 0 4px rgba(244,114,182,0.5))' }} /></div>,
    nope: <div {...btnI('#22d3ee')} className="absolute top-2 left-0 w-9 h-9 rounded-full border border-red-400/50 bg-gradient-to-br from-red-500/20 to-rose-600/20 flex items-center justify-center shadow-lg shadow-red-500/20 backdrop-blur-sm"><X className="w-3.5 h-3.5 text-red-300" style={{ filter: 'drop-shadow(0 0 4px rgba(248,113,113,0.5))' }} /></div>,
    rewind: <div {...btnI('#22d3ee')} className="absolute top-2 -left-4 w-9 h-9 rounded-full border border-blue-400/50 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 flex items-center justify-center shadow-lg shadow-blue-500/20 backdrop-blur-sm"><Undo2 className="w-3.5 h-3.5 text-blue-300" style={{ filter: 'drop-shadow(0 0 4px rgba(96,165,250,0.5))' }} /></div>,
  },

  'deluxe-orbit': {
    layout: 'radial',
    layoutClass: 'absolute bottom-16 right-3 z-40',
    btnClass: '',
    seek: { height: 'h-1', rounded: 'rounded-full', color: 'bg-violet-400' },
    like: <div {...btnI('#a78bfa')} className="absolute -top-12 left-0 w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center shadow-lg"><Heart className="w-4 h-4 text-white" fill="white" /></div>,
    nope: <div {...btnI('#a78bfa')} className="absolute top-0 left-0 w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg"><X className="w-4 h-4 text-white" /></div>,
    rewind: <div {...btnI('#a78bfa')} className="absolute top-0 -left-6 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg"><Undo2 className="w-4 h-4 text-white" /></div>,
  },

  // ════════════════════════════════════════════════════════
  //  INLINE — compact horizontal
  // ════════════════════════════════════════════════════════

  'deluxe-minimal-dot': {
    layout: 'inline',
    layoutClass: 'absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-6 z-40',
    btnClass: '',
    seek: { height: 'h-0.5', rounded: 'rounded-full', color: 'bg-white/50' },
    like: <div {...btnI('#f472b6')} className="w-5 h-5 rounded-full bg-gradient-to-br from-pink-300 to-rose-500 shadow-[0_0_12px_rgba(244,114,182,0.6)] border border-pink-300/30" />,
    nope: <div {...btnI('#f472b6')} className="w-5 h-5 rounded-full bg-gradient-to-br from-red-300 to-red-600 shadow-[0_0_12px_rgba(248,113,113,0.6)] border border-red-300/30" />,
    rewind: <div {...btnI('#f472b6')} className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-300 to-blue-600 shadow-[0_0_12px_rgba(96,165,250,0.6)] border border-blue-300/30" />,
  },

  'deluxe-bar-segment': {
    layout: 'inline',
    layoutClass: 'absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2 z-40',
    btnClass: '',
    seek: { height: 'h-2', rounded: 'rounded-full', color: 'bg-white' },
    like: <div {...btnI('#ec4899')} className="w-14 h-8 rounded-md bg-gradient-to-r from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/20 border border-pink-400/20"><Heart className="w-3.5 h-3.5 text-white drop-shadow" fill="white" /></div>,
    nope: <div {...btnI('#ec4899')} className="w-14 h-8 rounded-md bg-gradient-to-r from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/20 border border-red-400/20"><X className="w-3.5 h-3.5 text-white drop-shadow" /></div>,
    rewind: <div {...btnI('#ec4899')} className="w-14 h-8 rounded-md bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/20"><Undo2 className="w-3.5 h-3.5 text-white drop-shadow" /></div>,
  },

  'deluxe-text-only': {
    layout: 'inline',
    layoutClass: 'absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-4 z-40',
    btnClass: '',
    seek: { height: 'h-0.5', rounded: 'rounded-full', color: 'bg-white/60' },
    like: <span className="text-sm font-black tracking-wider uppercase" style={{ color: '#f472b6', textShadow: '0 0 12px rgba(244,114,182,0.5), 0 0 24px rgba(244,114,182,0.2)' }}>Like</span>,
    nope: <span className="text-sm font-black tracking-wider uppercase" style={{ color: '#f87171', textShadow: '0 0 12px rgba(248,113,113,0.5), 0 0 24px rgba(248,113,113,0.2)' }}>Nope</span>,
    rewind: <span className="text-sm font-black tracking-wider uppercase" style={{ color: '#60a5fa', textShadow: '0 0 12px rgba(96,165,250,0.5), 0 0 24px rgba(96,165,250,0.2)' }}>Undo</span>,
  },

  'deluxe-emoji-face': {
    layout: 'inline',
    layoutClass: 'absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-5 z-40',
    btnClass: '',
    seek: { height: 'h-1', rounded: 'rounded-full', color: 'bg-yellow-400' },
    like: <div {...btnI('#fbbf24')} className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-3xl shadow-lg select-none" style={{ fontFamily: '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", "Android Emoji", sans-serif' }}>😍</div>,
    nope: <div {...btnI('#fbbf24')} className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-3xl shadow-lg select-none" style={{ fontFamily: '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", "Android Emoji", sans-serif' }}>👋</div>,
    rewind: <div {...btnI('#fbbf24')} className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-3xl shadow-lg select-none" style={{ fontFamily: '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", "Android Emoji", sans-serif' }}>🤔</div>,
  },

  // ════════════════════════════════════════════════════════
  //  MIXED / SPECIAL
  // ════════════════════════════════════════════════════════

  'deluxe-cyber-slash': {
    layout: 'side-right',
    layoutClass: 'absolute bottom-12 right-4 flex flex-col items-center gap-6 z-40',
    btnClass: '',
    seek: { height: 'h-1', rounded: 'rounded-full', color: 'bg-green-400' },
    like: <div {...btnI('#22c55e')} className="w-10 h-10 bg-green-500/10 border border-green-400/40 flex items-center justify-center shadow-[0_0_10px_rgba(34,197,94,0.2)]" style={{ clipPath: 'polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)' }}><Heart className="w-4 h-4 text-green-400" fill="currentColor" /></div>,
    nope: <div {...btnI('#22c55e')} className="w-10 h-10 bg-red-500/10 border border-red-400/40 flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.2)]" style={{ clipPath: 'polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)' }}><X className="w-4 h-4 text-red-400" /></div>,
    rewind: <div {...btnI('#22c55e')} className="w-10 h-10 bg-blue-500/10 border border-blue-400/40 flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.2)]" style={{ clipPath: 'polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)' }}><Undo2 className="w-4 h-4 text-blue-400" /></div>,
  },

  'deluxe-prism': {
    layout: 'row-bottom',
    layoutClass: 'absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-5 z-40',
    btnClass: '',
    seek: { height: 'h-1', rounded: 'rounded-full', color: 'bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400' },
    like: <div {...btnI('#a855f7')} className="w-11 h-11 rounded-lg flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6, #06b6d4)' }}><Heart className="w-5 h-5 text-white" fill="white" /></div>,
    nope: <div {...btnI('#a855f7')} className="w-11 h-11 rounded-lg flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #ef4444, #f97316, #eab308)' }}><X className="w-5 h-5 text-white" /></div>,
    rewind: <div {...btnI('#a855f7')} className="w-11 h-11 rounded-lg flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1, #a855f7)' }}><Undo2 className="w-5 h-5 text-white" /></div>,
  },

  'deluxe-wireframe': {
    layout: 'side-right',
    layoutClass: 'absolute bottom-12 right-4 flex flex-col items-center gap-6 z-40',
    btnClass: '',
    seek: { height: 'h-px', rounded: 'rounded-full', color: 'bg-white/30' },
    like: <div {...btnI('rgba(255,255,255,0.4)')} className="w-10 h-10 rounded-full border border-white/25 bg-gradient-to-br from-white/8 to-white/3 flex items-center justify-center shadow-md backdrop-blur-sm"><Heart className="w-4 h-4 text-white/60" /></div>,
    nope: <div {...btnI('rgba(255,255,255,0.4)')} className="w-10 h-10 rounded-full border border-white/25 bg-gradient-to-br from-white/8 to-white/3 flex items-center justify-center shadow-md backdrop-blur-sm"><X className="w-4 h-4 text-white/60" /></div>,
    rewind: <div {...btnI('rgba(255,255,255,0.4)')} className="w-10 h-10 rounded-full border border-white/25 bg-gradient-to-br from-white/8 to-white/3 flex items-center justify-center shadow-md backdrop-blur-sm"><Undo2 className="w-4 h-4 text-white/60" /></div>,
  },

  'deluxe-gem': {
    layout: 'row-bottom',
    layoutClass: 'absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-5 z-40',
    btnClass: '',
    seek: { height: 'h-1', rounded: 'rounded-full', color: 'bg-emerald-400' },
    like: <div {...btnI('#10b981')} className="w-10 h-10 flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', clipPath: 'polygon(50% 0%, 80% 20%, 100% 50%, 80% 80%, 50% 100%, 20% 80%, 0% 50%, 20% 20%)' }}><Heart className="w-4 h-4 text-white" fill="white" /></div>,
    nope: <div {...btnI('#10b981')} className="w-10 h-10 flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', clipPath: 'polygon(50% 0%, 80% 20%, 100% 50%, 80% 80%, 50% 100%, 20% 80%, 0% 50%, 20% 20%)' }}><X className="w-4 h-4 text-white" /></div>,
    rewind: <div {...btnI('#10b981')} className="w-10 h-10 flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', clipPath: 'polygon(50% 0%, 80% 20%, 100% 50%, 80% 80%, 50% 100%, 20% 80%, 0% 50%, 20% 20%)' }}><Undo2 className="w-4 h-4 text-white" /></div>,
  },

  'deluxe-plasma': {
    layout: 'side-right',
    layoutClass: 'absolute bottom-12 right-4 flex flex-col items-center gap-6 z-40',
    btnClass: '',
    seek: { height: 'h-1', rounded: 'rounded-full', color: 'bg-purple-400' },
    like: <div {...btnI('#a855f7')} className="w-11 h-11 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)]" style={{ background: 'radial-gradient(circle at 30% 30%, #c084fc, #7c3aed, #4c1d95)' }}><Heart className="w-5 h-5 text-white" fill="white" /></div>,
    nope: <div {...btnI('#ef4444')} className="w-11 h-11 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.3)]" style={{ background: 'radial-gradient(circle at 30% 30%, #fca5a5, #dc2626, #7f1d1d)' }}><X className="w-5 h-5 text-white" /></div>,
    rewind: <div {...btnI('#3b82f6')} className="w-11 h-11 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)]" style={{ background: 'radial-gradient(circle at 30% 30%, #93c5fd, #2563eb, #1e3a5f)' }}><Undo2 className="w-5 h-5 text-white" /></div>,
  },

  'deluxe-cross-stitch': {
    layout: 'side-right',
    layoutClass: 'absolute bottom-12 right-4 flex flex-col items-center gap-6 z-40',
    btnClass: '',
    seek: { height: 'h-1', rounded: 'rounded-sm', color: 'bg-red-300' },
    like: <div {...btnI('#f87171')} className="w-10 h-10 bg-gradient-to-br from-red-400/15 to-rose-500/15 border-2 border-dashed border-red-400/50 rounded-sm flex items-center justify-center shadow-md backdrop-blur-sm"><Heart className="w-4 h-4 text-red-300" fill="currentColor" /></div>,
    nope: <div {...btnI('#60a5fa')} className="w-10 h-10 bg-gradient-to-br from-blue-400/15 to-indigo-500/15 border-2 border-dashed border-blue-400/50 rounded-sm flex items-center justify-center shadow-md backdrop-blur-sm"><X className="w-4 h-4 text-blue-300" /></div>,
    rewind: <div {...btnI('#4ade80')} className="w-10 h-10 bg-gradient-to-br from-green-400/15 to-emerald-500/15 border-2 border-dashed border-green-400/50 rounded-sm flex items-center justify-center shadow-md backdrop-blur-sm"><Undo2 className="w-4 h-4 text-green-300" /></div>,
  },

  'deluxe-triangle-set': {
    layout: 'row-bottom',
    layoutClass: 'absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-6 z-40',
    btnClass: '',
    seek: { height: 'h-1', rounded: 'rounded-full', color: 'bg-orange-400' },
    like: <div {...btnI('#a855f7')} className="w-10 h-10 flex items-center justify-center" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', background: 'linear-gradient(to bottom, #f472b6, #ec4899)' }}><Heart className="w-3.5 h-3.5 text-white mt-1.5" fill="white" /></div>,
    nope: <div {...btnI('#a855f7')} className="w-10 h-10 flex items-center justify-center" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', background: 'linear-gradient(to bottom, #f87171, #ef4444)' }}><X className="w-3.5 h-3.5 text-white mt-1.5" /></div>,
    rewind: <div {...btnI('#a855f7')} className="w-10 h-10 flex items-center justify-center" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', background: 'linear-gradient(to bottom, #60a5fa, #3b82f6)' }}><Undo2 className="w-3.5 h-3.5 text-white mt-1.5" /></div>,
  },
};
