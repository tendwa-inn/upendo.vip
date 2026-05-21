import React, { useState, useEffect } from 'react';
import { Plus, Upload, Trash2, Edit, Eye, Check, X, Search, Users } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import { connectionApplicationService, ConnectionApplication } from '../services/connectionApplicationService';

interface Connection {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  location: { name: string; latitude: number; longitude: number };
  bio: string;
  photos: string[];
  whatsapp_number: string;
  whatsapp_message: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

type TabType = 'connections' | 'pending' | 'approved' | 'rejected';

const AdminConnectionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('connections');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingApplications, setPendingApplications] = useState<ConnectionApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; connection: Connection | null }>({ isOpen: false, connection: null });
  const [denyModal, setDenyModal] = useState<{ isOpen: boolean; application: ConnectionApplication | null }>({ isOpen: false, application: null });
  const [denyReason, setDenyReason] = useState('');
  const [photoViewer, setPhotoViewer] = useState<{ isOpen: boolean; photos: string[]; currentIndex: number }>({ isOpen: false, photos: [], currentIndex: 0 });
  const [clearAllModal, setClearAllModal] = useState<{ isOpen: boolean; status: 'pending' | 'approved' | 'denied' | null }>({ isOpen: false, status: null });
  const [formData, setFormData] = useState({
    name: '', age: '', gender: 'female' as 'male' | 'female', location_name: '', latitude: '', longitude: '',
    bio: '', photos: [] as string[], whatsapp_number: '', whatsapp_message: '', is_active: true,
  });

  const whatsappTemplates = [
    'Hey, I would love to connect with {{name}}',
    'Hi {{name}}, I found you on Upendo and would like to connect!',
    'Hello {{name}}, can we connect on WhatsApp?',
  ];

  useEffect(() => { fetchConnections(); fetchPendingApplications(); }, []);

  const fetchPendingApplications = async () => {
    try { const apps = await connectionApplicationService.getAllApplications(); setPendingApplications(apps); }
    catch (error) { console.error('Error fetching pending applications:', error); }
  };

  const confirmClearAll = async () => {
    if (!clearAllModal.status) return;
    try {
      const appsToDelete = pendingApplications.filter(a => a.status === clearAllModal.status);
      if (appsToDelete.length === 0) return;
      const ids = appsToDelete.map(a => a.id);
      const { error } = await supabase.from('connection_applications').delete().in('id', ids);
      if (error) throw error;
      const label = clearAllModal.status === 'denied' ? 'rejected' : clearAllModal.status;
      toast.success(`Cleared ${ids.length} ${label} applications`);
      setClearAllModal({ isOpen: false, status: null });
      fetchPendingApplications();
    } catch { toast.error('Failed to clear applications'); }
  };

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('connections').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setConnections(data || []);
    } catch (error) { toast.error('Failed to load connections'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error('You must be logged in'); return; }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || profile.role !== 'admin') { toast.error('No permission'); return; }
    try {
      const connectionData = {
        name: formData.name, age: parseInt(formData.age), gender: formData.gender,
        location: { name: formData.location_name, latitude: parseFloat(formData.latitude) || 0, longitude: parseFloat(formData.longitude) || 0 },
        bio: formData.bio, photos: formData.photos, whatsapp_number: formData.whatsapp_number,
        whatsapp_message: formData.whatsapp_message, is_active: formData.is_active,
      };
      if (editingConnection) {
        const { error } = await supabase.from('connections').update(connectionData).eq('id', editingConnection.id);
        if (error) throw error;
        toast.success('Connection updated');
      } else {
        const { error } = await supabase.from('connections').insert([connectionData]);
        if (error) throw error;
        toast.success('Connection created');
      }
      resetForm(); fetchConnections();
    } catch { toast.error('Failed to save connection'); }
  };

  const resetForm = () => {
    setFormData({ name: '', age: '', gender: 'female', location_name: '', latitude: '', longitude: '', bio: '', photos: [], whatsapp_number: '', whatsapp_message: '', is_active: true });
    setShowForm(false); setEditingConnection(null);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return; }
    if (!file.type.startsWith('image/')) { toast.error('Images only'); return; }
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `connections/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      if (data?.publicUrl) {
        const newPhotos = [...formData.photos]; newPhotos[index] = data.publicUrl;
        setFormData({ ...formData, photos: newPhotos });
        toast.success('Photo uploaded');
      }
    } catch { toast.error('Upload failed'); }
  };

  const removePhoto = (index: number) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    setFormData({ ...formData, photos: newPhotos });
  };

  const handleEdit = (connection: Connection) => {
    setEditingConnection(connection);
    setFormData({
      name: connection.name, age: String(connection.age), gender: connection.gender,
      location_name: connection.location?.name || '', latitude: String(connection.location?.latitude || ''),
      longitude: String(connection.location?.longitude || ''), bio: connection.bio || '',
      photos: connection.photos || [], whatsapp_number: connection.whatsapp_number || '',
      whatsapp_message: connection.whatsapp_message || '', is_active: connection.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = (connection: Connection) => { setDeleteModal({ isOpen: true, connection }); };

  const confirmDelete = async () => {
    if (!deleteModal.connection) return;
    try {
      const { error } = await supabase.from('connections').delete().eq('id', deleteModal.connection.id);
      if (error) throw error;
      toast.success('Connection deleted');
      setDeleteModal({ isOpen: false, connection: null });
      fetchConnections();
    } catch { toast.error('Failed to delete'); }
  };

  const handleApproveApplication = async (app: ConnectionApplication) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await connectionApplicationService.approveApplication(app.id, user.id);
      toast.success(`${app.name}'s application approved!`);
      fetchPendingApplications(); fetchConnections();
    } catch { toast.error('Failed to approve'); }
  };

  const handleDenyApplication = async () => {
    if (!denyModal.application) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await connectionApplicationService.denyApplication(denyModal.application.id, user.id, denyReason);
      toast.success(`${denyModal.application.name}'s application denied`);
      setDenyModal({ isOpen: false, application: null }); setDenyReason('');
      fetchPendingApplications();
    } catch { toast.error('Failed to deny'); }
  };

  const toggleStatus = async (connection: Connection) => {
    try {
      const { error } = await supabase.from('connections').update({ is_active: !connection.is_active }).eq('id', connection.id);
      if (error) throw error;
      toast.success(`Connection ${connection.is_active ? 'deactivated' : 'activated'}`);
      fetchConnections();
    } catch { toast.error('Failed to update'); }
  };

  const filteredConnections = connections.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGender = genderFilter === 'all' || c.gender === genderFilter;
    const matchStatus = statusFilter === 'all' || (statusFilter === 'active' && c.is_active) || (statusFilter === 'inactive' && !c.is_active);
    return matchSearch && matchGender && matchStatus;
  });

  const inputClasses = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all";

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">Connections</h1>
          <p className="text-gray-400 mt-1 text-sm">{connections.length} connections, {pendingApplications.filter(a => a.status === 'pending').length} pending</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium shadow-lg shadow-pink-500/25 transition-all duration-300">
          <Plus size={18} /> Add Connection
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <button onClick={() => setActiveTab('connections')} className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${activeTab === 'connections' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'}`}>
          Connections ({connections.length})
        </button>
        <button onClick={() => setActiveTab('pending')} className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${activeTab === 'pending' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'}`}>
          Pending {pendingApplications.filter(a => a.status === 'pending').length > 0 && (
            <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{pendingApplications.filter(a => a.status === 'pending').length}</span>
          )}
        </button>
        <button onClick={() => setActiveTab('approved')} className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${activeTab === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'}`}>
          Approved {pendingApplications.filter(a => a.status === 'approved').length > 0 && (
            <span className="ml-1.5 bg-emerald-500 text-white text-xs rounded-full px-1.5 py-0.5">{pendingApplications.filter(a => a.status === 'approved').length}</span>
          )}
        </button>
        <button onClick={() => setActiveTab('rejected')} className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${activeTab === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'}`}>
          Rejected {pendingApplications.filter(a => a.status === 'denied').length > 0 && (
            <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{pendingApplications.filter(a => a.status === 'denied').length}</span>
          )}
        </button>
      </div>

      {/* Pending Tab */}
      {activeTab === 'pending' && (
        <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <p className="text-sm text-gray-400">{pendingApplications.filter(a => a.status === 'pending').length} pending applications</p>
            {pendingApplications.filter(a => a.status === 'pending').length > 0 && (
              <button onClick={() => setClearAllModal({ isOpen: true, status: 'pending' })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors">
                <Trash2 size={12} /> Clear All
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-white/10">
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Photo</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Name</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4 hidden md:table-cell">Age</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4 hidden md:table-cell">Gender</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4 hidden lg:table-cell">Bio</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4 hidden lg:table-cell">Location</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Applied</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-white/5">
                {pendingApplications.filter(a => a.status === 'pending').length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">No pending applications</td></tr>
                ) : pendingApplications.filter(a => a.status === 'pending').map(app => (
                  <tr key={app.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex flex-wrap gap-1">
                        {app.photos?.length > 0 ? app.photos.slice(0, 3).map((photo, i) => (
                          <img key={i} src={photo} alt={`${app.name} ${i + 1}`} className="w-8 h-8 rounded object-cover cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setPhotoViewer({ isOpen: true, photos: app.photos, currentIndex: i })} />
                        )) : (
                          <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center"><span className="text-xs text-gray-400">{app.name.charAt(0)}</span></div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-white font-medium">{app.name}</td>
                    <td className="px-6 py-3 text-sm text-gray-300 hidden md:table-cell">{app.age}</td>
                    <td className="px-6 py-3 hidden md:table-cell">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${app.gender === 'male' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-pink-500/10 text-pink-400 border-pink-500/20'}`}>{app.gender}</span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-300 max-w-[200px] truncate hidden lg:table-cell">{app.bio}</td>
                    <td className="px-6 py-3 text-sm text-gray-300 hidden lg:table-cell">{app.location?.name || 'Unknown'}</td>
                    <td className="px-6 py-3 text-sm text-gray-300">{new Date(app.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleApproveApplication(app)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"><Check size={12} /> Approve</button>
                        <button onClick={() => setDenyModal({ isOpen: true, application: app })} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"><X size={12} /> Deny</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Approved Tab */}
      {activeTab === 'approved' && (
        <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <p className="text-sm text-gray-400">{pendingApplications.filter(a => a.status === 'approved').length} approved applications</p>
            {pendingApplications.filter(a => a.status === 'approved').length > 0 && (
              <button onClick={() => setClearAllModal({ isOpen: true, status: 'approved' })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors">
                <Trash2 size={12} /> Clear All
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-white/10">
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Photo</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Name</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4 hidden md:table-cell">Age</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4 hidden md:table-cell">Gender</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4 hidden lg:table-cell">Bio</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4 hidden lg:table-cell">Location</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Approved</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-white/5">
                {pendingApplications.filter(a => a.status === 'approved').length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">No approved applications</td></tr>
                ) : pendingApplications.filter(a => a.status === 'approved').map(app => (
                  <tr key={app.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex flex-wrap gap-1">
                        {app.photos?.length > 0 ? app.photos.slice(0, 3).map((photo, i) => (
                          <img key={i} src={photo} alt={`${app.name} ${i + 1}`} className="w-8 h-8 rounded object-cover cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setPhotoViewer({ isOpen: true, photos: app.photos, currentIndex: i })} />
                        )) : (
                          <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center"><span className="text-xs text-gray-400">{app.name.charAt(0)}</span></div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-white font-medium">{app.name}</td>
                    <td className="px-6 py-3 text-sm text-gray-300 hidden md:table-cell">{app.age}</td>
                    <td className="px-6 py-3 hidden md:table-cell">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${app.gender === 'male' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-pink-500/10 text-pink-400 border-pink-500/20'}`}>{app.gender}</span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-300 max-w-[200px] truncate hidden lg:table-cell">{app.bio}</td>
                    <td className="px-6 py-3 text-sm text-gray-300 hidden lg:table-cell">{app.location?.name || 'Unknown'}</td>
                    <td className="px-6 py-3 text-sm text-emerald-400">{app.reviewed_at ? new Date(app.reviewed_at).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Check size={12} /> Approved
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rejected Tab */}
      {activeTab === 'rejected' && (
        <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <p className="text-sm text-gray-400">{pendingApplications.filter(a => a.status === 'denied').length} rejected applications</p>
            {pendingApplications.filter(a => a.status === 'denied').length > 0 && (
              <button onClick={() => setClearAllModal({ isOpen: true, status: 'denied' })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors">
                <Trash2 size={12} /> Clear All
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-white/10">
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Photo</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Name</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4 hidden md:table-cell">Age</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4 hidden md:table-cell">Gender</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4 hidden lg:table-cell">Location</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4 hidden lg:table-cell">Reason</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Rejected</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-white/5">
                {pendingApplications.filter(a => a.status === 'denied').length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">No rejected applications</td></tr>
                ) : pendingApplications.filter(a => a.status === 'denied').map(app => (
                  <tr key={app.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex flex-wrap gap-1">
                        {app.photos?.length > 0 ? app.photos.slice(0, 3).map((photo, i) => (
                          <img key={i} src={photo} alt={`${app.name} ${i + 1}`} className="w-8 h-8 rounded object-cover cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setPhotoViewer({ isOpen: true, photos: app.photos, currentIndex: i })} />
                        )) : (
                          <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center"><span className="text-xs text-gray-400">{app.name.charAt(0)}</span></div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-white font-medium">{app.name}</td>
                    <td className="px-6 py-3 text-sm text-gray-300 hidden md:table-cell">{app.age}</td>
                    <td className="px-6 py-3 hidden md:table-cell">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${app.gender === 'male' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-pink-500/10 text-pink-400 border-pink-500/20'}`}>{app.gender}</span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-300 hidden lg:table-cell">{app.location?.name || 'Unknown'}</td>
                    <td className="px-6 py-3 text-sm text-gray-300 max-w-[200px] truncate hidden lg:table-cell">{app.admin_note || 'No reason'}</td>
                    <td className="px-6 py-3 text-sm text-red-400">{app.reviewed_at ? new Date(app.reviewed_at).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                        <X size={12} /> Rejected
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Connections Tab */}
      {activeTab === 'connections' && <>
        {/* Filters */}
        <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="text" placeholder="Search by name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className={`${inputClasses} pl-9`} />
            </div>
            <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)} className={inputClasses}>
              <option value="all">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={inputClasses}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Connections Table */}
        <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-white/10">
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Photo</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Name</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4 hidden md:table-cell">Age</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4 hidden md:table-cell">Gender</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4 hidden lg:table-cell">Location</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4 hidden lg:table-cell">WhatsApp</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Status</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-white/5">
                {filteredConnections.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500"><Users size={40} className="mx-auto mb-3 text-gray-600" />No connections found</td></tr>
                ) : filteredConnections.map(conn => (
                  <tr key={conn.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex flex-wrap gap-1">
                        {conn.photos?.length > 0 ? conn.photos.slice(0, 3).map((photo, i) => (
                          <img key={i} src={photo} alt={`${conn.name} ${i + 1}`} className="w-8 h-8 rounded object-cover" />
                        )) : (
                          <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center"><span className="text-xs text-gray-400">{conn.name.charAt(0)}</span></div>
                        )}
                        {conn.photos?.length > 3 && (
                          <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center"><span className="text-xs text-gray-400">+{conn.photos.length - 3}</span></div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-white font-medium">{conn.name}</td>
                    <td className="px-6 py-3 text-sm text-gray-300 hidden md:table-cell">{conn.age}</td>
                    <td className="px-6 py-3 hidden md:table-cell">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${conn.gender === 'male' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-pink-500/10 text-pink-400 border-pink-500/20'}`}>{conn.gender}</span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-300 hidden lg:table-cell">{conn.location?.name}</td>
                    <td className="px-6 py-3 text-sm text-gray-300 hidden lg:table-cell">{conn.whatsapp_number}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${conn.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>{conn.is_active ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => toggleStatus(conn)} className="px-2.5 py-1 rounded-lg text-xs bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 transition-colors">
                          {conn.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => handleEdit(conn)} className="px-2.5 py-1 rounded-lg text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors">Edit</button>
                        <button onClick={() => handleDelete(conn)} className="px-2.5 py-1 rounded-lg text-xs bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/70 backdrop-blur-sm">
          <div className="flex min-h-full items-start justify-center p-3 sm:p-4 md:items-center md:p-6">
            <div className="w-full max-w-4xl bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
              <form onSubmit={handleSubmit} className="flex max-h-[calc(100vh-2rem)] flex-col sm:max-h-[90vh]">
                <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-4 sm:px-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">{editingConnection ? 'Edit Connection' : 'Add New Connection'}</h3>
                    <p className="mt-1 text-sm text-gray-400">Manage profile details, photos, and WhatsApp settings</p>
                  </div>
                  <button type="button" onClick={resetForm} className="p-2 rounded-lg hover:bg-white/10 text-gray-400"><X size={18} /></button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 space-y-6">
                  {/* Basic Details */}
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-300">Basic Details</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <label className="space-y-2"><span className="block text-sm text-gray-400">Name</span>
                        <input placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className={inputClasses} />
                      </label>
                      <label className="space-y-2"><span className="block text-sm text-gray-400">Age</span>
                        <input placeholder="Age" type="number" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} required className={inputClasses} />
                      </label>
                      <label className="space-y-2"><span className="block text-sm text-gray-400">Gender</span>
                        <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })} className={inputClasses}>
                          <option value="female">Female</option>
                          <option value="male">Male</option>
                        </select>
                      </label>
                      <label className="space-y-2"><span className="block text-sm text-gray-400">Location</span>
                        <input placeholder="Location Name" value={formData.location_name} onChange={e => setFormData({ ...formData, location_name: e.target.value })} required className={inputClasses} />
                      </label>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-300">Profile</h3>
                    <label className="space-y-2"><span className="block text-sm text-gray-400">Bio</span>
                      <textarea placeholder="Bio" value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} className={`${inputClasses} h-28 resize-none`} required />
                    </label>
                  </div>

                  {/* Photos */}
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div><h3 className="text-sm font-semibold uppercase tracking-wide text-gray-300">Profile Photos</h3><p className="mt-1 text-xs text-gray-500">Up to 10 photos</p></div>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-300">{formData.photos.length}/10</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {formData.photos.map((photo, i) => (
                        <div key={i} className="relative group">
                          <div className="aspect-square cursor-pointer rounded-lg border-2 border-dashed border-white/20 bg-white/5 flex items-center justify-center hover:border-pink-500/50 transition-all" onClick={() => document.getElementById(`photo-${i}`)?.click()}>
                            <img src={photo} alt={`Photo ${i + 1}`} className="h-full w-full rounded-lg object-cover" />
                          </div>
                          <input id={`photo-${i}`} type="file" accept="image/*" className="hidden" onChange={e => handlePhotoUpload(e, i)} />
                          <button type="button" className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removePhoto(i)}><Trash2 className="w-3 h-3" /></button>
                        </div>
                      ))}
                      {formData.photos.length < 10 && (
                        <div className="aspect-square cursor-pointer rounded-lg border-2 border-dashed border-white/20 bg-white/5 flex items-center justify-center hover:border-pink-500/50 transition-all" onClick={() => document.getElementById(`photo-${formData.photos.length}`)?.click()}>
                          <div className="text-center text-gray-400"><Upload className="mx-auto mb-1 h-5 w-5" /><p className="text-xs">Add photo</p></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-300">WhatsApp</h3>
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                      <label className="space-y-2"><span className="block text-sm text-gray-400">WhatsApp Number</span>
                        <input placeholder="+260968708647" value={formData.whatsapp_number} onChange={e => setFormData({ ...formData, whatsapp_number: e.target.value })} required className={inputClasses} />
                      </label>
                      <label className="space-y-2 xl:col-span-2"><span className="block text-sm text-gray-400">Message Template</span>
                        <textarea placeholder="WhatsApp Message (use {{name}})" value={formData.whatsapp_message} onChange={e => setFormData({ ...formData, whatsapp_message: e.target.value })} className={`${inputClasses} h-28 resize-none`} />
                      </label>
                    </div>
                    <div className="mt-4">
                      <label className="mb-2 block text-sm text-gray-400">Suggestions</label>
                      <select value={whatsappTemplates.includes(formData.whatsapp_message) ? formData.whatsapp_message : ''} onChange={e => { if (e.target.value) setFormData({ ...formData, whatsapp_message: e.target.value }); }} className={inputClasses}>
                        <option value="">Pick a template</option>
                        {whatsappTemplates.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Active Status */}
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <label htmlFor="is_active" className="flex cursor-pointer items-center gap-3">
                      <input type="checkbox" id="is_active" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="h-4 w-4 rounded border-white/20 bg-white/5 text-pink-500 focus:ring-pink-500/50" />
                      <div><p className="font-medium text-white">Active Status</p><p className="text-xs text-gray-400">Control whether this connection is visible</p></div>
                    </label>
                  </div>
                </div>

                <div className="border-t border-white/10 px-4 py-4 sm:px-6 flex gap-3">
                  <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium hover:from-pink-600 hover:to-purple-700 shadow-lg shadow-pink-500/25 transition-all">{editingConnection ? 'Update' : 'Create'}</button>
                  <button type="button" onClick={resetForm} className="px-4 py-2.5 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 transition-colors">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Deny Modal */}
      {denyModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/10 p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Deny Application</h3>
            <p className="text-gray-300 mb-4">Deny {denyModal.application?.name}'s application?</p>
            <label className="space-y-2 mb-4 block">
              <span className="text-sm text-gray-400">Reason (optional)</span>
              <textarea value={denyReason} onChange={e => setDenyReason(e.target.value)} placeholder="Enter reason..." className={`${inputClasses} h-24 resize-none`} />
            </label>
            <div className="flex gap-3">
              <button onClick={handleDenyApplication} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors font-medium">Deny</button>
              <button onClick={() => { setDenyModal({ isOpen: false, application: null }); setDenyReason(''); }} className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ isOpen: false, connection: null })} onConfirm={confirmDelete} title="Delete Connection" message={`Delete ${deleteModal.connection?.name}? This cannot be undone.`} confirmText="Delete" type="danger" />

      {/* Clear All Confirmation Modal */}
      {clearAllModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/10 p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                <Trash2 size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Clear All {clearAllModal.status === 'denied' ? 'Rejected' : clearAllModal.status?.charAt(0).toUpperCase() + clearAllModal.status?.slice(1)}</h3>
                <p className="text-sm text-gray-400">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-6">
              Are you sure you want to clear all {clearAllModal.status === 'denied' ? 'rejected' : clearAllModal.status} applications? {pendingApplications.filter(a => a.status === clearAllModal.status).length} applications will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button onClick={confirmClearAll} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors font-medium">
                Clear All
              </button>
              <button onClick={() => setClearAllModal({ isOpen: false, status: null })} className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Viewer */}
      {photoViewer.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={() => setPhotoViewer({ isOpen: false, photos: [], currentIndex: 0 })}>
          <div className="relative max-w-2xl max-h-[80vh]">
            <img src={photoViewer.photos[photoViewer.currentIndex]} alt="Preview" className="max-h-[80vh] rounded-xl object-contain" />
            {photoViewer.photos.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {photoViewer.photos.map((_, i) => (
                  <button key={i} onClick={e => { e.stopPropagation(); setPhotoViewer({ ...photoViewer, currentIndex: i }); }}
                    className={`w-2 h-2 rounded-full ${i === photoViewer.currentIndex ? 'bg-pink-500' : 'bg-white/30'}`} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminConnectionsPage;
