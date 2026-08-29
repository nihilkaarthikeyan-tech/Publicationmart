import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <div className="min-h-screen bg-parchment flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-paper">
            <Head title="Verify Email" />

            {/* Ambient Background Effects */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3 group">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-6 h-6 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </Link>
                    <h2 className="mt-4 text-2xl font-bold text-ink tracking-tight">Check your inbox</h2>
                </div>

                {/* Main Card */}
                <div className="bg-paper border border-gray-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
                    <div className="text-umber text-sm leading-relaxed mb-6">
                        <p>
                            Thanks for signing up! Before getting started, could you verify
                            your email address by clicking on the link we just emailed to
                            you?
                        </p>
                        <p className="mt-4">
                            If you didn't receive the email, we will gladly send you another.
                        </p>
                    </div>

                    {status === 'verification-link-sent' && (
                        <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-green-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-medium text-green-700">
                                    A new verification link has been sent to your email address.
                                </span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div className="flex flex-col gap-4">
                            <PrimaryButton
                                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f1014] focus:ring-indigo-500 transition-all transform hover:scale-[1.02] shadow-lg shadow-indigo-600/25"
                                disabled={processing}
                            >
                                {processing ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending...
                                    </span>
                                ) : (
                                    'Resend Verification Email'
                                )}
                            </PrimaryButton>

                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="w-full py-3 text-sm font-semibold text-umber hover:text-ink-soft transition-colors border border-gray-800 hover:border-gray-700 rounded-xl hover:bg-paper"
                            >
                                Log Out
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Footer Help */}
                <p className="mt-8 text-center text-sm text-umber">
                    Need help? <a href="#" className="text-indigo-700 hover:text-indigo-700">Contact Support</a>
                </p>
            </div>
        </div>
    );
}

// Full-screen page: renders its own chrome, so the global Layout stays off.
VerifyEmail.layout = null;
