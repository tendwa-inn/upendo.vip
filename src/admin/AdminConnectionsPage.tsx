import React, { useState, useEffect } from 'react';
import { Card, Title, TextInput, Button, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Badge, Select, SelectItem } from '@tremor/react';
import { Plus, Upload, Trash2, Edit, Eye } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/modals/ConfirmationModal';

interface Connection {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  bio: string;
  photos: string[];
  whatsapp_number: string;
  whatsapp_message: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AdminConnectionsPage: React.FC = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; connection: Connection | null }>({ isOpen: false, connection: null });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'female' as 'male' | 'female',
    location_name: '',
    latitude: '',
    longitude: '',
    bio: '',
    photos: [] as string[],
    whatsapp_number: '',
    whatsapp_message: '',
    is_active: true,
  });

  const whatsappTemplates = [
    'Hey, I would love to connect with {{name}}',
    'Hi {{name}}, I found you on Upendo and would like to connect!',
    'Hello {{name}}, can we connect on WhatsApp?',
  ];

  useEffect(() => {
    fetchConnections();
    checkBucketPermissions(); // Check bucket permissions on load
  }, []);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConnections(data || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const connectionData = {
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        location: {
          name: formData.location_name,
          latitude: parseFloat(formData.latitude) || 0,
          longitude: parseFloat(formData.longitude) || 0,
        },
        bio: formData.bio,
        photos: formData.photos,
        whatsapp_number: formData.whatsapp_number,
        whatsapp_message: formData.whatsapp_message,
        is_active: formData.is_active,
      };

      if (editingConnection) {
        // Update existing connection
        const { error } = await supabase
          .from('connections')
          .update(connectionData)
          .eq('id', editingConnection.id);

        if (error) throw error;
        toast.success('Connection updated successfully');
      } else {
        // Create new connection
        const { error } = await supabase
          .from('connections')
          .insert([connectionData]);

        if (error) throw error;
        toast.success('Connection created successfully');
      }

      resetForm();
      fetchConnections();
    } catch (error) {
      console.error('Error saving connection:', error);
      toast.error('Failed to save connection');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      age: '',
      gender: 'female',
      location_name: '',
      latitude: '',
      longitude: '',
      bio: '',
      photos: [],
      whatsapp_number: '',
      whatsapp_message: '',
      is_active: true,
    });
    setShowForm(false);
    setEditingConnection(null);
  };

  // Function to check bucket permissions and create if needed
  const checkBucketPermissions = async () => {
    try {
      // First try to list existing buckets
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error('Error listing buckets:', error);
        // If we get an authorization error, we'll need to handle it differently
        if (error.message?.includes('authorization') || error.message?.includes('RLS')) {
          console.log('Authorization error detected - will use fallback approach');
          // Return a default bucket name to try
          return 'avatars';
        }
        return null;
      }
      
      console.log('Available buckets:', buckets);
      console.log('Available bucket names:', buckets.map(b => b.id));
      
      // Try to find avatars bucket first
      let targetBucket = buckets.find(b => b.id === 'avatars');
      
      // If avatars doesn't exist, try other common bucket names
      if (!targetBucket) {
        console.log('Avatars bucket not found, trying alternative bucket names...');
        const alternativeBuckets = ['profiles', 'avatars', 'uploads', 'media'];
        
        for (const bucketName of alternativeBuckets) {
          const foundBucket = buckets.find(b => b.id === bucketName);
          if (foundBucket) {
            console.log(`Found alternative bucket: ${bucketName}`, foundBucket);
            targetBucket = foundBucket;
            break;
          }
        }
      }
      
      if (targetBucket) {
        console.log('Using bucket:', targetBucket.id);
        console.log('Bucket details:', targetBucket);
        return targetBucket.id;
      } else {
        console.log('No suitable bucket found, will use default avatars');
        return 'avatars'; // Return default bucket name
      }
    } catch (error) {
      console.error('Error checking bucket permissions:', error);
      console.log('Using fallback bucket name: avatars');
        return 'avatars'; // Return default bucket name as fallback
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    try {
      // Try direct upload first - if bucket doesn't exist, we'll handle the error
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `connections/${fileName}`;
      
      console.log('Attempting direct upload to avatars bucket...');
      console.log('File details:', { name: file.name, size: file.size, type: file.type });

      // Upload to Supabase Storage - try avatars bucket directly
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Direct upload error:', uploadError);
        
        // If bucket not found, try alternative approach
        if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('bucket')) {
          console.log('Bucket not found, trying alternative bucket...');
          
          // Try with a different bucket name that might exist
          const alternativeBuckets = ['avatars', 'profiles', 'uploads', 'media'];
          let uploaded = false;
          
          for (const bucketName of alternativeBuckets) {
            try {
              console.log(`Trying bucket: ${bucketName}`);
              const { error: altError } = await supabase.storage
                .from(bucketName)
                .upload(filePath, file);
              
              if (!altError) {
                console.log(`Successfully uploaded to ${bucketName}`);
                uploaded = true;
                
                // Get public URL
                const { data } = supabase.storage
                  .from(bucketName)
                  .getPublicUrl(filePath);
                
                if (data?.publicUrl) {
                  const newPhotos = [...formData.photos];
                  newPhotos[index] = data.publicUrl;
                  setFormData({ ...formData, photos: newPhotos });
                  toast.success('Photo uploaded successfully');
                  return;
                }
                break;
              }
            } catch (bucketError) {
              console.error(`Failed with ${bucketName}:`, bucketError);
              continue;
            }
          }
          
          if (!uploaded) {
            toast.error('Could not upload photo - no suitable storage bucket found. Please create the avatars bucket.');
            return;
          }
        } else {
          // Other upload error
          throw uploadError;
        }
      } else {
        // Success with avatars bucket
        console.log('Successfully uploaded to avatars bucket');
        
        // Get public URL
        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        console.log('Public URL data:', data);

        if (!data?.publicUrl) {
          throw new Error('Failed to get public URL');
        }

        // Update form data
        const newPhotos = [...formData.photos];
        newPhotos[index] = data.publicUrl;
        setFormData({ ...formData, photos: newPhotos });

        toast.success('Photo uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload photo';
      toast.error(`Photo upload failed: ${errorMessage}`);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...formData.photos];
    newPhotos.splice(index, 1);
    setFormData({ ...formData, photos: newPhotos });
  };

  const handleEdit = (connection: Connection) => {
    setEditingConnection(connection);
    setFormData({
      name: connection.name,
      age: connection.age.toString(),
      gender: connection.gender,
      location_name: connection.location.name,
      latitude: connection.location.latitude.toString(),
      longitude: connection.location.longitude.toString(),
      bio: connection.bio,
      photos: connection.photos,
      whatsapp_number: connection.whatsapp_number,
      whatsapp_message: connection.whatsapp_message,
      is_active: connection.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (connection: Connection) => {
    setDeleteModal({ isOpen: true, connection });
  };

  const confirmDelete = async () => {
    if (!deleteModal.connection) return;
    
    try {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', deleteModal.connection.id);

      if (error) throw error;
      toast.success('Connection deleted successfully');
      fetchConnections();
    } catch (error) {
      console.error('Error deleting connection:', error);
      toast.error('Failed to delete connection');
    } finally {
      setDeleteModal({ isOpen: false, connection: null });
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, connection: null });
  };

  const toggleStatus = async (connection: Connection) => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ is_active: !connection.is_active })
        .eq('id', connection.id);

      if (error) throw error;
      toast.success(`Connection ${connection.is_active ? 'deactivated' : 'activated'} successfully`);
      fetchConnections();
    } catch (error) {
      console.error('Error toggling connection status:', error);
      toast.error('Failed to update connection status');
    }
  };

  const filteredConnections = connections.filter(connection => {
    const matchesSearch = connection.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = genderFilter === 'all' || connection.gender === genderFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && connection.is_active) ||
      (statusFilter === 'inactive' && !connection.is_active);
    
    return matchesSearch && matchesGender && matchesStatus;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title>Connections Management</Title>
        <Button 
          icon={Plus} 
          onClick={() => setShowForm(true)}
          className="bg-pink-500 hover:bg-pink-600"
        >
          Add Connection
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <TextInput
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
            <SelectItem value="all">All Genders</SelectItem>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </Select>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </Select>
        </div>
      </Card>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/80 backdrop-blur-sm">
          <div className="flex min-h-full items-start justify-center p-3 sm:p-4 md:items-center md:p-6">
            <Card className="w-full max-w-4xl bg-[#1a0f14] border-pink-500/30 shadow-2xl shadow-black/40">
              <form onSubmit={handleSubmit} className="flex max-h-[calc(100vh-2rem)] flex-col sm:max-h-[90vh]">
                <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-[#1a0f14] px-4 py-4 sm:px-6">
                  <div>
                    <Title className="text-white">{editingConnection ? 'Edit Connection' : 'Add New Connection'}</Title>
                    <p className="mt-1 text-sm text-gray-400">Manage profile details, photos, and WhatsApp outreach settings.</p>
                  </div>
                  <Button type="button" variant="light" color="gray" onClick={resetForm}>Close</Button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
                  <div className="space-y-6">
                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/80">Basic Details</h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <label className="space-y-2">
                          <span className="block text-sm text-white/80">Name</span>
                          <TextInput
                            placeholder="Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="bg-black/50 text-white border-white/10"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="block text-sm text-white/80">Age</span>
                          <TextInput
                            placeholder="Age"
                            type="number"
                            value={formData.age}
                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                            required
                            className="bg-black/50 text-white border-white/10"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="block text-sm text-white/80">Gender</span>
                          <select
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
                            className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-white transition-all focus:border-pink-500/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                          >
                            <option value="female">Female</option>
                            <option value="male">Male</option>
                          </select>
                        </label>
                        <label className="space-y-2">
                          <span className="block text-sm text-white/80">Location Name</span>
                          <TextInput
                            placeholder="Location Name"
                            value={formData.location_name}
                            onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                            required
                            className="bg-black/50 text-white border-white/10"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/80">Profile</h3>
                      <label className="space-y-2">
                        <span className="block text-sm text-white/80">Bio</span>
                        <textarea
                          placeholder="Bio"
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          className="h-28 w-full rounded-lg border border-white/10 bg-black/50 p-3 text-white transition-all resize-none placeholder:text-gray-500 focus:border-pink-500/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                          required
                        />
                      </label>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/80">Profile Photos</h3>
                          <p className="mt-1 text-xs text-gray-400">Upload up to 10 photos. Only one add tile stays visible to keep the dialog compact.</p>
                        </div>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">{formData.photos.length}/10</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {formData.photos.map((photo, index) => (
                          <div key={index} className="relative group">
                            <div
                              className="aspect-square cursor-pointer rounded-lg border-2 border-dashed border-white/20 bg-black/30 flex items-center justify-center transition-all hover:border-pink-500/50"
                              onClick={() => document.getElementById(`photo-${index}`)?.click()}
                            >
                              <img
                                src={photo}
                                alt={`Photo ${index + 1}`}
                                className="h-full w-full rounded-lg object-cover"
                              />
                            </div>
                            <input
                              id={`photo-${index}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handlePhotoUpload(e, index)}
                            />
                            <button
                              type="button"
                              className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                              onClick={() => removePhoto(index)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {formData.photos.length < 10 && (
                          <div className="relative group">
                            <div
                              className="aspect-square cursor-pointer rounded-lg border-2 border-dashed border-white/20 bg-black/30 flex items-center justify-center transition-all hover:border-pink-500/50"
                              onClick={() => document.getElementById(`photo-${formData.photos.length}`)?.click()}
                            >
                              <div className="text-center text-gray-400">
                                <Upload className="mx-auto mb-1 h-5 w-5" />
                                <p className="text-xs">Add photo</p>
                              </div>
                            </div>
                            <input
                              id={`photo-${formData.photos.length}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handlePhotoUpload(e, formData.photos.length)}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/80">WhatsApp</h3>
                      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                        <label className="space-y-2 xl:col-span-1">
                          <span className="block text-sm text-white/80">WhatsApp Number</span>
                          <TextInput
                            placeholder="+260968708647"
                            value={formData.whatsapp_number}
                            onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                            required
                            className="bg-black/50 text-white border-white/10"
                          />
                        </label>
                        <label className="space-y-2 xl:col-span-2">
                          <span className="block text-sm text-white/80">Message Template</span>
                          <textarea
                            placeholder="WhatsApp Message Template (use {{name}})"
                            value={formData.whatsapp_message}
                            onChange={(e) => setFormData({ ...formData, whatsapp_message: e.target.value })}
                            className="h-28 w-full rounded-lg border border-white/10 bg-black/50 p-3 text-white transition-all resize-none placeholder:text-gray-500 focus:border-pink-500/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                          />
                          <p className="text-xs text-gray-400">Tip: use {'{{name}}'} to insert the person’s name automatically.</p>
                        </label>
                      </div>
                      <div className="mt-4">
                        <label className="mb-2 block text-sm text-white/80">Suggestions</label>
                        <select
                          value={whatsappTemplates.includes(formData.whatsapp_message) ? formData.whatsapp_message : ''}
                          onChange={(e) => {
                            if (!e.target.value) return;
                            setFormData({ ...formData, whatsapp_message: e.target.value });
                          }}
                          className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-white transition-all focus:border-pink-500/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                        >
                          <option value="">Pick a template</option>
                          {whatsappTemplates.map((template) => (
                            <option key={template} value={template}>
                              {template}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <label htmlFor="is_active" className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          id="is_active"
                          checked={formData.is_active}
                          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                          className="h-4 w-4 rounded border-white/20 bg-black/50 text-pink-500 focus:ring-pink-500/50"
                        />
                        <div>
                          <p className="font-medium text-white">Active Status</p>
                          <p className="text-xs text-gray-400">Control whether this connection is visible as active.</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 bg-[#1a0f14] px-4 py-4 sm:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      type="submit"
                      className="flex-1 bg-pink-500 hover:bg-pink-600 text-white border-none shadow-lg shadow-pink-500/20"
                    >
                      {editingConnection ? 'Update' : 'Create'}
                    </Button>
                    <Button
                      type="button"
                      variant="light"
                      color="gray"
                      className="flex-1 hover:bg-white/10"
                      onClick={resetForm}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="light"
                      color="blue"
                      className="sm:w-auto"
                      onClick={checkBucketPermissions}
                    >
                      Debug: Check Bucket Permissions
                    </Button>
                  </div>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}

      {/* Connections Table */}
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Photo</TableHeaderCell>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Age</TableHeaderCell>
              <TableHeaderCell>Gender</TableHeaderCell>
              <TableHeaderCell>Location</TableHeaderCell>
              <TableHeaderCell>WhatsApp</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredConnections.map((connection) => (
              <TableRow key={connection.id}>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {connection.photos?.length > 0 ? (
                      connection.photos.slice(0, 3).map((photo, index) => (
                        <img 
                          key={index}
                          src={photo} 
                          alt={`${connection.name} - Photo ${index + 1}`}
                          className="w-8 h-8 rounded object-cover"
                        />
                      ))
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-xs text-gray-500">{connection.name.charAt(0)}</span>
                      </div>
                    )}
                    {connection.photos?.length > 3 && (
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-xs text-gray-600">+{connection.photos.length - 3}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{connection.name}</TableCell>
                <TableCell>{connection.age}</TableCell>
                <TableCell>
                  <Badge color={connection.gender === 'male' ? 'blue' : 'pink'}>
                    {connection.gender}
                  </Badge>
                </TableCell>
                <TableCell>{connection.location.name}</TableCell>
                <TableCell>{connection.whatsapp_number}</TableCell>
                <TableCell>
                  <Badge color={connection.is_active ? 'green' : 'gray'}>
                    {connection.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="xs"
                      variant="light"
                      icon={Eye}
                      onClick={() => toggleStatus(connection)}
                    >
                      {connection.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      size="xs"
                      variant="light"
                      icon={Edit}
                      onClick={() => handleEdit(connection)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="xs"
                      variant="light"
                      color="red"
                      icon={Trash2}
                      onClick={() => handleDelete(connection)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredConnections.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No connections found matching your filters.
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Connection"
        message={`Are you sure you want to delete ${deleteModal.connection?.name}? This action cannot be undone and will permanently remove this connection from the database.`}
        confirmText="Delete Connection"
        type="danger"
      />
    </div>
  );
};

export default AdminConnectionsPage;
