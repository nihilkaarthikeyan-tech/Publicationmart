import Checkbox from '@/Components/Checkbox';
import ApplicationLogo from '@/Components/ApplicationLogo';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import { route } from 'ziggy-js';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
        otp: '',
        recaptcha_token: '',
    });

    const [otpSent, setOtpSent] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [otpSuccess, setOtpSuccess] = useState('');
    const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
    const RECAPTCHA_SITE_KEY = window.RECAPTCHA_V3_SITE_KEY || '6Le2fGEsAAAAAMjTTSNnz7vQ2IodTgsie0_24VNj';
    const [showPassword, setShowPassword] = useState(false);
    const [loginMethod, setLoginMethod] = useState('password');

    // Bypass reCAPTCHA on testing domains
    const isTestingMode = typeof window !== 'undefined' && 
                          (window.location.hostname === 'radinfotec.com' || 
                           window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1');

    // Clear any browser-autofilled values on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            const emailEl = document.getElementById('email');
            const passEl = document.getElementById('password');
            if (emailEl && emailEl.value && !data.email) {
                emailEl.value = '';
            }
            if (passEl && passEl.value && !data.password) {
                passEl.value = '';
            }
        }, 50);
        return () => clearTimeout(timer);
    }, []);

    // Load reCAPTCHA v3 script
    useEffect(() => {
        if (isTestingMode) {
            setRecaptchaLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
        script.async = true;
        script.defer = true;
        script.onload = () => setRecaptchaLoaded(true);
        document.head.appendChild(script);

        return () => {
            const scripts = document.querySelectorAll(`script[src*="recaptcha"]`);
            scripts.forEach(s => s.remove());
            const badges = document.querySelectorAll('.grecaptcha-badge');
            badges.forEach(b => b.remove());
        };
    }, []);

    // Get reCAPTCHA token
    const executeRecaptcha = useCallback(async (action = 'login') => {
        if (isTestingMode) return 'skipped_for_testing';

        if (!window.grecaptcha) {
            console.error('reCAPTCHA not loaded');
            return null;
        }
        try {
            const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
            return token;
        } catch (error) {
            console.error('reCAPTCHA error:', error);
            return null;
        }
    }, [RECAPTCHA_SITE_KEY]);

    const submit = async (e) => {
        e.preventDefault();
        const token = await executeRecaptcha('login');
        if (!token) {
            alert('Security verification failed. Please refresh and try again.');
            return;
        }
        setData('recaptcha_token', token);
        setTimeout(() => {
            post(route('login'), {
                data: { ...data, recaptcha_token: token },
                onFinish: () => reset('password'),
            });
        }, 0);
    };

    const handleSendOtp = async () => {
        if (!data.email) {
            setOtpError("Please enter your email first.");
            return;
        }
        setSendingOtp(true);
        setOtpError('');
        setOtpSuccess('');
        try {
            const response = await fetch(route('otp.send'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({ email: data.email }),
            });
            const result = await response.json();
            if (response.ok && result.success) {
                setOtpSent(true);
                setOtpSuccess('OTP sent to your email! Check your inbox.');
            } else {
                setOtpError(result.message || 'Failed to send OTP. Please try again.');
            }
        } catch (error) {
            setOtpError('Network error. Please try again.');
        } finally {
            setSendingOtp(false);
        }
    };

    return (
        <div className="min-h-screen flex font-sans relative overflow-hidden bg-[#0A0A10]">
            {/* Ambient Base matching website */}
            <div className="fixed inset-0 bg-gradient-to-br from-[#0c0814] via-[#120a22] to-[#0A0A10]" />
            <div className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-fuchsia-600/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="fixed inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

            <Head title="Sign In" />

            {/* Left Side - Login Form */}
            <div className="w-full lg:w-[48%] flex items-center justify-center p-6 sm:p-12 relative z-10">
                <div className="w-full max-w-md space-y-6">
                    {/* Header */}
                    <div className="text-center">
                        <Link href="/" className="inline-flex justify-center mb-6">
                            <ApplicationLogo className="h-32 w-auto drop-shadow-lg" />
                        </Link>
                        <h1 className="text-3xl font-black text-white tracking-tight">Welcome back</h1>
                        <p className="mt-2 text-slate-400 text-[15px]">Sign in to continue your publishing journey</p>
                    </div>

                    {status && (
                        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm font-medium text-emerald-400 text-center">
                            {status}
                        </div>
                    )}

                    <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
                        {/* Google Sign In */}
                        <a
                            href={route('auth.google')}
                            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all border border-white/10 hover:border-white/20 hover:shadow-lg"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Sign in with Google
                        </a>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 text-slate-500 font-medium bg-[#0f0b18]">or sign in with email</span>
                            </div>
                        </div>

                        {/* Login Method Tabs */}
                        <div className="grid grid-cols-2 gap-1 p-1 bg-white/5 rounded-xl border border-white/5 mb-6">
                            <button
                                type="button"
                                onClick={() => { setLoginMethod('password'); setOtpSent(false); }}
                                className={`py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${loginMethod === 'password' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                Password
                            </button>
                            <button
                                type="button"
                                onClick={() => { setLoginMethod('otp'); }}
                                className={`py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${loginMethod === 'otp' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                One-Time Code
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={submit} className="space-y-4">
                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-slate-300" htmlFor="email">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="block w-full pl-11 pr-4 py-3 border border-white/10 rounded-xl bg-white/5 text-white caret-violet-500 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all text-sm"
                                        placeholder="author@example.com"
                                        autoComplete="off"
                                        isFocused={true}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-1" />
                                {otpError && <p className="mt-1 text-sm text-red-400">{otpError}</p>}
                                {otpSuccess && <p className="mt-1 text-sm text-emerald-400">{otpSuccess}</p>}
                            </div>

                            {/* Password Flow */}
                            {loginMethod === 'password' && (
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-slate-300" htmlFor="password">Password</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={data.password}
                                            className="block w-full pl-11 pr-12 py-3 border border-white/10 rounded-xl bg-white/5 text-white caret-violet-500 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all text-sm"
                                            autoComplete="off"
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button type="button" className="absolute inset-y-0 right-0 px-3.5 flex items-center text-slate-500 hover:text-white transition-colors" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? (
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                            ) : (
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            )}
                                        </button>
                                    </div>
                                    <InputError message={errors.password} className="mt-1" />
                                </div>
                            )}

                            {/* OTP Flow */}
                            {loginMethod === 'otp' && otpSent && (
                                <div className="space-y-4">
                                    <label className="block text-sm font-medium text-slate-300 text-center">Enter the verification code sent to your email</label>
                                    <TextInput
                                        id="otp"
                                        type="text"
                                        name="otp"
                                        value={data.otp}
                                        className="block w-full text-center text-3xl tracking-[0.5em] py-4 border border-violet-500/50 rounded-xl bg-violet-900/20 text-white caret-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-500/30 font-mono transition-all"
                                        onChange={(e) => setData('otp', e.target.value)}
                                        maxLength={6}
                                        placeholder="000000"
                                        autoFocus
                                    />
                                    <div className="text-center">
                                        <button type="button" onClick={() => { setOtpSent(false); }} className="text-xs text-violet-400 hover:text-violet-300 transition-colors underline">
                                            Use a different email or retry
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Remember & Forgot */}
                            {loginMethod === 'password' && (
                                <div className="flex items-center justify-between py-1">
                                    <label className="flex items-center cursor-pointer group">
                                        <Checkbox name="remember" checked={data.remember} onChange={(e) => setData('remember', e.target.checked)} className="rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500 focus:ring-offset-gray-900" />
                                        <span className="ms-2 text-sm text-slate-400 group-hover:text-white transition-colors select-none">Remember me</span>
                                    </label>
                                    {canResetPassword && (
                                        <Link href={route('password.request')} className="text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors">
                                            Forgot password?
                                        </Link>
                                    )}
                                </div>
                            )}

                            {/* Submit */}
                            <div className="pt-2">
                                {loginMethod === 'otp' && !otpSent ? (
                                    <PrimaryButton
                                        type="button"
                                        onClick={handleSendOtp}
                                        className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-violet-500 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] border border-white/10"
                                        disabled={sendingOtp}
                                    >
                                        {sendingOtp ? <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : (
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                        )}
                                        {sendingOtp ? 'Sending Code...' : 'Send Login Code'}
                                    </PrimaryButton>
                                ) : (
                                    <PrimaryButton
                                        className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-violet-500 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] border border-white/10"
                                        disabled={processing}
                                    >
                                        {processing && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                                        {loginMethod === 'otp' ? 'Verify & Sign In' : 'Sign In'}
                                    </PrimaryButton>
                                )}
                            </div>
                        </form>

                        {/* reCAPTCHA v3 Status */}
                        <div className="flex justify-center mt-6">
                            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-medium">
                                {recaptchaLoaded ? (
                                    <>
                                        <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span>{isTestingMode ? 'Testing Mode (reCAPTCHA bypassed)' : 'Protected by reCAPTCHA'}</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="animate-spin w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                        <span>Loading security...</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="text-center pt-2">
                        <span className="text-sm text-slate-400">Don't have an account? </span>
                        <Link href={route('register')} className="text-sm font-bold text-violet-400 hover:text-violet-300 hover:underline transition-colors">
                            Start Publishing
                        </Link>
                    </div>

                </div>
            </div>

            {/* Right Side - Image Overlay for Dark Theme Integration */}
            <div className="hidden lg:block lg:w-[52%] relative overflow-hidden bg-black">
                {/* Blend the image into the dark theme */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A10] via-transparent to-transparent z-10" />
                <div className="absolute inset-0 bg-[#0A0A10]/40 z-10 mix-blend-multiply" />

                <img
                    src="/images/auth-login-hero.png"
                    alt="Golden book with quill pen"
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                />

                {/* Overlay text at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-12 z-20">
                    <div className="backdrop-blur-xl bg-black/40 rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20" />
                        <div className="relative flex items-center gap-6">
                            <div className="flex-1">
                                <h3 className="text-white font-black text-2xl tracking-tight mb-1">Your Publishing Partner</h3>
                                <p className="text-slate-300 text-sm">From manuscript to bookshelf — we make it simple</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg">
                                    <span className="text-white text-xs font-bold tracking-wider uppercase">Smart Writer</span>
                                </div>
                                <div className="px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg">
                                    <span className="text-white text-xs font-bold tracking-wider uppercase">AI Studio</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
