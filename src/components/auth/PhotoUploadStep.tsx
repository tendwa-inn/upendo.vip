import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSignUpStore } from '../../stores/signUpStore';
import { Camera, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const PhotoUploadStep: React.FC = () => {
  const { nextStep, updateFormData } = useSignUpStore();
  const [photos, setPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newPhotos = files.map((file) => URL.createObjectURL(file));
      setPhotos((prev) => [...prev, ...newPhotos].slice(0, 5));
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (photos.length < 3) {
      toast.error('Please upload at least 3 photos');
      return;
    }
    updateFormData({ photos });
    nextStep();
  };

  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full mb-6"
      >
        <Camera className="w-10 h-10 text-white" />
      </motion.div>

      <h2 className="text-2xl font-bold text-white mb-3">Upload your photos</h2>
      <p className="text-white/80 mb-6">Add at least 3 photos to continue (max 5).</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {photos.map((photo, index) => (
          <div key={index} className="relative aspect-square rounded-xl overflow-hidden">
            <img src={photo} alt={`upload-${index}`} className="w-full h-full object-cover" />
            <button
              onClick={() => removePhoto(index)}
              className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {photos.length < 5 && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative aspect-square rounded-xl border-2 border-dashed border-white/50 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors"
          >
            <Plus className="w-8 h-8 text-white/50" />
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleNext}
        disabled={photos.length < 3}
        className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold rounded-2xl hover:from-green-600 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Finish
      </motion.button>
    </div>
  );
};

export default PhotoUploadStep;