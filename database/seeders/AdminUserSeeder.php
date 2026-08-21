<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Super Admin
        User::updateOrCreate(
            ['email' => 'admin@publicationmart.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('Admin@1234'),
                'role' => 'super_admin',
                'email_verified_at' => now(),
            ]
        );

        // Editors (Admin 1-10)
        for ($i = 1; $i <= 10; $i++) {
            User::updateOrCreate(
                ['email' => "admin{$i}@publicationmart.com"],
                [
                    'name' => "Admin {$i}",
                    'password' => Hash::make('Admin@1234'),
                    'role' => 'editor',
                    'email_verified_at' => now(),
                ]
            );
        }
    }
}
