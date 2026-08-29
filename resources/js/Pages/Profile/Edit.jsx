import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status, myPurchases = [] }) {
    return (
        <>
            <Head title="Profile" />

            <div className="bg-white shadow dark:bg-paper">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <h2 className="text-xl font-semibold leading-tight text-ink dark:text-ink-soft">
                        Profile
                    </h2>
                </div>
            </div>

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">

                    {/* My Purchases Section */}
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-paper">
                        <section>
                            <header>
                                <h2 className="text-lg font-medium text-ink dark:text-ink-soft">
                                    My Purchases
                                </h2>
                                <p className="mt-1 text-sm text-umber dark:text-umber">
                                    History of books and services you have purchased.
                                </p>
                            </header>

                            <div className="mt-6 flow-root">
                                <ul role="list" className="-my-5 divide-y divide-linen dark:divide-linen">
                                    {myPurchases.length > 0 ? myPurchases.map((purchase) => (
                                        <li key={purchase.id} className="py-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-shrink-0">
                                                    {purchase.book_cover ?
                                                        <img className="h-12 w-8 object-cover rounded shadow" src={`/storage/${purchase.book_cover}`} alt={purchase.book_title} />
                                                        : <div className="h-12 w-8 bg-linen dark:bg-ink-soft rounded flex items-center justify-center text-xs">📖</div>
                                                    }
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium text-ink dark:text-ink-soft">{purchase.book_title}</p>
                                                    <p className="truncate text-xs text-umber dark:text-umber">Transaction ID: {purchase.transaction_id}</p>
                                                    <p className="text-xs text-umber dark:text-umber">{purchase.created_at}</p>
                                                </div>
                                                <div>
                                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-700">
                                                        ₹{purchase.amount}
                                                    </span>
                                                </div>
                                            </div>
                                        </li>
                                    )) : (
                                        <p className="text-sm text-umber dark:text-umber py-4">No purchases found.</p>
                                    )}
                                </ul>
                            </div>
                        </section>
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-paper">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-paper">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-paper">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </>
    );
}
