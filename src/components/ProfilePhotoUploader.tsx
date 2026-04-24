import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import { UploadCloud, X, Edit } from 'lucide-react';
import PhotoCropModal from './PhotoCropModal';

const ProfilePhotoUploader: React.FC<{ maxPhotos?: number }> = ({ maxPhotos = 6 }) => {
  const { user, updateUserProfile, profile } = useAuthStore();
  const isVip = profile?.account_type === 'vip';
  const isPro = profile?.account_type === 'pro';
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [currentImageToCrop, setCurrentImageToCrop] = useState<string | null>(null);
  const [currentFileToCrop, setCurrentFileToCrop] = useState<File | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const combinedPhotos = [...photos, ...filesArray].slice(0, maxPhotos);
      setPhotos(combinedPhotos);

      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      const combinedPreviews = [...previews, ...newPreviews].slice(0, maxPhotos);
      setPreviews(combinedPreviews);
      e.target.value = '';
    }
  };

  const openCropper = (index: number) => {
    setEditingIndex(index);
    setCurrentImageToCrop(previews[index]);
    setCropModalOpen(true);
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    if (editingIndex === null) return;

    fetch(croppedImageUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `cropped_${Date.now()}.jpg`, { type: 'image/jpeg' });
        
        const newPhotos = [...photos];
        newPhotos[editingIndex] = file;
        setPhotos(newPhotos);

        const newPreviews = [...previews];
        newPreviews[editingIndex] = croppedImageUrl;
        setPreviews(newPreviews);

        // Clean up the old blob URL that was replaced
        // URL.revokeObjectURL(previews[editingIndex]);

        setCropModalOpen(false);
        setCurrentImageToCrop(null);
        setEditingIndex(null);
      });
  };

  const handleCropCancel = () => {
    setCropModalOpen(false);
    setCurrentImageToCrop(null);
    setCurrentFileToCrop(null);
    if (currentImageToCrop) {
      URL.revokeObjectURL(currentImageToCrop);
    }
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSavePhotos = async () => {
    if (!user) {
      toast.error('You must be logged in to upload photos.');
      return;
    }
    if (photos.length < 1) {
      toast.error('Please select at least one photo to upload.');
      return;
    }

    setUploading(true);
    const uploadToastId = toast.loading('Starting upload...');

    try {
      const uploadPromises = photos.map(async (photo, index) => {
        const fileName = `${user.id}/${Date.now()}_${photo.name}`;
        toast.loading(`Uploading photo ${index + 1} of ${photos.length}...`, { id: uploadToastId });

        const uploadPromise = supabase.storage
            .from('avatars')
            .upload(fileName, photo);

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Upload for ${photo.name} timed out.`)), 15000)
        );

        const { error }: any = await Promise.race([uploadPromise, timeoutPromise]);

        if (error) {
          throw new Error(`Failed to upload ${photo.name}: ${error.message}`);
        }

        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      toast.loading('Saving photos to your profile...', { id: uploadToastId });

      const { data: currentProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('photos')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        throw new Error(`Could not fetch current profile: ${fetchError.message}`);
      }

      const existingPhotos = currentProfile?.photos || [];
      const newPhotos = [...existingPhotos, ...uploadedUrls];

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ photos: newPhotos })
        .eq('id', user.id);

      if (profileError) {
        throw new Error(`Failed to save photos to profile: ${profileError.message}`);
      }

      updateUserProfile({ photos: newPhotos });
      toast.success('Photos uploaded successfully!', { id: uploadToastId });
      setPhotos([]);
      setPreviews([]);
    } catch (error: any) {
      toast.error(error.message, { id: uploadToastId });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-4">
      <div className="grid grid-cols-3 gap-4 mb-6 w-full">
        {previews.map((preview, index) => (
          <div key={index} className="relative aspect-square group">
            <img src={preview} alt={`preview ${index}`} className="w-full h-full object-cover rounded-lg" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button onClick={() => openCropper(index)} className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => removePhoto(index)} className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {photos.length < maxPhotos && (
          <label htmlFor="photo-upload" className="cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-500 rounded-lg aspect-square hover:bg-gray-700 transition-colors">
                                                  <UploadCloud className="w-8 h-8 text-gray-400 opacity-50" />
            <input id="photo-upload" type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        )}
      </div>
      <button onClick={handleSavePhotos} disabled={uploading || photos.length === 0} className={`w-full font-bold py-3 px-4 rounded-xl transition-all duration-300 disabled:cursor-not-allowed ${
        isVip ? 'bg-amber-400 hover:bg-amber-500 text-black disabled:bg-amber-800' : isPro ? 'bg-cyan-400 hover:bg-cyan-500 text-white disabled:bg-cyan-800' : 'bg-green-600 hover:bg-green-700 text-white disabled:bg-green-800'
      }`}>
        {uploading ? 'Uploading...' : 'Save Photos'}
      </button>
      {currentImageToCrop && (
        <PhotoCropModal
          isOpen={cropModalOpen}
          onClose={handleCropCancel}
          onCropComplete={handleCropComplete}
          imageUrl={currentImageToCrop}
        />
      )}
    </div>
  );
};

export default ProfilePhotoUploader;
