import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Image as ImageIcon, Upload, CheckCircle, Bold, Italic, Underline, Strikethrough, List, ListOrdered, Quote, Link as LinkIcon, ExternalLink, MessageSquare, Trash2 } from 'lucide-react';
import { systemMessengerService, SystemMessage } from '../services/systemMessengerService';
import { systemProfileService } from '../services/systemProfileService';
import { profileService } from '../services/profileService';
import { fileUploadService } from '../services/fileUploadService';
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
  const [welcomeMessageMode, setWelcomeMessageMode] = useState(false);
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const [showButtonModal, setShowButtonModal] = useState(false);
  const [buttonUrl, setButtonUrl] = useState('');
  const [buttonName, setButtonName] = useState('');
  const [buttonColor, setButtonColor] = useState('#ec4899');

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
      fetchHistory();
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

  const wrapWithTag = (tag: string) => {
    const textarea = messageRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = message.substring(start, end);
    let newText: string;
    let newCursorPos: number;
    if (selected) {
      newText = message.substring(0, start) + `<${tag}>${selected}</${tag}>` + message.substring(end);
      newCursorPos = end + tag.length * 2 + 5;
    } else {
      newText = message.substring(0, start) + `<${tag}></${tag}>` + message.substring(end);
      newCursorPos = start + tag.length + 2;
    }
    setMessage(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertBlock = (html: string, cursorOffset: number) => {
    const textarea = messageRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const newText = message.substring(0, start) + html + message.substring(start);
    setMessage(newText);
    setTimeout(() => {
      textarea.focus();
      const pos = start + cursorOffset;
      textarea.setSelectionRange(pos, pos);
    }, 0);
  };

  const insertButton = () => {
    if (!buttonUrl || !buttonName) return;
    const btnHtml = `<a href="${buttonUrl}" style="display:inline-block;padding:10px 24px;background:${buttonColor};color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;margin:8px 0;">${buttonName}</a>`;
    const textarea = messageRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const newText = message.substring(0, start) + btnHtml + message.substring(start);
    setMessage(newText);
    setShowButtonModal(false);
    setButtonUrl('');
    setButtonName('');
    setButtonColor('#ec4899');
    setTimeout(() => textarea.focus(), 0);
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
        welcome_message_mode: welcomeMessageMode,
      });
      toast.success('System message sent successfully!');
      setTitle('');
      setMessage('');
      setTarget('all');
      setUserSearch('all');
      setAttachedPhoto(null);
      setWelcomeMessageMode(false);
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
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const inputClasses = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all duration-200";

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            System Messenger
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Compose and manage system-wide messages</p>
        </div>
      </div>

      {/* Compose Section */}
      <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 mb-8 animate-fade-in">
        {/* Decorative gradient blob */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          {/* System Profile */}
          <div className="flex items-center space-x-4 mb-8 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="relative group">
              <img
                src={systemProfile?.photo_url || '/logo-splash.png'}
                alt="Upendo System"
                className="w-16 h-16 rounded-full border-2 border-pink-500/50 object-cover cursor-pointer group-hover:border-pink-400 transition-all duration-300 shadow-lg shadow-pink-500/20"
                onClick={() => profilePhotoInputRef.current?.click()}
                onError={(e) => { e.currentTarget.src = '/logo-splash.png'; }}
              />
              <div className="absolute bottom-0 right-0 bg-pink-500 rounded-full p-1.5 border-2 border-[#2b0f16] shadow-md">
                <Upload size={12} className="text-white" />
              </div>
              <input type="file" ref={profilePhotoInputRef} className="hidden" onChange={handleProfilePhotoUpload} accept="image/*" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold text-white">{systemProfile?.name || 'Upendo'}</h2>
                <CheckCircle size={18} className="text-blue-400" />
              </div>
              <p className="text-sm text-gray-400">System Account</p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-2">Title</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Scheduled Maintenance"
                className={inputClasses}
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-2">Message</label>
              {/* Formatting Toolbar */}
              <div className="flex items-center gap-1 mb-2 p-2 bg-white/5 rounded-xl border border-white/10 flex-wrap">
                <button type="button" onClick={() => wrapWithTag('b')} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-pink-400 transition-all duration-200" title="Bold">
                  <Bold size={16} />
                </button>
                <button type="button" onClick={() => wrapWithTag('i')} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-pink-400 transition-all duration-200" title="Italic">
                  <Italic size={16} />
                </button>
                <button type="button" onClick={() => wrapWithTag('u')} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-pink-400 transition-all duration-200" title="Underline">
                  <Underline size={16} />
                </button>
                <button type="button" onClick={() => wrapWithTag('s')} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-pink-400 transition-all duration-200" title="Strikethrough">
                  <Strikethrough size={16} />
                </button>
                <div className="w-px h-5 bg-white/10 mx-1" />
                <button type="button" onClick={() => insertBlock('<ul><li></li></ul>', 5)} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-pink-400 transition-all duration-200" title="Bullet List">
                  <List size={16} />
                </button>
                <button type="button" onClick={() => insertBlock('<ol><li></li></ol>', 5)} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-pink-400 transition-all duration-200" title="Numbered List">
                  <ListOrdered size={16} />
                </button>
                <button type="button" onClick={() => insertBlock('<blockquote></blockquote>', 12)} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-pink-400 transition-all duration-200" title="Quote">
                  <Quote size={16} />
                </button>
                <div className="w-px h-5 bg-white/10 mx-1" />
                <button type="button" onClick={() => insertBlock('<br />', 6)} className="px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-pink-400 transition-all duration-200 text-xs font-mono" title="Line Break">
                  BR
                </button>
                <div className="w-px h-5 bg-white/10 mx-1" />
                <button type="button" onClick={() => setShowButtonModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-pink-400 transition-all duration-200 text-xs" title="Add Button">
                  <ExternalLink size={14} /> Button
                </button>
              </div>
              <textarea
                ref={messageRef}
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here... Select text and use toolbar to format."
                rows={6}
                className={`${inputClasses} resize-y`}
              />
              <p className="text-xs text-gray-500 mt-2">
                Select text then click <b className="text-gray-400">B</b> <i className="text-gray-400">I</i> <u className="text-gray-400">U</u> <s className="text-gray-400">S</s> to format. Use Button to add a clickable link.
              </p>
            </div>

            {/* Image Attachment */}
            <div>
              <label className="inline-flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 border-dashed text-gray-400 hover:text-pink-400 hover:border-pink-500/30 transition-all duration-200">
                <Paperclip size={16} />
                <span className="text-sm">{attachedPhoto ? attachedPhoto.name : 'Attach Image'}</span>
                <input type="file" className="hidden" onChange={handlePhotoAttachment} accept="image/*" />
              </label>
            </div>

            {/* Message Type & Target */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Message Type</label>
                <div className="flex flex-wrap gap-2">
                  {['notification', 'story', 'message'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setMessageTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${messageTypes.includes(type) ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'}`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
                {messageTypes.length === 0 && <p className="text-xs text-red-400 mt-1.5">Select at least one type</p>}
              </div>
              <div className="relative">
                <label htmlFor="target" className="block text-sm font-medium text-gray-400 mb-2">Target</label>
                <input
                  id="target"
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="'all' or @username to search"
                  className={inputClasses}
                />
                {searchResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                    <ul>
                      {searchResults.map(user => (
                        <li
                          key={user.id}
                          className="p-3 hover:bg-white/10 cursor-pointer flex items-center space-x-3 transition-colors border-b border-white/5 last:border-0"
                          onClick={() => {
                            setUserSearch(`@${user.name}`);
                            setTarget(user.id);
                            setSearchResults([]);
                          }}
                        >
                          <img src={user.photos[0] || '/upendo-logo.png'} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                          <div>
                            <p className="font-medium text-white">{user.name}</p>
                            <p className="text-xs text-gray-400">{calculateAge(user.dob)} years old</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Welcome Mode */}
            <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10">
              <button
                type="button"
                id="welcome-mode"
                onClick={() => setWelcomeMessageMode(!welcomeMessageMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${welcomeMessageMode ? 'bg-pink-500' : 'bg-white/10'}`}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${welcomeMessageMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <label htmlFor="welcome-mode" className="text-sm text-gray-300 cursor-pointer">
                Welcome Message Mode <span className="text-gray-500">-- Auto-sent to new users after onboarding</span>
              </label>
            </div>

            {/* Send Button */}
            <div className="flex justify-end pt-4 border-t border-white/10">
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600
                           hover:from-pink-600 hover:to-purple-700 text-white font-medium shadow-lg shadow-pink-500/25
                           transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message History */}
      <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 animate-fade-in">
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <div>
            <h2 className="text-lg font-semibold text-white">Message History</h2>
            <p className="text-sm text-gray-400 mt-0.5">{history.length} messages sent</p>
          </div>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete all system messages? This action cannot be undone.')) {
                handleDeleteAll();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 border border-red-500/20 text-sm transition-colors"
          >
            <Trash2 size={14} />
            Delete All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Date</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Title</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Message</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4 hidden md:table-cell">Type</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4 hidden lg:table-cell">Target</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4 hidden md:table-cell">Welcome</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">File</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <MessageSquare size={40} className="mx-auto text-gray-600 mb-3" />
                    <p className="text-gray-400">No messages sent yet</p>
                    <p className="text-gray-600 text-sm mt-1">Compose your first system message above</p>
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-300 whitespace-nowrap">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-white font-medium max-w-[200px] truncate">{item.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-300 max-w-[300px] truncate">{item.message}</td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 hidden lg:table-cell">{item.target}</td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      {item.welcome_message_mode ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-500/10 text-pink-400 border border-pink-500/20">
                          Welcome
                        </span>
                      ) : (
                        <span className="text-gray-600">--</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {item.photo_url && (
                        <a href={item.photo_url} target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:text-pink-300 transition-colors">
                          <ImageIcon size={18} />
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Button Modal */}
      {showButtonModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md border border-white/10 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Add Button</h3>
            <p className="text-sm text-gray-400 mb-5">Insert a styled clickable button into your message</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Button Text</label>
                <input
                  type="text"
                  value={buttonName}
                  onChange={(e) => setButtonName(e.target.value)}
                  placeholder="e.g. Visit Now"
                  className={inputClasses}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Link URL</label>
                <input
                  type="url"
                  value={buttonUrl}
                  onChange={(e) => setButtonUrl(e.target.value)}
                  placeholder="https://example.com"
                  className={inputClasses}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Button Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={buttonColor}
                    onChange={(e) => setButtonColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-white/10"
                  />
                  <span className="text-gray-300 text-sm font-mono">{buttonColor}</span>
                  <div className="flex gap-2 ml-auto">
                    {['#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'].map(c => (
                      <button
                        key={c}
                        onClick={() => setButtonColor(c)}
                        className={`w-7 h-7 rounded-full border-2 transition-all duration-200 hover:scale-110 ${buttonColor === c ? 'border-white ring-2 ring-white/30' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              {/* Preview */}
              {buttonName && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Preview</label>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-center">
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      style={{ display: 'inline-block', padding: '10px 24px', background: buttonColor, color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' }}
                    >
                      {buttonName}
                    </a>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
              <button
                onClick={() => setShowButtonModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={insertButton}
                disabled={!buttonName || !buttonUrl}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg shadow-pink-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Insert Button
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemMessenger;
