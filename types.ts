


export enum Role {
  Freelancer = 'Freelancer',
  Tasker = 'Tasker',
  Client = 'Client',
  Viewer = 'Viewer',
}

export enum JobType {
  Freelance = 'freelance',
  Task = 'task'
}

export interface JobPosterInfo {
  id: string;
  name: string;
  avatarUrl: string;
  rating: number;
  isPremium: boolean;
}

export interface BidderInfo {
    id: string;
    name: string;
    avatarUrl: string;
    rating: number;
    isPremium: boolean;
    isIdVerified: boolean;
}

export interface CommenterInfo {
    id: string;
    name: string;
    avatarUrl: string;
}

export interface ActivityUserInfo {
    id: string;
    name: string;
    avatarUrl: string;
}

export interface ConversationSummary {
    otherUser: Pick<User, 'id' | 'name' | 'avatarUrl'>;
    lastMessage: Message;
    unreadCount: number;
    isBuying: boolean;
};

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  tagline: string;
  roles: Role[];
  points: number;
  usdBalance: number;
  rating: number;
  skills: string[];
  isIdVerified: boolean;
  isLinkedInVerified: boolean;
  isPremium: boolean;
  workHistory: Omit<Job, 'postedBy'>[];
  bio: string;
  unreadMessages: number;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  type: JobType;
  budget: number;
  skills: string[];
  location?: string; // Only for tasks
  postedBy: JobPosterInfo;
  isSponsored: boolean;
  createdAt: string;
  allowsPointDiscount?: boolean;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  quote: string;
  avatarUrl: string;
}

export interface Survey {
    id: string;
    title: string;
    description: string;
    points: number;
}

export interface RewardTask {
    id: string;
    title: string;
    description: string;
    reward: string; // e.g., "500 Points" or "$5.00"
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: string;
  readAt: string | null;
  jobId?: string;
  jobSubject?: string;
}


export interface Transaction {
    id: string;
    date: string;
    description: string;
    amount: string;
    status: 'Completed' | 'Pending' | 'Failed';
    type: 'Deposit' | 'Withdrawal' | 'Earning' | 'Expense';
}

export interface Bid {
  id: string;
  user: BidderInfo;
  amount: number;
  message: string;
  createdAt: string;
}

export interface Comment {
  id:string;
  user: CommenterInfo;
  content: string;
  createdAt: string;
}

export interface Activity {
    id: string;
    type: 'message' | 'bid' | 'job_completed' | 'withdrawal' | 'job_posted';
    text: string;
    timestamp: string;
    isRead: boolean;
    link?: string;
    user?: ActivityUserInfo;
}