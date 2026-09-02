export type Gender = 'm' | 'f';

export type AttendanceStatus = 'present' | 'late' | 'excused' | 'absent';

export type NoteCategory = 'academic' | 'behavior' | 'health' | 'general';

export interface Student {
  id: string;
  name: string;
  gender: Gender;
  level: string;
  birthDate: string;
  guardianName: string;
  phone: string;
  address: string;
  joinedAt: string;
  color: string;
}

export interface AttendanceDay {
  date: string;
  map: Record<string, AttendanceStatus>;
}

export interface GradeEntry {
  id: string;
  studentId: string;
  subject: string;
  term: string;
  type: string;
  maxScore: number;
  score: number;
  date: string;
}

export interface NoteEntry {
  id: string;
  studentId: string;
  category: NoteCategory;
  text: string;
  date: string;
}

export interface AppState {
  teacherName: string;
  students: Student[];
  attendance: AttendanceDay[];
  grades: GradeEntry[];
  notes: NoteEntry[];
}

export type Page =
  | 'dashboard'
  | 'students'
  | 'profile'
  | 'attendance'
  | 'grades'
  | 'settings';
