import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
  ShoppingBag, 
  Package, 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  ArrowRight
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, href, color }) => (
  <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        {trend && (
          <div className={`mt-2 flex items-center text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div className={`rounded-lg p-3 ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
    {href && (
      <Link href={href} className="mt-4 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800">
        View details <ArrowRight className="ml-1 w-4 h-4" />
      </Link>
    )}
  </div>
);

const RecentOrderRow = ({ order }) => {
  const statusColors = {
    pending_payment: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 text-sm font-medium text-gray-900">#{order.id}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{order.user?.name || 'Guest'}</td>
      <td className="px-4 py-3 text-sm text-gray-900">${order.total}</td>
      <td className="px-4 py-3">
        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
          {order.status?.replace('_', ' ')}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString()}</td>
    </tr>
  );
};

export default function Dashboard({ stats, recentOrders, lowStockProducts, customersWithOrders, topCustomers, recentCustomers }) {
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
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="mt-1 text-sm text-gray-600">Welcome back! Here's what's happening with your store.</p>
          </div>
        </div>
      }
    >
      <Head title="Dashboard" />

      <div className="py-8">
        <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Revenue"
              value={formatCurrency(stats?.revenue)}
              icon={DollarSign}
              color="bg-green-500"
              href={route('admin.orders.index')}
            />
            <StatCard
              title="Total Orders"
              value={stats?.orderCount || 0}
              icon={ShoppingBag}
              color="bg-blue-500"
              href={route('admin.orders.index')}
            />
            <StatCard
              title="Products"
              value={stats?.productCount || 0}
              icon={Package}
              color="bg-purple-500"
              href={route('admin.products.index')}
            />
            <StatCard
              title="Customers"
              value={stats?.userCount || 0}
              icon={Users}
              color="bg-orange-500"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Recent Orders */}
            <div className="lg:col-span-2 rounded-xl bg-white shadow-sm border border-gray-100">
              <div className="border-b border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                  <Link href={route('admin.orders.index')} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                    View all
                  </Link>
                </div>
              </div>
              <div className="overflow-x-auto">
                {recentOrders?.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Order</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Customer</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Total</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentOrders.map((order) => (
                        <RecentOrderRow key={order.id} order={order} />
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    No orders yet. Orders will appear here when customers make purchases.
                  </div>
                )}
              </div>
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              {/* Top Customers - Real customers from ShopApp */}
              <div className="rounded-xl bg-white shadow-sm border border-gray-100">
                <div className="border-b border-gray-100 p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Top Customers
                    </h3>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {stats?.customerCount || 0} total
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Real customers from ShopApp</p>
                </div>
                <div className="p-6">
                  {topCustomers?.length > 0 ? (
                    <div className="space-y-4">
                      {topCustomers.map((customer, index) => (
                        <div key={customer.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-600">
                              {index + 1}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                              <p className="text-xs text-gray-500">{customer.email}</p>
                              <p className="text-xs text-gray-400">{customer.orders_count} orders</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">{formatCurrency(customer.total_spent)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">No customers with orders yet.</p>
                  )}
                </div>
                <div className="border-t border-gray-100 p-4">
                  <Link href={route('admin.users.index')} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                    View all customers →
                  </Link>
                </div>
              </div>

              {/* Recent Customers Today */}
              {recentCustomers?.length > 0 && (
                <div className="rounded-xl bg-white shadow-sm border border-gray-100">
                  <div className="border-b border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900">New Orders Today</h3>
                    <p className="text-xs text-gray-500 mt-1">Customers who ordered today</p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {recentCustomers.map((customer) => (
                        <div key={customer.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                            <p className="text-xs text-gray-500">{customer.email}</p>
                          </div>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {customer.orders_count} today
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Low Stock Alert */}
              <div className="rounded-xl bg-white shadow-sm border border-gray-100">
                <div className="border-b border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
                </div>
                <div className="p-6">
                  {lowStockProducts?.length > 0 ? (
                    <div className="space-y-4">
                      {lowStockProducts.map((product) => (
                        <div key={product.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-500">SKU: {product.sku || 'N/A'}</p>
                          </div>
                          <div className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            product.stock === 0 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {product.stock} left
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">All products have sufficient stock.</p>
                  )}
                </div>
                <div className="border-t border-gray-100 p-4">
                  <Link href={route('admin.products.index')} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                    Manage inventory →
                  </Link>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href={route('admin.products.create')}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-700">Add New Product</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Link>
                  <Link
                    href={route('admin.categories.index')}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-700">Manage Categories</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Link>
                  <Link
                    href={route('admin.orders.index')}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-700">View Orders</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
