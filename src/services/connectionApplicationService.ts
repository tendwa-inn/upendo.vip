import { supabase } from '../lib/supabaseClient';

export interface ConnectionApplication {
  id: string;
  user_id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  bio: string;
  location: { name: string; latitude: number; longitude: number };
  photos: string[];
  status: 'pending' | 'approved' | 'denied';
  admin_note: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  // Joined profile data
  profiles?: {
    name: string;
    photos: string[];
  };
}

export interface ConnectionRequest {
  id: string;
  connection_id: string;
  connection_applicant_id: string;
  requester_id: string;
  status: 'pending' | 'accepted' | 'denied';
  created_at: string;
  // Joined data
  connection?: {
    id: string;
    name: string;
    photos: string[];
    bio: string;
    applicant_user_id: string;
  };
  requester?: {
    id: string;
    name: string;
    photos: string[];
    age: number;
    bio: string;
  };
}

export const connectionApplicationService = {
  // Submit a new connection application
  async submitApplication(application: {
    user_id: string;
    name: string;
    age: number;
    gender: 'male' | 'female';
    bio: string;
    location: { name: string; latitude: number; longitude: number };
    photos: string[];
  }) {
    const { data, error } = await supabase
      .from('connection_applications')
      .insert(application)
      .select()
      .single();

    if (error) throw error;

    // Send notification to user
    await supabase.from('notifications').insert({
      user_id: application.user_id,
      title: 'Connection Application Sent',
      message: 'Your connection application has been submitted and is pending review.',
      type: 'connection_application',
    });

    return data;
  },

  // Get user's own applications
  async getUserApplications(userId: string): Promise<ConnectionApplication[]> {
    const { data, error } = await supabase
      .from('connection_applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get all pending applications (admin)
  async getPendingApplications(): Promise<ConnectionApplication[]> {
    const { data, error } = await supabase
      .from('connection_applications')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get all applications (admin)
  async getAllApplications(): Promise<ConnectionApplication[]> {
    const { data, error } = await supabase
      .from('connection_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Approve application (admin)
  async approveApplication(applicationId: string, adminId: string) {
    // Get the application
    const { data: app, error: fetchError } = await supabase
      .from('connection_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (fetchError) throw fetchError;
    if (!app) throw new Error('Application not found');

    // Update application status
    const { error: updateError } = await supabase
      .from('connection_applications')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminId,
      })
      .eq('id', applicationId);

    if (updateError) throw updateError;

    // Insert into connections table with 3-day expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3);

    const { error: insertError } = await supabase
      .from('connections')
      .insert({
        name: app.name,
        age: app.age,
        gender: app.gender,
        bio: app.bio,
        location: app.location,
        photos: app.photos,
        whatsapp_number: '', // Not needed for user-applied
        whatsapp_message: '',
        is_active: true,
        is_user_applied: true,
        applicant_user_id: app.user_id,
        suitor_count: 0,
        max_suitors: 10,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) throw insertError;

    // Send notification to user
    await supabase.from('notifications').insert({
      user_id: app.user_id,
      title: 'Connection Approved!',
      message: 'Your connection application has been approved!',
      type: 'connection_approved',
    });
  },

  // Deny application (admin)
  async denyApplication(applicationId: string, adminId: string, reason?: string) {
    const { data: app, error: fetchError } = await supabase
      .from('connection_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (fetchError) throw fetchError;
    if (!app) throw new Error('Application not found');

    const { error: updateError } = await supabase
      .from('connection_applications')
      .update({
        status: 'denied',
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminId,
        admin_note: reason || null,
      })
      .eq('id', applicationId);

    if (updateError) throw updateError;

    // Send notification to user
    await supabase.from('notifications').insert({
      user_id: app.user_id,
      title: 'Connection Denied',
      message: reason
        ? `Your connection application has been denied. Reason: ${reason}`
        : 'Your connection application has been denied.',
      type: 'connection_denied',
    });
  },

  // Send a connection request (suitor clicks Connect on an applied connection)
  async sendConnectionRequest(connectionId: string, requesterId: string, connectionApplicantId: string) {
    // Check if already requested (use maybeSingle to avoid 406 when no rows)
    const { data: existing } = await supabase
      .from('connection_requests')
      .select('id')
      .eq('connection_id', connectionId)
      .eq('requester_id', requesterId)
      .maybeSingle();

    if (existing) return existing;

    // Check tier-based connection request limit
    const { data: applicantProfile } = await supabase
      .from('profiles')
      .select('account_type')
      .eq('id', connectionApplicantId)
      .maybeSingle();

    const applicantTier = (applicantProfile?.account_type || 'free') as 'free' | 'pro' | 'vip';

    const { data: settings } = await supabase
      .from('app_settings')
      .select('connection_requests')
      .eq('account_type', applicantTier)
      .maybeSingle();

    const requestLimit = settings?.connection_requests ?? (applicantTier === 'free' ? 2 : applicantTier === 'pro' ? 10 : -1);

    if (requestLimit !== -1) {
      const { count } = await supabase
        .from('connection_requests')
        .select('*', { count: 'exact', head: true })
        .eq('connection_id', connectionId);

      if ((count || 0) >= requestLimit) {
        throw new Error('This connection has reached its request limit.');
      }
    }

    const { data, error } = await supabase
      .from('connection_requests')
      .insert({
        connection_id: connectionId,
        connection_applicant_id: connectionApplicantId,
        requester_id: requesterId,
      })
      .select()
      .maybeSingle();

    if (error) throw error;

    // Notify the requester that their request is pending
    await supabase.from('notifications').insert({
      user_id: requesterId,
      title: 'Connection Request Sent',
      message: 'Your connection request has been sent and is pending review.',
      type: 'connection_request',
    });

    // Notify the connection applicant that they have a new request
    await supabase.from('notifications').insert({
      user_id: connectionApplicantId,
      title: 'New Connection Request',
      message: 'Someone wants to connect with you! Check your requests.',
      type: 'connection_request',
    });

    return data;
  },

  // Get connection requests for a user (incoming requests they need to accept/deny)
  async getIncomingRequests(userId: string): Promise<ConnectionRequest[]> {
    const { data, error } = await supabase
      .from('connection_requests')
      .select(`
        *,
        connection:connections!connection_id(id, name, photos, bio, applicant_user_id),
        requester:profiles!requester_id(id, name, photos, age, bio)
      `)
      .eq('connection_applicant_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get outgoing connection requests (requests user has sent)
  async getOutgoingRequests(userId: string): Promise<ConnectionRequest[]> {
    const { data, error } = await supabase
      .from('connection_requests')
      .select(`
        *,
        connection:connections!connection_id(id, name, photos, bio, applicant_user_id)
      `)
      .eq('requester_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Accept a connection request
  async acceptConnectionRequest(requestId: string, userId: string) {
    // Get the request
    const { data: request, error: fetchError } = await supabase
      .from('connection_requests')
      .select('*, connection:connections!connection_id(*)')
      .eq('id', requestId)
      .single();

    if (fetchError) throw fetchError;
    if (!request) throw new Error('Request not found');

    // Update request status
    const { error: updateError } = await supabase
      .from('connection_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId);

    if (updateError) throw updateError;

    // Increment suitor count directly (avoid RPC dependency)
    await supabase
      .from('connections')
      .update({ suitor_count: (request.connection?.suitor_count || 0) + 1 })
      .eq('id', request.connection_id);

    // Check for existing match first
    const { data: existingMatch } = await supabase
      .from('matches')
      .select('*')
      .or(`and(user1_id.eq.${request.requester_id},user2_id.eq.${userId}),and(user1_id.eq.${userId},user2_id.eq.${request.requester_id})`)
      .single();

    let match = existingMatch;

    if (!match) {
      // Create a new match
      const { data: newMatch, error: matchError } = await supabase
        .from('matches')
        .insert({
          user1_id: request.requester_id,
          user2_id: userId,
        })
        .select()
        .single();

      if (matchError) throw matchError;
      match = newMatch;
    }

    // Send notification to requester
    await supabase.from('notifications').insert({
      user_id: request.requester_id,
      title: 'Connection Accepted!',
      message: 'Your connection request has been accepted! You can now chat.',
      type: 'connection_accepted',
    });

    // Check if suitor limit reached, deactivate connection
    const { data: conn } = await supabase
      .from('connections')
      .select('suitor_count, max_suitors')
      .eq('id', request.connection_id)
      .single();

    if (conn && conn.suitor_count >= conn.max_suitors) {
      await supabase
        .from('connections')
        .update({ is_active: false })
        .eq('id', request.connection_id);
    }

    return match;
  },

  // Deny a connection request
  async denyConnectionRequest(requestId: string) {
    const { error } = await supabase
      .from('connection_requests')
      .update({ status: 'denied' })
      .eq('id', requestId);

    if (error) throw error;
  },
};
