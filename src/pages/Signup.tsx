import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2, ArrowRight, Check, X } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/context/AuthContext';

function PasswordStrength({ password }: { password: string }) {
    const checks = [
        { label: '8+ characters', ok: password.length >= 8 },
        { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
        { label: 'Number', ok: /[0-9]/.test(password) },
        { label: 'Special char', ok: /[!@#$%^&*]/.test(password) },
    ];
    const passed = checks.filter((c) => c.ok).length;
    const strength = passed <= 1 ? 'Weak' : passed <= 2 ? 'Fair' : passed <= 3 ? 'Good' : 'Strong';
    const color = passed <= 1 ? 'bg-red-500' : passed <= 2 ? 'bg-yellow-500' : passed <= 3 ? 'bg-blue-500' : 'bg-green-500';

    if (!password) return null;

    return (
        <div className="mt-2 space-y-2">
            <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= passed ? color : 'bg-gray-200'}`} />
                ))}
            </div>
            <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${passed <= 1 ? 'text-red-500' : passed <= 2 ? 'text-yellow-500' : passed <= 3 ? 'text-blue-500' : 'text-green-500'}`}>{strength}</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
                {checks.map((c) => (
                    <div key={c.label} className="flex items-center gap-1 text-xs">
                        {c.ok ? <Check className="w-3 h-3 text-green-500" /> : <X className="w-3 h-3 text-gray-300" />}
                        <span className={c.ok ? 'text-green-600' : 'text-gray-400'}>{c.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Signup() {
    const { signup, googleLogin } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [agreedTerms, setAgreedTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!form.name || !form.email || !form.password) { setError('Please fill in all required fields'); return; }
        if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
        if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
        if (!agreedTerms) { setError('Please agree to the Terms & Conditions'); return; }

        setIsLoading(true);
        const result = await signup({ name: form.name, email: form.email, phone: form.phone, password: form.password });
        setIsLoading(false);

        if (result.success) {
            navigate('/', { replace: true });
        } else {
            setError(result.error || 'Signup failed');
        }
    };

    const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
        if (!credentialResponse.credential) {
            setError('Google signup failed. Please try again.');
            return;
        }

        setGoogleLoading(true);
        setError('');
        
        const result = await googleLogin(credentialResponse.credential);
        
        setGoogleLoading(false);

        if (result.success) {
            navigate('/', { replace: true });
        } else {
            setError(result.error || 'Google signup failed');
        }
    };

    const handleGoogleError = () => {
        setError('Google signup failed. Please try again.');
    };

    return (
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

                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">Create Account</h2>
                    <p className="text-gray-500 text-center mb-6 text-sm">Join Golden Lotus Rewards</p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                            <p className="text-red-600 text-sm text-center">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent bg-gray-50 focus:bg-white transition-all" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent bg-gray-50 focus:bg-white transition-all" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                            <div className="relative">
                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input name="phone" value={form.phone} onChange={handleChange} placeholder="(555) 123-4567" className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent bg-gray-50 focus:bg-white transition-all" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Min 8 characters" className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent bg-gray-50 focus:bg-white transition-all" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <PasswordStrength password={form.password} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password *</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input name="confirmPassword" type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter password" className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent bg-gray-50 focus:bg-white transition-all" />
                            </div>
                            {form.confirmPassword && form.password !== form.confirmPassword && (
                                <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                            )}
                        </div>

                        <label className="flex items-start gap-3 cursor-pointer">
                            <input type="checkbox" checked={agreedTerms} onChange={() => setAgreedTerms(!agreedTerms)} className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#F97316] focus:ring-[#F97316]" />
                            <span className="text-sm text-gray-600">
                                I agree to the <button type="button" className="text-[#F97316] hover:underline">Terms of Service</button> and <button type="button" className="text-[#F97316] hover:underline">Privacy Policy</button>
                            </span>
                        </label>

                        <button
                            type="submit" disabled={isLoading}
                            className="w-full py-3.5 bg-gradient-to-r from-[#F97316] to-[#ea6c10] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating account...</> : <>Create Account <ArrowRight className="w-5 h-5" /></>}
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
                            text="signup_with"
                            shape="rectangular"
                        />
                    </div>

                    <p className="text-center mt-6 text-gray-500 text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-[#F97316] hover:text-[#ea6c10] font-semibold transition-colors">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
