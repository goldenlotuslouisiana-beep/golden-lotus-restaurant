import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
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



  // If already logged in, redirect
  useEffect(() => {
    if (isLoggedIn) {
      navigate(redirect, { replace: true });
    }
  }, [isLoggedIn, navigate, redirect]);

  if (isLoggedIn) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }

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
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">Welcome Back</h2>
          <p className="text-gray-500 text-center mb-6 text-sm">Sign in to your account</p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 animate-shake">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent bg-gray-50 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent bg-gray-50 focus:bg-white transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#F97316] focus:ring-[#F97316]" />
                <span className="text-gray-600">Remember me</span>
              </label>
              <button type="button" className="text-[#F97316] hover:text-[#ea6c10] font-medium transition-colors">Forgot password?</button>
            </div>

            <button
              type="submit" disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-[#F97316] to-[#ea6c10] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
            >
              {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Signing in...</> : <>Sign In <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>

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

          <p className="text-center mt-6 text-gray-500 text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#F97316] hover:text-[#ea6c10] font-semibold transition-colors">Create one</Link>
          </p>
        </div>

        <div className="text-center mt-6">
          <Link to="/admin/login" className="text-xs text-gray-400 hover:text-[#F97316] transition-colors">Admin Login</Link>
        </div>
      </div>
    </div>
    </>
  );
}
