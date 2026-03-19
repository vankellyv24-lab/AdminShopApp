import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gradient-to-b from-primary-50 to-gray-100 pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/">
                    <ApplicationLogo className="h-20 w-20 fill-current text-primary-600" />
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden rounded-2xl border border-white/40 bg-white/80 px-6 py-5 shadow-xl backdrop-blur sm:max-w-md">
                {children}
            </div>
        </div>
    );
}
