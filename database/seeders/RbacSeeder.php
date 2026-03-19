<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RbacSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            'super_admin',
            'admin',
            'moderator',
        ];

        $permissions = [
            'dashboard.view',

            'users.view',
            'users.create',
            'users.update',
            'users.delete',

            'categories.view',
            'categories.create',
            'categories.update',
            'categories.delete',

            'products.view',
            'products.create',
            'products.update',
            'products.delete',

            'orders.view',
            'orders.update',

            'reports.view',

            'activity_logs.view',
        ];

        $roleModels = [];
        foreach ($roles as $r) {
            $roleModels[$r] = Role::firstOrCreate(['name' => $r]);
        }

        $permModels = [];
        foreach ($permissions as $p) {
            $permModels[$p] = Permission::firstOrCreate(['name' => $p]);
        }

        // super_admin gets all
        $roleModels['super_admin']->permissions()->sync(collect($permModels)->pluck('id')->all());

        // admin gets everything except user delete (example)
        $adminPerms = collect($permModels)
            ->reject(fn ($perm, $name) => $name === 'users.delete')
            ->pluck('id')
            ->all();
        $roleModels['admin']->permissions()->sync($adminPerms);

        // moderator: view + limited updates
        $moderatorPerms = collect($permModels)
            ->filter(fn ($perm, $name) => in_array($name, [
                'dashboard.view',
                'products.view',
                'categories.view',
                'orders.view',
                'orders.update',
            ], true))
            ->pluck('id')
            ->all();
        $roleModels['moderator']->permissions()->sync($moderatorPerms);

        // Default super admin user
        $user = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            ['name' => 'Super Admin', 'password' => Hash::make('Admin@12345')]
        );

        $user->roles()->syncWithoutDetaching([$roleModels['super_admin']->id]);
    }
}
