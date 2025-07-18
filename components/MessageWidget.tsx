import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Message, User } from '../types';
import { getConversations, getMessagesForConversation, addMessage, getUnreadMessageCount } from '../services/apiService';
import { generateMessageReply } from '../services/geminiService';
import { Link } from 'react-router-dom';
import { XIcon, MessageIcon as MessageBubbleIcon, AIIcon, PaperClipIcon, PhotoIcon, MicrophoneIcon, SendIcon, StopIcon, CheckIcon, DoubleCheckIcon } from './Icons';
import BackButton from './BackButton';

type ConversationSummary = {
    otherUser: Pick<User, 'id' | 'name' | 'avatarUrl'>;
    lastMessage: Message;
    unreadCount: number;
    isBuying: boolean;
};

const MessageWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, isAuthenticated, unreadMessages, setUnreadMessages } = useAuth();
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [activeConversation, setActiveConversation] = useState<ConversationSummary | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'buying' | 'selling'>('buying');
    
    const [isGeneratingReply, setIsGeneratingReply] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [attachment, setAttachment] = useState<File | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messageInputRef = useRef<HTMLInputElement>(null);

    // Centralized polling for unread messages
    useEffect(() => {
        if (isAuthenticated && user) {
            const fetchCount = async () => {
                try {
                    const count = await getUnreadMessageCount(user.id);
                    setUnreadMessages(count);
                } catch (error) {
                    console.error("Failed to fetch unread message count:", error);
                }
            };

            fetchCount(); // Initial fetch
            const intervalId = setInterval(fetchCount, 15000); // Poll every 15 seconds

            return () => clearInterval(intervalId); // Cleanup on unmount
        }
    }, [isAuthenticated, user, setUnreadMessages]);

    const refreshConversations = () => {
         if (user) {
            setLoading(true);
            getConversations(user.id).then(data => {
                setConversations(data);
                if (activeConversation) {
                    const refreshedActive = data.find(c => c.otherUser.id === activeConversation.otherUser.id);
                    if (refreshedActive && refreshedActive.isBuying === (activeTab === 'buying')) {
                       setActiveConversation(refreshedActive);
                    } else {
                       setActiveConversation(null);
                    }
                }
            }).finally(() => {
                setLoading(false);
            });
        }
    }
    
    useEffect(() => {
        if (isOpen && user) {
            refreshConversations();
        }
    }, [isOpen, user, activeTab]);
    
    useEffect(() => {
        if (activeConversation && user) {
            getMessagesForConversation(user.id, activeConversation.otherUser.id).then(setMessages);
            const convoToUpdate = conversations.find(c => c.otherUser.id === activeConversation.otherUser.id);
            if(convoToUpdate && convoToUpdate.unreadCount > 0){
                 setUnreadMessages(Math.max(0, unreadMessages - convoToUpdate.unreadCount));
            }
            setConversations(prev => prev.map(c => c.otherUser.id === activeConversation.otherUser.id ? { ...c, unreadCount: 0 } : c));
        } else {
            setMessages([]);
        }
    }, [activeConversation, user]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const input = messageInputRef.current;
        if (!user || !activeConversation || !input) return;

        const content = input.value;
        if (!content.trim() && !attachment) return;

        const newMessage: Message = {
            id: `msg-${Date.now()}`,
            senderId: user.id,
            recipientId: activeConversation.otherUser.id,
            content: attachment ? `Sent attachment: ${attachment.name}` : content,
            timestamp: new Date().toISOString(),
            readAt: null, 
            jobId: activeConversation.lastMessage.jobId,
            jobSubject: activeConversation.lastMessage.jobSubject,
        };

        setMessages(prev => [...prev, newMessage]);
        setConversations(prev => {
            const convoIndex = prev.findIndex(c => c.otherUser.id === activeConversation.otherUser.id);
            if(convoIndex === -1) return prev;
            const updatedConvo = { ...prev[convoIndex], lastMessage: newMessage };
            const restConvos = prev.filter(c => c.otherUser.id !== activeConversation.otherUser.id);
            return [updatedConvo, ...restConvos];
        })
        
        await addMessage(newMessage, user);
        setAttachment(null);
        form.reset();
    };
    
    const handleAiAssist = async () => {
        if (!user || !activeConversation || messages.length === 0) return;
        const lastMessage = messages.slice().reverse().find(m => m.senderId !== user.id);
        if (!lastMessage) return;

        setIsGeneratingReply(true);
        const reply = await generateMessageReply(lastMessage, user);
        if(messageInputRef.current) {
            messageInputRef.current.value = reply;
        }
        setIsGeneratingReply(false);
        messageInputRef.current?.focus();
    };

    const handleAttachmentClick = () => fileInputRef.current?.click();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setAttachment(e.target.files[0]);
    };

    const handleRecordVoice = () => {
        if (!isRecording) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => { setIsRecording(true); })
                .catch(err => alert("Microphone access denied."));
        } else {
            setIsRecording(false);
        }
    };

    const handleToggleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsOpen(prev => !prev);
    };

    const closeWidget = () => {
        setIsOpen(false);
    };

    if (!isAuthenticated) return null;

    const filteredConversations = conversations.filter(c => c.isBuying === (activeTab === 'buying'));
    
    return (
        <div className="fixed bottom-24 right-5 z-[55]">
            {isOpen && (
                <div 
                    className="absolute bottom-full right-0 mb-2 w-[calc(100vw-2.5rem)] sm:w-[70vw] md:w-[60vw] lg:w-[50vw] max-w-3xl h-[calc(100vh-7.5rem)] sm:h-[65vh] max-h-[600px] bg-fog-white/50 dark:bg-fog-dark/50 backdrop-blur-xl rounded-2xl shadow-2xl dark:shadow-2xl-dark flex overflow-hidden animate-fade-in-up origin-bottom-right border border-black/10 dark:border-white/10"
                >
                    {/* Conversations List */}
                    <div className={`w-full ${activeConversation ? 'hidden' : 'flex'} sm:w-2/5 md:w-1/3 xl:w-1/4 border-r border-black/10 dark:border-white/10 flex-col bg-white/30 dark:bg-fog-dark/30`}>
                        <header className="p-4 border-b border-black/10 dark:border-white/10 flex justify-between items-center flex-shrink-0">
                            <h2 className="text-xl font-bold text-fog-dark dark:text-fog-light">Inbox</h2>
                        </header>
                        <div className="p-2 border-b border-black/10 dark:border-white/10 flex-shrink-0">
                             <div className="flex bg-gray-200 dark:bg-slate-900 rounded-md p-1">
                                <button onClick={() => setActiveTab('buying')} className={`w-1/2 py-1.5 text-sm font-semibold rounded ${activeTab === 'buying' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-gray-500 dark:text-slate-400'}`}>Buying</button>
                                <button onClick={() => setActiveTab('selling')} className={`w-1/2 py-1.5 text-sm font-semibold rounded ${activeTab === 'selling' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-gray-500 dark:text-slate-400'}`}>Selling</button>
                            </div>
                        </div>
                        <div className="flex-grow overflow-y-auto">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="w-6 h-6 border-2 border-fog-accent border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : filteredConversations.length > 0 ? (
                                filteredConversations.map(convo => (
                                    <div key={convo.otherUser.id} onClick={() => setActiveConversation(convo)}
                                        className={`p-3 flex items-start gap-3 cursor-pointer border-l-4 ${activeConversation?.otherUser.id === convo.otherUser.id ? 'bg-fog-accent/10 border-fog-accent' : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'}`}>
                                        <div className="relative flex-shrink-0">
                                            <img src={convo.otherUser.avatarUrl} alt={convo.otherUser.name} className="w-12 h-12 rounded-full" />
                                            {convo.unreadCount > 0 && <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-fog-accent ring-2 ring-white dark:ring-fog-dark/50"/>}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="flex justify-between items-baseline">
                                                <p className="font-semibold text-fog-dark dark:text-fog-light truncate">{convo.otherUser.name}</p>
                                                <p className="text-xs text-gray-400 dark:text-slate-500 flex-shrink-0">{new Date(convo.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-slate-400 truncate">{convo.lastMessage.jobSubject}</p>
                                            <p className={`text-sm truncate mt-1 ${convo.unreadCount > 0 ? 'text-fog-dark dark:text-fog-light font-bold' : 'text-gray-500 dark:text-slate-400'}`}>{convo.lastMessage.content}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-slate-400 p-6">
                                    <MessageBubbleIcon className="w-16 h-16 text-gray-300 dark:text-slate-600 mb-4"/>
                                    <h3 className="text-lg font-semibold text-fog-dark dark:text-fog-light">No Conversations</h3>
                                    <p className="text-sm">There are no conversations in your '{activeTab}' tab yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat Window */}
                    <div className={`flex-1 flex-col ${activeConversation ? 'flex' : 'hidden'} sm:flex`}>
                        {activeConversation && user ? (
                            <>
                                <header className="p-3 border-b border-black/10 dark:border-white/10 flex items-center gap-3 bg-white/30 dark:bg-fog-dark/30 flex-shrink-0">
                                    <BackButton onClick={() => setActiveConversation(null)} className="!mb-0" />
                                     <img src={activeConversation.otherUser.avatarUrl} alt={activeConversation.otherUser.name} className="w-10 h-10 rounded-full" />
                                     <div>
                                        <h3 className="font-bold text-fog-dark dark:text-fog-light">{activeConversation.otherUser.name}</h3>
                                        {activeConversation.lastMessage.jobSubject && <Link to={`/job/${activeConversation.lastMessage.jobId}`} onClick={closeWidget} className="text-sm text-fog-accent hover:underline">{activeConversation.lastMessage.jobSubject}</Link>}
                                     </div>
                                </header>
                                <main className="flex-grow overflow-y-auto p-4 space-y-1">
                                    {messages.map((msg, index) => {
                                        const isCurrentUser = msg.senderId === user.id;
                                        const prevMsg = messages[index - 1];
                                        const nextMsg = messages[index + 1];
                                        const isFirstInGroup = !prevMsg || prevMsg.senderId !== msg.senderId;
                                        const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId;

                                        let bubbleClasses = ' ';
                                        if (isCurrentUser) {
                                            bubbleClasses += isLastInGroup ? 'rounded-br-none' : 'rounded-br-lg';
                                            bubbleClasses += isFirstInGroup ? 'rounded-tr-lg' : 'rounded-tr-lg';
                                        } else {
                                            bubbleClasses += isLastInGroup ? 'rounded-bl-none' : 'rounded-bl-lg';
                                            bubbleClasses += isFirstInGroup ? 'rounded-tl-lg' : 'rounded-tl-lg';
                                        }

                                        return (
                                        <div key={msg.id} className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'} ${!isLastInGroup ? 'mb-1' : 'mb-3'}`}>
                                            {!isCurrentUser && isLastInGroup && <img src={activeConversation.otherUser.avatarUrl} className="w-6 h-6 rounded-full self-start" alt="" />}
                                            {!isCurrentUser && !isLastInGroup && <div className="w-6"/>}
                                            <div className={`max-w-xs md:max-w-md p-3 rounded-xl shadow-sm ${isCurrentUser ? 'bg-fog-accent text-white' : 'bg-white dark:bg-slate-700'} ${bubbleClasses}`}>
                                                <p className="text-sm break-words">{msg.content}</p>
                                            </div>
                                             {isCurrentUser && (
                                                <div className="self-end mb-1">
                                                    {msg.readAt ? <DoubleCheckIcon className="w-4 h-4 text-blue-400" /> : <CheckIcon className="w-4 h-4 text-gray-400 dark:text-slate-500" />}
                                                </div>
                                            )}
                                        </div>
                                    )})}
                                    <div ref={messagesEndRef} />
                                </main>
                                <footer className="p-2 sm:p-3 border-t border-black/10 dark:border-white/10 bg-white/30 dark:bg-fog-dark/30 flex-shrink-0">
                                    {attachment && (
                                        <div className="px-4 pb-2 flex items-center justify-between text-sm">
                                            <div className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                                <PaperClipIcon className="w-4 h-4" />
                                                <span className="truncate max-w-xs">{attachment.name}</span>
                                            </div>
                                            <button onClick={() => setAttachment(null)} className="text-red-500 hover:text-red-700"><XIcon /></button>
                                        </div>
                                    )}
                                    <form onSubmit={handleSendMessage} className="flex items-center gap-1 sm:gap-2">
                                        <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" />
                                        <button onClick={handleAttachmentClick} type="button" title="Attach file" className="p-2 text-gray-500 dark:text-gray-400 hover:text-fog-accent dark:hover:text-fog-light rounded-full transition-colors"><PaperClipIcon className="w-5 h-5" /></button>
                                        <div className="flex-1 relative">
                                            <input ref={messageInputRef} name="message" type="text" placeholder="Type a message..." autoComplete="off" disabled={isGeneratingReply || isRecording} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-full bg-gray-100 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-fog-accent disabled:opacity-50"/>
                                            {isGeneratingReply && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-fog-accent border-t-transparent rounded-full animate-spin"></div>}
                                        </div>
                                        <button onClick={handleAiAssist} disabled={isGeneratingReply} type="button" title="Use AI assist" className="p-2 text-gray-500 dark:text-gray-400 hover:text-fog-accent dark:hover:text-fog-light rounded-full transition-colors disabled:opacity-50"><AIIcon className="w-5 h-5" /></button>
                                        <button onClick={handleRecordVoice} type="button" title="Record voice note" className={`p-2 rounded-full transition-colors ${isRecording ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-fog-accent dark:hover:text-fog-light'}`}>{isRecording ? <StopIcon className="w-5 h-5"/> : <MicrophoneIcon className="w-5 h-5" />}</button>
                                        <button type="submit" title="Send message" className="p-3 text-white bg-fog-accent rounded-full transition-colors hover:bg-fog-accent-hover shadow-sm flex-shrink-0"><SendIcon className="w-5 h-5" /></button>
                                    </form>
                                </footer>
                            </>
                        ) : (
                            <div className="flex-grow flex-col items-center justify-center text-center text-gray-500 dark:text-slate-400 p-8 hidden sm:flex">
                                <MessageBubbleIcon className="w-16 h-16 text-gray-300 dark:text-slate-600 mb-4"/>
                                <h3 className="text-xl font-semibold text-fog-dark dark:text-fog-light">Your Messages</h3>
                                <p>Select a conversation to start chatting.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            <button
                type="button"
                onClick={handleToggleClick}
                className="bg-fog-accent text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:bg-fog-accent-hover transition-all transform hover:scale-110 focus:outline-none relative"
                aria-label="Toggle Messages"
            >
                {isOpen ? <XIcon /> : <MessageBubbleIcon />}
                {unreadMessages > 0 && !isOpen && (
                    <span className="absolute -top-1 -right-1 block h-5 w-5 text-xs flex items-center justify-center rounded-full bg-red-500 ring-2 ring-white dark:ring-fog-dark">{unreadMessages}</span>
                )}
            </button>
        </div>
    );
};

export default MessageWidget;