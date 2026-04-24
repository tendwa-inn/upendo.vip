import React from 'react';
import { motion } from 'framer-motion';

interface CardPreviewProps {
  imageUrl: string;
  name: string;
  age: number | null;
  bio: string;
}

const CardPreview: React.FC<CardPreviewProps> = ({ imageUrl, name, age, bio }) => {
  return (
    <div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden shadow-lg bg-gray-800 flex items-center justify-center">
      <p className="text-white/50 text-sm">Live Preview</p>
      <div className="absolute inset-0">
        <img src={imageUrl} alt="Profile preview" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="text-2xl font-bold">
            {name}{age ? `, ${age}` : ''}
          </h3>
          <p className="text-sm opacity-80 truncate">{bio || 'This is my bio'}</p>
        </div>
      </div>
    </div>
  );
};

export default CardPreview;
