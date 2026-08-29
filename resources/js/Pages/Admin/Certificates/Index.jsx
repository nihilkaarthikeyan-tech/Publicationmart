import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function CertificatesIndex({ auth, certificates }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        recipient_name: '',
        certificate_name: '',
        file: null,
    });

    const [showForm, setShowForm] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.certificates.store'), {
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this certificate?')) {
            router.delete(route('admin.certificates.destroy', id));
        }
    };

    return (
        <>
            <Head title="Manage Certificates" />

            <div className="min-h-screen bg-vellum dark:bg-paper py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Header Action */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="font-semibold text-2xl text-ink dark:text-ink-soft leading-tight">Certificate Manager</h2>
                            <div className="text-umber dark:text-umber mt-1">
                                Issue certificates to users before they even sign up.
                            </div>
                        </div>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-lg shadow-indigo-500/30"
                        >
                            {showForm ? 'Cancel' : '+ Issue New Certificate'}
                        </button>
                    </div>

                    {/* Issue Form */}
                    {showForm && (
                        <div className="bg-white dark:bg-paper p-6 rounded-lg shadow-lg border border-indigo-500/30 animate-in fade-in slide-in-from-top-4">
                            <h3 className="text-lg font-bold text-ink dark:text-ink mb-4">Issue Digital Certificate</h3>
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel value="Recipient Email (Key Anchor)" />
                                    <TextInput
                                        type="email"
                                        className="w-full mt-1"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        placeholder="user@example.com"
                                    />
                                    <InputError message={errors.email} className="mt-2" />
                                    <p className="text-xs text-umber mt-1">
                                        * Does not need an existing account. Will auto-link when they join.
                                    </p>
                                </div>

                                <div>
                                    <InputLabel value="Recipient Name" />
                                    <TextInput
                                        type="text"
                                        className="w-full mt-1"
                                        value={data.recipient_name}
                                        onChange={e => setData('recipient_name', e.target.value)}
                                        placeholder="John Doe"
                                    />
                                    <InputError message={errors.recipient_name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel value="Certificate Title / Course" />
                                    <TextInput
                                        type="text"
                                        className="w-full mt-1"
                                        value={data.certificate_name}
                                        onChange={e => setData('certificate_name', e.target.value)}
                                        placeholder="e.g. Master of Publishing"
                                    />
                                    <InputError message={errors.certificate_name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel value="Upload Certificate (PDF/Image)" />
                                    <input
                                        type="file"
                                        className="w-full mt-1 text-umber file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-ink-soft dark:file:text-ink-soft"
                                        onChange={e => setData('file', e.target.files[0])}
                                    />
                                    <InputError message={errors.file} className="mt-2" />
                                </div>

                                <div className="md:col-span-2 flex justify-end">
                                    <PrimaryButton disabled={processing} className="w-full md:w-auto">
                                        {processing ? 'Issuing...' : 'Issue Certificate Now'}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Certificates List */}
                    <div className="bg-white dark:bg-paper overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-ink dark:text-ink-soft mb-4">Issued Certificates</h3>

                            {certificates.length === 0 ? (
                                <p className="text-umber text-center py-10">No certificates issued yet.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-linen dark:divide-linen">
                                        <thead className="bg-vellum">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-umber dark:text-ink-soft uppercase tracking-wider">Recipient</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-umber dark:text-ink-soft uppercase tracking-wider">Title</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-umber dark:text-ink-soft uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-umber dark:text-ink-soft uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-umber dark:text-ink-soft uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-paper divide-y divide-linen dark:divide-linen">
                                            {certificates.map((cert) => (
                                                <tr key={cert.id} className="hover:bg-paper dark:hover:bg-vellum transition">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-ink dark:text-ink">{cert.recipient_name}</div>
                                                        <div className="text-sm text-umber">{cert.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="px-2 py-1 text-xs font-semibold bg-indigo-100 text-indigo-800 rounded-full">
                                                            {cert.certificate_name}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {cert.is_claimed ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                <span className="w-2 h-2 mr-1 bg-green-400 rounded-full"></span>
                                                                Claimed
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                <span className="w-2 h-2 mr-1 bg-yellow-400 rounded-full animate-pulse"></span>
                                                                Pending
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-umber">
                                                        {new Date(cert.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <a
                                                            href={`/storage/${cert.file_path}`}
                                                            target="_blank"
                                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                        >
                                                            View
                                                        </a>
                                                        <button
                                                            onClick={() => handleDelete(cert.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
