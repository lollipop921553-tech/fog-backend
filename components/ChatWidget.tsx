import React, { useState, useEffect, useRef } from 'react';
import { ChatBubbleIcon, XIcon, AIIcon, SendIcon } from './Icons';
import { useAuth } from '../hooks/useAuth';
import { generateAIChatResponseStream, ChatHistoryPart } from '../services/geminiService';

interface ChatMessage {
    id: string;
    sender: 'user' | 'ai';
    content: string;
}

const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const initialMessage: ChatMessage = {
        id: 'ai-welcome',
        sender: 'ai',
        content: `Hello ${user ? user.name.split(' ')[0] : 'there'}! I'm Foggy, the FOG AI assistant. How can I help you today?`
    };

    useEffect(() => {
        if (isOpen) {
            setMessages([initialMessage]);
            setHasInteracted(false);
        }
    }, [isOpen, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSendMessage = async (messageText: string) => {
        if (!messageText.trim() || isLoading) return;
        setHasInteracted(true);

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            sender: 'user',
            content: messageText,
        };
        
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setIsLoading(true);

        // Format history for the API, excluding the initial canned greeting.
        const history: ChatHistoryPart[] = newMessages
            .filter(msg => msg.id !== 'ai-welcome')
            .map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }],
            }));

        try {
            const stream = generateAIChatResponseStream(history, user?.name ?? 'there');
            
            let aiMessage: ChatMessage = {
                id: `ai-${Date.now()}`,
                sender: 'ai',
                content: '',
            };

            // Add a placeholder for the AI message
            setMessages(prev => [...prev, aiMessage]);

            for await (const chunk of stream) {
                aiMessage.content += chunk;
                // Update the placeholder message with new content
                setMessages(prev => prev.map(m => m.id === aiMessage.id ? { ...aiMessage } : m));
            }
        } catch (error) {
            console.error("AI Error:", error);
            const errorMessage: ChatMessage = {
                id: `ai-error-${Date.now()}`,
                sender: 'ai',
                content: "Sorry, I'm having trouble connecting right now. Please try again later.",
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (inputRef.current) {
            handleSendMessage(inputRef.current.value);
            inputRef.current.value = '';
        }
    };
    
    const handleQuickReply = (text: string) => {
        if (inputRef.current) {
            inputRef.current.value = text;
            handleSendMessage(text);
            inputRef.current.value = '';
        }
    };

    const toggleChat = () => setIsOpen(!isOpen);

    const quickReplies = [
        "How do I post a job?",
        "How do I get paid?",
        "What are FOG Points?"
    ];

    return (
        <div className="fixed bottom-5 right-5 z-[60]">
            {isOpen && (
                <div className="absolute bottom-full right-0 mb-2 w-[calc(100vw-2.5rem)] sm:w-[450px] h-[calc(100vh-7.5rem)] sm:h-[70vh] max-h-[600px] bg-fog-white/50 dark:bg-fog-dark/50 backdrop-blur-xl rounded-2xl shadow-2xl dark:shadow-2xl-dark flex flex-col overflow-hidden animate-fade-in-up origin-bottom-right border border-black/10 dark:border-white/10">
                    <header className="flex items-center justify-between p-4 bg-fog-accent text-white rounded-t-xl flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <AIIcon className="w-6 h-6" />
                            <h3 className="font-bold">AI Customer Service</h3>
                        </div>
                        <button onClick={toggleChat} className="p-1 rounded-full hover:bg-white/20">
                            <XIcon />
                        </button>
                    </header>
                    <main className="flex-grow p-4 space-y-1 overflow-y-auto">
                        {messages.map((msg, index) => {
                             const isCurrentUser = msg.sender === 'user';
                             const isAi = msg.sender === 'ai';

                            return (
                                <div key={msg.id} className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-3`}>
                                     {isAi && <div className="w-7 h-7 rounded-full bg-fog-accent flex items-center justify-center text-white flex-shrink-0 self-start"><AIIcon className="w-4 h-4"/></div>}
                                     <div className={`max-w-xs md:max-w-sm p-3 rounded-2xl shadow-sm ${isCurrentUser ? 'bg-fog-accent text-white rounded-br-none' : 'bg-white dark:bg-slate-700 rounded-bl-none'}`}>
                                        <p className="text-sm break-words">{msg.content}</p>
                                    </div>
                                </div>
                            )
                        })}
                        
                        {!hasInteracted && (
                            <div className="flex flex-wrap gap-2 pt-2 pl-9">
                                {quickReplies.map(reply => (
                                     <button key={reply} onClick={() => handleQuickReply(reply)} className="text-sm text-fog-accent border border-fog-accent/50 rounded-full px-3 py-1 hover:bg-fog-accent/10 transition-colors">
                                        {reply}
                                    </button>
                                ))}
                            </div>
                        )}

                         {isLoading && (
                            <div className="flex items-end gap-2 justify-start mb-3">
                                <div className="w-7 h-7 rounded-full bg-fog-accent flex items-center justify-center text-white flex-shrink-0 self-start"><AIIcon className="w-4 h-4"/></div>
                                <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-white dark:bg-slate-700 shadow-sm rounded-bl-none">
                                    <div className="flex items-center gap-1.5">
                                        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </main>
                    <footer className="p-3 border-t border-black/10 dark:border-white/10 bg-white/30 dark:bg-fog-dark/30 flex-shrink-0">
                         <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Ask a question..."
                                disabled={isLoading}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-full bg-gray-100 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-fog-accent disabled:opacity-50"
                            />
                             <button type="submit" title="Send message" disabled={isLoading} className="p-3 text-white bg-fog-accent rounded-full transition-colors hover:bg-fog-accent-hover shadow-sm flex-shrink-0 disabled:opacity-50">
                                <SendIcon className="w-5 h-5" />
                            </button>
                        </form>
                    </footer>
                </div>
            )}

            <button
                onClick={toggleChat}
                className="bg-fog-accent text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:bg-fog-accent-hover transition-all transform hover:scale-110 focus:outline-none overflow-hidden"
                aria-label="Toggle AI Chat"
            >
                {isOpen ? <XIcon /> : <ChatBubbleIcon />}
            </button>
        </div>
    );
};

export default ChatWidget;