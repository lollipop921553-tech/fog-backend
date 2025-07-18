
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';
import { User } from '../types';
import { getUserById } from '../services/apiService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  logout: () => void;
  unreadMessages: number;
  setUnreadMessages: (count: number) => void;
  updateUser: (updatedData: Partial<User>) => void;
  isInitializing: boolean; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isInitializing, setIsInitializing] = useState(true);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    let appUser: User | null = null;
    
    // Retry fetching the profile to account for potential replication delay
    // between user creation in 'auth' and profile creation in 'public' via trigger.
    for (let i = 0; i < 3; i++) {
        appUser = await getUserById(supabaseUser.id);
        if (appUser) break;
        await new Promise(res => setTimeout(res, 500)); // wait 500ms before retrying
    }

    if (appUser) {
      setUser(appUser);
      setUnreadMessages(appUser.unreadMessages || 0);
    } else {
      console.error("Critical: Failed to load user profile after multiple attempts for user ID:", supabaseUser.id);
      // Handle failure case, e.g., show an error message or log out.
      setUser(null);
      setUnreadMessages(0);
    }
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (user) {
        setUser(prev => prev ? { ...prev, ...updatedData } : null);
    }
  };


  useEffect(() => {
    setIsInitializing(true);
    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
       if (session?.user) {
        loadUserProfile(session.user).finally(() => setIsInitializing(false));
      } else {
        setIsInitializing(false);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
        setUnreadMessages(0);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };
  
  const isAuthenticated = !!session?.user;

  const value = { user, session, isAuthenticated, logout, unreadMessages, setUnreadMessages, updateUser, isInitializing };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
