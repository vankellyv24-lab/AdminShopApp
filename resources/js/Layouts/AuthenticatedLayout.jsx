import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import ToastStack from '@/Components/ToastStack';
import useToast from '@/Hooks/useToast';
import { Link, usePage } from '@inertiajs/react';
import { createContext, useEffect, useMemo, useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Tags, 
  Users,
  BarChart3,
  History,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

export const ToastContext = createContext(null);

const NavItem = ({ href, active, icon: Icon, children }) => (
  <NavLink
    href={href}
    active={active}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      active 
        ? 'bg-indigo-50 text-indigo-700' 
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    <Icon className="h-4 w-4" />
    {children}
  </NavLink>
);

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const flash = usePage().props.flash;

    const toast = useToast();

    useEffect(() => {
        if (flash?.success) {
            toast.push({ type: 'success', title: 'Success', message: flash.success });
        }
        if (flash?.error) {
            toast.push({ type: 'error', title: 'Error', message: flash.error });
        }
    }, [flash?.success, flash?.error, toast]);

    const toastContextValue = useMemo(() => toast, [toast]);

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <ToastContext.Provider value={toastContextValue}>
        <div className="min-h-screen bg-[#f6f7f9]">
            <nav className="border-b border-gray-200/80 bg-white/80 backdrop-blur sticky top-0 z-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex items-center gap-8">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-indigo-600" />
                                </Link>
                            </div>

                            <div className="hidden sm:flex items-center gap-1">
                                <NavItem
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                    icon={LayoutDashboard}
                                >
                                    Dashboard
                                </NavItem>
                                <NavItem
                                    href={route('admin.categories.index')}
                                    active={route().current('admin.categories.*')}
                                    icon={Tags}
                                >
                                    Categories
                                </NavItem>
                                <NavItem
                                    href={route('admin.products.index')}
                                    active={route().current('admin.products.*')}
                                    icon={Package}
                                >
                                    Products
                                </NavItem>
                                <NavItem
                                    href={route('admin.orders.index')}
                                    active={route().current('admin.orders.*')}
                                    icon={ShoppingBag}
                                >
                                    Orders
                                </NavItem>
                                <NavItem
                                    href={route('admin.users.index')}
                                    active={route().current('admin.users.*')}
                                    icon={Users}
                                >
                                    Customers
                                </NavItem>
                                <NavItem
                                    href={route('admin.reports.index')}
                                    active={route().current('admin.reports.*')}
                                    icon={BarChart3}
                                >
                                    Reports
                                </NavItem>
                                <NavItem
                                    href={route('admin.activity-logs.index')}
                                    active={route().current('admin.activity-logs.*')}
                                    icon={History}
                                >
                                    Activity Log
                                </NavItem>
                            </div>
                        </div>

                        <div className="hidden sm:flex sm:items-center">
                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-lg">
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                            >
                                                {user.name}
                                                <ChevronDown className="h-4 w-4" />
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                                className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            >
                                {showingNavigationDropdown ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className={`sm:hidden ${showingNavigationDropdown ? 'block' : 'hidden'}`}>
                    <div className="space-y-1 border-t border-gray-100 p-4">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                            <div className="flex items-center gap-2">
                                <LayoutDashboard className="h-4 w-4" />
                                Dashboard
                            </div>
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('admin.categories.index')} active={route().current('admin.categories.*')}>
                            <div className="flex items-center gap-2">
                                <Tags className="h-4 w-4" />
                                Categories
                            </div>
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('admin.products.index')} active={route().current('admin.products.*')}>
                            <div className="flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Products
                            </div>
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('admin.orders.index')} active={route().current('admin.orders.*')}>
                            <div className="flex items-center gap-2">
                                <ShoppingBag className="h-4 w-4" />
                                Orders
                            </div>
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('admin.users.index')} active={route().current('admin.users.*')}>
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Customers
                            </div>
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('admin.reports.index')} active={route().current('admin.reports.*')}>
                            <div className="flex items-center gap-2">
                                <BarChart3 className="h-4 w-4" />
                                Reports
                            </div>
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('admin.activity-logs.index')} active={route().current('admin.activity-logs.*')}>
                            <div className="flex items-center gap-2">
                                <History className="h-4 w-4" />
                                Activity Log
                            </div>
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-gray-100 p-4">
                        <div className="text-base font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>Profile</ResponsiveNavLink>
                            <ResponsiveNavLink href={route('logout')} method="post" as="button">
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow-sm border-b border-gray-100">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
        <ToastStack toasts={toast.toasts} onDismiss={toast.remove} />
        </ToastContext.Provider>
    );
}
