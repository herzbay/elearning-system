<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CourseController extends Controller
{
    // Student: daftar course yang dipublikasikan
    public function index()
    {
        $courses = Course::where('status', 'published')
            ->withCount('lessons')
            ->latest()
            ->get();

        return response()->json($courses);
    }

    // Student: detail course yang dipublikasikan
    public function show(string $slug)
    {
        $course = Course::where('slug', $slug)
            ->where('status', 'published')
            ->with(['lessons' => function ($query) {
                $query->orderBy('sort_order');
            }])
            ->firstOrFail();

        return response()->json($course);
    }

    // Admin: daftar semua course
    public function adminIndex()
    {
        return response()->json(
            Course::withCount('lessons')->latest()->get()
        );
    }

    // Admin: membuat course
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['required', Rule::in(['draft', 'published'])],
        ]);

        $course = Course::create([
            ...$validated,
            'slug' => Str::slug($validated['title']) . '-' . Str::random(6),
        ]);

        return response()->json([
            'message' => 'Course berhasil dibuat.',
            'course' => $course,
        ], 201);
    }

    // Admin: detail course
    public function adminShow(Course $course)
    {
        return response()->json(
            $course->load('lessons')
        );
    }

    // Admin: mengubah course
    public function update(Request $request, Course $course)
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['sometimes', Rule::in(['draft', 'published'])],
        ]);

        if (isset($validated['title'])) {
            $validated['slug'] = Str::slug($validated['title'])
                . '-' . Str::random(6);
        }

        $course->update($validated);

        return response()->json([
            'message' => 'Course berhasil diperbarui.',
            'course' => $course,
        ]);
    }

    // Admin: menghapus course
    public function destroy(Course $course)
    {
        $course->delete();

        return response()->json([
            'message' => 'Course berhasil dihapus.',
        ]);
    }
}
