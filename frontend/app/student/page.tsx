"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";
import {
  BookOpen,
  LogOut,
  GraduationCap,
  PlayCircle,
  BookOpenCheck,
  Search,
  Sun,
  Moon,
  X,
  AlertTriangle,
  Layers3,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import type { Course } from "@/lib/types";

export default function StudentPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

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

    fetchCourses();
  }, [user, loading, router]);

  async function fetchCourses() {
    try {
      setLoadingCourses(true);

      const response = await api.get("/courses");
      const data = response.data;

      setCourses(Array.isArray(data) ? data : data.courses ?? []);
    } catch {
      toast.error("Gagal memuat daftar kelas.");
    } finally {
      setLoadingCourses(false);
    }
  }

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await logout();
      toast.success("Berhasil keluar dari akun.");
    } catch {
      toast.error("Terjadi kesalahan saat logout.");
    } finally {
      setLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  }

  if (loading || !user || user.role !== "student") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-white">
      {/* Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-md shadow-teal-600/15">
              <BookOpen size={19} />
            </div>

            <div className="min-w-0">
              <p className="text-base font-bold leading-tight text-slate-900 dark:text-white">
                EduFlow
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Student Learning Portal
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden border-r border-slate-200 pr-3 dark:border-slate-700 sm:block sm:pr-4">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Student
              </p>
              <p className="max-w-[180px] truncate text-xs text-slate-500 dark:text-slate-400">
                {user.email}
              </p>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Ganti tema"
              title="Ganti tema"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-red-500/40 dark:hover:bg-red-500/10 dark:hover:text-red-400"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>

        {/* Informasi akun pada layar kecil */}
        <div className="border-t border-slate-100 px-4 py-2 sm:hidden dark:border-slate-800">
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            Masuk sebagai <span className="font-semibold text-slate-700 dark:text-slate-200">{user.email}</span>
          </p>
        </div>
      </header>

      {/* Konten */}
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 via-teal-600 to-cyan-600 px-5 py-5 text-white shadow-sm sm:px-7 sm:py-6">
          <div className="pointer-events-none absolute -right-8 -top-16 h-48 w-48 rounded-full border-[28px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-24 right-28 h-44 w-44 rounded-full bg-white/5" />

          <div className="relative flex items-center gap-4">
            <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white sm:flex">
              <GraduationCap size={30} />
            </div>

            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-teal-100 sm:text-sm">
                <GraduationCap size={16} className="sm:hidden" />
                AREA PEMBELAJARAN STUDENT
              </div>

              <h1 className="text-xl font-bold sm:text-2xl">
                Selamat datang, {user.name}!
              </h1>

              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-teal-50 sm:text-sm">
                Temukan kelas yang tersedia dan lanjutkan perjalanan belajarmu bersama EduFlow.
              </p>
            </div>
          </div>
        </section>

        {/* Daftar kelas */}
        <section className="mt-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300">
                  <BookOpenCheck size={17} />
                </div>

                <h2 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
                  Kelas Pembelajaran
                </h2>
              </div>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                Pilih kelas yang ingin kamu pelajari.
              </p>
            </div>

            {!loadingCourses && (
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <Layers3 size={15} className="text-teal-600 dark:text-teal-400" />
                {courses.length} kelas tersedia
              </div>
            )}
          </div>

          {loadingCourses ? (
            <div className="flex justify-center rounded-2xl border border-slate-200 bg-white py-16 dark:border-slate-700 dark:bg-slate-800">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
            </div>
          ) : courses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center dark:border-slate-700 dark:bg-slate-800">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400">
                <Search size={23} />
              </div>

              <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
                Belum Ada Kelas Tersedia
              </h3>

              <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-500 dark:text-slate-400 sm:text-sm">
                Kelas pembelajaran yang diterbitkan Admin akan muncul di halaman ini.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <article
                  key={course.id}
                  className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md hover:shadow-teal-900/5 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-teal-600"
                >
                  <div className="flex h-24 items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-950/60 dark:to-slate-800 sm:h-28">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-teal-600 shadow-sm dark:bg-slate-700 dark:text-teal-400">
                      <BookOpenCheck size={25} />
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-slate-900 dark:text-white sm:text-base">
                      {course.title}
                    </h3>

                    <p className="mt-1.5 line-clamp-2 min-h-9 text-xs leading-relaxed text-slate-500 dark:text-slate-400 sm:text-sm">
                      {course.description || "Belum ada deskripsi kelas."}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-700">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <BookOpen size={15} className="text-teal-600 dark:text-teal-400" />
                        <span>
                          {course.lessons_count ?? course.lessons?.length ?? 0} materi
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => router.push(`/student/courses/${course.slug}`)}
                        className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-teal-600/15 transition hover:bg-teal-700 sm:text-sm"
                      >
                        <PlayCircle size={15} />
                        Lihat Kelas
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Konfirmasi logout */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                <AlertTriangle size={21} />
              </div>

              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                disabled={loggingOut}
                aria-label="Tutup"
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:hover:bg-slate-700 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
              Keluar dari akun?
            </h3>

            <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Apakah kamu yakin ingin keluar dari akun EduFlow?
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                disabled={loggingOut}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut size={15} />
                {loggingOut ? "Memproses..." : "Ya, Keluar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
