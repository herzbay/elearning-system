<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use Cloudinary\Cloudinary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class VideoController extends Controller
{
    /**
     * Upload atau mengganti video materi.
     */
    public function upload(Request $request, Lesson $lesson)
    {
        $request->validate([
            'video' => [
                'required',
                'file',
                'mimes:mp4,mov,avi,mkv,webm',
                'max:512000',
            ],
        ]);

        $cloudinary = new Cloudinary();
        $oldPublicId = $lesson->video_public_id;
        $newPublicId = null;

        try {
            $file = $request->file('video');

            // Upload video baru ke Cloudinary.
            $result = $cloudinary->uploadApi()->upload(
                $file->getRealPath(),
                [
                    'resource_type' => 'video',
                    'folder' => 'eduflow/lessons',
                ]
            );

            $newPublicId = $result['public_id'];

            // Simpan informasi video baru ke database.
            DB::transaction(function () use ($lesson, $file, $result) {
                $lesson->update([
                    'video_path' => $result['secure_url'],
                    'video_public_id' => $result['public_id'],
                    'video_original_name' => $file->getClientOriginalName(),
                    'video_mime_type' => $file->getMimeType(),
                    'video_size' => $file->getSize(),
                    'video_status' => 'ready',
                ]);
            });

            // Hapus video lama setelah video baru berhasil disimpan.
            if ($oldPublicId && $oldPublicId !== $newPublicId) {
                try {
                    $cloudinary->uploadApi()->destroy(
                        $oldPublicId,
                        ['resource_type' => 'video']
                    );
                } catch (Throwable $e) {
                    Log::warning('Old video could not be deleted: ' . $e->getMessage());
                }
            }

            return response()->json([
                'message' => 'Video berhasil diunggah.',
                'lesson' => $lesson->fresh(),
            ]);
        } catch (Throwable $e) {
            // Bersihkan video baru jika proses penyimpanan database gagal.
            if ($newPublicId) {
                try {
                    $cloudinary->uploadApi()->destroy(
                        $newPublicId,
                        ['resource_type' => 'video']
                    );
                } catch (Throwable $cleanupError) {
                    Log::warning('Failed to clean up uploaded video: ' . $cleanupError->getMessage());
                }
            }

            Log::error('Video upload failed: ' . $e->getMessage());

            return response()->json([
                'message' => 'Gagal mengunggah video. Silakan coba lagi.',
            ], 500);
        }
    }

    /**
     * Menghapus video dari Cloudinary dan database.
     */
    public function destroy(Lesson $lesson)
    {
        try {
            if ($lesson->video_public_id) {
                $cloudinary = new Cloudinary();

                $cloudinary->uploadApi()->destroy(
                    $lesson->video_public_id,
                    ['resource_type' => 'video']
                );
            }

            $lesson->update([
                'video_path' => null,
                'video_public_id' => null,
                'video_original_name' => null,
                'video_mime_type' => null,
                'video_size' => null,
                'video_status' => 'pending',
            ]);

            return response()->json([
                'message' => 'Video berhasil dihapus.',
                'lesson' => $lesson->fresh(),
            ]);
        } catch (Throwable $e) {
            Log::error('Video deletion failed: ' . $e->getMessage());

            return response()->json([
                'message' => 'Gagal menghapus video. Silakan coba lagi.',
            ], 500);
        }
    }
}
