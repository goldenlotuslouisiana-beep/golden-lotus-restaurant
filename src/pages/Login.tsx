import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/context/AuthContext';
import SEO from '@/components/SEO';

export default function Login() {
  const { login, googleLogin, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

  const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);



  // If already logged in, redirect
  useEffect(() => {
    if (isLoggedIn) {
      navigate(redirect, { replace: true });
    }
  }, [isLoggedIn, navigate, redirect]);

  if (isLoggedIn) return null;

  const validateField = (name: 'email' | 'password', value: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (name === 'email') {
        const trimmed = value.trim();
        if (!trimmed) next.email = 'Email is required';
        else if (!emailRegex.test(trimmed)) next.email = 'Enter a valid email address';
        else delete next.email;
      }
      if (name === 'password') {
        if (!value) next.password = 'Password is required';
        else if (value.length < 8) next.password = 'Password must be at least 8 characters';
        else delete next.password;
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setTouched({ email: true, password: true });
    validateField('email', email);
    validateField('password', password);
    const hasErrors = !!fieldErrors.email || !!fieldErrors.password || !email.trim() || !password;
    if (hasErrors) return;

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      navigate(redirect, { replace: true });
    } else {
      setError(result.error || 'Invalid email or password');
    }
  };

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) {
      setError('Google login failed. Please try again.');
      return;
    }

    setGoogleLoading(true);
    setError('');
    
    const result = await googleLogin(credentialResponse.credential);
    
    setGoogleLoading(false);

    if (result.success) {
      navigate(redirect, { replace: true });
    } else {
      setError(result.error || 'Google login failed');
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setForgotSuccess('');

    const normalized = forgotEmail.trim().toLowerCase();
    if (!normalized || !emailRegex.test(normalized)) {
      setError('Please enter a valid email address.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'forgot-password', email: normalized }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'Something went wrong. Please try again.');
        return;
      }
      setForgotSuccess('Check your email for a password reset link.');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="Sign In | Golden Lotus Rewards"
        description="Sign in to your Golden Lotus account to access rewards, track orders, and manage your preferences."
        url="https://www.goldenlotusgrill.com/login"
        noIndex={true}
      />
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Branding */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="w-16 h-16 bg-gradient-to-br from-[#F97316] to-[#ea6c10] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-200">
              <span className="text-white font-bold text-2xl">GL</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 font-['Playfair_Display']">Golden Lotus</h1>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">
            {mode === 'login' ? 'Welcome Back' : 'Reset your password'}
          </h2>
          <p className="text-gray-500 text-center mb-6 text-sm">
            {mode === 'login' ? 'Sign in to your account' : 'We’ll email you a secure reset link.'}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 animate-shake">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (touched.email) validateField('email', e.target.value);
                    }}
                    onBlur={() => {
                      setTouched((prev) => ({ ...prev, email: true }));
                      validateField('email', email);
                    }}
                    placeholder="your@email.com"
                    className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 bg-gray-50 focus:bg-white transition-all text-[16px] ${
                      touched.email && fieldErrors.email
                        ? 'border-[#DC2626] focus:ring-[#DC2626]/15 focus:border-[#DC2626]'
                        : 'border-gray-200 focus:ring-[#F97316]/15 focus:border-[#F97316]'
                    }`}
                  />
                </div>
                {touched.email && fieldErrors.email && (
                  <p className="mt-1 text-xs text-[#DC2626]">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (touched.password) validateField('password', e.target.value);
                    }}
                    onBlur={() => {
                      setTouched((prev) => ({ ...prev, password: true }));
                      validateField('password', password);
                    }}
                    placeholder="••••••••"
                    className={`w-full pl-11 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 bg-gray-50 focus:bg-white transition-all text-[16px] ${
                      touched.password && fieldErrors.password
                        ? 'border-[#DC2626] focus:ring-[#DC2626]/15 focus:border-[#DC2626]'
                        : 'border-gray-200 focus:ring-[#F97316]/15 focus:border-[#F97316]'
                    }`}
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
                {touched.password && fieldErrors.password && (
                  <p className="mt-1 text-xs text-[#DC2626]">{fieldErrors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#F97316] focus:ring-[#F97316]" />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-[#F97316] hover:text-[#ea6c10] font-medium transition-colors"
                  onClick={() => {
                    setMode('forgot');
                    setError('');
                    setForgotSuccess('');
                    setForgotEmail(email || '');
                  }}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit" disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-[#F97316] to-[#ea6c10] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
              >
                {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Signing in...</> : <>Sign In <ArrowRight className="w-5 h-5" /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              {forgotSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-2">
                  <p className="text-green-700 text-sm flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {forgotSuccess}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent bg-gray-50 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full py-3.5 bg-gradient-to-r from-[#F97316] to-[#ea6c10] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
              >
                {forgotLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</> : <>Send reset link <ArrowRight className="w-5 h-5" /></>}
              </button>

              <button
                type="button"
                className="w-full py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setMode('login');
                  setError('');
                  setForgotSuccess('');
                }}
              >
                Back to sign in
              </button>
            </form>
          )}

          {mode === 'login' && (
            <>
              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center text-sm"><span className="bg-white px-4 text-gray-400">or continue with</span></div>
              </div>

              {/* Google */}
              <div className="relative">
                {googleLoading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-xl">
                    <Loader2 className="w-6 h-6 animate-spin text-[#F97316]" />
                  </div>
                )}
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  theme="outline"
                  size="large"
                  width="100%"
                  text="continue_with"
                  shape="rectangular"
                />
              </div>
            </>
          )}

          {mode === 'login' && (
            <p className="text-center mt-6 text-gray-500 text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#F97316] hover:text-[#ea6c10] font-semibold transition-colors">Create one</Link>
            </p>
          )}
        </div>

        <div className="text-center mt-6">
          <Link to="/admin/login" className="text-xs text-gray-400 hover:text-[#F97316] transition-colors">Admin Login</Link>
        </div>
      </div>
    </div>
    </>
  );
}
