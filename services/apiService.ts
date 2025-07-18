

import { supabase } from './supabaseClient';
import { Job, Testimonial, Survey, RewardTask, Transaction, User, Bid, Comment, Activity, Message, Role, JobType, JobPosterInfo, ConversationSummary } from '../types';

// --- HELPERS ---
const isUUID = (id: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

// --- MAPPERS ---
// Map data from snake_case (DB) to camelCase (frontend)

const mapProfile = (profile: any): User => ({
    id: profile.id,
    name: profile.name,
    email: profile.email,
    avatarUrl: profile.avatar_url,
    tagline: profile.tagline,
    roles: profile.roles,
    points: profile.points,
    usdBalance: profile.usd_balance,
    rating: profile.rating,
    skills: profile.skills,
    isIdVerified: profile.is_id_verified,
    isLinkedInVerified: profile.is_linkedin_verified,
    isPremium: profile.is_premium,
    bio: profile.bio,
    // These are populated by other queries, default to empty/0
    workHistory: [], 
    unreadMessages: 0,
});

const mapJob = (job: any): Job => ({
    id: job.id,
    title: job.title,
    description: job.description,
    type: job.type,
    budget: job.budget,
    skills: job.skills,
    location: job.location,
    postedBy: {
        id: job.postedBy.id,
        name: job.postedBy.name,
        avatarUrl: job.postedBy.avatar_url,
        rating: job.postedBy.rating,
        isPremium: job.postedBy.is_premium,
    },
    isSponsored: job.is_sponsored,
    createdAt: job.created_at,
    allowsPointDiscount: job.allows_point_discount,
});

const mapActivity = (activity: any): Activity => ({
    id: activity.id,
    type: activity.type,
    text: activity.text,
    timestamp: activity.timestamp,
    isRead: activity.is_read,
    link: activity.link,
    user: activity.user ? {
        id: activity.user.id,
        name: activity.user.name,
        avatarUrl: activity.user.avatar_url,
    } : undefined
});

// --- API FUNCTIONS ---

export const getFreelanceJobs = async (): Promise<Job[]> => {
    const { data, error } = await supabase
        .from('jobs')
        .select(`*, postedBy:posted_by_id(id, name, avatar_url, rating, is_premium)`)
        .eq('type', 'freelance')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching freelance jobs:', error.message);
        return [];
    }
    return data.map(mapJob);
};

export const getLocalTasks = async (): Promise<Job[]> => {
    const { data, error } = await supabase
        .from('jobs')
        .select(`*, postedBy:posted_by_id(id, name, avatar_url, rating, is_premium)`)
        .eq('type', 'task')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching local tasks:', error.message);
        return [];
    }
    return data.map(mapJob);
};

export const getJobById = async (id: string | undefined): Promise<Job | null> => {
    if (!id || !isUUID(id)) return null;
    const { data, error } = await supabase
        .from('jobs')
        .select(`*, postedBy:posted_by_id(id, name, avatar_url, rating, is_premium)`)
        .eq('id', id)
        .single();
    if (error) {
        // Don't log "no rows" as an error for .single()
        if (error.code !== 'PGRST116') {
             console.error(`Error fetching job ${id}:`, error.message);
        }
        return null;
    }
    return data ? mapJob(data) : null;
};

export const getUserById = async (id: string | undefined): Promise<User | null> => {
    if (!id || !isUUID(id)) return null;
    const { data: profileData, error } = await supabase.from('profiles').select('id, name, email, avatar_url, tagline, roles, points, usd_balance, rating, skills, is_id_verified, is_linkedin_verified, is_premium, bio').eq('id', id).single();
    if (error) {
        // Don't log "no rows" as an error for .single()
         if (error.code !== 'PGRST116') {
            console.error(`Error fetching user ${id}:`, error.message);
         }
        return null;
    }
    if (!profileData) return null;

    const user = mapProfile(profileData);

    const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select(`id, title, description, type, budget, skills, location, is_sponsored, created_at, allows_point_discount`)
        .eq('posted_by_id', id);

    if (jobsError) {
        console.error(`Error fetching jobs for user ${id}:`, jobsError.message);
        user.workHistory = [];
    } else {
        user.workHistory = jobsData.map((dbJob: any): Omit<Job, 'postedBy'> => ({
            id: dbJob.id,
            title: dbJob.title,
            description: dbJob.description,
            type: dbJob.type,
            budget: dbJob.budget,
            skills: dbJob.skills,
            location: dbJob.location,
            isSponsored: dbJob.is_sponsored,
            createdAt: dbJob.created_at,
            allowsPointDiscount: dbJob.allows_point_discount,
        }));
    }

    const unreadMessages = await getUnreadMessageCount(id);
    user.unreadMessages = unreadMessages;
    return user;
};


export const getJobsByUserId = async (userId: string | undefined): Promise<Job[]> => {
    if (!userId || !isUUID(userId)) return [];
    const { data, error } = await supabase
        .from('jobs')
        .select(`*, postedBy:posted_by_id(id, name, avatar_url, rating, is_premium)`)
        .eq('posted_by_id', userId);
    if (error) {
        console.error(`Error fetching jobs for user ${userId}:`, error.message);
        return [];
    }
    return data.map(mapJob);
};

export const addJob = async (job: Omit<Job, 'id' | 'createdAt'>, user: User): Promise<Job> => {
    const { data, error } = await supabase
        .from('jobs')
        .insert([{
            title: job.title,
            description: job.description,
            type: job.type,
            budget: job.budget,
            skills: job.skills,
            location: job.location,
            posted_by_id: user.id,
            is_sponsored: false,
            allows_point_discount: job.allowsPointDiscount,
        }] as any)
        .select('id, created_at')
        .single();

    if (error || !data) throw new Error(error?.message || 'Failed to create job');
    
    const newJob: Job = {
        ...job,
        id: data.id,
        createdAt: data.created_at,
    };
    return newJob;
};

export const updateJob = async (updatedJob: Job, user: User): Promise<Job> => {
    if (!updatedJob.id || !isUUID(updatedJob.id)) throw new Error("Invalid job ID for update.");
    const { error } = await supabase
        .from('jobs')
        .update({
            title: updatedJob.title,
            description: updatedJob.description,
            budget: updatedJob.budget,
            skills: updatedJob.skills,
            location: updatedJob.location,
        } as any)
        .eq('id', updatedJob.id)
        .eq('posted_by_id', user.id); // Ensure only owner can update
        
    if (error) throw new Error(error.message);
    return updatedJob;
};

export const deleteJob = async (jobId: string, user: User): Promise<{ success: boolean; id: string }> => {
    if (!jobId || !isUUID(jobId)) return { success: false, id: jobId };
    const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId)
        .eq('posted_by_id', user.id); // Ensure only owner can delete
        
    if (error) throw new Error(error.message);
    return { success: true, id: jobId };
};

export const getBidsByJobId = async (jobId: string | undefined): Promise<Bid[]> => {
    if(!jobId || !isUUID(jobId)) return [];
    const { data, error } = await supabase
        .from('bids')
        .select(`*, user:user_id(id, name, avatar_url, rating, is_premium, is_id_verified)`)
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error(`Error fetching bids for job ${jobId}:`, error.message);
        return [];
    }
    return data.map(bid => ({
        id: bid.id,
        amount: bid.amount,
        message: bid.message,
        createdAt: bid.created_at,
        user: {
            id: bid.user.id,
            name: bid.user.name,
            avatarUrl: bid.user.avatar_url,
            rating: bid.user.rating,
            isPremium: bid.user.is_premium,
            isIdVerified: bid.user.is_id_verified,
        }
    }));
};

export const addBid = async (jobId: string, bid: Omit<Bid, 'id' | 'createdAt'>, user: User): Promise<Bid> => {
    if (!jobId || !isUUID(jobId)) throw new Error("Invalid job ID for bid.");
    const { data, error } = await supabase
        .from('bids')
        .insert([{
            job_id: jobId,
            user_id: user.id,
            amount: bid.amount,
            message: bid.message
        }] as any)
        .select(`*, user:user_id(id, name, avatar_url, rating, is_premium, is_id_verified)`)
        .single();
    if (error || !data) throw new Error(error?.message || 'Failed to add bid');
    return {
        id: data.id,
        amount: data.amount,
        message: data.message,
        createdAt: data.created_at,
        user: {
            id: data.user.id,
            name: data.user.name,
            avatarUrl: data.user.avatar_url,
            rating: data.user.rating,
            isPremium: data.user.is_premium,
            isIdVerified: data.user.is_id_verified,
        }
    };
};

export const getCommentsByJobId = async (jobId: string | undefined): Promise<Comment[]> => {
     if(!jobId || !isUUID(jobId)) return [];
    const { data, error } = await supabase
        .from('comments')
        .select(`*, user:user_id(id, name, avatar_url)`)
        .eq('job_id', jobId)
        .order('created_at', { ascending: true });
    
    if (error) {
        console.error(`Error fetching comments for job ${jobId}:`, error.message);
        return [];
    }
    return data.map(comment => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.created_at,
        user: {
            id: comment.user.id,
            name: comment.user.name,
            avatarUrl: comment.user.avatar_url,
        }
    }));
};

export const addComment = async (jobId: string, comment: Omit<Comment, 'id'|'createdAt'>, user: User): Promise<Comment> => {
    if (!jobId || !isUUID(jobId)) throw new Error("Invalid job ID for comment.");
    const { data, error } = await supabase
        .from('comments')
        .insert([{
            job_id: jobId,
            user_id: user.id,
            content: comment.content,
        }] as any)
        .select(`*, user:user_id(id, name, avatar_url)`)
        .single();
    if (error || !data) throw new Error(error?.message || 'Failed to add comment');
    return {
        id: data.id,
        content: data.content,
        createdAt: data.created_at,
        user: {
            id: data.user.id,
            name: data.user.name,
            avatarUrl: data.user.avatar_url,
        }
    };
};

export const addMessage = async (message: Message, user: User): Promise<Message> => {
    const { data, error } = await supabase
        .rpc('send_message', {
            p_sender_id: user.id,
            p_recipient_id: message.recipientId,
            p_content: message.content,
            p_job_id: message.jobId
        });

    if (error) {
        console.error('Error sending message via RPC:', error.message);
        throw new Error(error.message);
    }
    // RPC returns the new message ID, but for consistency we return the optimistic message object
    return message;
};

export const getConversations = async (userId: string): Promise<ConversationSummary[]> => {
    if (!userId || !isUUID(userId)) return [];
    const { data, error } = await supabase.rpc('get_user_conversations', { p_user_id: userId });

    if (error) {
        console.error('Error fetching conversations:', error.message);
        return [];
    }

    if (!data) return [];

    return data.map((convo: any): ConversationSummary => ({
        otherUser: convo.other_user,
        lastMessage: convo.last_message,
        unreadCount: convo.unread_count,
        isBuying: convo.is_buying,
    }));
};

export const getMessagesForConversation = async (userId: string, otherUserId: string): Promise<Message[]> => {
    if (!userId || !isUUID(userId) || !otherUserId || !isUUID(otherUserId)) return [];
    const { data, error } = await supabase
        .from('messages')
        .select('id, sender_id, recipient_id, content, created_at, read_at, job_id')
        .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`)
        .order('created_at', { ascending: true });
        
    if (error) {
        console.error(`Error fetching messages between ${userId} and ${otherUserId}:`, error.message);
        return [];
    }
    
    // Mark messages as read
    const unreadMessageIds = data.filter(m => m.recipient_id === userId && !m.read_at).map(m => m.id);
    if (unreadMessageIds.length > 0) {
        await supabase.from('messages').update({ read_at: new Date().toISOString() } as any).in('id', unreadMessageIds);
    }

    return data.map(msg => ({
        id: msg.id,
        senderId: msg.sender_id,
        recipientId: msg.recipient_id,
        content: msg.content,
        timestamp: msg.created_at,
        readAt: msg.read_at,
        jobId: msg.job_id,
        jobSubject: '' // This needs another join, maybe add later if needed
    }));
};

export const getUnreadMessageCount = async (userId: string): Promise<number> => {
    if (!userId || !isUUID(userId)) return 0;
    const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .is('read_at', null);

    if (error) {
        console.error('Error fetching unread message count:', error.message);
        return 0;
    }
    return count || 0;
};

// --- STATIC & MOCK-LIKE FUNCTIONS (can be replaced with DB queries later) ---

export const getTestimonials = async (): Promise<Testimonial[]> => {
    const { data, error } = await supabase.from('testimonials').select('*');
    if (error) {
        console.error('Error fetching testimonials:', error.message);
        return [];
    }
    return data || [];
};
export const getSurveys = async (): Promise<Survey[]> => {
    const { data, error } = await supabase.from('surveys').select('*');
    if (error) {
        console.error('Error fetching surveys:', error.message);
        return [];
    }
    return data || [];
};
export const getRewardTasks = async (): Promise<RewardTask[]> => {
    const { data, error } = await supabase.from('reward_tasks').select('*');
    if (error) {
        console.error('Error fetching reward tasks:', error.message);
        return [];
    }
    return data || [];
};

export const getTransactions = async (userId: string | undefined): Promise<Transaction[]> => {
    if(!userId || !isUUID(userId)) return [];
    const { data, error } = await supabase
        .from('transactions')
        .select('id, date, description, amount, status, type')
        .eq('user_id', userId)
        .order('date', { ascending: false });

    if(error) {
        console.error('Error fetching transactions:', error.message);
        return [];
    }
    return data.map(tx => ({
        id: tx.id,
        date: tx.date,
        description: tx.description,
        amount: (tx.type === 'Deposit' || tx.type === 'Earning' ? '+' : '-') + `$${Number(tx.amount).toFixed(2)}`,
        status: tx.status,
        type: tx.type,
    }));
};

export const getActivities = async (userId: string | undefined): Promise<Activity[]> => {
    if(!userId || !isUUID(userId)) return [];
    const { data, error } = await supabase
        .from('activities')
        .select(`*, user:related_user_id (id, name, avatar_url)`)
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(20);

    if (error) {
        console.error('Error fetching activities:', error.message);
        return [];
    }
    return data.map(mapActivity);
};

export const completeRewardTask = async (taskId: string, user: User): Promise<{ success: boolean }> => {
    if (!taskId || !isUUID(taskId)) return { success: false };
    // This would involve complex logic, for now, just return success
    console.log(`User ${user.id} completed task ${taskId}`);
    return { success: true };
};

export const claimAdPoints = async (points: number, user: User): Promise<{ success: boolean }> => {
    const { error } = await supabase
        .rpc('increment_points', { p_user_id: user.id, p_points_to_add: points });

    if (error) {
        console.error('Error claiming ad points:', error.message);
        throw new Error(error.message);
    }
    return { success: true };
};

// Dashboard charts - requires complex aggregation, better done with DB functions.
// For now, return static data.
export const getEarningsBreakdown = () => Promise.resolve([
    { name: 'Freelance', value: 3400, color: '#3b82f6' },
    { name: 'Tasks', value: 150, color: '#14b8a6' },
    { name: 'Rewards', value: 820, color: '#f59e0b' },
]);
export const getMonthlyActivity = () => Promise.resolve([
    { name: 'Jul', value: 12 },
    { name: 'Aug', value: 19 },
    { name: 'Sep', value: 32 },
    { name: 'Oct', value: 28 },
]);