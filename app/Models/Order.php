<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'status',
        'subtotal',
        'shipping_fee',
        'total',
        'currency',
        'payment_method',
        'payment_ref',
        'shipping_name',
        'shipping_address',
        'shipping_city',
        'shipping_country',
        'shipping_phone',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'shipping_fee' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    protected $appends = ['shipping_full_address'];

    public function getShippingFullAddressAttribute(): ?string
    {
        if (!$this->shipping_address) {
            return null;
        }
        $parts = array_filter([
            $this->shipping_address,
            $this->shipping_city,
            $this->shipping_country,
        ]);
        return implode(', ', $parts);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
