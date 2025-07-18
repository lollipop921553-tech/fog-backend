import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { LogoIcon, GoogleIcon } from '../components/Icons';
import { supabase } from '../services/supabaseClient';

const SignupPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithOtp({ 
        email,
        options: {
            emailRedirectTo: window.location.origin,
            data: {
                full_name: name,
            }
        }
    });

    if (error) {
      setError(`Sign up failed: ${error.message}`);
    } else {
      setMessage('Check your email for the magic sign up link!');
    }
    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      setError(`Google sign up failed: ${error.message}`);
    }
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
                      <input id="full-name" name="name" type="text" required value={name} onChange={e => setName(e.target.value)} className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-fog-accent focus:border-fog-accent sm:text-sm" placeholder="Full Name" />
                  </div>
                   <div>
                      <label htmlFor="email-address-signup" className="sr-only">Email address</label>
                      <input id="email-address-signup" name="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-fog-accent focus:border-fog-accent sm:text-sm" placeholder="Email address" />
                  </div>

                  {message && <p className="text-sm text-center text-green-600 dark:text-green-400">{message}</p>}
                  {error && <p className="text-sm text-center text-red-600 dark:text-red-400">{error}</p>}

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-fog-accent hover:bg-fog-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-fog-light dark:ring-offset-fog-dark focus:ring-fog-accent disabled:bg-fog-mid"
                    >
                      {loading ? 'Sending...' : 'Sign Up with Magic Link'}
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