import React, { useState, useEffect } from 'react';
import { AreaChart } from '@tremor/react';
import { Users, Ticket, Flag, UserX, Users as UsersIcon, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { dashboardService } from '../services/dashboardService';
import { useTranslation } from 'react-i18next';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' as const },
  }),
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    totalPromos: 0,
    activePromos: 0,
    totalReports: 0,
    pendingReports: 0,
    dormantAccounts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const userStatsChartData = [
    { name: 'Total Users', Total: stats.totalUsers, Active: 0, New: 0 },
    { name: 'Active Now', Total: 0, Active: stats.activeUsers, New: 0 },
    { name: 'New Today', Total: 0, Active: 0, New: stats.newUsersToday },
  ];

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="h-8 w-48 bg-white/10 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-white/5 rounded mt-2 animate-pulse" />
          </div>
          <div className="h-10 w-40 bg-white/10 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-44 bg-white/5 rounded-2xl border border-white/10 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            {t('admin.title')}
          </h1>
          <p className="text-gray-400 mt-1 text-sm">{t('admin.welcome')}</p>
        </div>
        <button
          onClick={() => navigate('/admin/connections')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600
                     hover:from-pink-600 hover:to-purple-700 text-white font-medium shadow-lg shadow-pink-500/25
                     transition-all duration-300"
        >
          <UsersIcon size={18} />
          Manage Connections
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* User Statistics - spans 2 cols */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="md:col-span-2 relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500/10 to-transparent rounded-bl-full" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20">
                  <TrendingUp size={20} className="text-pink-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm font-medium">User Statistics</p>
                  <p className="text-xs text-gray-500">Platform growth overview</p>
                </div>
              </div>
            </div>

            <AreaChart
              className="h-52 mt-2"
              data={userStatsChartData}
              index="name"
              categories={['Total', 'Active', 'New']}
              colors={['pink', 'emerald', 'blue']}
              showAnimation={true}
              showLegend={false}
              showGradient={true}
              curveType="natural"
              yAxisWidth={48}
            />

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-pink-500 rounded-full" />
                  <span className="text-sm text-gray-300">Total Users</span>
                </div>
                <span className="text-lg font-bold text-white">{stats.totalUsers.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                  <span className="text-sm text-gray-300">Active Now</span>
                  {stats.activeUsers > 0 && (
                    <span className="flex h-2 w-2 ml-1">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                  )}
                </div>
                <span className="text-lg font-bold text-emerald-400">{stats.activeUsers.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                  <span className="text-sm text-gray-300">New Today</span>
                </div>
                <span className="text-lg font-bold text-blue-400">{stats.newUsersToday.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Promo Codes */}
        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full" />
          <div className="relative z-10">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 w-fit mb-4">
              <Ticket size={20} className="text-emerald-400" />
            </div>
            <p className="text-gray-400 text-sm font-medium">Promo Codes</p>
            <p className="text-3xl font-bold text-white mt-1">{stats.totalPromos}</p>
            <p className="text-gray-500 text-sm mt-2">
              Active: <span className="text-emerald-400 font-medium">{stats.activePromos}</span>
            </p>
          </div>
        </motion.div>

        {/* User Reports */}
        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-rose-500/10 to-transparent rounded-bl-full" />
          <div className="relative z-10">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 w-fit mb-4">
              <Flag size={20} className="text-rose-400" />
            </div>
            <p className="text-gray-400 text-sm font-medium">User Reports</p>
            <p className="text-3xl font-bold text-white mt-1">{stats.totalReports}</p>
            <p className="text-gray-500 text-sm mt-2">
              Pending: <span className="text-rose-400 font-medium">{stats.pendingReports}</span>
            </p>
          </div>
        </motion.div>

        {/* Dormant Accounts */}
        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full" />
          <div className="relative z-10">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 w-fit mb-4">
              <UserX size={20} className="text-amber-400" />
            </div>
            <p className="text-gray-400 text-sm font-medium">Dormant Accounts</p>
            <p className="text-3xl font-bold text-white mt-1">{stats.dormantAccounts}</p>
            <p className="text-gray-500 text-sm mt-2">Deactivated profiles</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
