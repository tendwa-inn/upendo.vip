import { supabase } from '../lib/supabaseClient';

export const reportService = {
  async createUserReport(reporterId: string, reportedId: string, reason: string) {
    const { data, error } = await supabase
      .from('reports')
      .insert([{ reporter_id: reporterId, reported_id: reportedId, reason, type: 'user' }]);

    if (error) {
      console.error('Error creating user report:', error);
      throw error;
    }

    return data;
  },

  async getUserAppeals() {
    const { data, error } = await supabase.from('appeals').select('*');
    if (error) throw error;
    return data;
  },

  async getReportedAccounts() {
    const { data, error } = await supabase.from('reports').select('*').eq('type', 'user');
    if (error) throw error;
    return data;
  },

  async getReportedMessages() {
    const { data, error } = await supabase.from('reports').select('*').eq('type', 'message');
    if (error) throw error;
    return data;
  },

  async processAppeal(appealId: string, approve: boolean, adminNote: string) {
    const { data, error } = await supabase.rpc('process_appeal', { appeal_id: appealId, approve, admin_note: adminNote });
    if (error) throw error;
    return data;
  },

  async processReportedAccount(reportId: string, action: string, duration?: number, adminNote?: string) {
    const { data, error } = await supabase.rpc('process_reported_account', { report_id: reportId, action, duration_days: duration, admin_note: adminNote });
    if (error) throw error;
    return data;
  },

  async processReportedMessage(reportId: string, action: string, adminNote?: string) {
    const { data, error } = await supabase.rpc('process_reported_message', { report_id: reportId, action, admin_note: adminNote });
    if (error) throw error;
    return data;
  },
};
