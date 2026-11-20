export type UserRole = "admin" | "student";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface Lesson {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  video_path: string | null;
  video_public_id: string | null;
  video_original_name: string | null;
  video_mime_type: string | null;
  video_size: number | null;
  video_status: "pending" | "ready" | "failed";
  sort_order: number;
}

export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  status: "draft" | "published";
  lessons_count?: number;
  lessons?: Lesson[];
  created_at?: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}