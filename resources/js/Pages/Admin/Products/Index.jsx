import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import useConfirmDialog from '@/Hooks/useConfirmDialog';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { 
  Search, 
  Plus, 
  Package, 
  Edit2, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Image as ImageIcon,
  CheckSquare,
  Square,
  Power,
  PowerOff,
  Download
} from 'lucide-react';

const StockBadge = ({ stock }) => {
  if (stock === 0) {
    return <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">Out of Stock</span>;
  }
  if (stock < 10) {
    return <span className="inline-flex rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800">{stock} left</span>;
  }
  return <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">In Stock</span>;
};

const StatusBadge = ({ isActive }) => (
  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
    isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }`}>
    {isActive ? 'Active' : 'Inactive'}
  </span>
);

export default function Index({ products, filters, categories }) {
  const [query, setQuery] = useState(filters?.q ?? '');
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Advanced filter states
  const [stockStatus, setStockStatus] = useState(filters?.stock_status ?? '');
  const [isActive, setIsActive] = useState(filters?.is_active ?? '');
  const [minPrice, setMinPrice] = useState(filters?.min_price ?? '');
  const [maxPrice, setMaxPrice] = useState(filters?.max_price ?? '');
  const [categoryId, setCategoryId] = useState(filters?.category_id ?? '');

  const confirmDialog = useConfirmDialog();

  useEffect(() => {
    setQuery(filters?.q ?? '');
  }, [filters?.q]);

  const rows = useMemo(() => products?.data ?? [], [products?.data]);

  // Handle select all
  const handleSelectAll = () => {
    if (selectedIds.length === rows.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(rows.map(r => r.id));
    }
  };

  // Handle individual select
  const handleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  // Bulk delete
  const handleBulkDelete = () => {
    confirmDialog.open({
      title: `Delete ${selectedIds.length} Products`,
      message: `Are you sure you want to delete ${selectedIds.length} products? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        router.post(route('admin.products.bulk-destroy'), { ids: selectedIds }, {
          onSuccess: () => setSelectedIds([]),
        });
      },
    });
  };

  // Bulk activate/deactivate
  const handleBulkUpdate = (isActive) => {
    router.post(route('admin.products.bulk-update'), { ids: selectedIds, is_active: isActive }, {
      onSuccess: () => setSelectedIds([]),
    });
  };

  const submitSearch = (e) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    const params = {};
    if (query) params.q = query;
    if (stockStatus) params.stock_status = stockStatus;
    if (isActive !== '') params.is_active = isActive;
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;
    if (categoryId) params.category_id = categoryId;
    
    router.get(route('admin.products.index'), params, { preserveState: true });
  };

  const clearFilters = () => {
    setQuery('');
    setStockStatus('');
    setIsActive('');
    setMinPrice('');
    setMaxPrice('');
    setCategoryId('');
    router.get(route('admin.products.index'));
  };

  const onDelete = (product) => {
    confirmDialog.open({
      title: 'Delete Product',
      message: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        router.delete(route('admin.products.destroy', product.id));
      },
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
            <h2 className="text-2xl font-bold text-gray-900">Products</h2>
            <p className="mt-1 text-sm text-gray-600">Manage your product catalog</p>
          </div>
          <Link href={route('admin.products.create')}>
            <PrimaryButton className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </PrimaryButton>
          </Link>
        </div>
      }
    >
      <Head title="Products" />

      <div className="py-8">
        <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
          {/* Search & Filter Bar */}
          <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 space-y-4">
            <form onSubmit={submitSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <TextInput
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 block w-full"
                  placeholder="Search by product name or SKU..."
                />
              </div>
              <SecondaryButton 
                type="button" 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 ${showFilters ? 'bg-gray-100' : ''}`}
              >
                <Filter className="h-4 w-4" />
                Filters
              </SecondaryButton>
              <PrimaryButton type="submit" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search
              </PrimaryButton>
              <SecondaryButton 
                type="button" 
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="flex items-center gap-2"
              >
                <CheckSquare className="h-4 w-4" />
                Bulk
              </SecondaryButton>
            </form>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Stock Status</label>
                  <select
                    value={stockStatus}
                    onChange={(e) => setStockStatus(e.target.value)}
                    className="w-full rounded-lg border-gray-300 text-sm"
                  >
                    <option value="">All</option>
                    <option value="out">Out of Stock</option>
                    <option value="low">Low Stock (1-10)</option>
                    <option value="in">In Stock (&gt;10)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select
                    value={isActive}
                    onChange={(e) => setIsActive(e.target.value)}
                    className="w-full rounded-lg border-gray-300 text-sm"
                  >
                    <option value="">All</option>
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-lg border-gray-300 text-sm"
                  >
                    <option value="">All Categories</option>
                    {categories?.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Min Price</label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full rounded-lg border-gray-300 text-sm"
                    placeholder="$0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Max Price</label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full rounded-lg border-gray-300 text-sm"
                    placeholder="$9999"
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-5 flex gap-2">
                  <SecondaryButton type="button" onClick={applyFilters} className="text-sm">
                    Apply Filters
                  </SecondaryButton>
                  <SecondaryButton type="button" onClick={clearFilters} className="text-sm text-gray-600">
                    Clear All
                  </SecondaryButton>
                </div>
              </div>
            )}

            {/* Bulk Actions Bar */}
            {showBulkActions && selectedIds.length > 0 && (
              <div className="mt-4 p-3 bg-indigo-50 rounded-lg flex items-center justify-between">
                <span className="text-sm font-medium text-indigo-900">
                  {selectedIds.length} product{selectedIds.length !== 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center gap-2">
                  <SecondaryButton
                    type="button"
                    onClick={() => handleBulkUpdate(true)}
                    className="flex items-center gap-1 text-sm"
                  >
                    <Power className="h-4 w-4" />
                    Activate
                  </SecondaryButton>
                  <SecondaryButton
                    type="button"
                    onClick={() => handleBulkUpdate(false)}
                    className="flex items-center gap-1 text-sm"
                  >
                    <PowerOff className="h-4 w-4" />
                    Deactivate
                  </SecondaryButton>
                  <DangerButton
                    type="button"
                    onClick={handleBulkDelete}
                    className="flex items-center gap-1 text-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </DangerButton>
                </div>
              </div>
            )}
          </div>

          {/* Products Table */}
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {showBulkActions && (
                      <th className="px-4 py-3 w-10">
                        <button 
                          type="button"
                          onClick={handleSelectAll}
                          className="text-gray-600 hover:text-indigo-600"
                        >
                          {selectedIds.length === rows.length && rows.length > 0 ? (
                            <CheckSquare className="h-5 w-5" />
                          ) : (
                            <Square className="h-5 w-5" />
                          )}
                        </button>
                      </th>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Category
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Price
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Stock
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={showBulkActions ? 7 : 6} className="px-4 py-12 text-center">
                        <Package className="mx-auto h-12 w-12 text-gray-300" />
                        <p className="mt-2 text-sm text-gray-600">No products found</p>
                        <p className="mt-1 text-xs text-gray-500">Add your first product to get started</p>
                      </td>
                    </tr>
                  ) : (
                    rows.map((p) => (
                      <tr key={p.id} className={`hover:bg-gray-50 ${selectedIds.includes(p.id) ? 'bg-indigo-50' : ''}`}>
                        {showBulkActions && (
                          <td className="px-4 py-4">
                            <button 
                              type="button"
                              onClick={() => handleSelect(p.id)}
                              className="text-gray-600 hover:text-indigo-600"
                            >
                              {selectedIds.includes(p.id) ? (
                                <CheckSquare className="h-5 w-5 text-indigo-600" />
                              ) : (
                                <Square className="h-5 w-5" />
                              )}
                            </button>
                          </td>
                        )}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                              {p.image_url ? (
                                <img src={p.image_url} alt={p.name} className="h-full w-full object-cover rounded-lg" />
                              ) : (
                                <ImageIcon className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{p.name}</p>
                              {p.sku && <p className="text-xs text-gray-500">SKU: {p.sku}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {p.category?.name ?? '-'}
                        </td>
                        <td className="px-4 py-4 text-right text-sm font-medium text-gray-900">
                          {formatCurrency(p.price)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <StockBadge stock={p.stock} />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <StatusBadge isActive={p.is_active} />
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <Link
                              href={route('admin.products.edit', p.id)}
                              className="inline-flex items-center rounded-md px-2 py-1 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                            >
                              <Edit2 className="mr-1 h-4 w-4" />
                              Edit
                            </Link>
                            <DangerButton
                              type="button"
                              onClick={() => onDelete(p)}
                              className="inline-flex items-center px-2 py-1"
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                              Delete
                            </DangerButton>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {products?.links?.length > 0 && (
              <div className="border-t border-gray-100 px-4 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {products.from} to {products.to} of {products.total} products
                  </p>
                  <div className="flex gap-2">
                    {products.links.map((l, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={!l.url}
                        onClick={() => l.url && router.visit(l.url)}
                        className={`rounded-md px-3 py-1.5 text-sm ${
                          l.active
                            ? 'bg-indigo-600 text-white'
                            : l.url
                            ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        dangerouslySetInnerHTML={{ __html: l.label }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal show={confirmDialog.isOpen} onClose={confirmDialog.close}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-full bg-red-100 p-2">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{confirmDialog.state.title}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-6">{confirmDialog.state.message}</p>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={confirmDialog.close}
              className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {confirmDialog.state.cancelText}
            </button>
            <DangerButton type="button" onClick={confirmDialog.confirm}>
              {confirmDialog.state.confirmText}
            </DangerButton>
          </div>
        </div>
      </Modal>
    </AuthenticatedLayout>
  );
}
