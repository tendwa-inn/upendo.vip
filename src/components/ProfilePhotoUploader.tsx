import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import { Upload, X } from 'lucide-react';

const ProfilePhotoUploader: React.FC<{ maxPhotos?: number }> = ({ maxPhotos = 6 }) => {
  const { user, updateUserProfile } = useAuthStore();
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setPhotos(prev => [...prev, ...filesArray]);

      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
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
          <div key={index} className="relative aspect-square">
            <img src={preview} alt={`preview ${index}`} className="w-full h-full object-cover rounded-lg" />
            <button onClick={() => removePhoto(index)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">X</button>
          </div>
        ))}
        {photos.length < maxPhotos && (
          <label htmlFor="photo-upload" className="cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-500 rounded-lg aspect-square hover:bg-gray-700 transition-colors">
            <Upload className="w-8 h-8 text-gray-400" />
            <input id="photo-upload" type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        )}
      </div>
      <button onClick={handleSavePhotos} disabled={uploading || photos.length === 0} className="w-full font-bold py-3 px-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300 disabled:bg-green-800 disabled:cursor-not-allowed">
        {uploading ? 'Uploading...' : 'Save Photos'}
      </button>
    </div>
  );
};

export default ProfilePhotoUploader;
