import { supabase } from '../utils/supabase';
import { UserReport } from '../types/admin';

export interface UserAppeal {
  id: string;
  userId: string;
  userName: string;
  actionType: 'warning' | 'suspension' | 'ban';
  reason: string;
  appealReason: string;
  createdAt: Date;
  status: 'pending' | 'approved' | 'denied';
  expiresAt?: Date;
}

export interface ReportedAccount {
  id: string;
  reportedUserId: string;
  reportedUserName: string;
  reportedBy: string;
  reportedByName: string;
  reason: 'profanity' | 'porn' | 'inappropriate_behavior' | 'harassment' | 'fake_profile' | 'spam' | 'other';
  description: string;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  evidence?: string[];
}

export interface ReportedMessage {
  id: string;
  messageId: string;
  senderId: string;
  senderName: string;
  reportedBy: string;
  reportedByName: string;
  content: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'action_taken' | 'dismissed';
  createdAt: Date;
  matchId?: string;
}

export const reportService = {
  // Get all pending user appeals
  async getUserAppeals(): Promise<UserAppeal[]> {
    const { data, error } = await supabase
      .from('user_actions')
      .select(`
        *,
        user:profiles!user_actions_user_id_fkey(id, name),
        admin:profiles!user_actions_admin_id_fkey(id, name)
      `)
      .eq('status', 'appealed')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data?.map(action => ({
      id: action.id,
      userId: action.user_id,
      userName: action.user?.name || 'Unknown User',
      actionType: action.action_type,
      reason: action.reason,
      appealReason: action.appeal_reason,
      createdAt: new Date(action.created_at),
      status: 'pending',
      expiresAt: action.expires_at ? new Date(action.expires_at) : undefined
    })) || [];
  },

  // Get all reported accounts
  async getReportedAccounts(): Promise<ReportedAccount[]> {
    const { data, error } = await supabase
      .from('user_reports')
      .select(`
        *,
        reported_user:profiles!user_reports_reported_user_id_fkey(id, name),
        reported_by:profiles!user_reports_reported_by_fkey(id, name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data?.map(report => ({
      id: report.id,
      reportedUserId: report.reported_user_id,
      reportedUserName: report.reported_user?.name || 'Unknown User',
      reportedBy: report.reported_by,
      reportedByName: report.reported_by?.name || 'Unknown User',
      reason: report.reason,
      description: report.description,
      status: report.status,
      priority: report.priority,
      createdAt: new Date(report.created_at),
      evidence: report.evidence
    })) || [];
  },

  // Get all reported messages
  async getReportedMessages(): Promise<ReportedMessage[]> {
    const { data, error } = await supabase
      .from('message_reports')
      .select(`
        *,
        message:messages(id, content, sender_id),
        sender:profiles!message_reports_sender_id_fkey(id, name),
        reported_by:profiles!message_reports_reported_by_fkey(id, name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data?.map(report => ({
      id: report.id,
      messageId: report.message_id,
      senderId: report.sender_id,
      senderName: report.sender?.name || 'Unknown User',
      reportedBy: report.reported_by,
      reportedByName: report.reported_by?.name || 'Unknown User',
      content: report.message?.content || 'Message not found',
      reason: report.reason,
      status: report.status,
      createdAt: new Date(report.created_at),
      matchId: report.match_id
    })) || [];
  },

  // Process user appeal (approve or deny)
  async processAppeal(actionId: string, approve: boolean, adminNote?: string): Promise<void> {
    const newStatus = approve ? 'approved' : 'denied';
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Admin user not authenticated');

    // Update the action status
    const { error: updateError } = await supabase
      .from('user_actions')
      .update({ 
        status: newStatus,
        admin_note: adminNote,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', actionId);

    if (updateError) throw updateError;

    // If appeal is approved, remove the action (reinstate user)
    if (approve) {
      const { error: deleteError } = await supabase
        .from('user_actions')
        .delete()
        .eq('id', actionId);

      if (deleteError) throw deleteError;
    }

    // Send notification to user
    await this.sendAppealNotification(actionId, newStatus);
  },

  // Process reported account
  async processReportedAccount(reportId: string, action: 'dismiss' | 'warn' | 'suspend' | 'ban', duration?: number, reason?: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Admin user not authenticated');

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
        status: action === 'dismiss' ? 'dismissed' : 'resolved',
        resolved_at: new Date().toISOString(),
        admin_note: reason
      })
      .eq('id', reportId);

    if (updateError) throw updateError;

    // Take action on user if needed
    if (action !== 'dismiss') {
      const expiresAt = duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString() : undefined;
      
      const { error: actionError } = await supabase
        .from('user_actions')
        .insert([{
          user_id: report.reported_user_id,
          action_type: action === 'warn' ? 'warning' : action,
          reason: reason || `Reported for ${report.reason}`,
          admin_id: user.id,
          expires_at: expiresAt
        }]);

      if (actionError) throw actionError;
    }

    // Send notification to reporter
    await this.sendReportNotification(report.reported_by, reportId, action);
  },

  // Process reported message
  async processReportedMessage(reportId: string, action: 'dismiss' | 'remove' | 'warn' | 'suspend', reason?: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Admin user not authenticated');

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
        status: action === 'dismiss' ? 'dismissed' : action === 'remove' ? 'action_taken' : 'reviewed',
        reviewed_at: new Date().toISOString(),
        admin_note: reason
      })
      .eq('id', reportId);

    if (updateError) throw updateError;

    // Take action on message if needed
    if (action === 'remove') {
      const { error: deleteError } = await supabase
        .from('messages')
        .delete()
        .eq('id', report.message_id);

      if (deleteError) throw deleteError;
    }

    // Take action on user if needed (warn/suspend)
    if (action === 'warn' || action === 'suspend') {
      const actionToInsert: any = {
        user_id: report.sender_id,
        action_type: action === 'warn' ? 'warning' : 'suspension',
        reason: reason || `Reported message: ${report.reason}`,
        admin_id: user.id
      };

      const { error: actionError } = await supabase
        .from('user_actions')
        .insert([actionToInsert]);

      if (actionError) throw actionError;
    }

    // Send notification to reporter
    await this.sendMessageReportNotification(report.reported_by, reportId, action);
  },

  // Send notification for appeal decision
  async sendAppealNotification(actionId: string, status: string): Promise<void> {
    // Implementation would depend on your notification system
    // This is a placeholder for the actual notification logic
    console.log(`Sending appeal notification: Action ${actionId} was ${status}`);
  },

  // Send notification for report decision
  async sendReportNotification(userId: string, reportId: string, action: string): Promise<void> {
    // Implementation would depend on your notification system
    // This is a placeholder for the actual notification logic
    console.log(`Sending report notification: Report ${reportId} was ${action}`);
  },

  // Send notification for message report decision
  async sendMessageReportNotification(userId: string, reportId: string, action: string): Promise<void> {
    // Implementation would depend on your notification system
    // This is a placeholder for the actual notification logic
    console.log(`Sending message report notification: Report ${reportId} was ${action}`);
  }
};