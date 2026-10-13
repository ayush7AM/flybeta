import { useState, useEffect } from 'react';
import { X, Mail, User, Lock, ArrowRight, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStartTour } from '../tour/tour';
import { requestPasswordReset } from '../../services/api';

export default function AuthModal({ isOpen, onClose, customMessage = null, initialView = 'login' }) {
  const { login, register } = useAuth();
  const startTour = useStartTour();
  
  // 'login', 'register', 'forgot'
  const [view, setView] = useState(initialView); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    password_confirm: ''
  });

  // Sync view when initialView prop changes (e.g. modal re-opened with different intent)
  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, initialView]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (view === 'login') {
        const res = await login(formData.username, formData.password);
        if (res.success) {
          onClose();
        } else {
          setError(res.error);
        }
      } else if (view === 'register') {
        if (formData.password !== formData.password_confirm) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }
        const res = await register({
          name: formData.name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          password_confirm: formData.password_confirm
        });
        if (res.success) {
          onClose();
          startTour(); // first-time walkthrough of the whole site
        } else {
          setError(res.error);
        }
      } else if (view === 'forgot') {
        await requestPasswordReset(formData.email);
        setSuccess('Password reset link sent! Please check your email.');
        setFormData({ ...formData, email: '' });
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const toggleView = (newView) => {
    setView(newView);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-[var(--color-surface)] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-4 border-black bg-[var(--color-primary)]">
          <h2 className="text-2xl font-black text-black uppercase tracking-wider">
            {view === 'login' && 'Welcome Back'}
            {view === 'register' && 'Join FlyBeta'}
            {view === 'forgot' && 'Reset Password'}
          </h2>
          <button 
            onClick={onClose}
            className="text-black hover:text-white bg-transparent border-2 border-transparent hover:border-black hover:bg-black p-1 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="p-6 overflow-y-auto">
          {customMessage && (
            <div className="mb-6 p-4 border-l-4 border-blue-500 bg-blue-50 text-blue-900 font-medium text-sm">
              {customMessage}
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 border-l-4 border-red-500 bg-red-100 text-red-900 font-medium text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 border-l-4 border-green-500 bg-green-100 text-green-900 font-medium text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            {view === 'register' && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold uppercase text-[var(--color-ink)] tracking-wider">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-primary)] border-2 border-black text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-primary)] placeholder-gray-500 transition-colors"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            {(view === 'login' || view === 'register') && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold uppercase text-[var(--color-ink)] tracking-wider">Username</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input 
                    type="text" 
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-primary)] border-2 border-black text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-primary)] placeholder-gray-500 transition-colors"
                    placeholder="flybeta_pilot"
                  />
                </div>
              </div>
            )}

            {(view === 'register' || view === 'forgot') && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold uppercase text-[var(--color-ink)] tracking-wider">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-primary)] border-2 border-black text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-primary)] placeholder-gray-500 transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
            )}

            {(view === 'login' || view === 'register') && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold uppercase text-[var(--color-ink)] tracking-wider">Password</label>
                  {view === 'login' && (
                    <button 
                      type="button"
                      onClick={() => toggleView('forgot')}
                      className="text-xs font-bold text-blue-500 hover:text-blue-600 uppercase tracking-wide bg-transparent border-none cursor-pointer"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-primary)] border-2 border-black text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-primary)] placeholder-gray-500 transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {view === 'register' && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold uppercase text-[var(--color-ink)] tracking-wider">Confirm Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input 
                    type="password" 
                    name="password_confirm"
                    value={formData.password_confirm}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-primary)] border-2 border-black text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-primary)] placeholder-gray-500 transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="mt-4 flex items-center justify-center gap-2 w-full bg-black text-white py-4 font-black uppercase tracking-widest text-lg hover:bg-[var(--color-primary)] hover:text-black border-4 border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader className="animate-spin" size={24} /> : (
                <>
                  {view === 'login' && 'Sign In'}
                  {view === 'register' && 'Create Account'}
                  {view === 'forgot' && 'Send Reset Link'}
                  <ArrowRight size={24} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t-4 border-black bg-[var(--color-bg-primary)] text-center">
          {view === 'login' && (
            <p className="text-[var(--color-ink)] font-medium">
              New here? <button onClick={() => toggleView('register')} className="font-bold text-[var(--color-primary)] uppercase hover:underline bg-transparent border-none cursor-pointer">Register</button>
            </p>
          )}
          {(view === 'register' || view === 'forgot') && (
            <p className="text-[var(--color-ink)] font-medium">
              Already have an account? <button onClick={() => toggleView('login')} className="font-bold text-[var(--color-primary)] uppercase hover:underline bg-transparent border-none cursor-pointer">Sign In</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
