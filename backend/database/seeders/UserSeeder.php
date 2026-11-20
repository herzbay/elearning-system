<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@eduflow.test'],
            [
                'name' => 'EduFlow Admin',
                'password' => 'password123',
                'role' => 'admin',
            ]
        );

        User::updateOrCreate(
            ['email' => 'student@eduflow.test'],
            [
                'name' => 'EduFlow Student',
                'password' => 'password123',
                'role' => 'student',
            ]
        );
    }
}
