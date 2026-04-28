export type Subscription = 'free' | 'pro' | 'vip' | 'premium' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  photos: string[];
  age: number;
  bio: string;
  interests: string[];
  tribe?: string;
  online: boolean;
  subscription?: Subscription;
  dateOfBirth?: Date;
  gender?: 'man' | 'woman' | 'other';
  lookingFor?: 'men' | 'women' | 'both';
  hereFor?: string[];
  location?: { name: string; latitude: number; longitude: number; };
  isVerified?: boolean;
  aboutMe?: { delicacies?: { food: string; photo?: string }[]; travel?: { place: string; summary: string }[] };
  education?: 'not-completed' | 'student' | 'undergraduate' | 'postgraduate' | 'graduate' | 'diploma' | 'bachelors' | 'masters';
  height?: number;
  drinking?: 'never' | 'occasionally' | 'socially' | 'regularly';
  smoking?: 'never' | 'occasionally' | 'socially' | 'regularly';
  religion?: string;
  firstDate?: 'at-home' | 'at-the-gym' | 'at-the-club' | 'on-a-date';
  preferences?: { distance: number; ageRange?: [number, number]; gender: string; };
  swipeCount?: number;
  replyRate?: number;
  loveLanguage?: string;
  lastActive?: Date;
  messageRequestsSent?: number;
  messageRequestResetDate?: Date;
  role?: string;
  account_type?: 'free' | 'pro' | 'vip';
  subscriptionTier?: string;
  ghostModeEnabled?: boolean;
  relationshipIntent?: string;
  viewed_at?: string; // For profile views
  liked_at?: string; // For likes
  canViewProfilesExpiresAt?: string; // For profile views promo
  dailyVibe?: string;
  dailyVibeExpiresAt?: string;
}

export interface AppSettings {
  id: number;
  account_type: string;
  swipes_per_day: number;
  rewind_count: number;
  international_dating: boolean;
  unlimited_message_requests: boolean;
  price: string;
  ghost_mode: boolean;
  read_receipts: boolean;
  visibility_rate: number;
  message_requests: number;
  profile_views: number;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  type: 'text' | 'image' | 'gif';
  replyTo?: string;
  parentMessage?: { content: string; senderId: string };
  isEdited?: boolean;
}

export interface Match {
  id: string;
  user1: User;
  user2: User;
  timestamp: Date;
  messages: Message[];
  lastMessage?: Message;
}

export type NotificationType = 
  | 'profile-view'
  | 'new-like'
  | 'swipe-refresh'
  | 'account-issue'
  | 'report-feedback'
  | 'new-message'
  | 'message-request'
  | 'system-message'
  | 'promo-redemption';

export interface Notification {
  id: string;
  type: NotificationType;
  isRead: boolean;
  timestamp: Date;
  message: string;
  relatedUser?: User;
  link?: string;
  photo_url?: string;
}

export interface Story {
  id: string;
  userId: string;
  imageUrl: string;
  createdAt: Date;
  user: User;
  likes: StoryLike[];
}

export interface StoryLike {
  id: string;
  story_id: string;
  user_id: string;
}

export interface SwipeCard extends User {
  distance: number;
}

export interface SwipeStats {
  likes: number;
  passes: number;
  matches: number;
}

export interface AuthUser {
  id: string;
  email: string;
  phone?: string;
  isVerified: boolean;
  subscription: 'free' | 'pro' | 'vip';
  subscriptionExpiry?: Date;
}


