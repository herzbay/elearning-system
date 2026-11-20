"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import {
  BookOpen,
  Users,
  GraduationCap,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "admin") {
      router.replace("/student");
    }
  }, [user, loading, router]);

  async function handleLogout() {
    try {
      await logout();
      toast.success("Berhasil keluar dari akun.");
    } catch {
      toast.error("Terjadi kesalahan saat logout.");
    }
  }

  if (loading || !user || user.role !== "admin") {
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
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                EduFlow
              </h1>
              <p className="text-xs text-slate-500">
                Administrator Panel
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-red-600"
          >
            <LogOut size={17} />
            Keluar
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-medium text-teal-600">
            Dashboard Administrator
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            Selamat datang, {user.name}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Kelola konten pembelajaran EduFlow melalui dashboard ini.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <BookOpen size={22} />
            </div>
            <h3 className="mt-5 font-semibold text-slate-900">
              Kelola Course
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Tambah, edit, dan hapus course pembelajaran.
            </p>
            <button
              onClick={() => router.push("/admin/courses")}
              className="mt-5 text-sm font-semibold text-teal-600 hover:text-teal-700"
            >
              Kelola course →
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <GraduationCap size={22} />
            </div>
            <h3 className="mt-5 font-semibold text-slate-900">
              Materi Pembelajaran
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Kelola lesson dan video untuk setiap course.
            </p>
            <p className="mt-5 text-sm text-slate-400">
              Tersedia melalui pengelolaan course.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Users size={22} />
            </div>
            <h3 className="mt-5 font-semibold text-slate-900">
              Administrator
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Anda masuk menggunakan akun administrator EduFlow.
            </p>
            <p className="mt-5 text-sm font-medium text-slate-700">
              {user.email}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="text-teal-600" size={22} />
            <h3 className="font-semibold text-slate-900">
              Ringkasan Dashboard
            </h3>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Dashboard berhasil diakses. Mulai dengan membuat course
            pembelajaran pertama Anda.
          </p>
        </div>
      </div>
    </main>
  );
}
