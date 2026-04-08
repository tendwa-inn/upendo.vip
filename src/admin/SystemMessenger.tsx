import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Title,
  Button,
  TextInput,
  Textarea,
  MultiSelect,
  MultiSelectItem,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from '@tremor/react';
import { Send, Paperclip, Image as ImageIcon, Upload, CheckCircle } from 'lucide-react';
import { systemMessengerService, SystemMessage } from '../services/systemMessengerService';
import { systemProfileService } from '../services/systemProfileService';
import { profileService } from '../services/profileService';
import { fileUploadService } from '../services/fileUploadService';
import { notificationService } from '../services/notificationService';
import toast from 'react-hot-toast';



interface SystemProfile {
  name: string;
  photo_url: string;
}

interface UserProfile {
  id: string;
  name: string;
  dob: string;
  photos: string[];
}

const SystemMessenger: React.FC = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [messageTypes, setMessageTypes] = useState<string[]>([]);
  const [target, setTarget] = useState('all');
  const [attachedPhoto, setAttachedPhoto] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<SystemMessage[]>([]);
  const [systemProfile, setSystemProfile] = useState<SystemProfile | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchHistory();
    fetchSystemProfile();
  }, []);

  useEffect(() => {
    if (userSearch.startsWith('@')) {
      const searchTerm = userSearch.substring(1);
      if (searchTerm.length > 0) {
        profileService.searchProfiles(searchTerm).then(setSearchResults);
      } else {
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
    setTarget(userSearch);
  }, [userSearch]);

  const fetchHistory = async () => {
    try {
      const messageHistory = await systemMessengerService.getSystemMessages();
      setHistory(messageHistory || []);
    } catch (error) {
      toast.error('Failed to load message history.');
    }
  };

  const handleDeleteAll = async () => {
    try {
      await systemMessengerService.deleteAllSystemMessages();
      toast.success('All system messages deleted successfully!');
      fetchHistory(); // Refresh the history
    } catch (error) {
      toast.error('Failed to delete system messages.');
    }
  };

  const fetchSystemProfile = async () => {
    try {
      const profile = await systemProfileService.getProfile();
      setSystemProfile(profile);
    } catch (error) {
      toast.error('Failed to load system profile.');
    }
  };

  const handlePhotoAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedPhoto(e.target.files[0]);
    }
  };

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsLoading(true);
      try {
        const photo_url = await fileUploadService.upload(file, 'avatars');
        await systemProfileService.updateProfile({ photo_url });
        fetchSystemProfile();
        toast.success('Profile picture updated!');
      } catch (error) {
        toast.error('Failed to update profile picture.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Please provide a title and message.');
      return;
    }
    if (messageTypes.length === 0) {
      toast.error('Please select at least one message type.');
      return;
    }

    setIsLoading(true);
    let photoUrl: string | undefined = undefined;

    try {
      if (attachedPhoto) {
        photoUrl = await fileUploadService.upload(attachedPhoto, 'avatars');
      }

            if (target.startsWith('@')) {
        toast.error("Please select a user from the list, or clear the target field to send to all users.");
        setIsLoading(false);
        return;
      }
      const finalTarget = (target.trim() === '') ? 'all' : target;

      await systemMessengerService.sendSystemMessage({
        title,
        message,
        type: messageTypes.join(', '),
        target: finalTarget,
        photo_url: photoUrl,
      });

      if (messageTypes.includes('notification')) {
        if (finalTarget === 'all') {
        } else {
          await notificationService.sendSystemMessage(finalTarget, title, message, photoUrl);
        }
      }

      toast.success('System message sent successfully!');
      // Reset form
      setTitle('');
      setMessage('');
      setTarget('all');
      setUserSearch('all');
      setAttachedPhoto(null);
      fetchHistory();
    } catch (error) {
      toast.error('Failed to send message.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="text-black">
            <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-200">System Messenger</h1>
        <Button onClick={handleSend} icon={Send} loading={isLoading} disabled={isLoading} className="text-white">
            Send Message
        </Button>
      </div>

      <Card className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            <img
              src={systemProfile?.photo_url || '/logo-splash.png'}
              alt="Upendo System"
              className="w-16 h-16 rounded-full border-2 border-pink-500 object-cover cursor-pointer"
              onClick={() => profilePhotoInputRef.current?.click()}
              onError={(e) => { e.currentTarget.src = '/logo-splash.png'; }}
            />
            <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 border-2 border-pink-500">
                <Upload size={16} className="text-pink-500" />
            </div>
            <input
              type="file"
              ref={profilePhotoInputRef}
              className="hidden"
              onChange={handleProfilePhotoUpload}
              accept="image/*"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <Title className="text-gray-200">{systemProfile?.name || 'Upendo'}</Title>
              <CheckCircle size={20} className="text-blue-500" />
            </div>
            <p className="text-sm text-gray-400">System Account</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-2">Title</label>
            <TextInput
              id="title"
              value={title}
              onValueChange={setTitle}
              placeholder="e.g. Scheduled Maintenance"
              style={{ backgroundColor: 'white', color: 'black' }}
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-2">Message</label>
            <Textarea
              id="message"
              value={message}
              onValueChange={setMessage}
              placeholder="Type your system-wide message here..."
              rows={6}
              style={{ backgroundColor: 'white', color: 'black' }}
            />
          </div>
          <div>
            <label htmlFor="photo-upload" className="cursor-pointer text-gray-400 hover:text-pink-500">
              <Paperclip className="inline-block" />
              <span className="ml-2">{attachedPhoto ? attachedPhoto.name : 'Attach Image'}</span>
              <input id="photo-upload" type="file" className="hidden" onChange={handlePhotoAttachment} accept="image/*" />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-400 mb-2">Message Type</label>
              <MultiSelect id="type" value={messageTypes} onValueChange={setMessageTypes} className="text-white bg-black">
                <MultiSelectItem value="notification">Notification</MultiSelectItem>
                <MultiSelectItem value="story">Story</MultiSelectItem>
                <MultiSelectItem value="message">Message</MultiSelectItem>
              </MultiSelect>
            </div>
            <div className="relative">
              <label htmlFor="target" className="block text-sm font-medium text-gray-400 mb-2">Target</label>
              <TextInput
                id="target"
                value={userSearch}
                onValueChange={setUserSearch}
                placeholder="'all' or @username to search"
                style={{ backgroundColor: 'white', color: 'black' }}
              />
              {searchResults.length > 0 && (
                <Card className="absolute z-10 mt-1 w-full">
                  <ul>
                    {searchResults.map(user => (
                      <li
                        key={user.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-3"
                        onClick={() => {
                          setUserSearch(`@${user.name}`);
                          setTarget(user.id);
                          setSearchResults([]);
                        }}
                      >
                        <img src={user.photos[0] || '/upendo-logo.png'} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <p className="font-bold">{user.name}</p>
                          <p className="text-sm text-gray-500">{calculateAge(user.dob)} years old</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>
          </div>


        </div>
      </Card>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <Title className="text-white">Message History</Title>
          <Button 
            onClick={async () => {
              if (window.confirm('Are you sure you want to delete all system messages? This action cannot be undone.')) {
                await handleDeleteAll();
              }
            }} 
            color="rose"
            size="sm"
          >
            Delete All
          </Button>
        </div>
        <Table className="mt-6">
          <TableHead>
            <TableRow>
              <TableHeaderCell className="text-white">Date</TableHeaderCell>
              <TableHeaderCell className="text-white">Title</TableHeaderCell>
              <TableHeaderCell className="text-white">Message</TableHeaderCell>
              <TableHeaderCell className="text-white">Type</TableHeaderCell>
              <TableHeaderCell className="text-white">Target</TableHeaderCell>
              <TableHeaderCell className="text-white">Attachment</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="text-white">{new Date(item.created_at).toLocaleString()}</TableCell>
                <TableCell className="text-white">{item.title}</TableCell>
                <TableCell className="text-white">{item.message}</TableCell>
                <TableCell className="text-white">{item.type}</TableCell>
                <TableCell className="text-white">{item.target}</TableCell>
                <TableCell className="text-white">
                  {item.photo_url && (
                    <a href={item.photo_url} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:underline">
                      <ImageIcon />
                    </a>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default SystemMessenger;
