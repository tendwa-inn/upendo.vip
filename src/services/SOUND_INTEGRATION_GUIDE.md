# Button Sound Integration Guide

This guide explains how to integrate the button click sound functionality into your React app.

## Quick Start

### 1. Using the SoundButton Component (Recommended for new buttons)

```tsx
import { SoundButton } from '../components/SoundButton';

function MyComponent() {
  const handleClick = () => {
    console.log('Button clicked!');
  };

  return (
    <SoundButton 
      onClick={handleClick}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      soundVolume={0.3} // Optional: adjust volume (0.0 to 1.0)
    >
      Click me!
    </SoundButton>
  );
}
```

### 2. Using the useButtonSound Hook (For existing buttons)

```tsx
import { useButtonSound } from '../hooks/useButtonSound';

function MyComponent() {
  const originalOnClick = () => {
    console.log('Button clicked!');
  };

  // Add sound to existing onClick handler
  const handleClick = useButtonSound(originalOnClick, 0.3);

  return (
    <button 
      onClick={handleClick}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg"
    >
      Click me!
    </button>
  );
}
```

### 3. Using AutoSoundEnhancer (For bulk enhancement)

```tsx
import { AutoSoundEnhancer } from '../components/SoundSettings';

function MyPage() {
  return (
    <AutoSoundEnhancer volume={0.3} enabled={true}>
      <div>
        {/* All buttons in this container will automatically play sounds */}
        <button className="btn-primary">Button 1</button>
        <button className="btn-secondary">Button 2</button>
        <CustomButtonComponent>Button 3</CustomButtonComponent>
      </div>
    </AutoSoundEnhancer>
  );
}
```

### 4. Using the HOC Pattern

```tsx
import { withButtonSound } from '../utils/buttonSound';

// Create a sound-enhanced version of any button component
const SoundButton = withButtonSound('button');
const SoundMotionButton = withButtonSound(motion.button);

function MyComponent() {
  return (
    <SoundMotionButton
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white"
      onClick={() => console.log('Clicked!')}
    >
      Enhanced Motion Button
    </SoundMotionButton>
  );
}
```

## Sound Settings

### Adding Sound Toggle to Your App

```tsx
import { SoundSettingsToggle } from '../components/SoundSettings';

function SettingsPage() {
  return (
    <div>
      <h2>Settings</h2>
      <SoundSettingsToggle className="mb-4" />
      {/* Other settings */}
    </div>
  );
}
```

### Using Sound Settings Hook

```tsx
import { useSoundSettings } from '../hooks/useButtonSound';

function MyComponent() {
  const { isSoundEnabled, toggleSound, setSoundEnabled } = useSoundSettings();

  return (
    <div>
      <p>Sounds are {isSoundEnabled ? 'enabled' : 'disabled'}</p>
      <button onClick={toggleSound}>Toggle Sounds</button>
      <button onClick={() => setSoundEnabled(true)}>Enable Sounds</button>
      <button onClick={() => setSoundEnabled(false)}>Disable Sounds</button>
    </div>
  );
}
```

## Advanced Usage

### Custom Sound Volumes

```tsx
// Different volume levels for different button types
<SoundButton soundVolume={0.1}>Subtle sound</SoundButton>
<SoundButton soundVolume={0.5}>Medium sound</SoundButton>
<SoundButton soundVolume={0.8}>Loud sound</SoundButton>
```

### Conditional Sound Playback

```tsx
// Only play sound under certain conditions
<SoundButton 
  playSound={userPreferences.soundsEnabled && !isMuted}
  onClick={handleClick}
>
  Conditional Sound
</SoundButton>
```

### Direct Sound Service Usage

```tsx
import { soundService } from '../services/soundService';

function MyComponent() {
  const playCustomSound = () => {
    // Play button click sound directly
    soundService.playButtonClick(0.4);
    
    // Or play other loaded sounds
    soundService.playSound('notification', 0.5);
  };

  return (
    <button onClick={playCustomSound}>
      Play Custom Sound
    </button>
  );
}
```

## Integration Examples

### Example 1: Navigation Menu

```tsx
import { SoundButton } from '../components/SoundButton';

function NavigationMenu() {
  return (
    <nav>
      <SoundButton className="nav-button" onClick={() => navigate('/home')}>
        Home
      </SoundButton>
      <SoundButton className="nav-button" onClick={() => navigate('/profile')}>
        Profile
      </SoundButton>
      <SoundButton className="nav-button" onClick={() => navigate('/settings')}>
        Settings
      </SoundButton>
    </nav>
  );
}
```

### Example 2: Form with Sound-Enhanced Buttons

```tsx
import { useButtonSound } from '../hooks/useButtonSound';

function ContactForm() {
  const handleSubmit = () => {
    // Form submission logic
    console.log('Form submitted');
  };

  const handleReset = () => {
    // Form reset logic
    console.log('Form reset');
  };

  const submitWithSound = useButtonSound(handleSubmit, 0.4);
  const resetWithSound = useButtonSound(handleReset, 0.2);

  return (
    <form>
      {/* Form fields */}
      <div className="form-actions">
        <button type="submit" onClick={submitWithSound} className="submit-btn">
          Send Message
        </button>
        <button type="button" onClick={resetWithSound} className="reset-btn">
          Reset Form
        </button>
      </div>
    </form>
  );
}
```

### Example 3: Game Interface with Auto Enhancement

```tsx
import { AutoSoundEnhancer } from '../components/SoundSettings';

function GameInterface() {
  return (
    <AutoSoundEnhancer volume={0.3}>
      <div className="game-ui">
        <div className="game-controls">
          <button className="game-btn">Attack</button>
          <button className="game-btn">Defend</button>
          <button className="game-btn">Special</button>
        </div>
        <div className="menu-controls">
          <button className="menu-btn">Pause</button>
          <button className="menu-btn">Settings</button>
          <button className="menu-btn">Quit</button>
        </div>
      </div>
    </AutoSoundEnhancer>
  );
}
```

## Best Practices

1. **Volume Control**: Keep button click sounds subtle (0.2-0.4) to avoid being intrusive
2. **User Preferences**: Always respect user sound preferences
3. **Performance**: The sound service preloads sounds for instant playback
4. **Accessibility**: Sounds enhance UX but shouldn't be required for functionality
5. **Mobile Optimization**: The service handles mobile audio context requirements

## Troubleshooting

### Sound Not Playing?
1. Check if sounds are enabled: `soundService.isSoundEnabled()`
2. Verify the sound file path is correct
3. Ensure audio context is not suspended (handled automatically)
4. Check browser console for any audio-related errors

### Performance Issues?
1. Use `AutoSoundEnhancer` sparingly (only on containers with many buttons)
2. Consider using the hook approach for better performance
3. Preload only necessary sounds

## Available Sounds

The following sounds are preloaded and ready to use:
- `buttonClick` - `/Sound/button click.wav`
- `notification` - `/Sound/push notification.wav`

You can add more sounds by using the `preloadSound` method in the sound service.