import { supabase } from '../lib/supabaseClient';

export const dashboardService = {
  async getStats() {
    const { data: totalUsers, error: totalUsersError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' });

    // Active users in last 15 minutes (truly online)
    const { data: activeUsers, error: activeUsersError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .filter('last_active_at', 'gte', new Date(Date.now() - 15 * 60 * 1000).toISOString());

    const { data: newUsersToday, error: newUsersTodayError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .filter('created_at', 'gte', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const { data: totalPromos, error: totalPromosError } = await supabase
      .from('promo_codes')
      .select('id', { count: 'exact' });

    const { data: activePromos, error: activePromosError } = await supabase
      .from('promo_codes')
      .select('id', { count: 'exact' })
      .filter('expires_at', 'gte', new Date().toISOString());

    const { data: totalReports, error: totalReportsError } = await supabase
      .from('user_reports')
      .select('id', { count: 'exact' });

    const { data: pendingReports, error: pendingReportsError } = await supabase
      .from('user_reports')
      .select('id', { count: 'exact' })
      .eq('status', 'pending');

    const { data: dormantAccounts, error: dormantAccountsError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .eq('is_deactivated', true);

    if (totalUsersError || activeUsersError || newUsersTodayError || totalPromosError || activePromosError || totalReportsError || pendingReportsError || dormantAccountsError) {
      console.error('Error fetching dashboard stats:', {
        totalUsersError,
        activeUsersError,
        newUsersTodayError,
        totalPromosError,
        activePromosError,
        totalReportsError,
        pendingReportsError,
        dormantAccountsError
      });
      throw new Error('Failed to fetch dashboard stats');
    }

    return {
      totalUsers: totalUsers?.length || 0,
      activeUsers: activeUsers?.length || 0,
      newUsersToday: newUsersToday?.length || 0,
      totalPromos: totalPromos?.length || 0,
      activePromos: activePromos?.length || 0,
      totalReports: totalReports?.length || 0,
      pendingReports: pendingReports?.length || 0,
      dormantAccounts: dormantAccounts?.length || 0,
    };
  },
};
