import React, { useState } from 'react';
import axios from 'axios';

export default function AiWritingModal({ show, onClose, onInsert }) {
    if (!show) return null;

    const [prompt, setPrompt] = useState('');
    const [tone, setTone] = useState('Casual');
    const [generatedContent, setGeneratedContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const tones = ['Casual', 'Formal', 'Mystery', 'Thriller', 'Romance', 'Fantasy', 'Non-fiction'];

    const handleGenerate = async () => {
        if (!prompt) return;

        setIsLoading(true);
        setError(null);
        setGeneratedContent('');

        try {
            const response = await axios.post(route('ai.generate'), {
                prompt: prompt,
                tone: tone
            });

            if (response.data.success) {
                setGeneratedContent(response.data.content);
            } else {
                setError('Failed to generate content.');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'An error occurred while connecting to the AI.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedContent);
        alert('Copied to clipboard!');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="text-2xl">✨</span> AI Studio Assistant
                        </h3>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 bg-gray-50">

                    {/* Controls */}
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">What should I write?</label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="E.g., Write a chapter about a detective finding a hidden map in an old library..."
                                className="w-full border-gray-300 rounded-xl shadow-sm focus:border-purple-500 focus:ring-purple-500 min-h-[100px]"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Tone & Style</label>
                                <select
                                    value={tone}
                                    onChange={(e) => setTone(e.target.value)}
                                    className="w-full border-gray-300 rounded-xl shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                >
                                    {tones.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="flex-shrink-0 mt-6">
                                <button
                                    onClick={handleGenerate}
                                    disabled={isLoading || !prompt}
                                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Writing...
                                        </>
                                    ) : (
                                        <>
                                            <span>🪄</span> Generate
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Output */}
                    {generatedContent && (
                        <div className="bg-white border-2 border-purple-100 rounded-xl p-6 shadow-sm relative group animate-fade-in-up">
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={handleCopy}
                                    className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-bold transition-colors"
                                    title="Copy to clipboard"
                                >
                                    📋 Copy
                                </button>
                            </div>
                            <div className="prose prose-purple max-w-none whitespace-pre-wrap font-serif text-gray-800 leading-relaxed">
                                {generatedContent}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
