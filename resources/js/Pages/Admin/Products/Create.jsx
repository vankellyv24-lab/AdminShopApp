import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ categories }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        sku: '',
        category_id: '',
        price: '0.00',
        stock: 0,
        is_active: true,
        image_url: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.products.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Create Product
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
            <Head title="Create Product" />

            <div className="py-10">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <InputLabel htmlFor="image_url" value="Image URL" />
                                <TextInput
                                    id="image_url"
                                    type="url"
                                    placeholder="https://example.com/image.jpg"
                                    className="mt-1 block w-full"
                                    value={data.image_url}
                                    onChange={(e) => setData('image_url', e.target.value)}
                                />
                                {data.image_url && (
                                    <img
                                        src={data.image_url}
                                        alt="Preview"
                                        className="mt-2 w-32 h-32 object-cover rounded-lg border"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                        onLoad={(e) => { e.target.style.display = 'block'; }}
                                    />
                                )}
                                <InputError className="mt-2" message={errors.image_url} />
                            </div>

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
                                    value={data.category_id}
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

                            <div className="flex items-center justify-end">
                                <PrimaryButton disabled={processing}>
                                    Create
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
