import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart,
  Package,
  Download,
  Calendar
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }) => (
  <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
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
  </div>
);

const SimpleBarChart = ({ data, labelKey, valueKey, title }) => {
  const maxValue = Math.max(...data.map(d => d[valueKey] || 0));
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-2">
        {data.map((item, index) => {
          const value = item[valueKey] || 0;
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
          return (
            <div key={index} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-16 truncate">{item[labelKey]}</span>
              <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-700 w-12 text-right">
                {typeof value === 'number' && value > 1000 
                  ? `$${(value / 1000).toFixed(1)}k` 
                  : typeof value === 'number' 
                    ? value.toLocaleString() 
                    : value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const LineChart = ({ data, title }) => {
  if (!data || data.length === 0) return null;
  
  const maxRevenue = Math.max(...data.map(d => d.revenue || 0));
  const maxOrders = Math.max(...data.map(d => d.orders || 0));
  
  // Create SVG path for revenue line
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * 100;
    const y = maxRevenue > 0 ? 100 - ((d.revenue || 0) / maxRevenue) * 100 : 100;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-48 relative">
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#e5e7eb" strokeWidth="0.5" />
          ))}
          {/* Revenue area */}
          <polygon 
            points={`0,100 ${points} 100,100`}
            fill="rgba(99, 102, 241, 0.1)"
          />
          {/* Revenue line */}
          <polyline 
            points={points}
            fill="none"
            stroke="#6366f1"
            strokeWidth="2"
          />
        </svg>
        {/* X-axis labels */}
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          {data.filter((_, i) => i % Math.ceil(data.length / 6) === 0 || i === data.length - 1).map((d, i) => (
            <span key={i}>{d.label}</span>
          ))}
        </div>
      </div>
      <div className="flex justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
          <span className="text-gray-600">Revenue</span>
        </div>
      </div>
    </div>
  );
};

export default function Reports({ period, salesData, topProducts, summary, ordersByStatus, paymentMethods }) {
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value || 0);
  };

  const periodOptions = [
    { value: '7', label: 'Last 7 Days' },
    { value: '30', label: 'Last 30 Days' },
    { value: '90', label: 'Last 3 Months' },
    { value: '365', label: 'Last Year' },
  ];

  const handlePeriodChange = (e) => {
    const newPeriod = e.target.value;
    setSelectedPeriod(newPeriod);
    window.location.href = route('admin.reports.index', { period: newPeriod });
  };

  const handleExport = () => {
    window.location.href = route('admin.reports.export-orders', { 
      start_date: new Date(Date.now() - selectedPeriod * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
            <p className="mt-1 text-sm text-gray-600">Sales performance and business insights</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={handlePeriodChange}
              className="rounded-lg border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {periodOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>
      }
    >
      <Head title="Reports & Analytics" />

      <div className="py-8">
        <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Revenue"
              value={formatCurrency(summary?.totalRevenue)}
              icon={DollarSign}
              color="bg-green-500"
              trend="up"
              trendValue="+12% vs last period"
            />
            <StatCard
              title="Total Orders"
              value={summary?.totalOrders || 0}
              icon={ShoppingCart}
              color="bg-blue-500"
              trend="up"
              trendValue="+8% vs last period"
            />
            <StatCard
              title="Average Order"
              value={formatCurrency(summary?.averageOrderValue)}
              icon={BarChart3}
              color="bg-purple-500"
            />
            <StatCard
              title="Conversion Rate"
              value={`${(summary?.conversionRate || 0).toFixed(1)}%`}
              icon={TrendingUp}
              color="bg-orange-500"
              trend={summary?.conversionRate > 90 ? 'up' : 'down'}
              trendValue={`${summary?.cancelledOrders || 0} cancelled`}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LineChart 
              data={salesData} 
              title="Revenue Over Time" 
            />
            <SimpleBarChart 
              data={topProducts} 
              labelKey="name" 
              valueKey="total_revenue"
              title="Top Products by Revenue" 
            />
          </div>

          {/* Order Status & Payment Methods */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Status Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders by Status</h3>
              <div className="space-y-3">
                {Object.entries(ordersByStatus || {}).map(([status, count]) => {
                  const total = Object.values(ordersByStatus || {}).reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? (count / total) * 100 : 0;
                  const statusColors = {
                    pending_payment: 'bg-yellow-500',
                    paid: 'bg-blue-500',
                    processing: 'bg-purple-500',
                    shipped: 'bg-indigo-500',
                    delivered: 'bg-green-500',
                    cancelled: 'bg-red-500',
                  };
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-32 capitalize">{status.replace('_', ' ')}</span>
                      <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${statusColors[status] || 'bg-gray-400'} rounded-full`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 w-12 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
              <div className="space-y-3">
                {(paymentMethods || []).map((method) => (
                  <div key={method.payment_method} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-lg font-semibold text-indigo-600">
                          {(method.payment_method || '').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{method.payment_method}</p>
                        <p className="text-xs text-gray-500">{method.count} orders</p>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-900">{formatCurrency(method.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
