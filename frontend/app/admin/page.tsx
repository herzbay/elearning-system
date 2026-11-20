"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";
import {
  BookOpen,
  GraduationCap,
  LogOut,
  Sun,
  Moon,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  UserRound,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

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
      <main className="flex min-h-svh items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
      </main>
    );
  }

  const menuItems = [
    {
      title: "Kelola Course",
      description:
        "Buat dan atur course pembelajaran, mulai dari informasi hingga status publikasi.",
      icon: BookOpen,
      iconColor: "text-teal-700 dark:text-teal-300",
      iconBackground: "bg-teal-100 dark:bg-teal-500/15",
      accent: "bg-teal-500",
      action: "Kelola Course",
      actionDescription: "Buka halaman pengelolaan course",
      buttonColor:
        "border-teal-200 bg-teal-50 hover:bg-teal-100 hover:border-teal-300 dark:border-teal-500/30 dark:bg-teal-500/10 dark:hover:bg-teal-500/20",
      buttonText: "text-teal-700 dark:text-teal-300",
      buttonIcon:
        "bg-white text-teal-700 dark:bg-teal-500/15 dark:text-teal-300",
      onClick: () => router.push("/admin/courses"),
    },
    {
      title: "Materi Pembelajaran",
      description:
        "Atur lesson, susunan materi, dan video pembelajaran untuk setiap course.",
      icon: GraduationCap,
      iconColor: "text-indigo-700 dark:text-indigo-300",
      iconBackground: "bg-indigo-100 dark:bg-indigo-500/15",
      accent: "bg-indigo-500",
      action: "Atur Materi",
      actionDescription: "Pilih course untuk mengatur materi",
      buttonColor:
        "border-indigo-200 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-300 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20",
      buttonText: "text-indigo-700 dark:text-indigo-300",
      buttonIcon:
        "bg-white text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
      onClick: () => router.push("/admin/courses"),
    },
  ];

  return (
    <main className="flex min-h-svh flex-col bg-slate-50 text-slate-900 transition-colors dark:bg-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-30 shrink-0 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-lg shadow-teal-600/20">
              <BookOpen size={21} />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                EduFlow
              </h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Administrator Panel
              </p>
            </div>
          </div>

          {/* Account and actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Account information - desktop */}
            <div className="hidden items-center gap-2.5 border-r border-slate-200 pr-4 dark:border-slate-700 sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300">
                <UserRound size={18} />
              </div>

              <div className="max-w-[220px]">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Administrator
                </p>
                <p className="max-w-[190px] truncate text-xs text-slate-500 dark:text-slate-400">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Ganti tema"
              title={theme === "light" ? "Dark Mode" : "Light Mode"}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-teal-500 dark:hover:bg-teal-500/10 dark:hover:text-teal-300"
            >
              {theme === "light" ? (
                <Moon size={19} />
              ) : (
                <Sun size={19} />
              )}
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-red-500/40 dark:hover:bg-red-500/10 dark:hover:text-red-400 sm:px-4"
            >
              <LogOut size={17} />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>

        {/* Account information - mobile */}
        <div className="border-t border-slate-100 px-5 py-2 sm:hidden dark:border-slate-800">
          <div className="flex items-center gap-2">
            <UserRound
              size={14}
              className="shrink-0 text-teal-600 dark:text-teal-400"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Administrator
              </p>
              <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 py-5 sm:px-8 sm:py-6">
        {/* Welcome banner */}
        <section className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-[#102A43] via-[#164E63] to-[#0F766E] px-5 py-5 text-white shadow-lg shadow-teal-950/10 sm:px-7 sm:py-6">
          <div className="absolute -right-12 -top-24 h-48 w-48 rounded-full bg-teal-400/15 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 h-40 w-40 rounded-full bg-indigo-400/15 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold text-teal-100 backdrop-blur-sm">
              <Sparkles size={12} />
              Dashboard Administrator
            </div>

            <h2 className="text-xl font-bold leading-tight tracking-tight sm:text-2xl">
              Selamat datang,{" "}
              <span className="text-teal-300">{user.name}</span>
            </h2>

            <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-200 sm:text-sm">
              Kelola course dan materi pembelajaran melalui satu dashboard
              EduFlow dengan mudah dan terorganisir.
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-white/15 pt-3">
              <div className="flex items-center gap-2 text-[11px] text-slate-200 sm:text-xs">
                <ShieldCheck size={14} className="text-teal-300" />
                Akses Administrator
              </div>

              <div className="hidden h-3 w-px bg-white/20 sm:block" />

              <p className="text-[11px] text-slate-200 sm:text-xs">
                Learning Management System
              </p>
            </div>
          </div>
        </section>

        {/* Section heading */}
        <section className="mb-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 rounded-full bg-teal-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">
              Menu Pengelolaan
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Pilih menu untuk mulai mengelola platform pembelajaran.
          </p>
        </section>

        {/* Menu cards */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600 dark:hover:shadow-black/20"
              >
                <div
                  className={`absolute left-0 top-0 h-1 w-full ${item.accent}`}
                />

                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.iconBackground}`}
                  >
                    <Icon size={22} className={item.iconColor} />
                  </div>

                  <div className="rounded-full bg-slate-100 p-2 text-slate-400 transition group-hover:bg-slate-200 group-hover:text-slate-700 dark:bg-slate-700 dark:text-slate-400 dark:group-hover:bg-slate-600 dark:group-hover:text-white">
                    <ArrowUpRight size={16} />
                  </div>
                </div>

                <h4 className="mt-4 text-base font-bold text-slate-900 dark:text-white sm:text-lg">
                  {item.title}
                </h4>

                <p className="mt-1.5 min-h-[42px] text-xs leading-5 text-slate-500 sm:text-sm dark:text-slate-400">
                  {item.description}
                </p>

                {/* Action button */}
                <button
                  type="button"
                  onClick={item.onClick}
                  className={`mt-4 flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition duration-200 ${item.buttonColor}`}
                >
                  <div>
                    <p className={`text-sm font-bold ${item.buttonText}`}>
                      {item.action}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                      {item.actionDescription}
                    </p>
                  </div>

                  <div
                    className={`ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm transition group-hover:scale-105 ${item.buttonIcon}`}
                  >
                    <ArrowUpRight size={17} />
                  </div>
                </button>
              </div>
            );
          })}
        </section>

        {/* Footer */}
        <footer className="mt-auto pt-6 text-center text-[11px] text-slate-400 dark:text-slate-500">
          © 2026 EduFlow · Learning Management System
        </footer>
      </div>
    </main>
  );
}
