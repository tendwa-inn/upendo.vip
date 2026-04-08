export interface User {
  id: string;
  name: string;
  email?: string;
  password?: string;
  age: number;
  dateOfBirth: Date;
  gender: 'man' | 'woman';
  lookingFor: 'men' | 'women';
  tribe?: string;
  hereFor: ('Friendship' | 'Dating' | 'Hookups' | 'Serious Relationship')[];
  interests: string[];
  bio: string;
  photos: string[];
  location: {
    latitude: number;
    longitude: number;
    city: string;
  };
  subscription: 'free' | 'pro' | 'vip' | 'admin' | 'mod';
  isVerified: boolean;
  messageRequestsSent?: number;
  messageRequestResetDate?: Date;
  swipeCount?: number;
  replyRate?: number;
  lastActive: Date;
  online: boolean;
  preferences: {
    ageRange: [number, number];
    distance: number;
    gender: string;
  };
  aboutMe: {
    delicacies?: { food: string; photo?: string }[];
    travel?: { place: string; summary: string }[];
  };
  religion?: string;
  education?: 'not-completed' | 'student' | 'undergraduate' | 'postgraduate' | 'graduate' | 'diploma' | 'bachelors' | 'masters';
  height?: number;
  drinking?: 'never' | 'occasionally' | 'socially' | 'regularly';
  smoking?: 'never' | 'occasionally' | 'socially' | 'regularly';
  firstDate?: 'at-home' | 'at-the-gym' | 'at-the-club' | 'on-a-date';
}

export interface SwipeCard {
  id: string;
  user: User;
  isLiked: boolean | null;
  timestamp: Date;
}

export interface Match {
  id: string;
  user1: User;
  user2: User;
  timestamp: Date;
  lastMessage?: Message;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  type: 'text' | 'image';
}

export interface Subscription {
  type: 'free' | 'pro' | 'vip';
  swipeLimit: number;
  features: string[];
  price?: {
    weekly: number;
    monthly: number;
  };
}

export interface SwipeStats {
  dailySwipes: number;
  remainingSwipes: number;
  lastReset: Date;
  totalSwipes: number;
}

export interface AuthUser {
  id: string;
  email: string;
  phone?: string;
  isVerified: boolean;
  subscription: 'free' | 'pro' | 'vip' | 'admin' | 'mod';
  subscriptionExpiry?: Date;
}
