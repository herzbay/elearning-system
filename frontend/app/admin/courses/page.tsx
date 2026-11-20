"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
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
} from "lucide-react";

export default function AdminCoursesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
        validationMessage ||
          message?.message ||
          "Gagal menyimpan course."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(course: Course) {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus course "${course.title}"? Seluruh lesson di dalamnya juga akan dihapus.`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/admin/courses/${course.id}`);

      setCourses((previous) =>
        previous.filter((item) => item.id !== course.id)
      );

      toast.success("Course berhasil dihapus.");
    } catch {
      toast.error("Gagal menghapus course.");
    }
  }

  function openLessons(course: Course) {
    router.push(`/admin/courses/${course.id}/lessons`);
  }

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || !user || user.role !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-teal-600" size={30} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-4 sm:px-8">
          <button
            onClick={() => router.push("/admin")}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            aria-label="Kembali ke dashboard"
          >
            <ArrowLeft size={19} />
          </button>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white">
            <BookOpen size={21} />
          </div>

          <div>
            <h1 className="font-bold text-slate-900">EduFlow</h1>
            <p className="text-xs text-slate-500">
              Administrator Panel
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        {/* Page Heading */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-teal-600">
              Manajemen Pembelajaran
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Kelola Course
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Tambah dan kelola course pembelajaran EduFlow.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-600/15 transition hover:bg-teal-700"
          >
            <Plus size={19} />
            Tambah Course
          </button>
        </div>

        {/* Statistics */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Total Course</p>
              <BookOpen className="text-teal-600" size={21} />
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">
              {courses.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Published</p>
              <CheckCircle2 className="text-emerald-600" size={21} />
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">
              {courses.filter((c) => c.status === "published").length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Draft</p>
              <Clock className="text-amber-600" size={21} />
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">
              {courses.filter((c) => c.status === "draft").length}
            </p>
          </div>
        </div>

        {/* Course List */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">
                Daftar Course
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {filteredCourses.length} course ditemukan
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari course..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <Loader2 className="animate-spin text-teal-600" size={30} />
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <FileText size={26} />
              </div>
              <h4 className="mt-4 font-semibold text-slate-800">
                {search ? "Course tidak ditemukan" : "Belum ada course"}
              </h4>
              <p className="mt-2 max-w-sm text-sm text-slate-500">
                {search
                  ? "Coba gunakan kata kunci pencarian lainnya."
                  : "Mulai dengan menambahkan course pembelajaran pertama Anda."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Course</th>
                      <th className="px-6 py-4">Lesson</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredCourses.map((course) => (
                      <tr
                        key={course.id}
                        className="transition hover:bg-slate-50/70"
                      >
                        <td className="max-w-md px-6 py-4">
                          <p className="font-semibold text-slate-800">
                            {course.title}
                          </p>
                          <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                            {course.description || "Tidak ada deskripsi"}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">
                            {course.lessons_count ?? 0} lesson
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                              course.status === "published"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {course.status === "published"
                              ? "Published"
                              : "Draft"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openLessons(course)}
                              className="flex h-9 items-center gap-2 rounded-lg border border-teal-200 px-3 text-xs font-medium text-teal-700 transition hover:bg-teal-50"
                              title="Kelola lesson"
                            >
                              <GraduationCap size={16} />
                              Lesson
                            </button>

                            <button
                              onClick={() => openEditModal(course)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                              title="Edit course"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              onClick={() => handleDelete(course)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                              title="Hapus course"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="divide-y divide-slate-100 md:hidden">
                {filteredCourses.map((course) => (
                  <div key={course.id} className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="font-semibold text-slate-800">
                          {course.title}
                        </h4>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                          {course.description || "Tidak ada deskripsi"}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                          course.status === "published"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {course.status === "published" ? "Published" : "Draft"}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs text-slate-500">
                        {course.lessons_count ?? 0} lesson
                      </span>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => openLessons(course)}
                          className="flex h-9 items-center gap-2 rounded-lg border border-teal-200 px-3 text-xs font-medium text-teal-700"
                        >
                          <GraduationCap size={14} />
                          Lesson
                        </button>

                        <button
                          onClick={() => openEditModal(course)}
                          className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(course)}
                          className="flex h-9 items-center gap-2 rounded-lg border border-red-100 px-3 text-xs font-medium text-red-600"
                        >
                          <Trash2 size={14} />
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="my-auto w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingCourse ? "Edit Course" : "Tambah Course"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Lengkapi informasi course pembelajaran.
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={submitting}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div>
                <label
                  htmlFor="course-title"
                  className="mb-2 block text-sm font-medium text-slate-700"
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
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                />
              </div>

              <div>
                <label
                  htmlFor="course-description"
                  className="mb-2 block text-sm font-medium text-slate-700"
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
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                />
              </div>

              <div>
                <label
                  htmlFor="course-status"
                  className="mb-2 block text-sm font-medium text-slate-700"
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
                <p className="mt-2 text-xs text-slate-400">
                  Course Draft tidak akan ditampilkan kepada Student.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    editingCourse ? "Simpan Perubahan" : "Tambah Course"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
