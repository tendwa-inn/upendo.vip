import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { House, Users, Ticket, MessageSquare, Settings, MoreHorizontal } from 'lucide-react';
import MoreMenu from './MoreMenu';

const navItems = [
  { path: '/admin/dashboard', icon: House, label: 'Dashboard' },
  { path: '/admin/users', icon: Users, label: 'Users' },
  { path: '/admin/promos', icon: Ticket, label: 'Promos' },
  { path: '/admin/system-messenger', icon: MessageSquare, label: 'Messenger' },
  { path: '/admin/settings', icon: Settings, label: 'Settings' },
];

const MobileNav: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 text-white shadow-lg z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${location.pathname === item.path ? 'text-pink-500' : 'hover:text-pink-500'}`}>
            <item.icon className="w-6 h-6" />
          </Link>
        ))}
        <button onClick={() => setIsMenuOpen(true)} className="flex flex-col items-center justify-center w-full h-full hover:text-pink-500">
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </div>
      <MoreMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  );
};

export default MobileNav;
