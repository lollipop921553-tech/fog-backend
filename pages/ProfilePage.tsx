
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getUserById, getJobsByUserId } from '../services/apiService';
import { User, Job } from '../types';
import BackButton from '../components/BackButton';
import JobCard from '../components/JobCard';
import { CheckBadgeIcon, StarIcon, ChatBubbleIcon, BriefcaseIcon, ZapIcon } from '../components/Icons';
import NotFoundPage from './NotFoundPage';

const ProfilePage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const { user: currentUser, isAuthenticated } = useAuth();
    const [profileUser, setProfileUser] = useState<User | null | undefined>(undefined);
    const [userJobs, setUserJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            setProfileUser(null);
            return;
        }

        setLoading(true);
        Promise.all([
            getUserById(userId),
            getJobsByUserId(userId)
        ]).then(([userData, jobsData]) => {
            setProfileUser(userData);
            setUserJobs(jobsData.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            setLoading(false);
        }).catch(err => {
            console.error("Failed to load profile data:", err);
            setProfileUser(null);
            setLoading(false);
        });
    }, [userId]);

    const handleMessageClick = (e: React.MouseEvent, targetUserId: string) => {
        e.preventDefault();
        e.stopPropagation();
        window.dispatchEvent(new CustomEvent('open-messages', { detail: { userId: targetUserId } }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full py-20">
                <div className="w-16 h-16 border-4 border-fog-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!profileUser) {
        return <NotFoundPage />;
    }

    const isOwnProfile = currentUser?.id === profileUser.id;

    return (
        <div className="animate-fade-in space-y-8">
            <BackButton />
            <div className="grid lg:grid-cols-12 gap-8">
                {/* Left Sidebar */}
                <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
                    <div className="bg-fog-white dark:bg-fog-mid-dark p-6 rounded-xl shadow-lg dark:shadow-2xl-dark text-center">
                        {profileUser.isPremium && <span className="absolute top-4 right-4 text-xs font-bold text-yellow-800 bg-yellow-300/50 px-2 py-1 rounded-full uppercase tracking-wider">PREMIUM</span>}
                        <img className="w-24 h-24 rounded-full mx-auto object-cover ring-4 ring-fog-accent/20" src={profileUser.avatarUrl} alt={profileUser.name} />
                        
                        <h1 className="mt-4 text-2xl font-bold text-fog-dark dark:text-fog-light flex items-center justify-center gap-2">
                            <span>{profileUser.name}</span>
                            {!isOwnProfile && isAuthenticated && (
                                <button 
                                    onClick={(e) => handleMessageClick(e, profileUser.id)}
                                    className="text-fog-accent hover:text-fog-accent-hover transition-colors p-1"
                                    aria-label={`Message ${profileUser.name}`}
                                >
                                    <ChatBubbleIcon className="w-6 h-6"/>
                                </button>
                            )}
                        </h1>

                        <p className="text-fog-mid dark:text-slate-400 text-sm">{profileUser.tagline}</p>
                        
                        <div className="mt-4 flex justify-center items-center flex-wrap gap-x-4 gap-y-1">
                            {profileUser.isIdVerified && <span className="flex items-center text-xs text-green-600 dark:text-green-400"><CheckBadgeIcon className="w-4 h-4 mr-1" /> ID Verified</span>}
                            {profileUser.isLinkedInVerified && <span className="flex items-center text-xs text-blue-600 dark:text-blue-400"><CheckBadgeIcon className="w-4 h-4 mr-1" /> LinkedIn</span>}
                        </div>
                    </div>
                     <div className="bg-fog-white dark:bg-fog-mid-dark p-6 rounded-xl shadow-lg dark:shadow-2xl-dark">
                        <h3 className="font-bold text-lg text-fog-dark dark:text-fog-light mb-4">Stats</h3>
                        <ul className="space-y-3">
                            <li className="flex justify-between text-sm"><span className="text-gray-500 dark:text-slate-400">Rating</span><span className="font-bold flex items-center gap-1">{profileUser.rating.toFixed(1)} <StarIcon className="w-4 h-4 text-yellow-400"/></span></li>
                            <li className="flex justify-between text-sm"><span className="text-gray-500 dark:text-slate-400">Jobs Completed</span><span className="font-bold">{profileUser.workHistory.length}</span></li>
                             <li className="flex justify-between text-sm"><span className="text-gray-500 dark:text-slate-400">Active Roles</span><span className="font-bold text-right">{profileUser.roles.join(', ')}</span></li>
                        </ul>
                    </div>
                </aside>
                {/* Right Content */}
                <main className="lg:col-span-8 xl:col-span-9 space-y-8">
                     <div className="bg-fog-white dark:bg-fog-mid-dark p-6 rounded-xl shadow-lg dark:shadow-2xl-dark">
                        <h2 className="text-xl font-bold text-fog-dark dark:text-fog-light mb-3">About {profileUser.name.split(' ')[0]}</h2>
                        <p className="text-gray-600 dark:text-slate-300 whitespace-pre-wrap">{profileUser.bio}</p>
                     </div>
                     <div className="bg-fog-white dark:bg-fog-mid-dark p-6 rounded-xl shadow-lg dark:shadow-2xl-dark">
                        <h3 className="font-bold text-lg text-fog-dark dark:text-fog-light mb-4">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {profileUser.skills.map(skill => (
                                <span key={skill} className="px-3 py-1 bg-fog-accent/10 text-fog-accent text-sm font-medium rounded-full">{skill}</span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-fog-dark dark:text-fog-light mb-4">Active Listings by {profileUser.name.split(' ')[0]} ({userJobs.length})</h2>
                        {userJobs.length > 0 ? (
                            <div className="grid md:grid-cols-2 gap-6">
                                {userJobs.map(job => (
                                    <JobCard key={job.id} job={job} />
                                ))}
                            </div>
                        ) : (
                             <div className="text-center py-12 bg-fog-white dark:bg-fog-mid-dark rounded-xl shadow-lg dark:shadow-2xl-dark">
                                <BriefcaseIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-slate-600" />
                                <h3 className="mt-2 text-xl font-semibold text-fog-dark dark:text-fog-light">No Active Listings</h3>
                                <p className="text-fog-mid dark:text-slate-400 mt-1">This user does not have any active job posts at the moment.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ProfilePage;
