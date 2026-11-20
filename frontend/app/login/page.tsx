"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { LoginResponse } from "@/lib/types";
import { toast } from "sonner";
import {
  BookOpen,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ArrowRight,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Email dan password wajib diisi.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post<LoginResponse>("/login", {
        email: email.trim(),
        password,
      });

      localStorage.setItem("eduflow_token", response.data.token);

      toast.success("Login berhasil. Selamat datang!");

      const destination =
        response.data.user.role === "admin" ? "/admin" : "/student";

      window.location.assign(destination);
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error
          ? (
              error as {
                response?: { data?: { message?: string } };
              }
            ).response?.data?.message
          : null;

      toast.error(message || "Login gagal. Periksa email dan password Anda.");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid h-dvh min-h-0 overflow-hidden bg-white lg:grid-cols-2">
      {/* Bagian kiri */}
      <section className="relative hidden min-h-0 overflow-hidden bg-[#102A43] px-10 py-8 text-white lg:flex lg:flex-col lg:justify-between xl:px-16 xl:py-10">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500">
            <BookOpen size={22} />
          </div>
          <span className="text-xl font-bold tracking-tight">EduFlow</span>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-teal-200">
            <GraduationCap size={17} />
            Learning Management System
          </div>

          <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
            Belajar lebih mudah,
            <span className="mt-2 block text-teal-400">
              berkembang tanpa batas.
            </span>
          </h1>

          <p className="mt-5 max-w-md text-sm leading-7 text-slate-300 xl:text-base">
            Akses berbagai materi pembelajaran, ikuti setiap pelajaran,
            dan kembangkan kemampuan Anda bersama EduFlow.
          </p>

          <div className="mt-7 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
              <ShieldCheck className="text-teal-300" size={21} />
            </div>
            <div>
              <p className="text-sm font-medium">
                Satu platform untuk belajar
              </p>
              <p className="text-xs text-slate-400">
                Kelola dan akses pembelajaran dengan mudah.
              </p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-400">
          © 2026 EduFlow. All rights reserved.
        </p>
      </section>

      {/* Bagian kanan */}
      <section className="flex min-h-0 items-center justify-center overflow-y-auto px-5 py-5 sm:px-10 lg:overflow-hidden lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-6 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white">
                <BookOpen size={22} />
              </div>
              <span className="text-xl font-bold text-slate-900">
                EduFlow
              </span>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Masuk ke akun Anda
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Masukkan email dan password untuk melanjutkan ke platform
              pembelajaran EduFlow.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                  aria-label={
                    showPassword
                      ? "Sembunyikan password"
                      : "Tampilkan password"
                  }
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Memproses...
                </>
              ) : (
                <>
                  Masuk
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Akun untuk pengujian
            </p>

            <div className="space-y-2.5 text-sm">
              <div>
                <p className="font-medium text-slate-700">Administrator</p>
                <p className="text-slate-500">admin@eduflow.test</p>
              </div>

              <div className="border-t border-slate-200 pt-2.5">
                <p className="font-medium text-slate-700">Student</p>
                <p className="text-slate-500">student@eduflow.test</p>
              </div>

              <p className="text-xs text-slate-400">
                Password kedua akun: password123
              </p>
            </div>
          </div>

          <p className="mt-5 text-center text-xs text-slate-400">
            © 2026 EduFlow · Learning Management System
          </p>
        </div>
      </section>
    </main>
  );
}
