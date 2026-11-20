<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use Cloudinary\Cloudinary;
use Illuminate\Http\Request;

class VideoController extends Controller
{
    /**
     * Admin: Upload video ke Cloudinary.
     */
    public function upload(Request $request, Lesson $lesson)
    {
        $validated = $request->validate([
            'video' => [
                'required',
                'file',
                'mimes:mp4,webm',
                'max:102400',
            ],
        ]);

        $file = $validated['video'];

        $cloudinary = new Cloudinary();

        $result = $cloudinary->uploadApi()->upload(
            $file->getRealPath(),
            [
                'resource_type' => 'video',
                'folder' => 'eduflow/lessons',
            ]
        );

        // Hapus video lama jika lesson sudah memiliki video
        if ($lesson->video_path) {
            // Penghapusan aset lama dapat ditambahkan
            // setelah proses upload baru berhasil.
        }

        $lesson->update([
            'video_path' => $result['secure_url'],
            'video_original_name' => $file->getClientOriginalName(),
            'video_mime_type' => $file->getMimeType(),
            'video_size' => $file->getSize(),
            'video_status' => 'ready',
        ]);

        return response()->json([
            'message' => 'Video berhasil diunggah.',
            'lesson' => $lesson,
        ]);
    }

    /**
     * Student: Mendapatkan URL video.
     */
    public function play(Lesson $lesson)
    {
        abort_unless(
            $lesson->video_status === 'ready' && $lesson->video_path,
            404,
            'Video belum tersedia.'
        );

        abort_unless(
            $lesson->course->status === 'published',
            404,
            'Course tidak ditemukan.'
        );

        return response()->json([
            'video_url' => $lesson->video_path,
        ]);
    }
}