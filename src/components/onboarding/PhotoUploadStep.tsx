
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, X } from 'lucide-react';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabaseClient';

interface PhotoUploadStepProps {
  onUploadComplete?: (urls: string[]) => void;
  submitButtonText?: string;
}

const PhotoUploadStep: React.FC<PhotoUploadStepProps> = ({ onUploadComplete, submitButtonText = 'Next' }) => {
  const { nextStep, prevStep, updateFormData, formData } = useOnboardingStore();
  const { user } = useAuthStore();

  // Local state for files and their object URL previews
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Effect to clean up object URLs when the component unmounts
  useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (photos.length + newFiles.length > 6) {
        alert('You can upload a maximum of 6 photos.');
        return;
      }

      const newPhotoFiles = [...photos, ...newFiles];
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      
      setPhotos(newPhotoFiles);
      setPreviews(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removePhoto = (index: number) => {
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(previews[index]);

    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = async () => {
    try {
      if (photos.length < 3) {
        alert('Please upload at least 3 photos.');
        return;
      }

      if (!user) {
        alert('Authentication session not found. Please try logging in again.');
        return;
      }

      setUploading(true);

      const uploadedUrls: string[] = [];

      for (const photo of photos) {
        const sanitizedName = photo.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const fileName = `${user.id}/${Date.now()}_${sanitizedName}`;
        
        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(fileName, photo);

        if (error) {
          throw new Error(`Upload failed for ${photo.name}: ${error.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        
        uploadedUrls.push(publicUrl);
      }

      if (onUploadComplete) {
        onUploadComplete(uploadedUrls);
      } else {
        updateFormData({ photos: uploadedUrls });
        nextStep();
      }

    } catch (error) {
      alert(`A critical error occurred: ${(error as Error).message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="w-full max-w-md bg-gray-900/30 backdrop-blur-lg rounded-3xl p-8 space-y-6"
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">Upload your photos</h1>
        <p className="text-white/60 mt-1">Show your best side! (3-6 photos)</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {previews.map((src, index) => (
          <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
            <img src={src} alt={`preview ${index}`} className="w-full h-full object-cover" />
            <button 
              onClick={() => removePhoto(index)}
              className="absolute top-1 right-1 bg-black/50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        ))}
        {photos.length < 6 && (
          <label className="relative aspect-square rounded-xl border-2 border-dashed border-white/30 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
            <Upload className="w-8 h-8 text-white/50" />
            <input 
              type="file" 
              multiple 
              accept="image/png, image/jpeg" 
              onChange={handleFileChange} 
              className="hidden" 
            />
          </label>
        )}
      </div>

      <div className="flex gap-4 pt-4">
        {prevStep && !onUploadComplete && (
          <button onClick={prevStep} className="w-full font-bold py-3 px-4 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300">Back</button>
        )}
        <button 
          onClick={handleNext} 
          disabled={uploading || photos.length < 3} 
          className="w-full font-bold py-3 px-4 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-all duration-300 disabled:bg-pink-800 disabled:cursor-not-allowed relative z-50"
        >
          {uploading ? 'Uploading...' : submitButtonText}
        </button>
      </div>
    </motion.div>
  );
};

export default PhotoUploadStep;
