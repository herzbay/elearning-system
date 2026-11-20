"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { BookOpen, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function StudentPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "student") {
      router.replace("/admin");
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
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600"
          >
            <LogOut size={17} />
            Keluar
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-sm font-medium text-teal-600">
          Area Student
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          Selamat datang, {user.name}
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          Temukan dan ikuti course pembelajaran yang tersedia di EduFlow.
        </p>
      </section>
    </main>
  );
}
