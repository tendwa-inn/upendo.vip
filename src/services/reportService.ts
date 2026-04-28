import { supabase } from '../lib/supabaseClient';

export interface UserAppeal {
  id: string;
  userName: string;
  actionType: string;
  reason: string;
  appealReason: string;
  createdAt: string;
  expiresAt?: string;
  status: string;
}

export interface ReportedAccount {
  id: string;
  reportedUserName: string;
  reportedByName: string;
  reason: string;
  priority: string;
  status: string;
  description: string;
  createdAt: string;
}

export interface ReportedMessage {
  id: string;
  senderName: string;
  reportedByName: string;
  content: string;
  reason: string;
  status: string;
  createdAt: string;
}

export const reportService = {
  async createUserReport(reporterId: string, reportedId: string, reason: string, description: string) {
    console.log('Creating user report with:', { reporterId, reportedId, reason, description });
    const { data, error } = await supabase
      .from('user_reports')
      .insert([{ 
        reported_by: reporterId, 
        reported_user_id: reportedId, 
        reason,
        description,
        status: 'pending',
        priority: 'medium'
      }]);

    if (error) {
      console.error('Error creating user report:', error);
      throw error;
    }

    console.log('Successfully created user report:', data);
    return data;
  },

  async getUserAppeals(): Promise<UserAppeal[]> {
    // For now, return empty array since we don't have appeals table
    // This can be implemented later when appeals functionality is added
    return [];
  },

  async getReportedAccounts(): Promise<ReportedAccount[]> {
    try {
      // Join with profiles table to get user names
      const { data, error } = await supabase
        .from('user_reports')
        .select(`
          *,
          reported_user:profiles!reported_user_id(name),
          reporter:profiles!reported_by(name)
        `);
      
      if (error) {
        console.error('Error fetching reported accounts:', error);
        throw error;
      }
      
      console.log('Raw reported accounts data:', data);
      
      if (!data || data.length === 0) {
        return [];
      }
      
      return data.map((report: any) => ({
        id: report.id,
        reportedUserName: report.reported_user?.name || 'Unknown User',
        reportedByName: report.reporter?.name || 'Unknown Reporter',
        reason: report.reason || 'unknown',
        priority: report.priority || 'medium',
        status: report.status || 'pending',
        description: report.description || 'No description provided',
        createdAt: report.created_at
      }));
    } catch (error) {
      console.error('Error in getReportedAccounts:', error);
      throw error;
    }
  },

  async getReportedMessages(): Promise<ReportedMessage[]> {
    try {
      // Join with profiles and messages tables to get complete data
      const { data, error } = await supabase
        .from('message_reports')
        .select(`
          *,
          sender:profiles!sender_id(name),
          reporter:profiles!reported_by(name),
          message:messages!message_id(content)
        `);
      
      if (error) {
        console.error('Error fetching reported messages:', error);
        throw error;
      }
      
      console.log('Raw reported messages data:', data);
      
      if (!data || data.length === 0) {
        return [];
      }
      
      return data.map((report: any) => ({
        id: report.id,
        senderName: report.sender?.name || 'Unknown Sender',
        reportedByName: report.reporter?.name || 'Unknown Reporter',
        content: report.message?.content || 'Message content not available',
        reason: report.reason || 'unknown',
        status: report.status || 'pending',
        createdAt: report.created_at
      }));
    } catch (error) {
      console.error('Error in getReportedMessages:', error);
      throw error;
    }
  },

  async processAppeal(appealId: string, approve: boolean, adminNote: string) {
    // Appeals functionality not implemented yet
    throw new Error('Appeals processing not implemented');
  },

  async processReportedAccount(reportId: string, action: string, duration?: number, adminNote?: string) {
    try {
      // Get the report details
      const { data: report, error: reportError } = await supabase
        .from('user_reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (reportError) throw reportError;
      if (!report) throw new Error('Report not found');

      // Update report status
      const { error: updateError } = await supabase
        .from('user_reports')
        .update({ 
          status: 'resolved',
          admin_note: adminNote,
          resolved_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (updateError) throw updateError;

      // Apply action to the reported user
      if (report.reported_user_id) {
        switch (action) {
          case 'warn':
            // Add warning to user record
            const { data: userProfile } = await supabase
              .from('profiles')
              .select('warnings')
              .eq('id', report.reported_user_id)
              .single();

            const warnings = (userProfile?.warnings || 0) + 1;
            
            const { error: warnError } = await supabase
              .from('profiles')
              .update({ warnings })
              .eq('id', report.reported_user_id);

            if (warnError) throw warnError;
            break;

          case 'suspend':
            const suspensionEnd = new Date();
            suspensionEnd.setDate(suspensionEnd.getDate() + (duration || 7));

            const { error: suspendError } = await supabase
              .from('profiles')
              .update({ 
                suspension_end: suspensionEnd.toISOString(),
                is_banned: false
              })
              .eq('id', report.reported_user_id);

            if (suspendError) throw suspendError;
            break;

          case 'ban':
            const { error: banError } = await supabase
              .from('profiles')
              .update({ 
                is_banned: true,
                suspension_end: null
              })
              .eq('id', report.reported_user_id);

            if (banError) throw banError;
            break;

          case 'dismiss':
            // No action needed, just mark as resolved
            break;
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error processing reported account:', error);
      throw error;
    }
  },

  async processReportedMessage(reportId: string, action: string, adminNote?: string) {
    try {
      // Get the report details
      const { data: report, error: reportError } = await supabase
        .from('message_reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (reportError) throw reportError;
      if (!report) throw new Error('Report not found');

      // Update report status
      const { error: updateError } = await supabase
        .from('message_reports')
        .update({ 
          status: 'resolved',
          admin_note: adminNote,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (updateError) throw updateError;

      // Apply action based on the action type
      if (report.sender_id) {
        switch (action) {
          case 'remove':
            // Delete the message
            if (report.message_id) {
              const { error: deleteError } = await supabase
                .from('messages')
                .delete()
                .eq('id', report.message_id);

              if (deleteError) throw deleteError;
            }
            break;

          case 'warn':
            // Add warning to sender
            const { data: userProfile } = await supabase
              .from('profiles')
              .select('warnings')
              .eq('id', report.sender_id)
              .single();

            const warnings = (userProfile?.warnings || 0) + 1;
            
            const { error: warnError } = await supabase
              .from('profiles')
              .update({ warnings })
              .eq('id', report.sender_id);

            if (warnError) throw warnError;
            break;

          case 'suspend':
            const suspensionEnd = new Date();
            suspensionEnd.setDate(suspensionEnd.getDate() + 7); // Default 7 days

            const { error: suspendError } = await supabase
              .from('profiles')
              .update({ 
                suspension_end: suspensionEnd.toISOString(),
                is_banned: false
              })
              .eq('id', report.sender_id);

            if (suspendError) throw suspendError;
            break;

          case 'dismiss':
            // No action needed, just mark as resolved
            break;
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error processing reported message:', error);
      throw error;
    }
  },
};
