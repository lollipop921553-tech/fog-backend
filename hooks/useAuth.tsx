import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  unreadMessages: number;
  setUnreadMessages: (count: number) => void;
  isInitializing: boolean; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('fog-user');
      if (storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
        setUnreadMessages(parsedUser.unreadMessages || 0);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('fog-user');
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setUnreadMessages(userData.unreadMessages || 0);
    localStorage.setItem('fog-user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setUnreadMessages(0);
    localStorage.removeItem('fog-user');
  };
  
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, unreadMessages, setUnreadMessages, isInitializing }}>
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
