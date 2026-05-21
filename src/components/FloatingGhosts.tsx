import React from 'react';
import { Ghost } from 'lucide-react';

const FloatingGhosts = () => {
  return (
    <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
      <style>
        {`
          @keyframes float-1 {
            0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
            25% { transform: translateY(-20px) translateX(10px) rotate(5deg); }
            50% { transform: translateY(-35px) translateX(18px) rotate(10deg); }
            75% { transform: translateY(-15px) translateX(8px) rotate(3deg); }
          }
          @keyframes float-2 {
            0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
            25% { transform: translateY(15px) translateX(-12px) rotate(-8deg); }
            50% { transform: translateY(28px) translateX(-22px) rotate(-15deg); }
            75% { transform: translateY(10px) translateX(-8px) rotate(-5deg); }
          }
          @keyframes float-3 {
            0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
            33% { transform: translateY(-25px) translateX(20px) rotate(8deg); }
            66% { transform: translateY(-10px) translateX(35px) rotate(3deg); }
          }
          @keyframes float-4 {
            0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
            33% { transform: translateY(18px) translateX(-15px) rotate(-6deg); }
            66% { transform: translateY(8px) translateX(-25px) rotate(-2deg); }
          }
          @keyframes float-5 {
            0%, 100% { transform: translateY(0) translateX(0) rotate(0deg) scale(1); }
            50% { transform: translateY(-20px) translateX(-10px) rotate(-8deg) scale(1.1); }
          }
          @keyframes float-6 {
            0%, 100% { transform: translateY(0) translateX(0) rotate(0deg) scale(1); }
            50% { transform: translateY(15px) translateX(20px) rotate(6deg) scale(0.9); }
          }
          @keyframes glow-pulse {
            0%, 100% { opacity: 0.15; filter: drop-shadow(0 0 8px var(--glow-color)); }
            50% { opacity: 0.3; filter: drop-shadow(0 0 18px var(--glow-color)); }
          }
        `}
      </style>

      {/* Pink Ghosts (Free) */}
      <div style={{ position: 'absolute', top: '8%', left: '10%', '--glow-color': '#E91E63' } as React.CSSProperties}>
        <Ghost
          className="text-pink-500"
          style={{ width: '85px', height: '85px', animation: 'float-1 7s ease-in-out infinite, glow-pulse 4s ease-in-out infinite' }}
        />
      </div>
      <div style={{ position: 'absolute', bottom: '18%', right: '8%', '--glow-color': '#E91E63' } as React.CSSProperties}>
        <Ghost
          className="text-pink-400"
          style={{ width: '55px', height: '55px', animation: 'float-3 9s ease-in-out infinite 1.5s, glow-pulse 5s ease-in-out infinite 1s' }}
        />
      </div>

      {/* Blue Ghosts (Pro) */}
      <div style={{ position: 'absolute', top: '22%', right: '15%', '--glow-color': '#3B82F6' } as React.CSSProperties}>
        <Ghost
          className="text-blue-500"
          style={{ width: '75px', height: '75px', animation: 'float-2 8s ease-in-out infinite 0.5s, glow-pulse 4.5s ease-in-out infinite 0.5s' }}
        />
      </div>
      <div style={{ position: 'absolute', bottom: '12%', left: '5%', '--glow-color': '#3B82F6' } as React.CSSProperties}>
        <Ghost
          className="text-blue-400"
          style={{ width: '48px', height: '48px', animation: 'float-4 10s ease-in-out infinite 2s, glow-pulse 5.5s ease-in-out infinite 2s' }}
        />
      </div>

      {/* Yellow Ghosts (VIP) */}
      <div style={{ position: 'absolute', top: '55%', left: '65%', '--glow-color': '#FBBF24' } as React.CSSProperties}>
        <Ghost
          className="text-yellow-400"
          style={{ width: '95px', height: '95px', animation: 'float-5 6s ease-in-out infinite 0.3s, glow-pulse 3.5s ease-in-out infinite' }}
        />
      </div>
      <div style={{ position: 'absolute', top: '5%', right: '35%', '--glow-color': '#FBBF24' } as React.CSSProperties}>
        <Ghost
          className="text-yellow-300"
          style={{ width: '50px', height: '50px', animation: 'float-6 11s ease-in-out infinite 3s, glow-pulse 6s ease-in-out infinite 1.5s' }}
        />
      </div>

      {/* Extra ghosts for depth */}
      <div style={{ position: 'absolute', top: '70%', left: '20%', '--glow-color': '#E91E63' } as React.CSSProperties}>
        <Ghost
          className="text-pink-600"
          style={{ width: '40px', height: '40px', animation: 'float-6 12s ease-in-out infinite 4s, glow-pulse 7s ease-in-out infinite 3s', opacity: 0.12 }}
        />
      </div>
      <div style={{ position: 'absolute', top: '35%', left: '40%', '--glow-color': '#3B82F6' } as React.CSSProperties}>
        <Ghost
          className="text-blue-300"
          style={{ width: '35px', height: '35px', animation: 'float-1 13s ease-in-out infinite 5s, glow-pulse 8s ease-in-out infinite 4s', opacity: 0.1 }}
        />
      </div>
      <div style={{ position: 'absolute', bottom: '35%', right: '30%', '--glow-color': '#FBBF24' } as React.CSSProperties}>
        <Ghost
          className="text-yellow-500"
          style={{ width: '42px', height: '42px', animation: 'float-3 9s ease-in-out infinite 2.5s, glow-pulse 5s ease-in-out infinite 2s', opacity: 0.1 }}
        />
      </div>
      <div style={{ position: 'absolute', top: '85%', right: '50%', '--glow-color': '#E91E63' } as React.CSSProperties}>
        <Ghost
          className="text-pink-300"
          style={{ width: '30px', height: '30px', animation: 'float-2 14s ease-in-out infinite 6s, glow-pulse 6s ease-in-out infinite 5s', opacity: 0.08 }}
        />
      </div>
    </div>
  );
};

export default FloatingGhosts;
