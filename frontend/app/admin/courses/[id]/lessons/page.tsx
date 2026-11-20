"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  UserRound,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Save,
  Upload,
  Video,
  FileVideo,
  Sun,
  Moon,
  Layers3,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Play,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";
import api from "@/lib/api";

interface Course {
  title: string;
}

interface Lesson {
  id: number;
  title: string;
  description?: string | null;
  sort_order: number;
  video_path?: string | null;
  video_public_id?: string | null;
  video_original_name?: string | null;
  video_mime_type?: string | null;
  video_size?: number | null;
  video_status?: string | null;
}

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

const MAX_VIDEO_SIZE = 500 * 1024 * 1024;

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
  "video/webm",
];

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      }
    ).response;

    return response?.data?.message || fallback;
  }

  return fallback;
}

function LessonsContent() {
  const params = useParams<{ id: string }>();
  const courseId = params.id;

  const router = useRouter();
  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [fetching, setFetching] = useState(true);

  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  const [form, setForm] = useState<LessonForm>(emptyForm);

  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [deletingVideo, setDeletingVideo] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Lesson | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteVideoConfirm, setShowDeleteVideoConfirm] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setFetching(true);

      const response = await api.get(`/admin/courses/${courseId}`);

      setCourse(response.data.course ?? response.data);

      const lessonData =
        response.data.lessons ?? response.data.course?.lessons ?? [];

      setLessons(
        [...lessonData].sort(
          (a: Lesson, b: Lesson) => a.sort_order - b.sort_order
        )
      );
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal mengambil data materi."));
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

  function resetVideoForm() {
    setSelectedVideo(null);
    setUploadProgress(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function closeModal() {
    if (saving || uploading || deletingVideo) return;

    setModalOpen(false);
    setEditingLesson(null);
    setForm(emptyForm);
    resetVideoForm();
  }

  function openCreateModal() {
    setEditingLesson(null);

    setForm({
      ...emptyForm,
      sort_order: lessons.length + 1,
    });

    resetVideoForm();
    setModalOpen(true);
  }

  function openEditModal(lesson: Lesson) {
    setEditingLesson(lesson);

    setForm({
      title: lesson.title,
      description: lesson.description || "",
      sort_order: lesson.sort_order,
    });

    resetVideoForm();
    setModalOpen(true);
  }

  function handleVideoSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      toast.error(
        "Format video tidak didukung. Gunakan MP4, MOV, AVI, MKV, atau WebM."
      );
      event.target.value = "";
      return;
    }

    if (file.size > MAX_VIDEO_SIZE) {
      toast.error("Ukuran video maksimal adalah 500 MB.");
      event.target.value = "";
      return;
    }

    setSelectedVideo(file);
  }

  async function uploadVideo(lessonId: number) {
    if (!selectedVideo) return;

    const formData = new FormData();
    formData.append("video", selectedVideo);

    try {
      setUploading(true);
      setUploadProgress(0);

      await api.post(`/admin/lessons/${lessonId}/video`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );

            setUploadProgress(progress);
          }
        },
      });

      toast.success("Video berhasil diunggah.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal mengunggah video."));
      throw error;
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim()) {
      toast.error("Judul materi wajib diisi.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        sort_order: Number(form.sort_order),
      };

      let lessonId: number;

      if (editingLesson) {
        const response = await api.put(
          `/admin/lessons/${editingLesson.id}`,
          payload
        );

        lessonId = response.data.lesson?.id ?? editingLesson.id;

        toast.success("Materi berhasil diperbarui.");
      } else {
        const response = await api.post(
          `/admin/courses/${courseId}/lessons`,
          payload
        );

        lessonId = response.data.lesson?.id ?? response.data.id;

        toast.success("Materi berhasil ditambahkan.");
      }

      if (selectedVideo && lessonId) {
        await uploadVideo(lessonId);
      }

      setModalOpen(false);
      setEditingLesson(null);
      setForm(emptyForm);
      resetVideoForm();

      await fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal menyimpan materi."));
    } finally {
      setSaving(false);
    }
  }

  async function confirmDeleteVideo() {
    if (!editingLesson) return;

    try {
      setDeletingVideo(true);

      await api.delete(`/admin/lessons/${editingLesson.id}/video`);

      toast.success("Video berhasil dihapus.");

      setEditingLesson({
        ...editingLesson,
        video_path: null,
        video_public_id: null,
        video_original_name: null,
        video_mime_type: null,
        video_size: null,
        video_status: null,
      });

      setSelectedVideo(null);
      setShowDeleteVideoConfirm(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal menghapus video."));
    } finally {
      setDeletingVideo(false);
    }
  }

  async function confirmDeleteLesson() {
    if (!deleteTarget) return;

    try {
      setDeleting(true);

      await api.delete(`/admin/lessons/${deleteTarget.id}`);

      toast.success("Materi berhasil dihapus.");

      setDeleteTarget(null);
      await fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal menghapus materi."));
    } finally {
      setDeleting(false);
    }
  }

  function formatFileSize(bytes?: number | null) {
    if (!bytes) return "-";

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  const cardClass = isDark
    ? "border-slate-700 bg-slate-800"
    : "border-slate-200 bg-white";

  const mutedText = isDark ? "text-slate-400" : "text-slate-500";
  const headingText = isDark ? "text-white" : "text-slate-900";

  const inputClass = isDark
    ? "border-slate-600 bg-slate-900 text-white placeholder:text-slate-500 focus:border-teal-400"
    : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-teal-500";

  if (loading || !user || user.role !== "admin") {
    return (
      <div
        className={`flex min-h-screen items-center justify-center ${
          isDark ? "bg-slate-900" : "bg-slate-50"
        }`}
      >
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <main className="min-h-svh bg-slate-50 text-slate-900 transition-colors dark:bg-slate-900 dark:text-slate-100">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo dan navigasi */}
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin/courses")}
              aria-label="Kembali ke Kelola Course"
              title="Kembali ke Kelola Course"
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

          {/* Account dan tema */}
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

        {/* Informasi akun pada mobile */}
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

      {/* Konten halaman */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page heading */}
        <section className="mb-7">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div
                className={`mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                  isDark
                    ? "bg-teal-500/15 text-teal-300"
                    : "bg-teal-50 text-teal-700"
                }`}
              >
                <Layers3 size={14} />
                MANAJEMEN MATERI
              </div>

              <h2 className={`text-2xl font-bold sm:text-3xl ${headingText}`}>
                Kelola Lesson
              </h2>

              <p className={`mt-2 max-w-2xl text-sm ${mutedText}`}>
                Atur urutan, deskripsi, dan video pembelajaran dalam course.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-700"
            >
              <Plus size={18} />
              Tambah Materi
            </button>
          </div>
        </section>

        {/* Informasi course */}
        <section
          className={`mb-6 overflow-hidden rounded-2xl border shadow-sm ${cardClass}`}
        >
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300">
                <BookOpen size={23} />
              </div>

              <div className="min-w-0">
                <p
                  className={`mb-1 text-xs font-medium uppercase tracking-wider ${mutedText}`}
                >
                  Course yang dikelola
                </p>

                <h3 className={`break-words text-lg font-bold ${headingText}`}>
                  {course?.title || "Memuat course..."}
                </h3>

                <p className={`mt-1 text-sm ${mutedText}`}>
                  Daftar materi pembelajaran course ini
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div
                className={`rounded-xl px-4 py-3 ${
                  isDark ? "bg-slate-700/70" : "bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers3
                    size={17}
                    className="text-teal-600 dark:text-teal-400"
                  />
                  <span className={`text-sm font-semibold ${headingText}`}>
                    {lessons.length} Materi
                  </span>
                </div>
              </div>

              <div
                className={`rounded-xl px-4 py-3 ${
                  isDark ? "bg-slate-700/70" : "bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Video
                    size={17}
                    className="text-teal-600 dark:text-teal-400"
                  />
                  <span className={`text-sm font-semibold ${headingText}`}>
                    {lessons.filter((lesson) => lesson.video_path).length} Video
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Daftar materi */}
        <section
          className={`overflow-hidden rounded-2xl border shadow-sm ${cardClass}`}
        >
          <div
            className={`flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 sm:px-6 ${
              isDark ? "border-slate-700" : "border-slate-100"
            }`}
          >
            <div>
              <h3 className={`font-bold ${headingText}`}>Daftar Materi</h3>
              <p className={`mt-1 text-xs ${mutedText}`}>
                Materi ditampilkan berdasarkan urutan pembelajaran.
              </p>
            </div>

            <span
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                isDark
                  ? "bg-teal-500/15 text-teal-300"
                  : "bg-teal-50 text-teal-700"
              }`}
            >
              {lessons.length} Lesson
            </span>
          </div>

          {fetching ? (
            <div className="flex min-h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
          ) : lessons.length === 0 ? (
            <div className="flex flex-col items-center px-5 py-16 text-center">
              <div
                className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${
                  isDark ? "bg-teal-500/10" : "bg-teal-50"
                }`}
              >
                <BookOpen
                  size={30}
                  className="text-teal-600 dark:text-teal-400"
                />
              </div>

              <h4 className={`text-lg font-bold ${headingText}`}>
                Belum Ada Materi
              </h4>

              <p className={`mt-2 max-w-sm text-sm ${mutedText}`}>
                Course ini belum memiliki materi pembelajaran. Tambahkan materi
                pertama untuk mulai menyusun pembelajaran.
              </p>

              <button
                type="button"
                onClick={openCreateModal}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
              >
                <Plus size={17} />
                Tambah Materi
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className={`flex flex-col gap-4 px-5 py-5 transition sm:flex-row sm:items-center sm:justify-between sm:px-6 ${
                    isDark ? "hover:bg-slate-700/30" : "hover:bg-slate-50/80"
                  }`}
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-sm font-bold text-teal-700 dark:bg-teal-500/15 dark:text-teal-300">
                      {String(lesson.sort_order ?? index + 1).padStart(2, "0")}
                    </div>

                    <div className="min-w-0">
                      <h4
                        className={`break-words font-semibold ${headingText}`}
                      >
                        {lesson.title}
                      </h4>

                      <p className={`mt-1 line-clamp-2 text-sm ${mutedText}`}>
                        {lesson.description || "Tidak ada deskripsi materi."}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {lesson.video_path ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                            <CheckCircle2 size={13} />
                            Video tersedia
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              isDark
                                ? "bg-slate-700 text-slate-300"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <FileVideo size={13} />
                            Belum ada video
                          </span>
                        )}

                        <span
                          className={`inline-flex items-center gap-1 text-xs ${mutedText}`}
                        >
                          <Clock size={13} />
                          Urutan {lesson.sort_order}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => openEditModal(lesson)}
                      className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition sm:flex-none ${
                        isDark
                          ? "border-teal-400/30 bg-teal-500/10 text-teal-300 hover:bg-teal-500/20"
                          : "border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100"
                      }`}
                    >
                      <Pencil size={15} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget(lesson)}
                      className={`inline-flex items-center justify-center rounded-lg border p-2 transition ${
                        isDark
                          ? "border-red-400/20 text-red-400 hover:bg-red-500/10"
                          : "border-red-200 text-red-600 hover:bg-red-50"
                      }`}
                      title="Hapus materi"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <p className={`mt-5 text-center text-xs ${mutedText}`}>
          © 2026 EduFlow · Learning Management System
        </p>
      </div>

      {/* Modal tambah / edit lesson */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div
            className={`my-auto w-full max-w-2xl overflow-hidden rounded-2xl border shadow-2xl ${
              isDark
                ? "border-slate-700 bg-slate-800"
                : "border-slate-200 bg-white"
            }`}
          >
            <div
              className={`flex items-center justify-between border-b px-5 py-4 sm:px-6 ${
                isDark ? "border-slate-700" : "border-slate-100"
              }`}
            >
              <div>
                <h3 className={`text-lg font-bold ${headingText}`}>
                  {editingLesson ? "Edit Materi" : "Tambah Materi"}
                </h3>
                <p className={`mt-1 text-xs ${mutedText}`}>
                  Lengkapi informasi materi pembelajaran.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving || uploading || deletingVideo}
                className={`rounded-lg p-2 transition ${
                  isDark
                    ? "text-slate-400 hover:bg-slate-700 hover:text-white"
                    : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="max-h-[70vh] space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
                <div>
                  <label
                    className={`mb-2 block text-sm font-semibold ${headingText}`}
                  >
                    Judul Materi <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    value={form.title}
                    onChange={(event) =>
                      setForm({ ...form, title: event.target.value })
                    }
                    placeholder="Masukkan judul materi"
                    required
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-teal-500/20 ${inputClass}`}
                  />
                </div>

                <div>
                  <label
                    className={`mb-2 block text-sm font-semibold ${headingText}`}
                  >
                    Deskripsi Materi
                  </label>

                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        description: event.target.value,
                      })
                    }
                    placeholder="Masukkan deskripsi materi (opsional)"
                    className={`w-full resize-y rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-teal-500/20 ${inputClass}`}
                  />
                </div>

                <div>
                  <label
                    className={`mb-2 block text-sm font-semibold ${headingText}`}
                  >
                    Urutan Materi
                  </label>

                  <input
                    type="number"
                    min={1}
                    value={form.sort_order}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        sort_order: Number(event.target.value),
                      })
                    }
                    required
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-teal-500/20 ${inputClass}`}
                  />

                  <p className={`mt-1.5 text-xs ${mutedText}`}>
                    Angka lebih kecil akan ditampilkan lebih dahulu.
                  </p>
                </div>

                {/* Video section */}
                <div
                  className={`rounded-xl border p-4 ${
                    isDark
                      ? "border-slate-700 bg-slate-900/50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300">
                      <Video size={18} />
                    </div>

                    <div>
                      <h4 className={`text-sm font-bold ${headingText}`}>
                        Video Pembelajaran
                      </h4>
                      <p className={`text-xs ${mutedText}`}>
                        Unggah atau ganti video materi.
                      </p>
                    </div>
                  </div>

                  {editingLesson?.video_path && !selectedVideo && (
                    <div
                      className={`mb-4 flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between ${
                        isDark
                          ? "border-emerald-500/20 bg-emerald-500/5"
                          : "border-emerald-200 bg-emerald-50"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                          <Play size={18} />
                        </div>

                        <div className="min-w-0">
                          <p
                            className={`truncate text-sm font-semibold ${
                              isDark ? "text-emerald-300" : "text-emerald-800"
                            }`}
                          >
                            {editingLesson.video_original_name ||
                              "Video tersimpan"}
                          </p>

                          <p className={`text-xs ${mutedText}`}>
                            {formatFileSize(editingLesson.video_size)}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowDeleteVideoConfirm(true)}
                        disabled={deletingVideo}
                        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-400/20 dark:text-red-400 dark:hover:bg-red-500/10"
                      >
                        <Trash2 size={14} />
                        Hapus Video
                      </button>
                    </div>
                  )}

                  {selectedVideo && (
                    <div
                      className={`mb-4 flex items-center gap-3 rounded-xl border p-3 ${
                        isDark
                          ? "border-teal-400/20 bg-teal-500/5"
                          : "border-teal-200 bg-teal-50"
                      }`}
                    >
                      <FileVideo
                        size={23}
                        className="shrink-0 text-teal-600 dark:text-teal-400"
                      />

                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-sm font-semibold ${headingText}`}
                        >
                          {selectedVideo.name}
                        </p>
                        <p className={`text-xs ${mutedText}`}>
                          {formatFileSize(selectedVideo.size)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={resetVideoForm}
                        className={`rounded-lg p-1.5 ${mutedText}`}
                      >
                        <X size={17} />
                      </button>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,video/webm"
                    onChange={handleVideoSelect}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={saving || uploading}
                    className={`flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition disabled:opacity-50 ${
                      isDark
                        ? "border-slate-600 hover:border-teal-400 hover:bg-teal-500/5"
                        : "border-slate-300 hover:border-teal-500 hover:bg-teal-50/50"
                    }`}
                  >
                    <div
                      className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${
                        isDark
                          ? "bg-slate-700 text-teal-300"
                          : "bg-teal-100 text-teal-700"
                      }`}
                    >
                      <Upload size={19} />
                    </div>

                    <span className={`text-sm font-semibold ${headingText}`}>
                      {selectedVideo || editingLesson?.video_path
                        ? "Pilih Video Pengganti"
                        : "Pilih Video"}
                    </span>

                    <span className={`mt-1 text-xs ${mutedText}`}>
                      MP4, MOV, AVI, MKV, atau WebM · Maksimal 500 MB
                    </span>
                  </button>

                  {uploading && (
                    <div className="mt-4">
                      <div className="mb-2 flex justify-between text-xs">
                        <span className={mutedText}>Mengunggah video...</span>
                        <span className={`font-semibold ${headingText}`}>
                          {uploadProgress}%
                        </span>
                      </div>

                      <div
                        className={`h-2 overflow-hidden rounded-full ${
                          isDark ? "bg-slate-700" : "bg-slate-200"
                        }`}
                      >
                        <div
                          className="h-full rounded-full bg-teal-600 transition-all"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div
                className={`flex flex-col-reverse gap-3 border-t px-5 py-4 sm:flex-row sm:justify-end sm:px-6 ${
                  isDark ? "border-slate-700" : "border-slate-100"
                }`}
              >
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving || uploading || deletingVideo}
                  className={`rounded-xl border px-5 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
                    isDark
                      ? "border-slate-600 text-slate-300 hover:bg-slate-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving || uploading || deletingVideo}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving || uploading ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Save size={17} />
                  )}

                  {uploading
                    ? "Mengunggah..."
                    : saving
                      ? "Menyimpan..."
                      : editingLesson
                        ? "Simpan Perubahan"
                        : "Tambah Materi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Konfirmasi hapus lesson */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
              isDark
                ? "border-slate-700 bg-slate-800"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400">
              <AlertTriangle size={23} />
            </div>

            <h3 className={`text-lg font-bold ${headingText}`}>
              Hapus Materi?
            </h3>

            <p className={`mt-2 text-sm leading-relaxed ${mutedText}`}>
              Apakah Anda yakin ingin menghapus materi{" "}
              <span className={`font-semibold ${headingText}`}>
                "{deleteTarget.title}"
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className={`rounded-xl border px-5 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
                  isDark
                    ? "border-slate-600 text-slate-300 hover:bg-slate-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Batal
              </button>

              <button
                type="button"
                onClick={confirmDeleteLesson}
                disabled={deleting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                {deleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Konfirmasi hapus video */}
      {showDeleteVideoConfirm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
              isDark
                ? "border-slate-700 bg-slate-800"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400">
              <AlertTriangle size={23} />
            </div>

            <h3 className={`text-lg font-bold ${headingText}`}>
              Hapus Video?
            </h3>

            <p className={`mt-2 text-sm leading-relaxed ${mutedText}`}>
              Apakah Anda yakin ingin menghapus video dari materi ini? Video
              yang dihapus tidak dapat dipulihkan.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteVideoConfirm(false)}
                disabled={deletingVideo}
                className={`rounded-xl border px-5 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
                  isDark
                    ? "border-slate-600 text-slate-300 hover:bg-slate-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Batal
              </button>

              <button
                type="button"
                onClick={confirmDeleteVideo}
                disabled={deletingVideo}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {deletingVideo ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                {deletingVideo ? "Menghapus..." : "Ya, Hapus Video"}
              </button>
            </div>
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
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      }
    >
      <LessonsContent />
    </Suspense>
  );
}