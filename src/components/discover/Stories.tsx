import React, { useEffect, useState } from 'react';
import { useStoryStore } from '../../stores/storyStore';
import { useAuthStore } from '../../stores/authStore';
import { Story } from '../../types';
import { Plus, Heart } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const Stories: React.FC = () => {
  const { stories, fetchStories, createStory, likeStory } = useStoryStore();
  const { user: currentUser, profile } = useAuthStore();
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const handleAddStory = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    const fileName = `${currentUser.id}/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from('stories').upload(fileName, file);

    if (error) {
      console.error('Error uploading story:', error);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('stories').getPublicUrl(data.path);
    await createStory(publicUrl);
  };

  const isStoryLiked = (story: Story) => {
    if (!currentUser) return false;
    return story.likes.some(like => like.user_id === currentUser.id);
  };

  const isStoryExpired = (story: Story) => {
    const storyDate = new Date(story.created_at);
    const now = new Date();
    const diff = now.getTime() - storyDate.getTime();
    return diff > 24 * 60 * 60 * 1000;
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">Stories</h2>
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {/* Add Story button */}
        <div className="flex-shrink-0 flex flex-col items-center space-y-2">
          <label className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-white cursor-pointer">
            <Plus size={24} />
            <input type="file" accept="image/*" className="hidden" onChange={handleAddStory} />
          </label>
          <p className="text-xs text-white font-medium">Add Story</p>
        </div>

        {/* Stories */}
        {stories.filter(story => !isStoryExpired(story)).map((story) => (
          <div key={story.id} className="flex-shrink-0 flex flex-col items-center space-y-2" onClick={() => setSelectedStory(story)}>
            <div className={`w-16 h-16 rounded-full overflow-hidden p-1 border-2 ${isStoryLiked(story) ? 'border-gray-500' : 'border-pink-500'}`}>
              <img 
                src={story.imageUrl} 
                alt={story.user.name} 
                className={`w-full h-full object-cover rounded-full ${profile?.subscription === 'free' && story.user.id !== currentUser?.id ? 'blur-md' : ''}`} />
            </div>
            <p className="text-xs text-white font-medium">{story.user.name}</p>
          </div>
        ))}
      </div>

      {selectedStory && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={() => setSelectedStory(null)}>
          <div className="relative w-full max-w-md h-full max-h-[80vh] bg-black rounded-lg overflow-hidden">
            <img src={selectedStory.imageUrl} alt={selectedStory.user.name} className="w-full h-full object-contain" />
            <div className="absolute bottom-4 left-4 text-white flex items-center space-x-2">
              <img src={selectedStory.user.photos[0]} alt={selectedStory.user.name} className="w-8 h-8 rounded-full object-cover" />
              <span>{selectedStory.user.name}</span>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                likeStory(selectedStory.id);
              }}
              className="absolute bottom-4 right-4 text-white">
              <Heart size={24} className={`${isStoryLiked(selectedStory) ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stories;