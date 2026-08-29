import { useEffect } from 'react';

export default function OrderDetailsModal({ order, onClose }) {
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    if (!order) return null;

    const ship = order.pys_shipping_details || {};
    const dash = <span className="italic opacity-40">Not provided</span>;

    const rows = [
        ['Transaction ID', order.id],
        ['Order Reference', order.transaction_id],
        ['Book ID', order.book_id],
        ['Book', order.book_title],
        ['Amount', `₹${Number(order.amount).toFixed(2)}`],
        ['Payment Status', order.status],
        ['Ordered Date', order.date],
        ['Customer', ship.full_name || order.customer_name],
        ['Email', ship.email],
        ['Phone', ship.phone],
        ['Address', ship.address],
        ['City', ship.city],
        ['State', ship.state],
        ['Pincode', ship.pincode],
    ];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-paper backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-paper rounded-2xl w-full max-w-lg shadow-2xl border border-linen max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center px-5 py-4 border-b border-linen sticky top-0 bg-paper backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-ink flex items-center gap-2">
                        <svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        Order Details
                    </h3>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="text-umber hover:text-ink transition-colors p-1 hover:bg-vellum rounded-lg"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-5">
                    <dl className="divide-y divide-linen">
                        {rows.map(([label, value]) => (
                            <div key={label} className="grid grid-cols-3 gap-3 py-2.5">
                                <dt className="text-umber text-sm">{label}</dt>
                                <dd className={`col-span-2 text-sm break-words ${label === 'Payment Status' ? 'uppercase font-bold text-green-700' : 'text-ink'}`}>
                                    {value === null || value === undefined || value === '' ? dash : value}
                                </dd>
                            </div>
                        ))}
                    </dl>

                    {!order.pys_shipping_details && (
                        <p className="mt-4 text-xs text-amber-800/80 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                            No shipping details were recorded for this order.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
