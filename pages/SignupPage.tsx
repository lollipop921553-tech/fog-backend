import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { LogoIcon, GoogleIcon } from '../components/Icons';
import { User, Role } from '../types';

const SignupPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Client' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
  };
  
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      avatarUrl: `https://picsum.photos/seed/${formData.email}/200/200`,
      tagline: `New ${formData.role}`,
      roles: [formData.role as Role],
      points: 0,
      usdBalance: 0,
      rating: 0,
      skills: [],
      isIdVerified: false,
      isLinkedInVerified: false,
      isPremium: false,
      unreadMessages: 0,
      bio: '',
      workHistory: [],
    };
    login(newUser);
    navigate('/dashboard');
  };

  const handleGoogleSignup = () => {
    const googleUser: User = {
      id: `user-${Date.now()}`,
      name: 'Google User',
      email: 'google.user@example.com',
      avatarUrl: `https://picsum.photos/seed/google-signup/200/200`,
      tagline: `New Client`,
      roles: [Role.Client],
      points: 0,
      usdBalance: 0,
      rating: 0,
      skills: [],
      isIdVerified: false,
      isLinkedInVerified: false,
      isPremium: false,
      unreadMessages: 0,
      bio: '',
      workHistory: [],
    };
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
        <div className="hidden lg:flex flex-col justify-center p-12 bg-gradient-to-br from-fog-secondary to-teal-700 text-white">
            <div className="flex items-center space-x-3">
              <LogoIcon className="h-12 w-12" />
              <span className="text-4xl font-bold">FOG</span>
            </div>
            <h1 className="mt-6 text-3xl font-bold tracking-tight">Join a World of Opportunity.</h1>
            <p className="mt-4 text-teal-100">
                Create your account to hire top talent, find your next project, or complete local tasks.
            </p>
        </div>
        {/* Right side with form */}
        <div className="bg-fog-white dark:bg-fog-mid-dark p-8 sm:p-12">
            <div className="w-full">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    Create your account
                  </h2>
                   <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Already have an account?{' '}
                      <Link to="/login" className="font-medium text-fog-accent hover:text-fog-accent-hover">
                          Log in
                      </Link>
                  </p>
                </div>
                
                <div className="mt-8">
                    <button
                      type="button"
                      onClick={handleGoogleSignup}
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

                <form className="mt-6 space-y-6" onSubmit={handleSignup}>
                   <div>
                      <label htmlFor="full-name" className="sr-only">Full Name</label>
                      <input id="full-name" name="name" type="text" required value={formData.name} onChange={handleInputChange} className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-fog-accent focus:border-fog-accent sm:text-sm" placeholder="Full Name" />
                  </div>
                   <div>
                      <label htmlFor="email-address-signup" className="sr-only">Email address</label>
                      <input id="email-address-signup" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleInputChange} className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-fog-accent focus:border-fog-accent sm:text-sm" placeholder="Email address" />
                  </div>
                  <div>
                      <label htmlFor="password-signup" className="sr-only">Password</label>
                      <input id="password-signup" name="password" type="password" required value={formData.password} onChange={handleInputChange} className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-fog-accent focus:border-fog-accent sm:text-sm" placeholder="Password" />
                  </div>
                  <div>
                    <label htmlFor="role" className="sr-only">I am a...</label>
                    <select id="role" name="role" required value={formData.role} onChange={handleInputChange} className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-gray-300 bg-gray-50 dark:bg-slate-800 focus:outline-none focus:ring-fog-accent focus:border-fog-accent sm:text-sm">
                      <option value="Client">I want to hire talent (Client)</option>
                      <option value="Freelancer">I want to find work (Professional)</option>
                    </select>
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-fog-accent hover:bg-fog-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-fog-light dark:ring-offset-fog-dark focus:ring-fog-accent"
                    >
                      Create Account
                    </button>
                  </div>
                   <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                      By creating an account, you agree to our{' '}
                      <Link to="/terms-of-service" className="underline hover:text-fog-accent">Terms of Service</Link> and{' '}
                      <Link to="/privacy-policy" className="underline hover:text-fog-accent">Privacy Policy</Link>.
                  </p>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
