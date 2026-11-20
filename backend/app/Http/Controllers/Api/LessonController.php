<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Lesson;
use Illuminate\Http\Request;

class LessonController extends Controller
{
    /**
     * Admin: membuat lesson dalam course.
     */
    public function store(Request $request, Course $course)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $lesson = $course->lessons()->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'sort_order' => $validated['sort_order']
                ?? $course->lessons()->count(),
        ]);

        return response()->json([
            'message' => 'Lesson berhasil ditambahkan.',
            'lesson' => $lesson->fresh(),
        ], 201);
    }

    /**
     * Admin: memperbarui lesson.
     */
    public function update(Request $request, Lesson $lesson)
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ]);

        $lesson->update($validated);

        return response()->json([
            'message' => 'Lesson berhasil diperbarui.',
            'lesson' => $lesson->fresh(),
        ]);
    }

    /**
     * Admin: menghapus lesson.
     */
    public function destroy(Lesson $lesson)
    {
        $lesson->delete();

        return response()->json([
            'message' => 'Lesson berhasil dihapus.',
        ]);
    }
}
