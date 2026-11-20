"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";
import {
  BookOpen,
  ArrowLeft,
  PlayCircle,
  Video,
  Clock,
  CheckCircle2,
  GraduationCap,
  Sun,
  Moon,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import type { Course, Lesson } from "@/lib/types";

function StudentCourseDetailContent() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();

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

  if (loading || !user || user.role !== "student" || loadingCourse) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
      </main>
    );
  }

  if (!course) return null;

  const lessons = course.lessons ?? [];

  const hasSelectedVideo =
    selectedLesson?.video_status === "ready" &&
    Boolean(selectedLesson?.video_path);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-white">
      {/* Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => router.push("/student")}
              aria-label="Kembali ke katalog kelas"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-teal-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-teal-400"
            >
              <ArrowLeft size={19} />
            </button>

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-sm shadow-teal-600/20">
              <BookOpen size={19} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-base font-bold leading-tight text-slate-900 dark:text-white">
                EduFlow
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Area Pembelajaran
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 border-r border-slate-200 pr-3 dark:border-slate-700 sm:flex sm:pr-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300">
                <UserRound size={17} />
              </div>
              <div className="max-w-[150px]">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Student
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {user.email}
                </p>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              aria-label="Ganti tema"
              title={theme === "light" ? "Mode gelap" : "Mode terang"}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
            </button>
          </div>
        </div>

        <div className="border-t border-slate-100 px-4 py-2 dark:border-slate-800 sm:hidden">
          <div className="mx-auto flex max-w-7xl items-center gap-2">
            <UserRound size={14} className="text-teal-600 dark:text-teal-400" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Student
            </span>
            <span className="truncate text-xs text-slate-400">
              {user.email}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        {/* Course Information */}
        <div className="rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-5 text-white shadow-sm sm:px-7 sm:py-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-100 sm:text-sm">
            <GraduationCap size={17} />
            Materi Pembelajaran
          </div>

          <h2 className="mt-2 text-xl font-bold sm:text-2xl">
            {course.title}
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-5 text-teal-50">
            {course.description || "Belum ada deskripsi kelas."}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium text-white">
              <BookOpen size={15} />
              {lessons.length} Materi Pembelajaran
            </div>
          </div>
        </div>

        {/* Video and Lesson List */}
        <div className="mt-5 grid items-start gap-5 lg:grid-cols-3">
          {/* Video Player */}
          <section className="min-w-0 lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="border-b border-slate-200 px-4 py-3 sm:px-5 dark:border-slate-700">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                      Sedang dipelajari
                    </p>
                    <h3 className="mt-1 truncate font-bold text-slate-900 dark:text-white">
                      {selectedLesson?.title ?? "Video Pembelajaran"}
                    </h3>
                  </div>

                  {selectedLesson && (
                    <span className="shrink-0 rounded-md bg-teal-50 px-2 py-1 text-xs font-medium text-teal-700 dark:bg-teal-500/10 dark:text-teal-400">
                      Materi {lessons.findIndex(
                        (lesson) => lesson.id === selectedLesson.id
                      ) + 1}
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-slate-950">
                {hasSelectedVideo ? (
                  <video
                    key={selectedLesson?.id}
                    controls
                    playsInline
                    preload="metadata"
                    className="aspect-video w-full"
                  >
                    <source
                      src={selectedLesson?.video_path ?? undefined}
                      type={selectedLesson?.video_mime_type || "video/mp4"}
                    />
                    Browser Anda tidak mendukung pemutar video.
                  </video>
                ) : (
                  <div className="flex aspect-video flex-col items-center justify-center px-6 text-center text-white">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                      <Video size={28} className="text-teal-400" />
                    </div>

                    <h4 className="mt-3 text-sm font-semibold sm:text-base">
                      {selectedLesson
                        ? "Video Belum Tersedia"
                        : "Belum Ada Materi"}
                    </h4>

                    <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400 sm:text-sm">
                      {selectedLesson
                        ? "Admin belum mengunggah video untuk materi ini."
                        : "Belum ada materi yang ditambahkan pada kelas ini."}
                    </p>
                  </div>
                )}
              </div>

              {selectedLesson && (
                <div className="p-4 sm:p-5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-teal-600 dark:text-teal-400">
                    <PlayCircle size={15} />
                    Materi yang dipilih
                  </div>

                  <h4 className="mt-2 font-bold text-slate-900 dark:text-white">
                    {selectedLesson.title}
                  </h4>

                  <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
                    {selectedLesson.description || "Tidak ada deskripsi materi."}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Lesson List */}
          <aside className="min-w-0">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    Daftar Materi
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Pilih materi untuk mulai belajar.
                  </p>
                </div>

                <span className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-500/10 dark:text-teal-400">
                  {lessons.length}
                </span>
              </div>

              {lessons.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500">
                    <BookOpen size={22} />
                  </div>
                  <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                    Belum ada materi tersedia.
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Materi akan muncul setelah ditambahkan oleh Admin.
                  </p>
                </div>
              ) : (
                <div className="max-h-[520px] divide-y divide-slate-100 overflow-y-auto dark:divide-slate-700">
                  {lessons.map((lesson, index) => {
                    const isSelected = selectedLesson?.id === lesson.id;
                    const hasVideo =
                      lesson.video_status === "ready" &&
                      Boolean(lesson.video_path);

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => setSelectedLesson(lesson)}
                        className={`flex w-full items-start gap-3 px-4 py-3 text-left transition ${
                          isSelected
                            ? "bg-teal-50 dark:bg-teal-500/10"
                            : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                            isSelected
                              ? "bg-teal-600 text-white"
                              : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {index + 1}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className={`line-clamp-2 text-sm font-semibold ${
                              isSelected
                                ? "text-teal-700 dark:text-teal-400"
                                : "text-slate-800 dark:text-slate-200"
                            }`}
                          >
                            {lesson.title}
                          </p>

                          <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                            {hasVideo ? (
                              <>
                                <CheckCircle2
                                  size={13}
                                  className="text-emerald-500"
                                />
                                <span className="text-slate-500 dark:text-slate-400">
                                  Video tersedia
                                </span>
                              </>
                            ) : (
                              <>
                                <Clock
                                  size={13}
                                  className="text-amber-500"
                                />
                                <span className="text-slate-500 dark:text-slate-400">
                                  Video belum tersedia
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {isSelected && (
                          <PlayCircle
                            size={17}
                            className="mt-1 shrink-0 text-teal-600 dark:text-teal-400"
                          />
                        )}
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
        <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
        </main>
      }
    >
      <StudentCourseDetailContent />
    </Suspense>
  );
}
