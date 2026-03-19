import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    return (
        <>
            <Head title="ShopApp Admin" />

            <div className="min-h-screen bg-[#f6f7f9]">
                <div className="mx-auto max-w-7xl px-6 py-10">
                    <header className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-white shadow">
                                <span className="text-sm font-extrabold">S</span>
                            </div>
                            <div>
                                <div className="text-lg font-extrabold text-gray-900">
                                    ShopApp Admin
                                </div>
                                <div className="text-sm font-semibold text-gray-600">
                                    Manage products, categories, and operations
                                </div>
                            </div>
                        </div>

                        <nav className="flex items-center gap-2">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-extrabold text-white shadow hover:bg-primary-600"
                                >
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-extrabold text-gray-900 hover:bg-gray-50"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-extrabold text-white shadow hover:bg-primary-600"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </nav>
                    </header>

                    <main className="mt-10 grid gap-6 lg:grid-cols-12">
                        <section className="lg:col-span-7">
                            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
                                <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-extrabold text-primary-700">
                                    Admin Dashboard
                                </div>
                                <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                                    The control center for your ShopApp store
                                </h1>
                                <p className="mt-4 text-base font-semibold text-gray-600">
                                    Keep your catalog clean, track inventory, and prepare the admin side
                                    for order integrations as your ShopApp grows.
                                </p>

                                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                    <Link
                                        href={auth.user ? route('dashboard') : route('login')}
                                        className="inline-flex items-center justify-center rounded-xl bg-primary-500 px-5 py-3 text-sm font-extrabold text-white shadow hover:bg-primary-600"
                                    >
                                        {auth.user ? 'Open Dashboard' : 'Start managing'}
                                    </Link>
                                    <Link
                                        href={route('admin.products.index')}
                                        className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-extrabold text-gray-900 hover:bg-gray-50"
                                    >
                                        Browse products
                                    </Link>
                                </div>

                                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <div className="rounded-2xl bg-[#f6f7f9] p-4">
                                        <div className="text-sm font-extrabold text-gray-900">
                                            Products
                                        </div>
                                        <div className="mt-1 text-sm font-semibold text-gray-600">
                                            Add, edit, activate, and track stock.
                                        </div>
                                    </div>
                                    <div className="rounded-2xl bg-[#f6f7f9] p-4">
                                        <div className="text-sm font-extrabold text-gray-900">
                                            Categories
                                        </div>
                                        <div className="mt-1 text-sm font-semibold text-gray-600">
                                            Organize your catalog with clean slugs.
                                        </div>
                                    </div>
                                    <div className="rounded-2xl bg-[#f6f7f9] p-4">
                                        <div className="text-sm font-extrabold text-gray-900">
                                            Orders
                                        </div>
                                        <div className="mt-1 text-sm font-semibold text-gray-600">
                                            Ready for API integration when available.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <aside className="lg:col-span-5">
                            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
                                <div className="text-sm font-extrabold text-gray-900">
                                    Environment
                                </div>
                                <div className="mt-3 space-y-2 text-sm font-semibold text-gray-700">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Laravel</span>
                                        <span>{laravelVersion}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">PHP</span>
                                        <span>{phpVersion}</span>
                                    </div>
                                </div>

                                <div className="mt-8 rounded-2xl bg-primary-500 p-6 text-white">
                                    <div className="text-base font-extrabold">
                                        Tip
                                    </div>
                                    <div className="mt-1 text-sm font-semibold text-white/90">
                                        Start by creating Categories, then add Products with stock so the dashboard shows meaningful KPIs.
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </main>

                    <footer className="mt-10 text-center text-xs font-semibold text-gray-500">
                        ShopApp Admin • Built with Laravel {laravelVersion}
                    </footer>
                </div>
            </div>
        </>
    );
}
