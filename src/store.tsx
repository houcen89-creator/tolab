import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type {
  AppState,
  AttendanceStatus,
  GradeEntry,
  NoteEntry,
  Student,
} from './types';
import { buildSeedState } from './data/seed';
import { uid } from './utils';

const LS_KEY = 'talameethi:v1';

function loadInitial(): AppState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const p = JSON.parse(raw) as AppState;
      if (p && Array.isArray(p.students)) return p;
    }
  } catch {
    /* تجاهل التلف وأعد البذور */
  }
  return buildSeedState();
}

interface StoreApi {
  state: AppState;
  setTeacherName: (name: string) => void;
  saveStudent: (s: Student) => void;
  deleteStudent: (id: string) => void;
  saveAttendanceDay: (
    date: string,
    map: Record<string, AttendanceStatus>,
  ) => void;
  clearAttendanceDay: (date: string) => void;
  addGrade: (g: Omit<GradeEntry, 'id'>) => void;
  deleteGrade: (id: string) => void;
  addNote: (n: Omit<NoteEntry, 'id'>) => void;
  deleteNote: (id: string) => void;
  loadDemo: () => void;
  importJson: (raw: string) => boolean;
  eraseAll: () => void;
}

const Ctx = createContext<StoreApi | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch {
      /* مساحة التخزين ممتلئة */
    }
  }, [state]);

  const api = useMemo<StoreApi>(
    () => ({
      state,
      setTeacherName: (name) => setState((s) => ({ ...s, teacherName: name })),
      saveStudent: (stu) =>
        setState((s) => {
          const exists = s.students.some((x) => x.id === stu.id);
          return {
            ...s,
            students: exists
              ? s.students.map((x) => (x.id === stu.id ? stu : x))
              : [...s.students, stu],
          };
        }),
      deleteStudent: (id) =>
        setState((s) => ({
          ...s,
          students: s.students.filter((x) => x.id !== id),
          attendance: s.attendance
            .map((d) => {
              if (!d.map[id]) return d;
              const map = { ...d.map };
              delete map[id];
              return { ...d, map };
            })
            .filter((d) => Object.keys(d.map).length > 0),
          grades: s.grades.filter((g) => g.studentId !== id),
          notes: s.notes.filter((n) => n.studentId !== id),
        })),
      saveAttendanceDay: (date, map) =>
        setState((s) => {
          const others = s.attendance.filter((d) => d.date !== date);
          return {
            ...s,
            attendance: [{ date, map }, ...others].sort((a, b) =>
              b.date.localeCompare(a.date),
            ),
          };
        }),
      clearAttendanceDay: (date) =>
        setState((s) => ({
          ...s,
          attendance: s.attendance.filter((d) => d.date !== date),
        })),
      addGrade: (g) =>
        setState((s) => ({
          ...s,
          grades: [{ id: uid(), ...g }, ...s.grades].sort((a, b) =>
            b.date.localeCompare(a.date),
          ),
        })),
      deleteGrade: (id) =>
        setState((s) => ({
          ...s,
          grades: s.grades.filter((g) => g.id !== id),
        })),
      addNote: (n) =>
        setState((s) => ({
          ...s,
          notes: [{ id: uid(), ...n }, ...s.notes].sort((a, b) =>
            b.date.localeCompare(a.date),
          ),
        })),
      deleteNote: (id) =>
        setState((s) => ({
          ...s,
          notes: s.notes.filter((n) => n.id !== id),
        })),
      loadDemo: () => setState(buildSeedState()),
      importJson: (raw) => {
        try {
          const p = JSON.parse(raw) as AppState;
          if (!p || !Array.isArray(p.students)) return false;
          setState({
            teacherName: typeof p.teacherName === 'string' ? p.teacherName : 'الأستاذة',
            students: p.students,
            attendance: Array.isArray(p.attendance) ? p.attendance : [],
            grades: Array.isArray(p.grades) ? p.grades : [],
            notes: Array.isArray(p.notes) ? p.notes : [],
          });
          return true;
        } catch {
          return false;
        }
      },
      eraseAll: () =>
        setState({
          teacherName: state.teacherName,
          students: [],
          attendance: [],
          grades: [],
          notes: [],
        }),
    }),
    [state],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useStore(): StoreApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore must be used within StoreProvider');
  return v;
}
