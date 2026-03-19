<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $cat = fn (string $slug) => Category::where('slug', $slug)->first()?->id;

        $products = [
            // Electronics (Mobiles & Gadgets)
            [
                'category_slug' => 'electronics',
                'name' => 'Wireless Earbuds',
                'sku' => 'EAR-001',
                'price' => 29.99,
                'rating' => 4.5,
                'stock' => 100,
                'image_url' => 'https://i.pinimg.com/1200x/af/a6/a2/afa6a2fb16504faa834a1dea1d252187.jpg',
                'is_active' => true,
            ],
            [
                'category_slug' => 'electronics',
                'name' => 'Smartphone Case',
                'sku' => 'CASE-001',
                'price' => 9.50,
                'rating' => 4.2,
                'stock' => 150,
                'image_url' => 'https://i.pinimg.com/1200x/52/bc/2b/52bc2b07ac6899ef1e4899b0f8dece8a.jpg',
                'is_active' => true,
            ],
            // Fashion
            [
                'category_slug' => 'fashion',
                'name' => "Men's T-Shirt",
                'sku' => 'TSHIRT-001',
                'price' => 12.00,
                'rating' => 4.0,
                'stock' => 200,
                'image_url' => 'https://i.pinimg.com/736x/59/d8/81/59d881e198fd3f06dc968db86df4d1d7.jpg',
                'is_active' => true,
            ],
            [
                'category_slug' => 'fashion',
                'name' => "Women's Dress",
                'sku' => 'DRESS-001',
                'price' => 24.99,
                'rating' => 4.6,
                'stock' => 80,
                'image_url' => 'https://i.pinimg.com/1200x/6e/be/c8/6ebec880d6f8eca7b10c84f85a2c9264.jpg',
                'is_active' => true,
            ],
            // Home & Living
            [
                'category_slug' => 'home-living',
                'name' => 'LED Desk Lamp',
                'sku' => 'LAMP-001',
                'price' => 18.75,
                'rating' => 4.4,
                'stock' => 60,
                'image_url' => 'https://i.pinimg.com/736x/16/02/66/16026697c933a7ee054cf01b2af69a09.jpg',
                'is_active' => true,
            ],
            [
                'category_slug' => 'home-living',
                'name' => 'Storage Organizer',
                'sku' => 'ORG-001',
                'price' => 15.00,
                'rating' => 4.1,
                'stock' => 120,
                'image_url' => 'https://i.pinimg.com/736x/8b/5d/85/8b5d850294a6eb39ae4d7f1dfaf09fc2.jpg',
                'is_active' => true,
            ],
            // Beauty
            [
                'category_slug' => 'beauty',
                'name' => 'Skin Care Set',
                'sku' => 'SKIN-001',
                'price' => 22.00,
                'rating' => 4.3,
                'stock' => 90,
                'image_url' => 'https://i.pinimg.com/736x/28/2c/26/282c26a499b8543668c8a4109fb802a2.jpg',
                'is_active' => true,
            ],
            [
                'category_slug' => 'beauty',
                'name' => 'Hair Dryer',
                'sku' => 'DRYER-001',
                'price' => 19.99,
                'rating' => 4.0,
                'stock' => 70,
                'image_url' => 'https://i.pinimg.com/736x/e2/de/8a/e2de8ac6ede52df46973d33a0a57bcaf.jpg',
                'is_active' => true,
            ],
            // Groceries
            [
                'category_slug' => 'groceries',
                'name' => 'Organic Coffee Beans',
                'sku' => 'COFFEE-001',
                'price' => 10.50,
                'rating' => 4.7,
                'stock' => 300,
                'image_url' => 'https://i.pinimg.com/1200x/b2/71/99/b27199ebf689395dcd9771f406c7095d.jpg',
                'is_active' => true,
            ],
            [
                'category_slug' => 'groceries',
                'name' => 'Granola Cereal',
                'sku' => 'GRANOLA-001',
                'price' => 6.25,
                'rating' => 4.2,
                'stock' => 250,
                'image_url' => 'https://i.pinimg.com/736x/06/f7/3a/06f73ae8332e7629e0c23f993727fe57.jpg',
                'is_active' => true,
            ],
            // Sports
            [
                'category_slug' => 'sports',
                'name' => 'Yoga Mat',
                'sku' => 'YOGA-001',
                'price' => 14.99,
                'rating' => 4.5,
                'stock' => 180,
                'image_url' => 'https://i.pinimg.com/1200x/78/0c/be/780cbe82202e67e66a942df852dfb9f1.jpg',
                'is_active' => true,
            ],
            [
                'category_slug' => 'sports',
                'name' => 'Water Bottle',
                'sku' => 'BOTTLE-001',
                'price' => 8.50,
                'rating' => 4.1,
                'stock' => 220,
                'image_url' => 'https://i.pinimg.com/736x/89/1e/e4/891ee42bbd5f036761f983837e333f81.jpg',
                'is_active' => true,
            ],
        ];

        foreach ($products as $p) {
            Product::updateOrCreate(
                ['sku' => $p['sku']],
                [
                    'category_id' => $cat($p['category_slug']),
                    'name' => $p['name'],
                    'price' => $p['price'],
                    'rating' => $p['rating'],
                    'stock' => $p['stock'],
                    'is_active' => $p['is_active'],
                    'image_url' => $p['image_url'],
                ]
            );
        }
    }
}
