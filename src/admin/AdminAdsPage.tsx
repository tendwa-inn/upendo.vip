import React, { useState, useEffect } from 'react';
import { Card, Title, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Button, Badge } from '@tremor/react';
import { Plus, Pencil, Trash2, X, Upload, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { adService, Ad } from '../services/adService';
import { supabase } from '../lib/supabaseClient';

const AdminAdsPage: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [form, setForm] = useState({
    name: '',
    type: 'swipe' as 'swipe' | 'engagement',
    image_url: '',
    video_url: '',
    redirect_url: '',
    action_label: 'Visit Page',
    is_active: true,
    frequency: 5,
    duration_seconds: 30,
    reward_swipes: 2,
    max_completions: 2,
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => { loadAds(); }, []);

  const loadAds = async () => {
    try {
      setLoading(true);
      const data = await adService.getAllAds();
      setAds(data);
    } catch (err) {
      console.error('Failed to load ads:', err);
      toast.error('Failed to load ads');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingAd(null);
    setForm({
      name: '', type: 'swipe', image_url: '', video_url: '', redirect_url: '',
      action_label: 'Visit Page', is_active: true, frequency: 5,
      duration_seconds: 30, reward_swipes: 2, max_completions: 2,
    });
    setShowModal(true);
  };

  const openEditModal = (ad: Ad) => {
    setEditingAd(ad);
    setForm({
      name: ad.name, type: ad.type, image_url: ad.image_url || '',
      video_url: ad.video_url || '', redirect_url: ad.redirect_url,
      action_label: ad.action_label, is_active: ad.is_active,
      frequency: ad.frequency, duration_seconds: ad.duration_seconds,
      reward_swipes: ad.reward_swipes, max_completions: ad.max_completions,
    });
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `ads/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('avatars').upload(path, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      setForm(f => ({ ...f, image_url: urlData.publicUrl }));
      toast.success('Image uploaded');
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `ads/videos/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('avatars').upload(path, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      setForm(f => ({ ...f, video_url: urlData.publicUrl }));
      toast.success('Video uploaded');
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    try {
      if (editingAd) {
        await adService.updateAd(editingAd.id, form);
        toast.success('Ad updated');
      } else {
        await adService.createAd(form);
        toast.success('Ad created');
      }
      setShowModal(false);
      loadAds();
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Failed to save ad');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this ad?')) return;
    try {
      await adService.deleteAd(id);
      toast.success('Ad deleted');
      loadAds();
    } catch (err) {
      toast.error('Failed to delete ad');
    }
  };

  const toggleActive = async (ad: Ad) => {
    try {
      await adService.updateAd(ad.id, { is_active: !ad.is_active });
      loadAds();
    } catch (err) {
      toast.error('Failed to update ad');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">Ad Manager</h1>
          <p className="text-gray-400 mt-1 text-sm">{ads.length} ads configured</p>
        </div>
        <button onClick={openCreateModal} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium shadow-lg shadow-pink-500/25 transition-all duration-300">
          <Plus className="w-4 h-4" /> Create Ad
        </button>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
          </div>
        ) : ads.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No ads created yet</p>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell className="text-white">Name</TableHeaderCell>
                <TableHeaderCell className="text-white">Type</TableHeaderCell>
                <TableHeaderCell className="text-white">Status</TableHeaderCell>
                <TableHeaderCell className="text-white">Details</TableHeaderCell>
                <TableHeaderCell className="text-white">Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ads.map(ad => (
                <TableRow key={ad.id}>
                  <TableCell className="font-medium text-white">{ad.name}</TableCell>
                  <TableCell>
                    <Badge color={ad.type === 'swipe' ? 'pink' : 'cyan'} size="sm">
                      {ad.type === 'swipe' ? 'Swipe Ad' : 'Engagement'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => toggleActive(ad)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        ad.is_active
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                      }`}
                    >
                      {ad.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </TableCell>
                  <TableCell className="text-gray-300 text-sm">
                    {ad.type === 'swipe' ? (
                      <span>Every {ad.frequency} swipes</span>
                    ) : (
                      <span>{ad.duration_seconds}s watch &middot; +{ad.reward_swipes} swipes &middot; max {ad.max_completions}x</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <button onClick={() => openEditModal(ad)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                        <Pencil className="w-4 h-4 text-gray-300" />
                      </button>
                      <button onClick={() => handleDelete(ad.id)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-[#2a0f15] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto text-white border border-pink-500/20 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-lg font-bold">{editingAd ? 'Edit Ad' : 'Create Ad'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-white/10 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              {/* Name */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Ad Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full p-2 bg-white/5 rounded-lg border border-white/10 text-white" placeholder="e.g. Summer Promo" />
              </div>

              {/* Type */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Ad Type</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setForm(f => ({ ...f, type: 'swipe' }))}
                    className={`flex-1 p-3 rounded-lg border text-center transition-colors ${
                      form.type === 'swipe' ? 'bg-pink-600/20 border-pink-500 text-pink-400' : 'bg-white/5 border-white/10 text-gray-400'
                    }`}
                  >
                    Swipe Ad
                  </button>
                  <button
                    onClick={() => setForm(f => ({ ...f, type: 'engagement' }))}
                    className={`flex-1 p-3 rounded-lg border text-center transition-colors ${
                      form.type === 'engagement' ? 'bg-cyan-600/20 border-cyan-500 text-cyan-400' : 'bg-white/5 border-white/10 text-gray-400'
                    }`}
                  >
                    Engagement
                  </button>
                </div>
              </div>

              {/* Redirect URL */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Redirect URL {form.type === 'swipe' && '(optional)'}</label>
                <input value={form.redirect_url} onChange={e => setForm(f => ({ ...f, redirect_url: e.target.value }))}
                  className="w-full p-2 bg-white/5 rounded-lg border border-white/10 text-white" placeholder="https://example.com" />
                {form.type === 'swipe' && <p className="text-xs text-gray-500 mt-1">If empty, ad shows with no action button</p>}
              </div>

              {/* Action Label */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Action Button Label</label>
                <select value={form.action_label} onChange={e => setForm(f => ({ ...f, action_label: e.target.value }))}
                  className="w-full p-2 bg-white/5 rounded-lg border border-white/10 text-white">
                  <option value="Visit Page">Visit Page</option>
                  <option value="Subscribe">Subscribe</option>
                  <option value="Follow">Follow</option>
                  <option value="Shop Now">Shop Now</option>
                  <option value="Learn More">Learn More</option>
                  <option value="Download">Download</option>
                  <option value="Sign Up">Sign Up</option>
                </select>
              </div>

              {/* Image */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Image (URL or upload)</label>
                <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                  className="w-full p-2 bg-white/5 rounded-lg border border-white/10 text-white mb-2" placeholder="https://example.com/image.jpg" />
                <label className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 text-sm text-gray-300 w-fit">
                  <Upload className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Upload Image'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
                {form.image_url && <img src={form.image_url} alt="Preview" className="mt-2 h-20 rounded-lg object-cover" />}
              </div>

              {/* Video (engagement only) */}
              {form.type === 'engagement' && (
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Video (URL or upload)</label>
                  <input value={form.video_url} onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))}
                    className="w-full p-2 bg-white/5 rounded-lg border border-white/10 text-white mb-2" placeholder="https://youtube.com/watch?v=..." />
                  <label className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 text-sm text-gray-300 w-fit">
                    <Upload className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Upload Video'}
                    <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} disabled={uploading} />
                  </label>
                  {form.video_url && <p className="text-xs text-green-400 mt-1">Video set: {form.video_url.substring(0, 50)}...</p>}
                </div>
              )}

              {/* Swipe Ad Settings */}
              {form.type === 'swipe' && (
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Show every N swipes</label>
                  <input type="number" min={1} value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: parseInt(e.target.value) || 5 }))}
                    className="w-full p-2 bg-white/5 rounded-lg border border-white/10 text-white" />
                </div>
              )}

              {/* Engagement Ad Settings */}
              {form.type === 'engagement' && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Watch (sec)</label>
                    <input type="number" min={5} value={form.duration_seconds} onChange={e => setForm(f => ({ ...f, duration_seconds: parseInt(e.target.value) || 30 }))}
                      className="w-full p-2 bg-white/5 rounded-lg border border-white/10 text-white" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Reward Swipes</label>
                    <input type="number" min={1} value={form.reward_swipes} onChange={e => setForm(f => ({ ...f, reward_swipes: parseInt(e.target.value) || 2 }))}
                      className="w-full p-2 bg-white/5 rounded-lg border border-white/10 text-white" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Max Completions</label>
                    <input type="number" min={1} value={form.max_completions} onChange={e => setForm(f => ({ ...f, max_completions: parseInt(e.target.value) || 2 }))}
                      className="w-full p-2 bg-white/5 rounded-lg border border-white/10 text-white" />
                  </div>
                </div>
              )}

              {/* Active Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Active</span>
                <button
                  onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                  className={`w-12 h-6 rounded-full transition-colors relative ${form.is_active ? 'bg-green-500' : 'bg-gray-600'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>

            <div className="p-4 border-t border-white/10 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-300">
                Cancel
              </button>
              <button onClick={handleSave} className="flex-1 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 transition-colors text-white font-semibold">
                {editingAd ? 'Save Changes' : 'Create Ad'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAdsPage;
