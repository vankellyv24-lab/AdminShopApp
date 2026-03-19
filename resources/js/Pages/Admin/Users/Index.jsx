import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Users,
  ShoppingBag,
  Mail,
  RefreshCw,
  UserCircle,
  Package
} from 'lucide-react';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Index() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [synced, setSynced] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/users');
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
        setSynced(data.synced);
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!query.trim()) return users;
    const lower = query.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(lower) ||
        u.email?.toLowerCase().includes(lower)
    );
  }, [users, query]);

  const totalSpent = useMemo(
    () => users.reduce((sum, u) => sum + (u.total_spent || 0), 0),
    [users]
  );

  const totalOrders = useMemo(
    () => users.reduce((sum, u) => sum + (u.orders_count || 0), 0),
    [users]
  );

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
            <p className="mt-1 text-sm text-gray-600">
              View all customers from ShopApp with their order history
            </p>
          </div>
          <PrimaryButton
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Syncing...' : 'Sync Users'}
          </PrimaryButton>
        </div>
      }
    >
      <Head title="Customers" />

      <div className="py-8">
        <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-100 p-3">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-3">
                  <ShoppingBag className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-3">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Orders/Customer</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.length > 0 ? (totalOrders / users.length).toFixed(1) : 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 p-3">
                  <UserCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSpent)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <TextInput
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 block w-full"
                  placeholder="Search customers by name or email..."
                />
              </div>
              {!loading && synced > 0 && (
                <p className="text-sm text-green-600">
                  Synced {synced} users from Firebase
                </p>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-red-50 p-4 border border-red-100">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Users Table */}
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Role
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Orders
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Total Spent
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Recent Orders
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {loading && users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                        <RefreshCw className="mx-auto h-12 w-12 text-gray-300 animate-spin" />
                        <p className="mt-2 text-sm">Loading customers...</p>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                        <Users className="mx-auto h-12 w-12 text-gray-300" />
                        <p className="mt-2 text-sm">
                          {query ? 'No customers match your search' : 'No customers found'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.external_id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-indigo-600 font-semibold text-sm">
                                {user.name?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{user.name}</p>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900">
                            <ShoppingBag className="h-4 w-4 text-gray-400" />
                            {user.orders_count || 0}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right text-sm font-semibold text-gray-900">
                          {formatCurrency(user.total_spent)}
                        </td>
                        <td className="px-4 py-4">
                          {user.orders && user.orders.length > 0 ? (
                            <div className="space-y-1">
                              {user.orders.slice(0, 2).map((order) => (
                                <div
                                  key={order.id}
                                  className="flex items-center justify-between text-xs"
                                >
                                  <span className="text-gray-600">
                                    #{order.id} - {formatDate(order.created_at)}
                                  </span>
                                  <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${
                                    order.status === 'delivered'
                                      ? 'bg-green-100 text-green-800'
                                      : order.status === 'paid'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {order.status}
                                  </span>
                                </div>
                              ))}
                              {user.orders.length > 2 && (
                                <p className="text-xs text-gray-400">
                                  +{user.orders.length - 2} more orders
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">No orders yet</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
