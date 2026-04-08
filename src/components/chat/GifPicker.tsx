import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface GifPickerProps {
  onSelect: (gifUrl: string) => void;
  onClose: () => void;
}

const GifPicker: React.FC<GifPickerProps> = ({ onSelect, onClose }) => {
  const [gifs, setGifs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [recentGifs, setRecentGifs] = useState<string[]>([]);

  useEffect(() => {
    const storedRecentGifs = JSON.parse(localStorage.getItem('recent_gifs') || '[]');
    setRecentGifs(storedRecentGifs);

    const fetchGifs = async () => {
      try {
        const response = await fetch('/GIFS/full_set.json');
        const data = await response.json();
        const shuffledGifs = data.data.sort(() => 0.5 - Math.random());
        setGifs(shuffledGifs);
      } catch (error) {
        console.error('Error fetching local GIFs:', error);
      }
    };
    fetchGifs();
  }, []);

  const filteredGifs = searchTerm
    ? gifs.filter(gif => gif.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : gifs;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="absolute bottom-20 left-0 right-0 bg-[#1f0a10] border-t border-white/10 rounded-t-lg p-4 h-96 z-20"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Choose a GIF</h3>
        <button onClick={onClose} className="text-white/60 hover:text-white">Close</button>
      </div>
      <input
        type="text"
        placeholder="Search for a GIF..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full bg-white/10 rounded-full px-4 py-2 text-sm outline-none mb-4"
      />

      {recentGifs.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-white/60 mb-2">Recently Used</h4>
          <div className="grid grid-cols-5 gap-2">
            {recentGifs.map((gifUrl) => (
              <motion.div
                key={gifUrl}
                whileHover={{ scale: 1.05 }}
                onClick={() => onSelect(gifUrl)}
                className="cursor-pointer rounded-md overflow-hidden"
              >
                <img src={gifUrl} alt="recent gif" className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 overflow-y-auto h-full pb-16">
        {filteredGifs.map((gif) => (
          <motion.div
            key={gif.id}
            whileHover={{ scale: 1.05 }}
            onClick={() => onSelect(gif.images.original.url)}
            className="cursor-pointer rounded-md overflow-hidden"
          >
            <img src={gif.images.original.url} alt={gif.title} className="w-full h-full object-cover" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default GifPicker;
