import React from 'react';
import { Ghost } from 'lucide-react';

const FloatingGhosts = () => {
  return (
    <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
      <style>
        {`
          @keyframes float-1 {
            0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
            50% { transform: translateY(-30px) translateX(15px) rotate(10deg); }
          }
          @keyframes float-2 {
            0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
            50% { transform: translateY(25px) translateX(-20px) rotate(-15deg); }
          }
          @keyframes float-3 {
            0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
            50% { transform: translateY(-20px) translateX(30px) rotate(5deg); }
          }
          @keyframes float-4 {
            0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
            50% { transform: translateY(15px) translateX(-10px) rotate(-5deg); }
          }
        `}
      </style>

      {/* Pink Ghosts (Free) */}
      <Ghost
        className="absolute text-pink-500 opacity-20"
        style={{ top: '10%', left: '15%', width: '80px', height: '80px', filter: 'drop-shadow(0 0 10px #E91E63)', animation: 'float-1 8s ease-in-out infinite' }}
      />
      <Ghost
        className="absolute text-pink-500 opacity-15"
        style={{ bottom: '20%', right: '10%', width: '60px', height: '60px', filter: 'drop-shadow(0 0 8px #E91E63)', animation: 'float-3 10s ease-in-out infinite 2s' }}
      />

      {/* Blue Ghosts (Pro) */}
      <Ghost
        className="absolute text-blue-500 opacity-20"
        style={{ top: '25%', right: '20%', width: '70px', height: '70px', filter: 'drop-shadow(0 0 10px #3B82F6)', animation: 'float-2 9s ease-in-out infinite 1s' }}
      />
      <Ghost
        className="absolute text-blue-500 opacity-15"
        style={{ bottom: '15%', left: '5%', width: '50px', height: '50px', filter: 'drop-shadow(0 0 8px #3B82F6)', animation: 'float-4 11s ease-in-out infinite 3s' }}
      />

      {/* Yellow Ghosts (VIP) */}
      <Ghost
        className="absolute text-yellow-400 opacity-20"
        style={{ top: '60%', left: '60%', width: '90px', height: '90px', filter: 'drop-shadow(0 0 12px #FBBF24)', animation: 'float-1 7s ease-in-out infinite 0.5s' }}
      />
      <Ghost
        className="absolute text-yellow-400 opacity-15"
        style={{ top: '5%', right: '40%', width: '55px', height: '55px', filter: 'drop-shadow(0 0 8px #FBBF24)', animation: 'float-2 12s ease-in-out infinite 4s' }}
      />
    </div>
  );
};

export default FloatingGhosts;
