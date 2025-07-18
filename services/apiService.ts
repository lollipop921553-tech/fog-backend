import { Job, Testimonial, Survey, RewardTask, Transaction, User, Bid, Comment, Activity, Message } from '../types';

// This is a placeholder API service. In a real application, these functions
// would make network requests to a backend server.

const apiCall = <T,>(data: T, delay = 200): Promise<T> => {
    // Simulate a small network delay.
    console.log("API CALL (placeholder - returning mock success): ", data);
    return new Promise(resolve => setTimeout(() => resolve(data), delay));
};

// Functions returning empty arrays to prevent UI from breaking
export const getFreelanceJobs = (): Promise<Job[]> => apiCall([]);
export const getLocalTasks = (): Promise<Job[]> => apiCall([]);
export const getTestimonials = (): Promise<Testimonial[]> => apiCall([]);
export const getSurveys = (): Promise<Survey[]> => apiCall([]);
export const getRewardTasks = (): Promise<RewardTask[]> => apiCall([]);
export const getTransactions = (): Promise<Transaction[]> => apiCall([]);
export const getActivities = (userId: string): Promise<Activity[]> => apiCall([]);
export const getJobsByUserId = (userId: string): Promise<Job[]> => apiCall([]);
export const getBidsByJobId = (jobId: string | undefined): Promise<Bid[]> => apiCall([]);
export const getCommentsByJobId = (jobId: string | undefined): Promise<Comment[]> => apiCall([]);
export const getConversations = (userId: string): Promise<any[]> => apiCall([]);
export const getMessagesForConversation = (userId: string, otherUserId: string): Promise<Message[]> => apiCall([]);
export const getUnreadMessageCount = (userId: string): Promise<number> => apiCall(0);

// Functions returning null for single objects
export const getJobById = (id: string | undefined): Promise<Job | null> => apiCall(null);

// Functions that perform actions (create, update, delete)
// Note: In a real app, the `user` object would likely be used for authorization on the backend (e.g., from a JWT).
// We pass it here to simulate a real API call's signature.
export const addJob = (job: Job, user: User): Promise<Job> => apiCall(job);
export const updateJob = (updatedJob: Job, user: User): Promise<Job> => apiCall(updatedJob);
export const deleteJob = (jobId: string, user: User): Promise<{ success: true, id: string }> => apiCall({ success: true, id: jobId });

export const addMessage = (message: Message, user: User): Promise<Message> => apiCall(message);

export const addBid = (jobId: string | undefined, bid: Omit<Bid, 'id' | 'createdAt'>, user: User): Promise<Bid> => {
    const newBid: Bid = { ...bid, id: `b-${Date.now()}`, createdAt: new Date().toISOString() };
    return apiCall(newBid);
};

export const addComment = (jobId: string | undefined, comment: Omit<Comment, 'id' | 'createdAt'>, user: User): Promise<Comment> => {
    const newComment: Comment = { ...comment, id: `cm-${Date.now()}`, createdAt: new Date().toISOString() };
    return apiCall(newComment);
};

// Placeholder for reward actions
export const completeRewardTask = (taskId: string, user: User): Promise<{ success: true }> => apiCall({ success: true });
export const claimAdPoints = (points: number, user: User): Promise<{ success: true }> => apiCall({ success: true });


// Functions returning placeholder data for charts to avoid empty state but with zero values
export const getEarningsBreakdown = () => apiCall([
    { name: 'Freelance', value: 0, color: '#3b82f6' },
    { name: 'Tasks', value: 0, color: '#14b8a6' },
    { name: 'Rewards', value: 0, color: '#f59e0b' },
]);

export const getMonthlyActivity = () => apiCall([
    { name: 'Jul', value: 0 },
    { name: 'Aug', value: 0 },
    { name: 'Sep', value: 0 },
    { name: 'Oct', value: 0 },
]);