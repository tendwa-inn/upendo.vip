import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flag, Funnel, UserX, LogOut, User, Users as UsersIcon } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

const otherNavItems = [
  { path: '/admin/connections', icon: UsersIcon, label: 'Connections' },
  { path: '/admin/reports', icon: Flag, label: 'Reports' },
  { path: '/admin/word-filter', icon: Funnel, label: 'Word Filter' },
  { path: '/admin/dormant', icon: UserX, label: 'Dormant' },
];

interface MoreMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MoreMenu: React.FC<MoreMenuProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { signOut } = useAuthStore();

  const handleLogout = async () => {
    await signOut();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end" onClick={onClose}>
      <div className="bg-gray-800 w-full rounded-t-2xl p-4 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="grid grid-cols-4 gap-4 text-center">
          {otherNavItems.map((item) => (
            <Link key={item.path} to={item.path} className="flex flex-col items-center space-y-2 text-white hover:text-pink-500 transition-colors" onClick={onClose}>
              <div className="p-3 bg-gray-700 rounded-full">
                <item.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px]">{item.label}</span>
            </Link>
          ))}
          <button onClick={() => navigate('/profile')} className="flex flex-col items-center space-y-2 text-white hover:text-pink-500 transition-colors">
            <div className="p-3 bg-gray-700 rounded-full">
              <User className="w-6 h-6" />
            </div>
            <span className="text-[10px]">Profile</span>
          </button>
          <button onClick={handleLogout} className="flex flex-col items-center space-y-2 text-white hover:text-pink-500 transition-colors">
            <div className="p-3 bg-gray-700 rounded-full">
              <LogOut className="w-6 h-6" />
            </div>
            <span className="text-[10px]">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoreMenu;
