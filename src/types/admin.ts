export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'moderator';
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface UserReport {
  id: string;
  reportedUserId: string;
  reportedBy: string;
  reason: 'profanity' | 'porn' | 'inappropriate_behavior' | 'harassment' | 'fake_profile' | 'spam' | 'other';
  description: string;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string; // Admin/Mod ID
  createdAt: Date;
  resolvedAt?: Date;
  evidence?: string[]; // URLs to screenshots, etc.
  actions?: ModerationAction[];
}

export interface ModerationAction {
  id: string;
  reportId: string;
  action: 'warning' | 'suspension' | 'permanent_ban' | 'content_removal' | 'account_restriction';
  duration?: number; // in days
  reason: string;
  performedBy: string; // Admin/Mod ID
  performedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  appealStatus?: 'none' | 'pending' | 'approved' | 'denied';
  appealReason?: string;
  appealDate?: Date;
}

export interface SystemMessage {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'promotion' | 'system_update';
  targetAudience: 'all' | 'free' | 'pro' | 'vip' | 'specific_users';
  targetUsers?: string[]; // Specific user IDs if targetAudience is 'specific_users'
  deliveryMethod: 'inbox' | 'story' | 'both';
  isActive: boolean;
  createdBy: string; // Admin ID
  createdAt: Date;
  expiresAt?: Date;
  sentCount?: number;
}

export interface KeywordFilter {
  id: string;
  keyword: string;
  category: 'profanity' | 'sexual' | 'harassment' | 'spam' | 'other';
  severity: 'low' | 'medium' | 'high';
  autoAction: 'none' | 'flag' | 'block' | 'review';
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  matchCount: number;
}

export interface UserSubscriptionHistory {
  id: string;
  userId: string;
  previousSubscription: 'free' | 'pro' | 'vip';
  newSubscription: 'free' | 'pro' | 'vip';
  changedAt: Date;
  changedBy?: string; // Admin ID if manually changed
  reason?: string;
  expiresAt?: Date;
}

export interface EscalationTicket {
  id: string;
  originalReportId: string;
  escalatedBy: string; // Mod ID
  escalatedTo: string; // Admin ID
  reason: string;
  status: 'pending' | 'under_review' | 'resolved';
  priority: 'high' | 'urgent';
  createdAt: Date;
  resolvedAt?: Date;
  resolution?: string;
}

export interface PromoCode {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'message_requests' | 'popularity_boost' | 'pro_account' | 'vip_account' | 'unlimited_swipes' | 'limited_swipes' | 'profile_views';
  durationDays: number | null;
  maxUses: number | null;
  timesUsed: number;
  createdAt: Date;
  expiresAt?: Date;
  effect: { [key: string]: any };
  isArchived?: boolean;
}