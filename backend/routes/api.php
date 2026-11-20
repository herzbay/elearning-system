<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\LessonController;
use App\Http\Controllers\Api\VideoController;

// Authentication
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Student: melihat course published
    Route::get('/courses', [CourseController::class, 'index']);
    Route::get('/courses/{slug}', [CourseController::class, 'show']);

    Route::get('/lessons/{lesson}/video', [VideoController::class, 'play']);

    // Admin: mengelola course dan lesson
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/courses', [CourseController::class, 'adminIndex']);
        Route::post('/courses', [CourseController::class, 'store']);
        Route::get('/courses/{course}', [CourseController::class, 'adminShow']);
        Route::put('/courses/{course}', [CourseController::class, 'update']);
        Route::patch('/courses/{course}', [CourseController::class, 'update']);
        Route::delete('/courses/{course}', [CourseController::class, 'destroy']);

        Route::post('/courses/{course}/lessons', [LessonController::class, 'store']);
        Route::put('/lessons/{lesson}', [LessonController::class, 'update']);
        Route::patch('/lessons/{lesson}', [LessonController::class, 'update']);
        Route::delete('/lessons/{lesson}', [LessonController::class, 'destroy']);

        Route::post('/lessons/{lesson}/video', [VideoController::class, 'upload']);
    });
});