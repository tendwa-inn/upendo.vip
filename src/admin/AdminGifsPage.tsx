import React, { useState, useEffect, useRef } from 'react';
import { gifService } from '../services/gifService';
import { PlusCircle, Trash2, Pencil, X } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminGifsPage: React.FC = () => {
  const [gifs, setGifs] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newGif, setNewGif] = useState<{ file: File | null; keywords: string }>({ file: null, keywords: '' });
  const [editingGif, setEditingGif] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadGifs(); }, []);

  const loadGifs = async () => {
    const gifs = await gifService.getGifs();
    setGifs(gifs);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setNewGif({ ...newGif, file: e.target.files[0] });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this GIF?')) {
      try {
        await gifService.deleteGif(id);
        toast.success('GIF deleted');
        loadGifs();
      } catch { toast.error('Failed to delete GIF'); }
    }
  };

  const handleEdit = (gif: any) => {
    setEditingGif(gif);
    setNewGif({ file: null, keywords: gif.keywords.join(', ') });
    setShowModal(true);
  };

  const handleUpload = async () => {
    try {
      if (editingGif) {
        await gifService.updateGif(editingGif.id, newGif.keywords.split(',').map(k => k.trim()));
        toast.success('GIF updated');
      } else if (newGif.file) {
        await gifService.uploadGif(newGif.file, newGif.keywords.split(',').map(k => k.trim()));
        toast.success('GIF uploaded');
      }
      setShowModal(false);
      setNewGif({ file: null, keywords: '' });
      setEditingGif(null);
      loadGifs();
    } catch { toast.error('Failed to save GIF'); }
  };

  const inputClasses = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all";

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">GIF Management</h1>
          <p className="text-gray-400 mt-1 text-sm">{gifs.length} GIFs available</p>
        </div>
        <button onClick={() => { setEditingGif(null); setNewGif({ file: null, keywords: '' }); setShowModal(true); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium shadow-lg shadow-pink-500/25 transition-all duration-300">
          <PlusCircle size={18} /> Add GIF
        </button>
      </div>

      {gifs.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-12 text-center">
          <p className="text-gray-500">No GIFs uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gifs.map(gif => (
            <div key={gif.id} className="relative group rounded-2xl overflow-hidden bg-white/5 border border-white/10 aspect-square">
              <img src={gif.url} alt="gif" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={() => handleEdit(gif)} className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"><Pencil size={16} /></button>
                <button onClick={() => handleDelete(gif.id)} className="p-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"><Trash2 size={16} /></button>
              </div>
              {gif.keywords?.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-xs text-gray-300 truncate">{gif.keywords.join(', ')}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md border border-white/10 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">{editingGif ? 'Edit GIF' : 'Upload GIF'}</h3>
            <p className="text-sm text-gray-400 mb-5">{editingGif ? 'Update keywords' : 'Select a GIF file and add keywords'}</p>
            <div className="space-y-4">
              {!editingGif && (
                <div>
                  <button onClick={() => fileInputRef.current?.click()} className="w-full p-4 rounded-xl bg-white/5 border border-white/10 border-dashed text-center text-gray-400 hover:text-pink-400 hover:border-pink-500/30 transition-all">
                    {newGif.file ? newGif.file.name : 'Click to select a GIF'}
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/gif" />
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Keywords (comma-separated)</label>
                <input type="text" value={newGif.keywords} onChange={e => setNewGif({ ...newGif, keywords: e.target.value })} placeholder="funny, reaction, happy" className={inputClasses} />
              </div>
            </div>
            <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
              <button onClick={() => { setShowModal(false); setEditingGif(null); }} className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 transition-colors">Cancel</button>
              <button onClick={handleUpload} disabled={!editingGif && !newGif.file} className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg shadow-pink-500/25 disabled:opacity-50 disabled:cursor-not-allowed">
                {editingGif ? 'Update' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGifsPage;
