import React from 'react';
import { soundService } from '../soundService';

/**
 * Higher-order component that adds sound functionality to button components
 * Usage: const SoundEnhancedButton = withButtonSound('button');
 */
export function withButtonSound(
  volume: number = 0.255,
  playSound: boolean = true
) {
  return React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>((props, ref) => {
    const { onClick, ...restProps } = props;
    
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      // Play the button click sound
      if (playSound) {
        soundService.playButtonClick(volume);
      }
      
      // Call the original onClick handler if provided
      if (onClick) {
        onClick(event);
      }
    };
    
    return (
      <button
        ref={ref}
        onClick={handleClick}
        {...restProps}
      />
    );
  });
}

// Pre-built sound-enhanced button component
export const SoundButton = withButtonSound(0.255);

// Track enhanced buttons to avoid re-enhancement
const enhancedButtons = new WeakSet<HTMLButtonElement>();

/**
 * Utility function to enhance an existing button element with sound
 * Usage: enhanceButtonWithSound(buttonElement);
 */
export function enhanceButtonWithSound(
  element: HTMLButtonElement,
  volume: number = 0.255,
  playSound: boolean = true
) {
  // Skip if already enhanced or has data-no-sound attribute
  if (enhancedButtons.has(element) || element.hasAttribute('data-no-sound')) {
    return;
  }

  enhancedButtons.add(element);
  const originalOnClick = element.onclick;

  element.onclick = function(event: MouseEvent) {
    if (playSound) {
      soundService.playButtonClick(volume);
    }

    if (originalOnClick) {
      originalOnClick.call(this, event);
    }
  };
}

/**
 * Batch enhance all buttons in a container with sound functionality
 * Usage: enhanceButtonsInContainer(document.body);
 */
export function enhanceButtonsInContainer(
  container: HTMLElement,
  volume: number = 0.255,
  playSound: boolean = true
) {
  const buttons = container.querySelectorAll('button');
  buttons.forEach(button => {
    if (button instanceof HTMLButtonElement) {
      enhanceButtonWithSound(button, volume, playSound);
    }
  });
}