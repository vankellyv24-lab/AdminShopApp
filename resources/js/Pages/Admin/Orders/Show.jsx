import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { 
  ArrowLeft, 
  Package, 
  User, 
  CreditCard, 
  Truck, 
  Calendar,
  MapPin,
  CheckCircle,
  XCircle
} from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';

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
    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${config.color}`}>
      {config.label}
    </span>
  );
};

export default function Show({ order }) {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const { data, setData, put, processing } = useForm({
    status: order.status,
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: order.currency || 'USD',
    }).format(value || 0);
  };

  const handleStatusUpdate = (e) => {
    e.preventDefault();
    put(route('admin.orders.update', order.id), {
      onSuccess: () => setShowStatusModal(false),
    });
  };

  const statusOptions = [
    { value: 'pending_payment', label: 'Pending Payment', color: 'text-yellow-700' },
    { value: 'paid', label: 'Paid', color: 'text-blue-700' },
    { value: 'processing', label: 'Processing', color: 'text-purple-700' },
    { value: 'shipped', label: 'Shipped', color: 'text-indigo-700' },
    { value: 'delivered', label: 'Delivered', color: 'text-green-700' },
    { value: 'cancelled', label: 'Cancelled', color: 'text-red-700' },
  ];

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={route('admin.orders.index')}
              className="rounded-lg p-2 hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Order #{order.id}</h2>
              <p className="mt-1 text-sm text-gray-600">Placed on {formatDate(order.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={order.status} />
            <PrimaryButton onClick={() => setShowStatusModal(true)}>
              Update Status
            </PrimaryButton>
          </div>
        </div>
      }
    >
      <Head title={`Order #${order.id}`} />

      <div className="py-8">
        <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order Items
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {order.items?.map((item) => (
                    <div key={item.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center">
                          {item.product?.image_url ? (
                            <img 
                              src={item.product.image_url} 
                              alt={item.product.name}
                              className="h-full w-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.product?.name || 'Unknown Product'}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(item.price)}</p>
                        <p className="text-sm text-gray-500">{formatCurrency(item.price * item.quantity)} total</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Timeline */}
              <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Order Timeline
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-green-100 p-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Order Placed</p>
                      <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                    </div>
                  </div>
                  {order.status !== 'pending_payment' && (
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-blue-100 p-2">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Payment Confirmed</p>
                        <p className="text-sm text-gray-500">Order is paid and ready for processing</p>
                      </div>
                    </div>
                  )}
                  {(order.status === 'shipped' || order.status === 'delivered') && (
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-indigo-100 p-2">
                        <Truck className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Order Shipped</p>
                        <p className="text-sm text-gray-500">Package is on its way</p>
                      </div>
                    </div>
                  )}
                  {order.status === 'delivered' && (
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-green-100 p-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Order Delivered</p>
                        <p className="text-sm text-gray-500">Package has been delivered</p>
                      </div>
                    </div>
                  )}
                  {order.status === 'cancelled' && (
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-red-100 p-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Order Cancelled</p>
                        <p className="text-sm text-gray-500">This order has been cancelled</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer
                </h3>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">{order.user?.name || 'Guest'}</p>
                  <p className="text-sm text-gray-500">{order.user?.email}</p>
                </div>
              </div>

              {/* Order Summary */}
              <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-gray-900">{formatCurrency(order.shipping_fee)}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="font-bold text-gray-900">{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment
                </h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Method: <span className="font-medium text-gray-900 capitalize">{order.payment_method}</span></p>
                  {order.payment_ref && (
                    <p className="text-sm text-gray-600">Reference: <span className="font-medium text-gray-900">{order.payment_ref}</span></p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      <Modal show={showStatusModal} onClose={() => setShowStatusModal(false)}>
        <form onSubmit={handleStatusUpdate} className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Order Status</h3>
          <div className="space-y-2">
            {statusOptions.map((option) => (
              <label 
                key={option.value} 
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  data.status === option.value 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={option.value}
                  checked={data.status === option.value}
                  onChange={(e) => setData('status', e.target.value)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className={`font-medium ${option.color}`}>{option.label}</span>
              </label>
            ))}
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <SecondaryButton type="button" onClick={() => setShowStatusModal(false)}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={processing}>
              Update Status
            </PrimaryButton>
          </div>
        </form>
      </Modal>
    </AuthenticatedLayout>
  );
}
