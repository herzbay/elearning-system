"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import {
  BookOpen,
  LogOut,
  GraduationCap,
  PlayCircle,
  BookOpenCheck,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import type { Course } from "@/lib/types";

export default function StudentPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

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
      await logout();
      toast.success("Berhasil keluar dari akun.");
    } catch {
      toast.error("Terjadi kesalahan saat logout.");
    }
  }

  if (loading || !user || user.role !== "student") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
      </main>
    );
  }

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

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 px-8 py-10 text-white">
          <div className="flex items-center gap-2 text-sm font-medium text-teal-100">
            <GraduationCap size={18} />
            Area Student
          </div>

          <h1 className="mt-3 text-3xl font-bold">
            Selamat datang, {user.name}!
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-teal-50">
            Temukan kelas pembelajaran yang tersedia dan tingkatkan
            pengetahuan serta kemampuanmu bersama EduFlow.
          </p>
        </div>

        <div className="mt-10">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Kelas Pembelajaran
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Pilih kelas yang ingin kamu pelajari.
              </p>
            </div>

            {!loadingCourses && (
              <span className="text-sm text-slate-500">
                {courses.length} kelas tersedia
              </span>
            )}
          </div>

          {loadingCourses ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
            </div>
          ) : courses.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                <Search size={26} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                Belum Ada Kelas Tersedia
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Kelas pembelajaran yang diterbitkan Admin akan muncul di sini.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <article
                  key={course.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-36 items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-100">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-teal-600 shadow-sm">
                      <BookOpenCheck size={32} />
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="line-clamp-2 text-lg font-bold text-slate-900">
                      {course.title}
                    </h3>

                    <p className="mt-2 line-clamp-3 min-h-[60px] text-sm leading-5 text-slate-500">
                      {course.description || "Belum ada deskripsi kelas."}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <BookOpen size={16} />
                        {course.lessons_count ?? course.lessons?.length ?? 0} Lesson
                      </div>

                      <button
                        onClick={() => router.push(`/student/courses/${course.slug}`)}
                        className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
                      >
                        <PlayCircle size={16} />
                        Lihat Kelas
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
