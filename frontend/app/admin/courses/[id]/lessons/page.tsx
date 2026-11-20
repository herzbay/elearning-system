"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import api from "@/lib/api";
import { Course, Lesson } from "@/lib/types";

interface LessonForm {
  title: string;
  description: string;
  sort_order: number;
}

const emptyForm: LessonForm = {
  title: "",
  description: "",
  sort_order: 1,
};

function LessonsContent() {
  const params = useParams<{ id: string }>();
  const courseId = params.id;

  const router = useRouter();
  const { user, loading } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [form, setForm] = useState<LessonForm>(emptyForm);

  const fetchData = useCallback(async () => {
    try {
      setFetching(true);

      const response = await api.get<Course>(
        `/admin/courses/${courseId}`
      );

      setCourse(response.data);
      setLessons(
        [...(response.data.lessons || [])].sort(
          (a, b) => a.sort_order - b.sort_order
        )
      );
    } catch {
      toast.error("Gagal memuat data lesson.");
    } finally {
      setFetching(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "admin") {
      router.replace("/student");
      return;
    }

    fetchData();
  }, [user, loading, router, fetchData]);

  const openCreateModal = () => {
    setEditingLesson(null);
    setForm({
      ...emptyForm,
      sort_order: lessons.length + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setForm({
      title: lesson.title,
      description: lesson.description || "",
      sort_order: lesson.sort_order,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Judul lesson wajib diisi.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        sort_order: Number(form.sort_order),
      };

      if (editingLesson) {
        await api.put(`/admin/lessons/${editingLesson.id}`, payload);
        toast.success("Lesson berhasil diperbarui.");
      } else {
        await api.post(
          `/admin/courses/${courseId}/lessons`,
          payload
        );
        toast.success("Lesson berhasil ditambahkan.");
      }

      setModalOpen(false);
      setEditingLesson(null);
      setForm(emptyForm);
      await fetchData();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Terjadi kesalahan. Silakan coba lagi.";

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (lesson: Lesson) => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus lesson "${lesson.title}"?`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/admin/lessons/${lesson.id}`);
      toast.success("Lesson berhasil dihapus.");
      await fetchData();
    } catch {
      toast.error("Gagal menghapus lesson.");
    }
  };

  if (loading || fetching) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!user || user.role !== "admin" || !course) return null;

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <button
            onClick={() => router.push("/admin/courses")}
            className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
            aria-label="Kembali"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Kelola Lesson
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {course.title}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Daftar Materi
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Atur materi dan urutan pembelajaran course ini.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            <Plus size={18} />
            Tambah Lesson
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-teal-50 p-3 text-teal-600">
                <BookOpen size={22} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Lesson</p>
                <p className="text-2xl font-bold text-slate-800">
                  {lessons.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Status Course</p>
            <p className="mt-2 text-lg font-bold capitalize text-slate-800">
              {course.status === "published" ? "Dipublikasikan" : "Draft"}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {lessons.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <BookOpen size={26} />
              </div>

              <h3 className="font-semibold text-slate-800">
                Belum ada lesson
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Tambahkan materi pertama untuk course ini.
              </p>

              <button
                onClick={openCreateModal}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
              >
                <Plus size={17} />
                Tambah Lesson
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-sm font-bold text-teal-700">
                      {lesson.sort_order}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-slate-800">
                        {lesson.title}
                      </h3>

                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                        {lesson.description || "Tidak ada deskripsi."}
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        {lesson.video_status === "ready"
                          ? "Video tersedia"
                          : "Video belum diunggah"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:justify-end">
                    <button
                      onClick={() => openEditModal(lesson)}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(lesson)}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-100 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4">
          <div className="my-auto w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {editingLesson ? "Edit Lesson" : "Tambah Lesson"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Lengkapi informasi materi pembelajaran.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                aria-label="Tutup"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Judul Lesson <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  placeholder="Contoh: Pengenalan Pemrograman"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Deskripsi
                </label>

                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Deskripsi singkat materi..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Urutan Lesson
                </label>

                <input
                  type="number"
                  min={1}
                  required
                  value={form.sort_order}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      sort_order: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />

                <p className="mt-1 text-xs text-slate-400">
                  Angka lebih kecil akan ditampilkan lebih dahulu.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Save size={17} />
                  )}

                  {saving ? "Menyimpan..." : "Simpan Lesson"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default function LessonsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      }
    >
      <LessonsContent />
    </Suspense>
  );
}