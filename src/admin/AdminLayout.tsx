import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Home, Users, Ticket, Flag, UserX, Settings, LogOut, Filter, MessageSquare, Image as ImageIcon, Users as UsersIcon, Megaphone, ShoppingBag } from 'lucide-react';
import MobileNav from '../components/admin/MobileNav';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = () => {
  const { signOut, updateUserProfile, isAdmin, loading } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  React.useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/login');
    }
  }, [isAdmin, loading, navigate]);

  const handleLogout = async () => {
    await signOut();
    toast.success(t('admin.loggedOut'));
    navigate('/login');
  };

  const handleReturnToProfile = () => {
    updateUserProfile({ role: 'user' });
    navigate('/profile');
  };

  const navItems = [
    { path: '/admin/dashboard', icon: Home, label: t('admin.nav.dashboard') },
    { path: '/admin/users', icon: Users, label: t('admin.nav.users') },
    { path: '/admin/connections', icon: UsersIcon, label: t('admin.nav.connections') },
    { path: '/admin/promos', icon: Ticket, label: t('admin.nav.promos') },
    { path: '/admin/reports', icon: Flag, label: t('admin.nav.reports') },
    { path: '/admin/word-filter', icon: Filter, label: t('admin.nav.wordFilter') },
    { path: '/admin/system-messenger', icon: MessageSquare, label: t('admin.nav.systemMessenger') },
    { path: '/admin/gifs', icon: ImageIcon, label: t('admin.nav.gifs') },
    { path: '/admin/ads', icon: Megaphone, label: t('admin.nav.ads') },
    { path: '/admin/store', icon: ShoppingBag, label: t('admin.nav.store') },
    { path: '/admin/dormant', icon: UserX, label: t('admin.nav.dormant') },
    { path: '/admin/settings', icon: Settings, label: t('admin.nav.settings') },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#2b0f16] to-[#120508] text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // This will be handled by the redirect in useEffect
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#2b0f16] to-[#120508] text-white">
      {/* Sidebar */}
      <aside className="hidden md:block w-64 bg-[#3a1a22] p-6 flex flex-col">
        <div className="text-2xl font-bold mb-8">{t('admin.panel')}</div>
        <nav className="flex-1">
          <ul>
            {navItems.map((item) => (
              <li key={item.path} className="mb-2">
                <Link
                  to={item.path}
                  className="flex items-center p-3 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto">
          <button onClick={handleReturnToProfile} className="flex items-center p-3 rounded-lg hover:bg-white/10 transition-colors w-full">
            <Users className="w-5 h-5 mr-3" />
            {t('admin.returnToProfile')}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center p-3 rounded-lg hover:bg-white/10 transition-colors w-full mt-4"
          >
            <LogOut className="w-5 h-5 mr-3" />
            {t('admin.logout')}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto pb-24 md:pb-8">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
};

export default AdminLayout;
