import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import useConfirmDialog from '@/Hooks/useConfirmDialog';
import { Head, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Plus, Tags, Edit2, Trash2, Folder } from 'lucide-react';

export default function Index({ categories }) {
    const [editing, setEditing] = useState(null);
    const confirmDialog = useConfirmDialog();

    const rows = useMemo(() => categories ?? [], [categories]);

    const createForm = useForm({ name: '' });
    const editForm = useForm({ name: '' });

    const startEdit = (category) => {
        setEditing(category);
        editForm.setData('name', category.name);
        editForm.clearErrors();
    };

    const closeEdit = () => {
        setEditing(null);
        editForm.reset();
        editForm.clearErrors();
    };

    const submitCreate = (e) => {
        e.preventDefault();
        createForm.post(route('admin.categories.store'), {
            preserveScroll: true,
            onSuccess: () => createForm.reset(),
        });
    };

    const submitEdit = (e) => {
        e.preventDefault();
        if (!editing) return;
        editForm.put(route('admin.categories.update', editing.id), {
            preserveScroll: true,
            onSuccess: closeEdit,
        });
    };

    const onDelete = (category) => {
        confirmDialog.open({
            title: 'Delete Category',
            message: `Delete "${category.name}"? Products under it will become Uncategorized.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            onConfirm: () => {
                router.delete(route('admin.categories.destroy', category.id), {
                    preserveScroll: true,
                });
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
                        <p className="mt-1 text-sm text-gray-600">Organize your products into categories</p>
                    </div>
                </div>
            }
        >
            <Head title="Categories" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl space-y-6 sm:px-6 lg:px-8">
                    {/* Create Category Card */}
                    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Plus className="h-5 w-5 text-indigo-600" />
                            Create New Category
                        </h3>
                        <form
                            onSubmit={submitCreate}
                            className="flex flex-col gap-3 sm:flex-row sm:items-end"
                        >
                            <div className="w-full">
                                <InputLabel htmlFor="name" value="Category Name" />
                                <TextInput
                                    id="name"
                                    value={createForm.data.name}
                                    onChange={(e) =>
                                        createForm.setData('name', e.target.value)
                                    }
                                    className="mt-1 block w-full"
                                    placeholder="Enter category name..."
                                    required
                                />
                                <InputError
                                    className="mt-2"
                                    message={createForm.errors.name}
                                />
                            </div>
                            <PrimaryButton disabled={createForm.processing} className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Create
                            </PrimaryButton>
                        </form>
                    </div>

                    {/* Categories Table */}
                    <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Folder className="h-4 w-4" />
                                                Category Name
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                            Slug
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {rows.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-12 text-center">
                                                <Tags className="mx-auto h-12 w-12 text-gray-300" />
                                                <p className="mt-2 text-sm text-gray-600">No categories yet</p>
                                                <p className="mt-1 text-xs text-gray-500">Create your first category above</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        rows.map((c) => (
                                            <tr key={c.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                                                            <Folder className="h-5 w-5 text-indigo-600" />
                                                        </div>
                                                        <span className="font-medium text-gray-900">{c.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-600 font-mono">
                                                    {c.slug}
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <div className="inline-flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => startEdit(c)}
                                                            className="inline-flex items-center rounded-md px-2 py-1 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                                                        >
                                                            <Edit2 className="mr-1 h-4 w-4" />
                                                            Edit
                                                        </button>
                                                        <DangerButton
                                                            type="button"
                                                            onClick={() => onDelete(c)}
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
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <Modal show={Boolean(editing)} onClose={closeEdit}>
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Edit2 className="h-5 w-5 text-indigo-600" />
                        Edit Category
                    </h3>
                    <form onSubmit={submitEdit} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="edit_name" value="Category Name" />
                            <TextInput
                                id="edit_name"
                                value={editForm.data.name}
                                onChange={(e) =>
                                    editForm.setData('name', e.target.value)
                                }
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError
                                className="mt-2"
                                message={editForm.errors.name}
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeEdit}
                                className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <PrimaryButton disabled={editForm.processing} className="flex items-center gap-2">
                                <Edit2 className="h-4 w-4" />
                                Save Changes
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

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
                        <DangerButton type="button" onClick={confirmDialog.confirm} className="flex items-center gap-2">
                            <Trash2 className="h-4 w-4" />
                            {confirmDialog.state.confirmText}
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
