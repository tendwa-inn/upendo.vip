import React, { useState, useEffect } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { connectionApplicationService } from '../../services/connectionApplicationService';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ConnectionApplicationModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { profile, user } = useAuthStore();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && profile) {
      setName(profile.name || '');
      setBio(profile.bio || '');
      // Pre-fill with first 3 profile photos
      setPhotos((profile.photos || []).slice(0, 3));
    }
  }, [isOpen, profile]);

  // Calculate age from various sources
  const calculatedAge = (() => {
    if (profile?.age) return profile.age;
    const dob = (profile as any)?.dob || profile?.date_of_birth;
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    }
    return null;
  })();

  if (!isOpen) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/connection_${Date.now()}_${index}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName);

      const newPhotos = [...photos];
      newPhotos[index] = urlData.publicUrl;
      setPhotos(newPhotos);
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const handleSubmit = async () => {
    if (!user || !profile) return;

    if (!name.trim() || !calculatedAge || !bio.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (photos.length === 0) {
      toast.error('Please add at least one photo');
      return;
    }

    setSubmitting(true);
    try {
      await connectionApplicationService.submitApplication({
        user_id: user.id,
        name: name.trim(),
        age: calculatedAge,
        gender: profile.gender as 'male' | 'female',
        bio: bio.trim(),
        location: profile.location || { name: 'Unknown', latitude: 0, longitude: 0 },
        photos: photos.filter(Boolean),
      });

      toast.success('Application submitted!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-black border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-[0_0_30px_rgba(255,255,255,0.05)]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Apply For A Connection</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm text-white/60 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-pink-500/50"
            />
          </div>

          {/* Age - auto-filled and disabled */}
          <div>
            <label className="block text-sm text-white/60 mb-1">Age</label>
            <input
              type="text"
              value={calculatedAge || ''}
              disabled
              placeholder="Auto-filled from profile"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/50 cursor-not-allowed"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm text-white/60 mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-pink-500/50 resize-none"
            />
          </div>

          {/* Photos */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Photos (up to 3)</label>
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/10">
                  {photos[index] ? (
                    <>
                      <img
                        src={photos[index]}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 bg-red-500/80 rounded-full p-1"
                      >
                        <Trash2 className="w-3 h-3 text-white" />
                      </button>
                    </>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-white/10 transition-colors">
                      <Upload className="w-6 h-6 text-white/30" />
                      <span className="text-xs text-white/30 mt-1">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(e, index)}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting || uploading}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionApplicationModal;
