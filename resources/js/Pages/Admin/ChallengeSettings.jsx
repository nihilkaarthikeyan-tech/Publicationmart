import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

function ChallengeCard({ setting }) {
    const [mode, setMode] = useState(setting.video_type || 'url');

    const { data, setData, post, processing, errors, reset } = useForm({
        challenge_type: setting.challenge_type,
        video_type: setting.video_type || 'url',
        video_url: setting.video_url || '',
        video_file: null,
        video_thumbnail: null,
        video_title: setting.video_title || '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.challenge-settings.update'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => reset('video_file', 'video_thumbnail'),
        });
    };

    const removeVideo = () => {
        if (!confirm(`Remove the video for ${setting.challenge_type}? This deletes any uploaded file.`)) return;
        router.delete(route('admin.challenge-settings.remove-video'), {
            data: { challenge_type: setting.challenge_type },
            preserveScroll: true,
        });
    };

    const pickMode = (m) => { setMode(m); setData('video_type', m); };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                    <h3 className="text-lg font-bold text-white">{setting.challenge_type}</h3>
                    <p className="text-sm mt-1">
                        {setting.has_video
                            ? <span className="text-emerald-400">Video is live on the challenges page</span>
                            : <span className="text-gray-500">No video — visitors see the placeholder</span>}
                    </p>
                </div>
                {setting.has_video && (
                    <button
                        type="button"
                        onClick={removeVideo}
                        className="shrink-0 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold transition-colors"
                    >
                        Remove
                    </button>
                )}
            </div>

            {/* Current video preview */}
            {setting.has_video && (
                <div className="mb-5 rounded-xl overflow-hidden border border-white/10 bg-black/40 max-w-[220px]">
                    {setting.video_type === 'url' && setting.video_url ? (
                        <div className="relative pt-[177.77%]">
                            <iframe
                                src={setting.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                                className="absolute inset-0 w-full h-full"
                                frameBorder="0"
                                allowFullScreen
                                title={`${setting.challenge_type} video`}
                            ></iframe>
                        </div>
                    ) : setting.video_file ? (
                        <video controls className="w-full h-auto" src={setting.video_file} poster={setting.video_thumbnail || undefined} />
                    ) : null}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                {/* Source toggle */}
                <div className="flex gap-2">
                    {['url', 'upload'].map((m) => (
                        <button
                            key={m}
                            type="button"
                            onClick={() => pickMode(m)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors border ${
                                mode === m
                                    ? 'bg-indigo-500 text-white border-indigo-400'
                                    : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
                            }`}
                        >
                            {m === 'url' ? 'YouTube / link' : 'Upload file'}
                        </button>
                    ))}
                </div>

                {mode === 'url' ? (
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1.5">Video link</label>
                        <input
                            type="url"
                            value={data.video_url}
                            onChange={(e) => setData('video_url', e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:border-indigo-500 focus:outline-none"
                        />
                        {errors.video_url && <p className="text-red-400 text-xs mt-1">{errors.video_url}</p>}
                        <p className="text-gray-600 text-xs mt-1.5">A normal YouTube link works — it is converted to an embed automatically.</p>
                    </div>
                ) : (
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1.5">Video file</label>
                        <input
                            type="file"
                            accept="video/mp4,video/webm,video/quicktime"
                            onChange={(e) => setData('video_file', e.target.files[0])}
                            className="w-full text-sm text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-500 file:text-white file:font-bold file:cursor-pointer"
                        />
                        {errors.video_file && <p className="text-red-400 text-xs mt-1">{errors.video_file}</p>}
                        <p className="text-gray-600 text-xs mt-1.5">MP4, WebM or MOV — up to 100 MB.</p>
                    </div>
                )}

                <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1.5">
                        Thumbnail <span className="text-gray-600 normal-case tracking-normal">(optional)</span>
                    </label>
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => setData('video_thumbnail', e.target.files[0])}
                        className="w-full text-sm text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/10 file:text-gray-200 file:font-bold file:cursor-pointer"
                    />
                    {errors.video_thumbnail && <p className="text-red-400 text-xs mt-1">{errors.video_thumbnail}</p>}
                </div>

                <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1.5">
                        Title <span className="text-gray-600 normal-case tracking-normal">(optional)</span>
                    </label>
                    <input
                        type="text"
                        value={data.video_title}
                        onChange={(e) => setData('video_title', e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                    />
                    {errors.video_title && <p className="text-red-400 text-xs mt-1">{errors.video_title}</p>}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60 text-white font-bold rounded-lg transition-colors"
                >
                    {processing ? 'Saving…' : 'Save video'}
                </button>
            </form>
        </div>
    );
}

export default function ChallengeSettings({ settings = [], flash = {} }) {
    return (
        <>
            <Head title="Challenge Videos" />

            <div className="min-h-screen bg-[#0f0a1e] py-10 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
                        <h1 className="text-2xl font-bold text-white">Challenge Videos</h1>
                        <Link
                            href={route('admin.dashboard')}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 rounded-lg text-sm transition-colors"
                        >
                            ← Back to dashboard
                        </Link>
                    </div>
                    <p className="text-gray-400 mb-8">
                        Set the promo video shown beside each challenge on the public challenges page.
                    </p>

                    {flash.success && (
                        <div className="mb-6 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-sm">
                            {flash.success}
                        </div>
                    )}
                    {flash.error && (
                        <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl text-sm">
                            {flash.error}
                        </div>
                    )}

                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {settings.map((s) => (
                            <ChallengeCard key={s.challenge_type} setting={s} />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
