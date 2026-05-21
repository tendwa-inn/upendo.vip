import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { soundService } from '../soundService.ts';

/**
 * Sound settings toggle component
 * Allows users to enable/disable button click sounds
 */
export const SoundSettingsToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isSoundEnabled, setIsSoundEnabled] = React.useState(soundService.isSoundEnabled());

  React.useEffect(() => {
    const unsubscribe = soundService.subscribeToSoundChanges(setIsSoundEnabled);
    return () => unsubscribe();
  }, []);

  const handleToggleSound = () => {
    soundService.setEnabled(!isSoundEnabled);
  };

  return (
    <button
      onClick={handleToggleSound}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
        isSoundEnabled
          ? 'bg-green-600 text-white hover:bg-green-700'
          : 'bg-gray-600 text-gray-300 hover:bg-gray-700'
      } ${className}`}
      title={isSoundEnabled ? 'Disable sounds' : 'Enable sounds'}
    >
      {isSoundEnabled ? (
        <>
          <Volume2 className="w-4 h-4" />
          <span className="text-sm font-medium">Sounds On</span>
        </>
      ) : (
        <>
          <VolumeX className="w-4 h-4" />
          <span className="text-sm font-medium">Sounds Off</span>
        </>
      )}
    </button>
  );
};

/**
 * Auto-sound enhancer component that automatically adds sound to all buttons in its children
 */
export const AutoSoundEnhancer: React.FC<{ 
  children: React.ReactNode;
  volume?: number;
  enabled?: boolean;
}> = ({ children, volume = 0.3, enabled = true }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!enabled || !containerRef.current) return;

    // Enhance all buttons in the container
    const enhanceButtons = () => {
      if (containerRef.current) {
        const buttons = containerRef.current.querySelectorAll('button');
        buttons.forEach(button => {
          if (button instanceof HTMLButtonElement && !button.dataset.soundEnhanced) {
            const originalOnClick = button.onclick;
            button.onclick = function(event: MouseEvent) {
              if (enabled) {
                // Import dynamically to avoid circular dependencies
                import('../soundService.ts').then(({ soundService }) => {
                  soundService.playButtonClick(volume);
                });
              }
              if (originalOnClick) {
                originalOnClick.call(this, event);
              }
            };
            button.dataset.soundEnhanced = 'true';
          }
        });
      }
    };

    // Initial enhancement
    enhanceButtons();

    // Set up mutation observer to handle dynamically added buttons
    const observer = new MutationObserver(() => {
      enhanceButtons();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current, {
        childList: true,
        subtree: true
      });
    }

    return () => {
      observer.disconnect();
    };
  }, [volume, enabled]);

  return <div ref={containerRef}>{children}</div>;
};