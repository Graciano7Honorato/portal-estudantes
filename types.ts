export enum UserRole {
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Material {
  id: string;
  title: string;
  description: string;
  subject: string;
  type: 'PDF' | 'DOCX' | 'OTHER';
  url: string; // In a real app this is a cloud URL, here it's a blob or base64 placeholder
  createdAt: string;
  uploadedBy: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start: string; // ISO string
  end: string;   // ISO string
  type: 'EXAM' | 'REVIEW' | 'ACTIVITY' | 'OTHER';
  subject?: string;
  createdBy: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  text: string;
  timestamp: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  class: string;
}

// Stats for dashboard
export interface DashboardStats {
  materialsCount: number;
  upcomingEvents: number;
  studentsCount?: number; // Only for teachers
}