import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { LogoIcon, GoogleIcon } from '../components/Icons';
import { User, Role } from '../types';

const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const createDummyUser = (email: string, name?: string): User => ({
    id: `user-${Date.now()}`,
    name: name || email.split('@')[0] || 'New User',
    email: email,
    avatarUrl: `https://picsum.photos/seed/${email}/200/200`,
    tagline: 'Ready to work!',
    roles: [Role.Client, Role.Freelancer, Role.Tasker],
    points: 1250,
    usdBalance: 250.75,
    rating: 4.9,
    skills: ['React', 'TypeScript', 'Node.js', 'Plumbing'],
    isIdVerified: true,
    isLinkedInVerified: true,
    isPremium: true,
    unreadMessages: 0,
    bio: 'A passionate professional ready to tackle new challenges on the FOG platform.',
    workHistory: [],
  });
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if(!email || !password) return;
    const userToLogin = createDummyUser(email);
    login(userToLogin);
    navigate('/dashboard');
  };
  
  const handleGoogleLogin = () => {
    const googleUser = createDummyUser('google.user@example.com', 'Google User');
    login(googleUser);
    navigate('/dashboard');
  };

  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-full flex items-center justify-center animate-fade-in p-4">
      <div className="w-full max-w-4xl lg:grid lg:grid-cols-2 rounded-2xl shadow-2xl dark:shadow-2xl-dark overflow-hidden">
        {/* Left side with branding */}
        <div className="hidden lg:flex flex-col justify-center p-12 bg-gradient-to-br from-fog-accent to-blue-700 text-white">
            <div className="flex items-center space-x-3">
              <LogoIcon className="h-12 w-12" />
              <span className="text-4xl font-bold">FOG</span>
            </div>
            <h1 className="mt-6 text-3xl font-bold tracking-tight">Productivity Starts Here.</h1>
            <p className="mt-4 text-blue-100">
                Join a global network of freelancers, taskers, and clients on a platform built for serious, productive work.
            </p>
        </div>
        {/* Right side with form */}
        <div className="bg-fog-white dark:bg-fog-mid-dark p-8 sm:p-12">
            <div className="w-full">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    Welcome back
                  </h2>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Sign in to continue to FOG.
                  </p>
                </div>

                <div className="mt-8">
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      className="w-full inline-flex justify-center items-center gap-3 py-3 px-4 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fog-accent"
                    >
                      <GoogleIcon />
                      Continue with Google
                    </button>
                </div>

                <div className="mt-6 flex items-center">
                    <div className="flex-grow border-t border-gray-300 dark:border-slate-600"></div>
                    <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 text-sm">OR</span>
                    <div className="flex-grow border-t border-gray-300 dark:border-slate-600"></div>
                </div>

                <form className="mt-6 space-y-4" onSubmit={handleLogin}>
                  <div>
                      <label htmlFor="email-address" className="sr-only">Email address</label>
                      <input id="email-address" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-fog-accent focus:border-fog-accent sm:text-sm" placeholder="Email address" />
                  </div>
                   <div>
                      <label htmlFor="password" className="sr-only">Password</label>
                      <input id="password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-fog-accent focus:border-fog-accent sm:text-sm" placeholder="Password" />
                  </div>

                  <div className="flex items-center justify-between">
                      <div className="flex items-center">
                          <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-fog-accent focus:ring-fog-accent border-gray-300 rounded" />
                          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                              Remember me
                          </label>
                      </div>

                      <div className="text-sm">
                          <a href="#" className="font-medium text-fog-accent hover:text-fog-accent-hover">
                              Forgot your password?
                          </a>
                      </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-fog-accent hover:bg-fog-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-fog-light dark:ring-offset-fog-dark focus:ring-fog-accent"
                    >
                      Sign in
                    </button>
                  </div>

                  <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                      Don't have an account?{' '}
                      <Link to="/signup" className="font-medium text-fog-accent hover:text-fog-accent-hover">
                          Sign up
                      </Link>
                  </p>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
