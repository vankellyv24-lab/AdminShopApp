<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json(['ok' => true]);
});

Route::get('/categories', [\App\Http\Controllers\Api\CategoryController::class, 'index']);

Route::get('/products', [\App\Http\Controllers\Api\ProductController::class, 'index']);
Route::get('/orders-test', [\App\Http\Controllers\Api\OrderController::class, 'index']);
Route::post('/orders-test', [\App\Http\Controllers\Api\OrderController::class, 'store']);
Route::post('/orders-test/{order}/pay', [\App\Http\Controllers\Api\OrderController::class, 'pay']);
Route::post('/orders-test/{order}/advance', [\App\Http\Controllers\Api\OrderController::class, 'advance']);

Route::middleware('firebase')->group(function () {
    Route::get('/orders', [\App\Http\Controllers\Api\OrderController::class, 'index']);
    Route::post('/orders', [\App\Http\Controllers\Api\OrderController::class, 'store']);
    Route::post('/orders/{order}/pay', [\App\Http\Controllers\Api\OrderController::class, 'pay']);
    Route::post('/orders/{order}/advance', [\App\Http\Controllers\Api\OrderController::class, 'advance']);
});

Route::get('/users', [\App\Http\Controllers\Api\FirebaseUsersController::class, 'index']);
Route::get('/users/{firebaseUid}', [\App\Http\Controllers\Api\FirebaseUsersController::class, 'show']);
