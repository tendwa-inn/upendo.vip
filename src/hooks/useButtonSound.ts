import { useCallback, useState, useEffect } from 'react';
import { soundService } from '../soundService.ts';

/**
 * Hook to add button click sound functionality to any component
 * Usage: const handleClick = useButtonSound(originalOnClick, volume);
 */
export const useButtonSound = (
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void,
  volume: number = 0.255,
  playSound: boolean = true
) => {
  return useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    // Play the button click sound
    if (playSound) {
      soundService.playButtonClick(volume);
    }
    
    // Call the original onClick handler if provided
    if (onClick) {
      onClick(event);
    }
  }, [onClick, volume, playSound]);
};

/**
 * Hook to manage sound settings
 */
export const useSoundSettings = () => {
  const [isEnabled, setIsEnabled] = useState(soundService.isSoundEnabled());
  
  useEffect(() => {
    const unsubscribe = soundService.subscribeToSoundChanges((enabled) => {
      setIsEnabled(enabled);
    });
    return unsubscribe;
  }, []);
  
  const toggleSound = useCallback(() => {
    soundService.setEnabled(!isEnabled);
  }, [isEnabled]);
  
  const setSoundEnabled = useCallback((enabled: boolean) => {
    soundService.setEnabled(enabled);
  }, []);
  
  return {
    isSoundEnabled: isEnabled,
    toggleSound,
    setSoundEnabled
  };
};