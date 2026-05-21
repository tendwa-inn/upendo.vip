import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import { UploadCloud, X, Edit } from 'lucide-react';
import PhotoCropModal from './PhotoCropModal';
import { useCurrentTheme } from '../stores/colorThemeStore';
import { useTranslation } from 'react-i18next';

const ProfilePhotoUploader: React.FC<{ maxPhotos?: number }> = ({ maxPhotos = 6 }) => {
  const { t } = useTranslation();
  const { user, updateUserProfile, profile } = useAuthStore();
  const acct = profile?.account_type || profile?.subscription || 'free';
  const theme = useCurrentTheme(acct);
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
      toast.error(t('photo.notLoggedIn'));
      return;
    }
    if (photos.length < 1) {
      toast.error(t('photo.selectPhoto'));
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
      toast.success(t('photo.uploadSuccess'), { id: uploadToastId });
      setPhotos([]);
      setPreviews([]);
    } catch (error: any) {
      toast.error(error.message, { id: uploadToastId });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-5">
        <h3 className="text-lg font-bold text-white">Add Photos</h3>
        <p className="text-xs text-white/50 mt-1">{photos.length > 0 ? `${photos.length} of ${maxPhotos} selected` : `Select up to ${maxPhotos} photos`}</p>
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {previews.map((preview, index) => (
          <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
            <img src={preview} alt={`preview ${index}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button onClick={() => openCropper(index)} className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => removePhoto(index)} className="p-2 bg-red-500/60 backdrop-blur-sm text-white rounded-full hover:bg-red-500/80 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Number badge */}
            <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">{index + 1}</span>
            </div>
          </div>
        ))}
        {photos.length < maxPhotos && (
          <label htmlFor="photo-upload" className={`cursor-pointer flex flex-col items-center justify-center gap-1.5 border-2 border-dashed ${theme.accent.border.replace('/30', '/40')} rounded-xl aspect-square bg-white/5 hover:bg-white/10 hover:border-white/40 transition-all duration-300 group`}>
            <div className={`${theme.button.primary} p-2.5 rounded-full transition-transform duration-300 group-hover:scale-110`}>
              <UploadCloud className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] text-white/40 group-hover:text-white/60 transition-colors">Browse</span>
            <input id="photo-upload" type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSavePhotos}
          disabled={uploading || photos.length === 0}
          className={`flex-1 font-bold py-3 px-4 rounded-xl transition-all duration-300 disabled:cursor-not-allowed ${theme.button.primary} ${theme.button.primaryHover} text-white disabled:opacity-40`}
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Uploading...
            </span>
          ) : `Upload ${photos.length > 0 ? `(${photos.length})` : ''}`}
        </button>
      </div>

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
