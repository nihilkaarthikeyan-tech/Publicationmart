import { useForm, router } from '@inertiajs/react';

export default function CreateCouponModal({ onClose, coupons = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        discount_percentage: '',
        min_order_value: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.coupons.store'), {
            onSuccess: () => {
                // Keep modal open or close it? The user code closes it.
                // But since it shows the list, maybe we want to keep it open?
                // The user code calls onClose(). I'll stick to that.
                // Actually, if it closes, successful creation feedback is shown via flash message on the parent page.
                // But the user might want to see the new coupon in the list immediately.
                // If I close it, they have to reopen it.
                // I will modify it slightly to reset form but keep open?
                // The user code: onSuccess: () => { onClose(); }
                // I will stick to user code for now.
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#faf8f3] backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in border border-gray-100">
                {/* Header */}
                <div className="flex justify-between items-center px-5 py-4 border-b border-gray-50 bg-gray-50/30">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-lg">🎟️</span> Manage Coupons
                    </h3>
                    <button onClick={onClose} className="text-[#635c4e] hover:text-[#635c4e] transition-colors p-1 hover:bg-gray-100 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Compact Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase tracking-wider text-[#635c4e] ml-1">Code</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-[#635c4e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={data.code}
                                    onChange={e => setData('code', e.target.value.toUpperCase())}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-mono font-bold uppercase"
                                    placeholder="SUMMER20"
                                    required
                                />
                            </div>
                            {errors.code && <p className="text-[10px] text-red-500 font-bold px-1">{errors.code}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase tracking-wider text-[#635c4e] ml-1">Discount %</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-[#635c4e] text-xs font-bold">%</span>
                                </div>
                                <input
                                    type="number"
                                    value={data.discount_percentage}
                                    onChange={e => setData('discount_percentage', e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-lg pl-8 pr-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold"
                                    placeholder="20"
                                    min="1"
                                    max="100"
                                    required
                                />
                            </div>
                            {errors.discount_percentage && <p className="text-[10px] text-red-500 font-bold px-1">{errors.discount_percentage}</p>}
                        </div>

                        <div className="col-span-2 space-y-1.5">
                            <label className="text-[11px] font-black uppercase tracking-wider text-[#635c4e] ml-1">Min Order Value (Optional)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-[#635c4e] text-xs font-bold">₹</span>
                                </div>
                                <input
                                    type="number"
                                    value={data.min_order_value}
                                    onChange={e => setData('min_order_value', e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-lg pl-8 pr-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold"
                                    placeholder="0.00"
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-50 text-sm"
                    >
                        {processing ? 'Creating...' : 'Generate Coupon'}
                    </button>
                </form>

                {/* Existing Coupons List */}
                <div className="bg-gray-50 p-4 border-t border-gray-100 max-h-[35vh] overflow-y-auto custom-scrollbar">
                    <h4 className="text-[11px] text-[#635c4e] font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span>📜</span> Active Coupons
                    </h4>
                    {coupons.length > 0 ? (
                        <div className="space-y-2">
                            {coupons.map((coupon) => (
                                <div key={coupon.id} className="bg-white border border-gray-100 rounded-lg p-3 flex items-center justify-between shadow-sm hover:border-indigo-100 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${coupon.is_active ? 'bg-emerald-500' : 'bg-red-400'}`}></div>
                                        <div>
                                            <p className="text-sm text-gray-800 font-bold font-mono uppercase leading-tight">{coupon.code}</p>
                                            <p className="text-indigo-600 text-[10px] font-black uppercase">{parseInt(coupon.discount_percentage)}% OFF {coupon.min_order_value ? `(Min ₹${coupon.min_order_value})` : ''}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-right mr-1">
                                            <p className="text-xs text-gray-800 font-bold leading-tight">{coupon.usage_count}</p>
                                            <p className="text-[9px] text-[#635c4e] uppercase font-bold tracking-tight">Uses</p>
                                        </div>

                                        <button
                                            onClick={() => router.post(route('admin.coupons.toggle', coupon.id), {}, { preserveScroll: true })}
                                            className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tight transition-colors ${coupon.is_active ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                                        >
                                            {coupon.is_active ? 'Disable' : 'Enable'}
                                        </button>

                                        <button
                                            onClick={() => { if (confirm('Delete coupon?')) router.delete(route('admin.coupons.destroy', coupon.id), { preserveScroll: true }) }}
                                            className="p-1.5 text-[#4b443a] hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-[#635c4e] italic text-xs">No active coupons.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
