import React from 'react';
import { SoundButton } from '../components/SoundButton.tsx';
import { useButtonSound } from '../hooks/useButtonSound.ts';
import { SoundSettingsToggle, AutoSoundEnhancer } from '../components/SoundSettings.tsx';

/**
 * Test component to demonstrate button sound functionality
 * This component showcases all the different ways to add sounds to buttons
 */
export const ButtonSoundDemo: React.FC = () => {
  // Using the hook approach
  const handleHookClick = useButtonSound(() => {
    console.log('Hook-enhanced button clicked!');
  }, 0.3);

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Button Sound Demo</h1>
        
        {/* Sound Settings */}
        <div className="mb-8 text-center">
          <SoundSettingsToggle />
        </div>

        {/* Method 1: SoundButton Component */}
        <div className="mb-8 p-6 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Method 1: SoundButton Component</h2>
          <div className="flex gap-4 flex-wrap">
            <SoundButton 
              onClick={() => console.log('Primary button clicked!')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Primary Button
            </SoundButton>
            
            <SoundButton 
              onClick={() => console.log('Success button clicked!')}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              soundVolume={0.4}
            >
              Success Button (Louder)
            </SoundButton>
            
            <SoundButton 
              onClick={() => console.log('Subtle button clicked!')}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              soundVolume={0.1}
            >
              Subtle Button (Quieter)
            </SoundButton>
          </div>
        </div>

        {/* Method 2: Hook Approach */}
        <div className="mb-8 p-6 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Method 2: useButtonSound Hook</h2>
          <div className="flex gap-4 flex-wrap">
            <button 
              onClick={handleHookClick}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Hook-Enhanced Button
            </button>
            
            <button 
              onClick={useButtonSound(() => console.log('Another hook button!'), 0.2)}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Another Hook Button
            </button>
          </div>
        </div>

        {/* Method 3: AutoSoundEnhancer */}
        <div className="mb-8 p-6 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Method 3: AutoSoundEnhancer</h2>
          <p className="text-gray-400 mb-4">All buttons in this section automatically play sounds:</p>
          <AutoSoundEnhancer volume={0.25}>
            <div className="flex gap-4 flex-wrap">
              <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Auto-Enhanced Button 1
              </button>
              <button className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                Auto-Enhanced Button 2
              </button>
              <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Auto-Enhanced Button 3
              </button>
            </div>
          </AutoSoundEnhancer>
        </div>

        {/* Method 4: Motion/Framer Motion Integration */}
        <div className="mb-8 p-6 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Method 4: Motion Button with Sound</h2>
          <div className="flex gap-4 flex-wrap">
            <SoundButton 
              onClick={() => console.log('Motion button clicked!')}
              className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-all duration-200 transform hover:scale-105"
              style={{
                boxShadow: '0 4px 14px 0 rgba(236, 72, 153, 0.3)'
              }}
            >
              ✨ Motion Button
            </SoundButton>
            
            <SoundButton 
              onClick={() => console.log('Gradient button clicked!')}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200"
            >
              🌈 Gradient Button
            </SoundButton>
          </div>
        </div>

        {/* Volume Examples */}
        <div className="mb-8 p-6 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Volume Examples</h2>
          <div className="flex gap-4 flex-wrap">
            <SoundButton 
              soundVolume={0.1}
              onClick={() => console.log('Very quiet button')}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              🔇 Very Quiet (0.1)
            </SoundButton>
            
            <SoundButton 
              soundVolume={0.3}
              onClick={() => console.log('Normal button')}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              🔊 Normal (0.3)
            </SoundButton>
            
            <SoundButton 
              soundVolume={0.6}
              onClick={() => console.log('Loud button')}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              🔊🔊 Loud (0.6)
            </SoundButton>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-6 bg-blue-900/30 rounded-lg border border-blue-500/30">
          <h2 className="text-xl font-semibold mb-4 text-blue-300">💡 Integration Instructions</h2>
          <div className="space-y-3 text-sm text-blue-200">
            <p>• <strong>Click any button above</strong> to hear the button click sound!</p>
            <p>• Use the <strong>Sound Settings toggle</strong> at the top to enable/disable sounds</p>
            <p>• <strong>SoundButton component</strong> is the easiest way for new buttons</p>
            <p>• <strong>useButtonSound hook</strong> is perfect for existing buttons</p>
            <p>• <strong>AutoSoundEnhancer</strong> automatically adds sounds to all buttons in a container</p>
            <p>• Adjust <strong>soundVolume</strong> prop (0.0 to 1.0) to control loudness</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ButtonSoundDemo;