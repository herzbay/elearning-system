"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";
import api from "@/lib/api";
import { Course } from "@/lib/types";
import { toast } from "sonner";
import {
  ArrowLeft,
  BookOpen,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Clock,
  CheckCircle2,
  FileText,
  Loader2,
  GraduationCap,
  Sun,
  Moon,
  UserRound,
  Layers3,
  AlertTriangle,
} from "lucide-react";

export default function AdminCoursesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // State dialog konfirmasi hapus
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "draft" as "draft" | "published",
  });

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "admin") {
      router.replace("/student");
    }
  }, [user, authLoading, router]);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get<Course[]>("/admin/courses");
      setCourses(response.data);
    } catch {
      toast.error("Gagal memuat daftar course.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user?.role === "admin") {
      fetchCourses();
    }
  }, [authLoading, user, fetchCourses]);

  function openCreateModal() {
    setEditingCourse(null);
    setForm({
      title: "",
      description: "",
      status: "draft",
    });
    setShowModal(true);
  }

  function openEditModal(course: Course) {
    setEditingCourse(course);
    setForm({
      title: course.title,
      description: course.description || "",
      status: course.status,
    });
    setShowModal(true);
  }

  function closeModal() {
    if (submitting) return;
    setShowModal(false);
    setEditingCourse(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Judul course wajib diisi.");
      return;
    }

    setSubmitting(true);

    try {
      if (editingCourse) {
        await api.put(`/admin/courses/${editingCourse.id}`, {
          title: form.title.trim(),
          description: form.description.trim() || null,
          status: form.status,
        });

        toast.success("Course berhasil diperbarui.");
      } else {
        await api.post("/admin/courses", {
          title: form.title.trim(),
          description: form.description.trim() || null,
          status: form.status,
        });

        toast.success("Course berhasil ditambahkan.");
      }

      setShowModal(false);
      setEditingCourse(null);
      await fetchCourses();
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error
          ? (
              error as {
                response?: {
                  data?: {
                    message?: string;
                    errors?: Record<string, string[]>;
                  };
                };
              }
            ).response?.data
          : null;

      const validationMessage = message?.errors
        ? Object.values(message.errors).flat()[0]
        : null;

      toast.error(
        validationMessage || message?.message || "Gagal menyimpan course."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Membuka dialog konfirmasi hapus
  function handleDelete(course: Course) {
    setDeletingCourse(course);
  }

  // Menjalankan penghapusan setelah dikonfirmasi
  async function confirmDelete() {
    if (!deletingCourse || deleting) return;

    setDeleting(true);

    try {
      await api.delete(`/admin/courses/${deletingCourse.id}`);

      setCourses((previous) =>
        previous.filter((item) => item.id !== deletingCourse.id)
      );

      toast.success("Course berhasil dihapus.");
      setDeletingCourse(null);
    } catch {
      toast.error("Gagal menghapus course.");
    } finally {
      setDeleting(false);
    }
  }

  function closeDeleteDialog() {
    if (deleting) return;
    setDeletingCourse(null);
  }

  function openLessons(course: Course) {
    router.push(`/admin/courses/${course.id}/lessons`);
  }

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(search.toLowerCase())
  );

  const publishedCount = courses.filter(
    (course) => course.status === "published"
  ).length;

  const draftCount = courses.filter(
    (course) => course.status === "draft"
  ).length;

  if (authLoading || !user || user.role !== "admin") {
    return (
      <main className="flex min-h-svh items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="animate-spin text-teal-600" size={30} />
      </main>
    );
  }

  return (
    <main className="min-h-svh bg-slate-50 text-slate-900 transition-colors dark:bg-slate-900 dark:text-slate-100">
      {/* Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin")}
              aria-label="Kembali ke dashboard"
              title="Kembali ke dashboard"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-teal-500 dark:hover:bg-teal-500/10 dark:hover:text-teal-300"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-md shadow-teal-600/15">
              <BookOpen size={19} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-base font-bold tracking-tight text-slate-900 dark:text-white">
                EduFlow
              </h1>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Administrator Panel
              </p>
            </div>
          </div>

          {/* Account and theme */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2.5 border-r border-slate-200 pr-3 dark:border-slate-700 sm:flex sm:pr-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300">
                <UserRound size={17} />
              </div>

              <div className="max-w-[190px]">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  Administrator
                </p>
                <p className="max-w-[175px] truncate text-[11px] text-slate-500 dark:text-slate-400">
                  {user.email}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Ganti tema"
              title={theme === "light" ? "Dark Mode" : "Light Mode"}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-teal-500 dark:hover:bg-teal-500/10 dark:hover:text-teal-300"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </div>

        {/* Account information - mobile */}
        <div className="border-t border-slate-100 px-4 py-2 sm:hidden dark:border-slate-800">
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
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        {/* Page heading */}
        <section className="mb-5 flex flex-col justify-between gap-4 sm:mb-6 sm:flex-row sm:items-center">
          <div>
            <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-teal-700 dark:text-teal-400">
              <Layers3 size={14} />
              Manajemen Pembelajaran
            </div>

            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              Kelola Course
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
              Tambah, edit, dan atur publikasi course pembelajaran.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-600/15 transition hover:bg-teal-700 sm:self-center"
          >
            <Plus size={17} />
            Tambah Course
          </button>
        </section>

        {/* Statistics */}
        <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Total Course
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {courses.length}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300">
              <BookOpen size={20} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Published
              </p>
              <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                {publishedCount}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              <CheckCircle2 size={20} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Draft
              </p>
              <p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-400">
                {draftCount}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
              <Clock size={20} />
            </div>
          </div>
        </section>

        {/* Course list */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          {/* List heading and search */}
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 dark:border-slate-700">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                  <BookOpen size={16} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Daftar Course
                </h3>
              </div>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Menampilkan {filteredCourses.length} dari {courses.length} course
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama course..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-9 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-teal-500 dark:focus:bg-slate-900"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Hapus pencarian"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex min-h-56 flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-teal-600" size={28} />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Memuat daftar course...
              </p>
            </div>
          ) : filteredCourses.length === 0 ? (
            /* Empty state */
            <div className="flex min-h-56 flex-col items-center justify-center px-5 py-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-300">
                <FileText size={25} />
              </div>

              <h4 className="mt-4 text-sm font-bold text-slate-800 dark:text-white">
                {search ? "Course tidak ditemukan" : "Belum ada course"}
              </h4>

              <p className="mt-1.5 max-w-sm text-xs leading-5 text-slate-500 dark:text-slate-400">
                {search
                  ? "Coba gunakan kata kunci pencarian lainnya."
                  : "Mulai dengan menambahkan course pembelajaran pertama Anda."}
              </p>

              {!search && (
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-teal-700"
                >
                  <Plus size={15} />
                  Tambah Course
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-900/70 dark:text-slate-400">
                    <tr>
                      <th className="px-5 py-3.5">Course</th>
                      <th className="px-5 py-3.5">Jumlah Lesson</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {filteredCourses.map((course) => (
                      <tr
                        key={course.id}
                        className="transition hover:bg-slate-50/80 dark:hover:bg-slate-700/30"
                      >
                        <td className="max-w-md px-5 py-3.5">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                              <BookOpen size={17} />
                            </div>

                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                {course.title}
                              </p>
                              <p className="mt-0.5 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                                {course.description || "Tidak ada deskripsi"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                            <GraduationCap
                              size={15}
                              className="text-indigo-500"
                            />
                            {course.lessons_count ?? 0} lesson
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              course.status === "published"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                                : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                course.status === "published"
                                  ? "bg-emerald-500"
                                  : "bg-amber-500"
                              }`}
                            />
                            {course.status === "published"
                              ? "Published"
                              : "Draft"}
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openLessons(course)}
                              className="flex h-8 items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
                              title="Kelola lesson"
                            >
                              <GraduationCap size={15} />
                              Lesson
                            </button>

                            <button
                              type="button"
                              onClick={() => openEditModal(course)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 dark:border-slate-600 dark:text-slate-300 dark:hover:border-teal-500/40 dark:hover:bg-teal-500/10 dark:hover:text-teal-300"
                              title="Edit course"
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(course)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-600 dark:text-slate-300 dark:hover:border-red-500/40 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                              title="Hapus course"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-slate-100 md:hidden dark:divide-slate-700">
                {filteredCourses.map((course) => (
                  <div key={course.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                        <BookOpen size={17} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {course.title}
                          </h4>

                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                              course.status === "published"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                                : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                            }`}
                          >
                            {course.status === "published"
                              ? "Published"
                              : "Draft"}
                          </span>
                        </div>

                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                          {course.description || "Tidak ada deskripsi"}
                        </p>

                        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                          <GraduationCap
                            size={14}
                            className="text-indigo-500"
                          />
                          {course.lessons_count ?? 0} lesson
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => openLessons(course)}
                        className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
                      >
                        <GraduationCap size={14} />
                        Lesson
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditModal(course)}
                        className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 dark:border-slate-600 dark:text-slate-300 dark:hover:border-teal-500/40 dark:hover:bg-teal-500/10 dark:hover:text-teal-300"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(course)}
                        className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-50 dark:border-slate-600 dark:text-red-400 dark:hover:border-red-500/40 dark:hover:bg-red-500/10"
                      >
                        <Trash2 size={14} />
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        <footer className="py-5 text-center text-[11px] text-slate-400 dark:text-slate-500">
          © 2026 EduFlow · Learning Management System
        </footer>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6 dark:border-slate-700">
              <div>
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-teal-600 dark:text-teal-400">
                  <BookOpen size={14} />
                  Manajemen Pembelajaran
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">
                  {editingCourse ? "Edit Course" : "Tambah Course"}
                </h3>

                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Lengkapi informasi course pembelajaran.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                aria-label="Tutup modal"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:hover:bg-slate-700 dark:hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            {/* Modal form */}
            <form onSubmit={handleSubmit} className="space-y-4 p-5 sm:p-6">
              <div>
                <label
                  htmlFor="course-title"
                  className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-200"
                >
                  Judul Course <span className="text-red-500">*</span>
                </label>

                <input
                  id="course-title"
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  placeholder="Contoh: Dasar-Dasar Web Development"
                  maxLength={255}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-teal-500 dark:focus:bg-slate-900"
                />
              </div>

              <div>
                <label
                  htmlFor="course-description"
                  className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-200"
                >
                  Deskripsi
                </label>

                <textarea
                  id="course-description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Jelaskan materi yang akan dipelajari dalam course ini..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-teal-500 dark:focus:bg-slate-900"
                />
              </div>

              <div>
                <label
                  htmlFor="course-status"
                  className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-200"
                >
                  Status Course
                </label>

                <select
                  id="course-status"
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as "draft" | "published",
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-teal-500 dark:focus:bg-slate-900"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>

                <p className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                  Course Draft tidak akan ditampilkan kepada Student.
                </p>
              </div>

              {/* Modal actions */}
              <div className="flex flex-col-reverse gap-2.5 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end dark:border-slate-700">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      {editingCourse ? "Simpan Perubahan" : "Tambah Course"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingCourse && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeDeleteDialog();
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800">
            <div className="p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400">
                  <AlertTriangle size={23} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Hapus Course?
                  </h3>

                  <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Apakah Anda yakin ingin menghapus course{" "}
                    <span className="font-semibold text-slate-900 dark:text-white">
                      &quot;{deletingCourse.title}&quot;
                    </span>
                    ?
                  </p>

                  <p className="mt-2 text-xs leading-5 text-red-600 dark:text-red-400">
                    Seluruh lesson di dalam course ini juga akan dihapus.
                    Tindakan ini tidak dapat dibatalkan.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeDeleteDialog}
                  disabled={deleting}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Menghapus...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Ya, Hapus
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
