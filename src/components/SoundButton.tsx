import React from 'react';
import { soundService } from '../soundService.ts';

interface SoundButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  soundVolume?: number;
  playSound?: boolean;
}

/**
 * Custom button component that plays a click sound when pressed
 * Integrates with the app's sound system for consistent audio feedback
 */
export const SoundButton: React.FC<SoundButtonProps> = ({ 
  children, 
  soundVolume = 0.255,
  playSound = true,
  onClick,
  className = '',
  ...props 
}) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Play the button click sound
    if (playSound) {
      soundService.playButtonClick(soundVolume);
    }
    
    // Call the original onClick handler if provided
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <button 
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default SoundButton;