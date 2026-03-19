<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])
        ->middleware('permission:dashboard.view')
        ->name('dashboard');

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/categories', [\App\Http\Controllers\Admin\CategoryController::class, 'index'])
            ->middleware('permission:categories.view')
            ->name('categories.index');
        Route::post('/categories', [\App\Http\Controllers\Admin\CategoryController::class, 'store'])
            ->middleware('permission:categories.create')
            ->name('categories.store');
        Route::put('/categories/{category}', [\App\Http\Controllers\Admin\CategoryController::class, 'update'])
            ->middleware('permission:categories.update')
            ->name('categories.update');
        Route::delete('/categories/{category}', [\App\Http\Controllers\Admin\CategoryController::class, 'destroy'])
            ->middleware('permission:categories.delete')
            ->name('categories.destroy');

        Route::get('/products', [\App\Http\Controllers\Admin\ProductController::class, 'index'])
            ->middleware('permission:products.view')
            ->name('products.index');
        Route::get('/products/create', [\App\Http\Controllers\Admin\ProductController::class, 'create'])
            ->middleware('permission:products.create')
            ->name('products.create');
        Route::post('/products', [\App\Http\Controllers\Admin\ProductController::class, 'store'])
            ->middleware('permission:products.create')
            ->name('products.store');
        Route::get('/products/{product}/edit', [\App\Http\Controllers\Admin\ProductController::class, 'edit'])
            ->middleware('permission:products.update')
            ->name('products.edit');
        Route::put('/products/{product}', [\App\Http\Controllers\Admin\ProductController::class, 'update'])
            ->middleware('permission:products.update')
            ->name('products.update');
        Route::delete('/products/{product}', [\App\Http\Controllers\Admin\ProductController::class, 'destroy'])
            ->middleware('permission:products.delete')
            ->name('products.destroy');
        Route::post('/products/bulk-delete', [\App\Http\Controllers\Admin\ProductController::class, 'bulkDestroy'])
            ->middleware('permission:products.delete')
            ->name('products.bulk-destroy');
        Route::post('/products/bulk-update', [\App\Http\Controllers\Admin\ProductController::class, 'bulkUpdate'])
            ->middleware('permission:products.update')
            ->name('products.bulk-update');

        Route::get('/orders', [\App\Http\Controllers\Admin\OrderController::class, 'index'])
            ->middleware('permission:orders.view')
            ->name('orders.index');
        Route::get('/orders/{order}', [\App\Http\Controllers\Admin\OrderController::class, 'show'])
            ->middleware('permission:orders.view')
            ->name('orders.show');
        Route::put('/orders/{order}', [\App\Http\Controllers\Admin\OrderController::class, 'update'])
            ->middleware('permission:orders.update')
            ->name('orders.update');

        Route::get('/reports', [\App\Http\Controllers\Admin\ReportController::class, 'index'])
            ->middleware('permission:reports.view')
            ->name('reports.index');
        Route::get('/reports/export-orders', [\App\Http\Controllers\Admin\ReportController::class, 'exportOrders'])
            ->middleware('permission:orders.view')
            ->name('reports.export-orders');

        Route::get('/users', [\App\Http\Controllers\Admin\UserController::class, 'index'])
            ->middleware('permission:users.view')
            ->name('users.index');

        Route::get('/activity-logs', [\App\Http\Controllers\Admin\ActivityLogController::class, 'index'])
            ->middleware('permission:activity_logs.view')
            ->name('activity-logs.index');
    });
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
