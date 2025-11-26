import { UserRole } from './types';

export const APP_NAME = "EduPortal";

export const MOCK_USERS = [
  {
    id: 'u-teacher-1',
    name: 'Prof. Albus D.',
    email: 'professor@example.com',
    password: 'prof123',
    role: UserRole.TEACHER,
    avatar: 'https://picsum.photos/id/1/200/200'
  },
  {
    id: 'u-student-1',
    name: 'Harry P.',
    email: 'aluno@example.com',
    password: 'aluno123',
    role: UserRole.STUDENT,
    avatar: 'https://picsum.photos/id/64/200/200'
  }
];

export const SUBJECTS = [
  'Matemática',
  'Física',
  'História',
  'Literatura',
  'Ciência da Computação',
  'Química'
];

export const EVENT_TYPES = {
  EXAM: { label: 'Prova', color: 'bg-red-100 text-red-800 border-red-200' },
  REVIEW: { label: 'Revisão', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  ACTIVITY: { label: 'Atividade', color: 'bg-green-100 text-green-800 border-green-200' },
  OTHER: { label: 'Outro', color: 'bg-gray-100 text-gray-800 border-gray-200' }
};

export const STORAGE_KEYS = {
  SESSION: 'eduportal_session',
  MATERIALS: 'eduportal_materials',
  EVENTS: 'eduportal_events',
  CHAT: 'eduportal_chat',
  STUDENTS: 'eduportal_students'
};