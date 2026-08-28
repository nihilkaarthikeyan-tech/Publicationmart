import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import CreateCouponModal from '../Components/CreateCouponModal';

export default function CouponIndex({ auth, coupons }) {
    const [showCreateModal, setShowCreateModal] = useState(false);

    return (
        <>
            <Head title="Manage Coupons" />

            <div className="min-h-screen bg-parchment text-ink font-sans selection:bg-indigo-500/30">
                {/* Background */}
                <div className="fixed inset-0 z-0 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-50 rounded-full blur-[120px]"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-ink mb-2">Coupons & Discounts</h1>
                            <p className="text-umber">Manage promotional codes and discounts.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href={route('admin.dashboard')} className="px-4 py-2 bg-paper hover:bg-slate-700 text-ink-soft rounded-lg text-sm font-bold transition-colors">
                                Dashboard
                            </Link>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all transform hover:scale-105"
                            >
                                + Create Coupon
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="grid grid-cols-1 gap-6">
                        {/* Summary / Stats could go here */}

                        {/* Main List (if not using modal list as main view) */}
                        <div className="bg-slate-100 backdrop-blur border border-linen rounded-2xl overflow-hidden">
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-ink mb-4">Active Campaign Codes</h3>
                                {coupons.length === 0 ? (
                                    <div className="text-center py-10 text-umber">
                                        No coupons created yet. Click "Create Coupon" to start.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm text-umber">
                                            <thead className="bg-paper text-ink-soft uppercase font-bold text-xs">
                                                <tr>
                                                    <th className="px-4 py-3">Code</th>
                                                    <th className="px-4 py-3">Discount</th>
                                                    <th className="px-4 py-3">Min Order</th>
                                                    <th className="px-4 py-3">Usage</th>
                                                    <th className="px-4 py-3">Status</th>
                                                    <th className="px-4 py-3">Created By</th>
                                                    <th className="px-4 py-3 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-linen">
                                                {coupons.map(coupon => (
                                                    <tr key={coupon.id} className="hover:bg-paper transition-colors">
                                                        <td className="px-4 py-3 font-mono font-bold text-ink">{coupon.code}</td>
                                                        <td className="px-4 py-3 text-indigo-700 font-bold">{parseInt(coupon.discount_percentage)}%</td>
                                                        <td className="px-4 py-3">{coupon.min_order_value ? `₹${coupon.min_order_value}` : '-'}</td>
                                                        <td className="px-4 py-3">{coupon.usage_count} uses</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${coupon.is_active ? 'bg-emerald-500/10 text-emerald-700' : 'bg-red-500/10 text-red-700'}`}>
                                                                {coupon.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">{coupon.creator?.name || 'Unknown'}</td>
                                                        <td className="px-4 py-3 text-right">
                                                            <button
                                                                onClick={() => setShowCreateModal(true)}
                                                                className="text-indigo-700 hover:text-ink transition-colors text-xs font-bold"
                                                            >
                                                                Manage
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

                {/* Modal */}
                {showCreateModal && (
                    <CreateCouponModal
                        coupons={coupons}
                        onClose={() => setShowCreateModal(false)}
                    />
                )}
            </div>
        </>
    );
}
