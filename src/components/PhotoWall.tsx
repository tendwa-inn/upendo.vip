
import React from 'react';
import ProfilePhotoUploader from './ProfilePhotoUploader';

const PhotoWall: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Showcase Yourself!</h2>
        <p className="text-gray-300 mb-6">
          To start seeing potential matches, please upload at least 3 photos.
        </p>
        <div className="w-full">
          <ProfilePhotoUploader />
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Your profile will become visible to others once you have enough photos.
        </p>
      </div>
    </div>
  );
};

export default PhotoWall;
