import { Head, Link, useForm } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { route } from 'ziggy-js';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useState } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        campaign_code: '',
        referral_code: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
            onSuccess: () => {
                // Meta Pixel: Track successful registration
                if (typeof window.fbq === 'function') {
                    fbq('track', 'CompleteRegistration');
                }
            },
        });
    };

    return (
        <div className="min-h-screen flex font-sans relative overflow-hidden bg-[#0A0A10]">
            {/* Ambient Base matching website */}
            <div className="fixed inset-0 bg-gradient-to-br from-[#0c0814] via-[#120a22] to-[#0A0A10]" />
            <div className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-fuchsia-600/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="fixed inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

            <Head title="Create Account" />

            {/* Left Side - Registration Form */}
            <div className="w-full lg:w-[48%] flex items-center justify-center p-6 sm:p-10 relative overflow-y-auto z-10 custom-scrollbar">
                <div className="w-full max-w-md space-y-5">
                    {/* Header */}
                    <div className="text-center">
                        <Link href="/" className="inline-flex justify-center mb-4">
                            <ApplicationLogo className="h-32 w-auto drop-shadow-lg" />
                        </Link>
                        <h1 className="text-3xl font-black text-white tracking-tight">Start your journey</h1>
                        <p className="mt-1.5 text-slate-400 text-[15px]">
                            Already have an account?{' '}
                            <Link href={route('login')} className="font-bold text-violet-400 hover:text-violet-300 hover:underline transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>

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
                            Sign up with Google
                        </a>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 text-slate-500 font-medium bg-[#0f0b18]">or create with email</span>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={submit} className="space-y-4">
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="name">Full Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <svg className={`h-5 w-5 transition-colors ${data.name.length > 2 ? 'text-emerald-400' : 'text-slate-500 group-focus-within:text-violet-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            {data.name.length > 2 ? (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            ) : (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            )}
                                        </svg>
                                    </div>
                                    <TextInput id="name" name="name" value={data.name} className={`block w-full pl-11 pr-4 py-3 border rounded-xl bg-white/5 text-white caret-violet-500 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all text-sm ${data.name.length > 2 ? 'border-emerald-500/50 focus:ring-emerald-500/30 focus:border-emerald-500' : 'border-white/10 focus:ring-violet-500/50 focus:border-violet-500'}`} placeholder="John Doe" autoComplete="name" isFocused={true} onChange={(e) => setData('name', e.target.value)} required />
                                </div>
                                <InputError message={errors.name} className="mt-1" />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="email">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <svg className={`h-5 w-5 transition-colors ${data.email.includes('@') && data.email.includes('.') ? 'text-emerald-400' : 'text-slate-500 group-focus-within:text-violet-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            {data.email.includes('@') && data.email.includes('.') ? (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            ) : (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            )}
                                        </svg>
                                    </div>
                                    <TextInput id="email" type="email" name="email" value={data.email} className={`block w-full pl-11 pr-4 py-3 border rounded-xl bg-white/5 text-white caret-violet-500 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all text-sm ${data.email.includes('@') && data.email.includes('.') ? 'border-emerald-500/50 focus:ring-emerald-500/30 focus:border-emerald-500' : 'border-white/10 focus:ring-violet-500/50 focus:border-violet-500'}`} placeholder="you@example.com" autoComplete="username" onChange={(e) => setData('email', e.target.value)} required />
                                </div>
                                <InputError message={errors.email} className="mt-1" />
                            </div>

                            {/* Password Fields  */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="password">Password</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <TextInput id="password" type={showPassword ? "text" : "password"} name="password" value={data.password} className="block w-full pl-11 pr-12 py-3 border border-white/10 rounded-xl bg-white/5 text-white caret-violet-500 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all text-sm" placeholder="••••••••" autoComplete="new-password" onChange={(e) => setData('password', e.target.value)} required />
                                        <button type="button" className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 hover:text-white transition-colors" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? (
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                            ) : (
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            )}
                                        </button>
                                    </div>
                                    <InputError message={errors.password} className="mt-1" />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="password_confirmation">Confirm</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <svg className={`h-5 w-5 transition-colors ${data.password && data.password === data.password_confirmation ? 'text-emerald-400' : 'text-slate-500 group-focus-within:text-violet-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                {data.password && data.password === data.password_confirmation ? (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                ) : (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                )}
                                            </svg>
                                        </div>
                                        <TextInput id="password_confirmation" type={showConfirmPassword ? "text" : "password"} name="password_confirmation" value={data.password_confirmation} className={`block w-full pl-11 pr-12 py-3 border rounded-xl bg-white/5 text-white caret-violet-500 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all text-sm ${data.password && data.password === data.password_confirmation ? 'border-emerald-500/50 focus:ring-emerald-500/30 focus:border-emerald-500' : 'border-white/10 focus:ring-violet-500/50 focus:border-violet-500'}`} placeholder="••••••••" autoComplete="new-password" onChange={(e) => setData('password_confirmation', e.target.value)} required />
                                        <button type="button" className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 hover:text-white transition-colors" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                            {showConfirmPassword ? (
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                            ) : (
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            )}
                                        </button>
                                    </div>
                                    <InputError message={errors.password_confirmation} className="mt-1" />
                                </div>

                                {/* Password Strength Meter */}
                                {data.password && (
                                    <div className="col-span-2 mt-0.5">
                                        <div className="flex gap-1 h-1">
                                            <div className={`flex-1 rounded-full transition-colors ${data.password.length > 0 ? (data.password.length < 6 ? 'bg-red-500' : 'bg-emerald-500') : 'bg-white/10'}`}></div>
                                            <div className={`flex-1 rounded-full transition-colors ${data.password.length >= 8 ? 'bg-emerald-500' : 'bg-white/10'}`}></div>
                                            <div className={`flex-1 rounded-full transition-colors ${data.password.length >= 10 && /\d/.test(data.password) ? 'bg-emerald-500' : 'bg-white/10'}`}></div>
                                            <div className={`flex-1 rounded-full transition-colors ${data.password.length >= 12 && /[!@#$%^&*]/.test(data.password) ? 'bg-emerald-500' : 'bg-white/10'}`}></div>
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-0.5 text-right font-medium">
                                            {data.password.length < 8 ? 'Weak' : (data.password.length < 12 ? 'Good' : 'Strong')}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {/* Campaign Code */}
                                <div>
                                    <label className="block text-[11px] font-medium text-slate-400 mb-1" htmlFor="campaign_code">
                                        Campaign Code <span className="text-slate-500 font-normal">(Optional)</span>
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-4 w-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                        </div>
                                        <TextInput
                                            id="campaign_code"
                                            type="text"
                                            name="campaign_code"
                                            value={data.campaign_code}
                                            className="block w-full pl-9 pr-3 py-2 border border-white/10 rounded-lg bg-white/5 text-white caret-violet-500 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all text-xs uppercase"
                                            placeholder="NEWYEAR2025"
                                            autoComplete="off"
                                            onChange={(e) => setData('campaign_code', e.target.value.toUpperCase())}
                                        />
                                    </div>
                                    {errors.campaign_code && <InputError message={errors.campaign_code} className="mt-1" />}
                                </div>

                                {/* Referral Code */}
                                <div>
                                    <label className="block text-[11px] font-medium text-slate-400 mb-1" htmlFor="referral_code">
                                        Referral Code <span className="text-slate-500 font-normal">(Optional)</span>
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-4 w-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <TextInput
                                            id="referral_code"
                                            type="text"
                                            name="referral_code"
                                            value={data.referral_code}
                                            className="block w-full pl-9 pr-3 py-2 border border-white/10 rounded-lg bg-white/5 text-white caret-violet-500 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all text-xs uppercase"
                                            placeholder="EKBPHJ75UG"
                                            autoComplete="off"
                                            onChange={(e) => setData('referral_code', e.target.value.toUpperCase())}
                                        />
                                    </div>
                                    {errors.referral_code && <InputError message={errors.referral_code} className="mt-1" />}
                                </div>
                            </div>

                            {/* Terms */}
                            <div className="text-[11px] text-slate-500 text-center py-2">
                                By continuing, you agree to our <a href="#" className="text-violet-400 hover:text-violet-300 font-medium hover:underline">Terms</a> and <a href="#" className="text-violet-400 hover:text-violet-300 font-medium hover:underline">Privacy Policy</a>
                            </div>

                            {/* Submit */}
                            <PrimaryButton className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-violet-500 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] border border-white/10" disabled={processing}>
                                {processing && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                                Create Account
                            </PrimaryButton>
                        </form>

                        {/* Bottom Security */}
                        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-medium mt-6">
                            <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            <span>Secure & encrypted connection</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Image Overlay for Dark Theme Integration */}
            <div className="hidden lg:block lg:w-[52%] relative overflow-hidden bg-black">
                {/* Blend the image into the dark theme */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A10] via-transparent to-transparent z-10" />
                <div className="absolute inset-0 bg-[#0A0A10]/40 z-10 mix-blend-multiply" />

                <img
                    src="/images/auth-register-hero.png"
                    alt="Golden angel statue with book"
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                />

                {/* Overlay content at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-12 z-20">
                    <div className="backdrop-blur-xl bg-black/40 rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20" />
                        <div className="relative flex items-center gap-6">
                            <div className="flex-1">
                                <h3 className="text-white font-black text-2xl tracking-tight mb-1">Your Story Begins Here</h3>
                                <p className="text-slate-300 text-sm">Write, design, and publish your book with AI-powered tools</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg">
                                    <span className="text-white text-xs font-bold tracking-wider uppercase">Cover Design</span>
                                </div>
                                <div className="px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg">
                                    <span className="text-white text-xs font-bold tracking-wider uppercase">Formatting</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
