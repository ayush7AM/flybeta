import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Lock, CheckCircle, ArrowRight, Loader } from 'lucide-react';
import { resetPassword } from '../services/api';

export default function ResetPasswordConfirmPage() {
  const { uid, token } = useParams();
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(uid, token, password);
      setSuccess(true);
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        // DRF may return { non_field_errors: [...] } or { new_password: [...] }
        const msgs = Object.values(data).flat();
        setError(msgs.join(' ') || 'Reset failed. The link may have expired.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
         style={{ background: 'var(--color-bg-primary, #f5f5f5)' }}>
      <div className="w-full max-w-md bg-[var(--color-surface,#fff)] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {/* Header */}
        <div className="p-6 border-b-4 border-black bg-[var(--color-primary,#EAB308)]">
          <h1 className="text-2xl font-black text-black uppercase tracking-wider m-0">
            {success ? 'Password Updated!' : 'Set New Password'}
          </h1>
        </div>

        <div className="p-6">
          {success ? (
            /* ── Success state ── */
            <div className="text-center py-4">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" strokeWidth={2.5} />
              <p className="text-lg font-bold text-[var(--color-ink,#000)] mb-2">
                Your password has been reset successfully!
              </p>
              <p className="text-sm text-gray-500 mb-6">
                You can now log in with your new password.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 font-black uppercase tracking-wider no-underline border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[var(--color-primary,#EAB308)] hover:text-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                Go to Home & Log In <ArrowRight size={20} />
              </Link>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              {error && (
                <div className="mb-6 p-4 border-l-4 border-red-500 bg-red-100 text-red-900 font-medium text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold uppercase text-[var(--color-ink,#000)] tracking-wider">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-primary,#f5f5f5)] border-2 border-black text-[var(--color-ink,#000)] focus:outline-none focus:border-[var(--color-primary,#EAB308)] placeholder-gray-500 transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold uppercase text-[var(--color-ink,#000)] tracking-wider">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="password"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      required
                      minLength={8}
                      className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-primary,#f5f5f5)] border-2 border-black text-[var(--color-ink,#000)] focus:outline-none focus:border-[var(--color-primary,#EAB308)] placeholder-gray-500 transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex items-center justify-center gap-2 w-full bg-black text-white py-4 font-black uppercase tracking-widest text-lg hover:bg-[var(--color-primary,#EAB308)] hover:text-black border-4 border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader className="animate-spin" size={24} />
                  ) : (
                    <>Reset Password <ArrowRight size={24} /></>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t-4 border-black bg-[var(--color-bg-primary,#f5f5f5)] text-center">
          <Link to="/" className="text-sm font-bold text-[var(--color-primary,#EAB308)] uppercase no-underline hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
