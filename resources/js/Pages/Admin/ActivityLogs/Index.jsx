import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { 
  History, 
  User, 
  Package, 
  ShoppingBag, 
  Tags,
  Edit3,
  Trash2,
  Plus,
  LogIn,
  Filter,
  Clock
} from 'lucide-react';

const actionIcons = {
  create: Plus,
  update: Edit3,
  delete: Trash2,
  login: LogIn,
};

const entityIcons = {
  product: Package,
  order: ShoppingBag,
  category: Tags,
  user: User,
};

const actionColors = {
  create: 'bg-green-100 text-green-800',
  update: 'bg-blue-100 text-blue-800',
  delete: 'bg-red-100 text-red-800',
  login: 'bg-purple-100 text-purple-800',
};

export default function Index({ logs, filters, actions, entityTypes }) {
  const [selectedAction, setSelectedAction] = useState(filters?.action || '');
  const [selectedEntity, setSelectedEntity] = useState(filters?.entity_type || '');

  const applyFilters = () => {
    const params = {};
    if (selectedAction) params.action = selectedAction;
    if (selectedEntity) params.entity_type = selectedEntity;
    window.location.href = route('admin.activity-logs.index', params);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const rows = logs?.data || [];

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Activity Log</h2>
            <p className="mt-1 text-sm text-gray-600">Track all admin actions and changes</p>
          </div>
        </div>
      }
    >
      <Head title="Activity Log" />

      <div className="py-8">
        <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Filter by:</span>
              </div>
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="rounded-lg border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">All Actions</option>
                {actions?.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
              <select
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value)}
                className="rounded-lg border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">All Entity Types</option>
                {entityTypes?.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
              >
                Apply
              </button>
              {(selectedAction || selectedEntity) && (
                <Link
                  href={route('admin.activity-logs.index')}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear filters
                </Link>
              )}
            </div>
          </div>

          {/* Activity Log Table */}
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Action
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Entity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      IP Address
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <History className="mx-auto h-12 w-12 text-gray-300" />
                        <p className="mt-2 text-sm text-gray-600">No activity logs found</p>
                      </td>
                    </tr>
                  ) : (
                    rows.map((log) => {
                      const ActionIcon = actionIcons[log.action] || History;
                      const EntityIcon = entityIcons[log.entity_type] || Package;
                      const actionColor = actionColors[log.action] || 'bg-gray-100 text-gray-800';
                      
                      return (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="h-4 w-4" />
                              {formatDate(log.created_at)}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                <User className="h-4 w-4 text-gray-600" />
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {log.user?.name || 'System'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${actionColor}`}>
                              <ActionIcon className="h-3 w-3" />
                              {log.action}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <EntityIcon className="h-4 w-4" />
                              <span className="capitalize">{log.entity_type}</span>
                              {log.entity_id && (
                                <span className="text-gray-400">#{log.entity_id}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-700 max-w-md truncate">
                            {log.description}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500 font-mono">
                            {log.ip_address}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {logs?.links?.length > 0 && (
              <div className="border-t border-gray-100 px-4 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {logs.from} to {logs.to} of {logs.total} entries
                  </p>
                  <div className="flex gap-2">
                    {logs.links.map((l, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={!l.url}
                        onClick={() => l.url && window.location.assign(l.url)}
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
    </AuthenticatedLayout>
  );
}
