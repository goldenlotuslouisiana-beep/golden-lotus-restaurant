import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import SEO from '@/components/SEO';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const minLength = 8;
  const passwordValid = useMemo(() => newPassword.length >= minLength, [newPassword]);
  const matches = useMemo(() => newPassword === confirmPassword, [newPassword, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Reset link is missing or invalid.');
      return;
    }
    if (!passwordValid) {
      setError(`Password must be at least ${minLength} characters.`);
      return;
    }
    if (!matches) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset-password', token, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'Something went wrong. Please try again.');
        return;
      }
      setSuccess('Password updated. Redirecting to sign in…');
      setTimeout(() => {
        navigate('/login?reset=1', { replace: true });
      }, 900);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Reset Password | Golden Lotus"
        description="Reset your Golden Lotus account password."
        url="https://www.goldenlotusgrill.com/reset-password"
        noIndex={true}
      />

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <div className="w-16 h-16 bg-gradient-to-br from-[#F97316] to-[#ea6c10] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-200">
                <span className="text-white font-bold text-2xl">GL</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 font-['Playfair_Display']">Golden Lotus</h1>
            </Link>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">Choose a new password</h2>
            <p className="text-gray-500 text-center mb-6 text-sm">Minimum {minLength} characters.</p>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
                <p className="text-green-700 text-sm flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {success}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent bg-gray-50 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent bg-gray-50 focus:bg-white transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-[#F97316] to-[#ea6c10] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
              >
                {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Updating...</> : <>Update password <ArrowRight className="w-5 h-5" /></>}
              </button>

              <Link
                to="/login"
                className="block text-center text-sm text-[#F97316] hover:text-[#ea6c10] font-semibold transition-colors"
              >
                Back to sign in
              </Link>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

