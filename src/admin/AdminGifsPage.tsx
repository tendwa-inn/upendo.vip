import React, { useState, useEffect, useRef } from 'react';
import { gifService } from '../services/gifService';
import { Button, Dialog, DialogPanel, Title, TextInput } from '@tremor/react';
import { PlusCircleIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const AdminGifsPage: React.FC = () => {
  const [gifs, setGifs] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGif, setNewGif] = useState<{ file: File | null; keywords: string }>({ file: null, keywords: '' });
  const [editingGif, setEditingGif] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEdit = (gif: any) => {
    setEditingGif(gif);
    setNewGif({ file: null, keywords: gif.keywords.join(', ') });
    setIsDialogOpen(true);
  };

  useEffect(() => {
    loadGifs();
  }, []);

  const loadGifs = async () => {
    const gifs = await gifService.getGifs();
    setGifs(gifs);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewGif({ ...newGif, file: e.target.files[0] });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this GIF?')) {
      try {
        await gifService.deleteGif(id);
        toast.success('GIF deleted successfully');
        loadGifs();
      } catch (error) {
        toast.error('Failed to delete GIF');
      }
    }
  };

  const handleUpload = async () => {
    if (editingGif) {
      try {
        await gifService.updateGif(editingGif.id, newGif.keywords.split(',').map(k => k.trim()));
        toast.success('GIF updated successfully');
        setIsDialogOpen(false);
        setNewGif({ file: null, keywords: '' });
        setEditingGif(null);
        loadGifs();
      } catch (error) {
        toast.error('Failed to update GIF');
      }
    } else if (newGif.file) {
      try {
        await gifService.uploadGif(newGif.file, newGif.keywords.split(',').map(k => k.trim()));
        toast.success('GIF uploaded successfully');
        setIsDialogOpen(false);
        setNewGif({ file: null, keywords: '' });
        loadGifs();
      } catch (error) {
        toast.error('Failed to upload GIF');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">GIF Management</h1>
        <Button icon={PlusCircleIcon} onClick={() => setIsDialogOpen(true)}>Add GIF</Button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {gifs.map((gif) => (
          <div key={gif.id} className="relative group">
            <img src={gif.url} alt="gif" className="w-full h-full object-cover rounded-md" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button icon={TrashIcon} variant="secondary" onClick={() => handleDelete(gif.id)}>Delete</Button>
              <Button icon={PencilIcon} variant="secondary" onClick={() => handleEdit(gif)}>Edit</Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} static={true}>
        <DialogPanel className="bg-[#3a1a22] p-6 rounded-lg shadow-xl z-50 text-white">
          <Title className="mb-4 text-white">Add New GIF</Title>
          <div className="space-y-4">
            <button onClick={() => fileInputRef.current?.click()} className="w-full bg-white/10 p-4 rounded-md text-center">
              {newGif.file ? newGif.file.name : 'Click to select a GIF'}
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/gif" />
            <TextInput 
              placeholder="Keywords (comma-separated)"
              value={newGif.keywords}
              onValueChange={(value) => setNewGif({ ...newGif, keywords: value })}
            />
          </div>
          <div className="mt-6 flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpload}>Upload</Button>
          </div>
        </DialogPanel>
      </Dialog>
    </div>
  );
};

export default AdminGifsPage;
