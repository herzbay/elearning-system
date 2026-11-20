"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import {
  BookOpen,
  LogOut,
  ArrowLeft,
  PlayCircle,
  Video,
  Clock,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import type { Course, Lesson } from "@/lib/types";

function StudentCourseDetailContent() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const { user, loading, logout } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [loadingCourse, setLoadingCourse] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "student") {
      router.replace("/admin");
      return;
    }

    if (slug) {
      fetchCourse();
    }
  }, [user, loading, slug, router]);

  async function fetchCourse() {
    try {
      setLoadingCourse(true);

      const response = await api.get(`/courses/${slug}`);
      const data = response.data.course ?? response.data;

      const sortedLessons = [...(data.lessons ?? [])].sort(
        (a: Lesson, b: Lesson) => a.sort_order - b.sort_order
      );

      const courseData: Course = {
        ...data,
        lessons: sortedLessons,
      };

      setCourse(courseData);
      setSelectedLesson(sortedLessons[0] ?? null);
    } catch {
      toast.error("Gagal memuat detail kelas.");
      router.replace("/student");
    } finally {
      setLoadingCourse(false);
    }
  }

  async function handleLogout() {
    try {
      await logout();
      toast.success("Berhasil keluar dari akun.");
    } catch {
      toast.error("Terjadi kesalahan saat logout.");
    }
  }

  if (loading || !user || user.role !== "student" || loadingCourse) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
      </main>
    );
  }

  if (!course) return null;

  const lessons = course.lessons ?? [];

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white">
              <BookOpen size={22} />
            </div>
            <span className="text-xl font-bold text-slate-900">
              EduFlow
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:text-red-600"
          >
            <LogOut size={17} />
            Keluar
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <button
          onClick={() => router.push("/student")}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-teal-600"
        >
          <ArrowLeft size={17} />
          Kembali ke Katalog Kelas
        </button>

        <div className="rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 p-8 text-white">
          <div className="flex items-center gap-2 text-sm font-medium text-teal-100">
            <GraduationCap size={18} />
            Materi Pembelajaran
          </div>

          <h1 className="mt-3 text-3xl font-bold">{course.title}</h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-teal-50">
            {course.description || "Belum ada deskripsi kelas."}
          </p>

          <div className="mt-5 flex items-center gap-2 text-sm text-teal-100">
            <BookOpen size={17} />
            {lessons.length} Lesson Pembelajaran
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="font-bold text-slate-900">
                  {selectedLesson?.title ?? "Video Pembelajaran"}
                </h2>

                {selectedLesson?.description && (
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {selectedLesson.description}
                  </p>
                )}
              </div>

              <div className="bg-slate-950">
                {selectedLesson?.video_path &&
                selectedLesson.video_status === "ready" ? (
                  <video
                    key={selectedLesson.id}
                    controls
                    playsInline
                    preload="metadata"
                    className="aspect-video w-full"
                  >
                    <source
                      src={selectedLesson.video_path}
                      type={selectedLesson.video_mime_type || "video/mp4"}
                    />
                    Browser Anda tidak mendukung pemutar video.
                  </video>
                ) : (
                  <div className="flex aspect-video flex-col items-center justify-center px-6 text-center text-white">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                      <Video size={32} className="text-teal-400" />
                    </div>

                    <h3 className="mt-4 font-semibold">
                      {selectedLesson
                        ? "Video Belum Tersedia"
                        : "Belum Ada Materi"}
                    </h3>

                    <p className="mt-2 max-w-sm text-sm text-slate-400">
                      {selectedLesson
                        ? "Admin belum mengunggah video untuk lesson ini."
                        : "Belum ada lesson yang ditambahkan pada kelas ini."}
                    </p>
                  </div>
                )}
              </div>

              {selectedLesson && (
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-teal-600">
                    <PlayCircle size={17} />
                    Sedang mempelajari
                  </div>

                  <h3 className="mt-2 text-lg font-bold text-slate-900">
                    {selectedLesson.title}
                  </h3>

                  {selectedLesson.description && (
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {selectedLesson.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>

          <aside>
            <div className="rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="font-bold text-slate-900">Daftar Materi</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Pilih materi untuk mulai belajar.
                </p>
              </div>

              {lessons.length === 0 ? (
                <div className="p-6 text-center">
                  <BookOpen size={28} className="mx-auto text-slate-300" />
                  <p className="mt-3 text-sm text-slate-500">
                    Belum ada lesson tersedia.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {lessons.map((lesson, index) => {
                    const isSelected = selectedLesson?.id === lesson.id;
                    const hasVideo =
                      lesson.video_status === "ready" &&
                      Boolean(lesson.video_path);

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => setSelectedLesson(lesson)}
                        className={`flex w-full items-start gap-3 p-4 text-left transition ${
                          isSelected ? "bg-teal-50" : "hover:bg-slate-50"
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                            isSelected
                              ? "bg-teal-600 text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <span className="text-sm font-semibold">
                            {index + 1}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm font-semibold ${
                              isSelected ? "text-teal-700" : "text-slate-800"
                            }`}
                          >
                            {lesson.title}
                          </p>

                          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                            {hasVideo ? (
                              <>
                                <CheckCircle2
                                  size={13}
                                  className="text-teal-600"
                                />
                                Video tersedia
                              </>
                            ) : (
                              <>
                                <Clock size={13} />
                                Video belum tersedia
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default function StudentCourseDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
        </main>
      }
    >
      <StudentCourseDetailContent />
    </Suspense>
  );
}
