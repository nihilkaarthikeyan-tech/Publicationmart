import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen bg-parchment flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-ink">
            <Head title="Reset Password" />

            {/* Ambient Background Effects */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3 group">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-6 h-6 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                    </Link>
                    <h2 className="mt-4 text-2xl font-bold text-ink tracking-tight">Set new password</h2>
                </div>

                {/* Main Card */}
                <div className="bg-paper border border-gray-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
                    <form onSubmit={submit} className="space-y-6">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-ink-soft mb-1.5" htmlFor="email">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-umber group-focus-within:text-indigo-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="block w-full pl-11 pr-4 py-3 border border-gray-800 rounded-xl bg-paper text-ink-soft placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm"
                                    autoComplete="username"
                                    onChange={(e) => setData('email', e.target.value)}
                                    readOnly={!!email} // If email is passed, make it read-only
                                />
                            </div>
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-ink-soft mb-1.5" htmlFor="password">New Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-umber group-focus-within:text-indigo-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="block w-full pl-11 pr-4 py-3 border border-gray-800 rounded-xl bg-paper text-ink-soft placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm"
                                    autoComplete="new-password"
                                    isFocused={true}
                                    placeholder="Minimum 8 characters"
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                            </div>
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        {/* Password Confirmation */}
                        <div>
                            <label className="block text-sm font-medium text-ink-soft mb-1.5" htmlFor="password_confirmation">Confirm Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-umber group-focus-within:text-indigo-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <TextInput
                                    type="password"
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="block w-full pl-11 pr-4 py-3 border border-gray-800 rounded-xl bg-paper text-ink-soft placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm"
                                    autoComplete="new-password"
                                    placeholder="Re-enter password"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                />
                            </div>
                            <InputError message={errors.password_confirmation} className="mt-2" />
                        </div>

                        <PrimaryButton
                            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f1014] focus:ring-indigo-500 transition-all transform hover:scale-[1.02] shadow-lg shadow-indigo-600/25"
                            disabled={processing}
                        >
                            {processing ? 'Resetting...' : 'Reset Password'}
                        </PrimaryButton>
                    </form>
                </div>
            </div>
        </div>
    );
}

// Full-screen page: renders its own chrome, so the global Layout stays off.
ResetPassword.layout = null;
