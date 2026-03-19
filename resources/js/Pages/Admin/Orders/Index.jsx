import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { 
  Search, 
  Eye, 
  ShoppingBag,
  Filter
} from 'lucide-react';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending_payment: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending Payment' },
    paid: { color: 'bg-blue-100 text-blue-800', label: 'Paid' },
    processing: { color: 'bg-purple-100 text-purple-800', label: 'Processing' },
    shipped: { color: 'bg-indigo-100 text-indigo-800', label: 'Shipped' },
    delivered: { color: 'bg-green-100 text-green-800', label: 'Delivered' },
    cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
  };

  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.color}`}>
      {config.label}
    </span>
  );
};

export default function Index({ orders, filters }) {
  const [query, setQuery] = useState(filters?.q ?? '');
  const [statusFilter, setStatusFilter] = useState(filters?.status ?? '');

  const rows = useMemo(() => orders?.data ?? [], [orders?.data]);

  const submitSearch = (e) => {
    e.preventDefault();
    router.get(
      route('admin.orders.index'),
      { q: query || undefined, status: statusFilter || undefined },
      { preserveState: true, replace: true },
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value || 0);
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
            <p className="mt-1 text-sm text-gray-600">Manage and track customer orders</p>
          </div>
        </div>
      }
    >
      <Head title="Orders" />

      <div className="py-8">
        <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
            <form onSubmit={submitSearch} className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <TextInput
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10 block w-full"
                    placeholder="Search by order ID or customer name..."
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">All Statuses</option>
                  <option value="pending_payment">Pending Payment</option>
                  <option value="paid">Paid</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <PrimaryButton type="submit" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </PrimaryButton>
            </form>
          </div>

          {/* Orders Table */}
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Order ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Total
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                        <ShoppingBag className="mx-auto h-12 w-12 text-gray-300" />
                        <p className="mt-2 text-sm">No orders found</p>
                      </td>
                    </tr>
                  ) : (
                    rows.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">
                          #{order.id}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {order.user?.name || 'Guest'}
                          <div className="text-xs text-gray-400">{order.user?.email}</div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-4 text-right text-sm font-semibold text-gray-900">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Link
                            href={route('admin.orders.show', order.id)}
                            className="inline-flex items-center rounded-md px-2 py-1 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                          >
                            <Eye className="mr-1 h-4 w-4" />
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {orders?.links?.length > 0 && (
              <div className="border-t border-gray-100 px-4 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {orders.from} to {orders.to} of {orders.total} results
                  </p>
                  <div className="flex gap-2">
                    {orders.links.map((link, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={!link.url}
                        onClick={() => link.url && router.visit(link.url)}
                        className={`rounded-md px-3 py-1.5 text-sm ${
                          link.active
                            ? 'bg-indigo-600 text-white'
                            : link.url
                            ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
