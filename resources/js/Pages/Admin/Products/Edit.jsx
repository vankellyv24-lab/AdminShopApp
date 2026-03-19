import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import useConfirmDialog from '@/Hooks/useConfirmDialog';
import { Head, Link, router, useForm } from '@inertiajs/react';

export default function Edit({ product, categories }) {
    const confirmDialog = useConfirmDialog();

    const { data, setData, put, processing, errors } = useForm({
        name: product?.name ?? '',
        sku: product?.sku ?? '',
        category_id: product?.category_id ?? '',
        price: product?.price ?? '0.00',
        stock: product?.stock ?? 0,
        is_active: Boolean(product?.is_active ?? true),
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.products.update', product.id));
    };

    const onDelete = () => {
        confirmDialog.open({
            title: 'Delete product',
            message: `Delete "${product.name}"? This cannot be undone.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            onConfirm: () => {
                router.delete(route('admin.products.destroy', product.id));
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Edit Product
                    </h2>
                    <Link
                        href={route('admin.products.index')}
                        className="text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                        Back
                    </Link>
                </div>
            }
        >
            <Head title="Edit Product" />

            <div className="py-10">
                <div className="mx-auto max-w-3xl space-y-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <InputLabel htmlFor="name" value="Name" />
                                <TextInput
                                    id="name"
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                <InputError className="mt-2" message={errors.name} />
                            </div>

                            <div>
                                <InputLabel htmlFor="sku" value="SKU" />
                                <TextInput
                                    id="sku"
                                    className="mt-1 block w-full"
                                    value={data.sku}
                                    onChange={(e) => setData('sku', e.target.value)}
                                />
                                <InputError className="mt-2" message={errors.sku} />
                            </div>

                            <div>
                                <InputLabel htmlFor="category_id" value="Category" />
                                <select
                                    id="category_id"
                                    value={data.category_id ?? ''}
                                    onChange={(e) =>
                                        setData(
                                            'category_id',
                                            e.target.value === ''
                                                ? ''
                                                : Number(e.target.value),
                                        )
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">Uncategorized</option>
                                    {categories?.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError
                                    className="mt-2"
                                    message={errors.category_id}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="price" value="Price" />
                                    <TextInput
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        className="mt-1 block w-full"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        required
                                    />
                                    <InputError
                                        className="mt-2"
                                        message={errors.price}
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="stock" value="Stock" />
                                    <TextInput
                                        id="stock"
                                        type="number"
                                        className="mt-1 block w-full"
                                        value={data.stock}
                                        onChange={(e) =>
                                            setData('stock', Number(e.target.value))
                                        }
                                        required
                                    />
                                    <InputError
                                        className="mt-2"
                                        message={errors.stock}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    id="is_active"
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) =>
                                        setData('is_active', e.target.checked)
                                    }
                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                />
                                <label
                                    htmlFor="is_active"
                                    className="text-sm text-gray-700"
                                >
                                    Active
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <DangerButton type="button" onClick={onDelete}>
                                    Delete
                                </DangerButton>
                                <PrimaryButton disabled={processing}>
                                    Save
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <Modal show={confirmDialog.isOpen} onClose={confirmDialog.close}>
                <div className="p-6">
                    <div className="text-lg font-semibold text-gray-900">
                        {confirmDialog.state.title}
                    </div>
                    <div className="mt-2 text-sm text-gray-700">
                        {confirmDialog.state.message}
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-2">
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
