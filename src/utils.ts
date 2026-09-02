import type {
  AttendanceDay,
  AttendanceStatus,
  GradeEntry,
  NoteCategory,
} from './types';

export const uid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

export const todayStr = (d: Date = new Date()): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const addDays = (iso: string, n: number): string => {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return todayStr(d);
};

export const fmtDate = (iso: string): string =>
  new Date(iso + 'T12:00:00').toLocaleDateString('ar', {
    day: 'numeric',
    month: 'long',
  });

export const fmtDateFull = (iso: string): string =>
  new Date(iso + 'T12:00:00').toLocaleDateString('ar', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export const relDate = (iso: string): string => {
  const diff = Math.round(
    (Date.now() - new Date(iso + 'T12:00:00').getTime()) / 86400000,
  );
  if (diff <= 0) return 'اليوم';
  if (diff === 1) return 'أمس';
  if (diff === 2) return 'منذ يومين';
  if (diff < 11) return `منذ ${diff} أيام`;
  return fmtDate(iso);
};

/** آخر n يوم دراسة (تُستبعد أيام الأحد)، بترتيب تصاعدي */
export const lastSchoolDays = (n: number): string[] => {
  const out: string[] = [];
  const d = new Date();
  while (out.length < n) {
    if (d.getDay() !== 0) out.push(todayStr(d));
    d.setDate(d.getDate() - 1);
  }
  return out.reverse();
};

export const ageOf = (birth: string): number => {
  const b = new Date(birth + 'T12:00:00');
  const now = new Date();
  let a = now.getFullYear() - b.getFullYear();
  if (
    now.getMonth() < b.getMonth() ||
    (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())
  )
    a--;
  return a;
};

export const clamp = (v: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, v));

/* ---------- ثوابت مدرسية ---------- */

export const SUBJECTS = [
  'اللغة العربية',
  'الرياضيات',
  'النشاط العلمي',
  'التربية الإسلامية',
  'الاجتماعيات',
  'اللغة الفرنسية',
  'التربية التشكيلية',
  'التربية البدنية',
];

export const TERMS = ['الدورة الأولى', 'الدورة الثانية'];

export const EXAM_TYPES = [
  'فرض كتابي',
  'مشاركة صفية',
  'واجب منزلي',
  'مراقبة مستمرة',
];

export const LEVELS = [
  'المستوى الأول',
  'المستوى الثاني',
  'المستوى الثالث',
  'المستوى الرابع',
  'المستوى الخامس',
  'المستوى السادس',
];

export const AVATAR_COLORS = [
  '#2f7d52',
  '#4e6e9e',
  '#db8a1f',
  '#8a4f7d',
  '#3e7c8a',
  '#c24a3f',
  '#6b7f3a',
  '#57629b',
];

export const ATT_META: Record<
  AttendanceStatus,
  { label: string; short: string; hex: string; chip: string; solid: string }
> = {
  present: {
    label: 'حاضر',
    short: 'ح',
    hex: '#2f7d52',
    chip: 'bg-ok-100 text-ok-600',
    solid: 'bg-ok-500',
  },
  late: {
    label: 'متأخر',
    short: 'م',
    hex: '#db8a1f',
    chip: 'bg-late-100 text-[#9a6210]',
    solid: 'bg-late-500',
  },
  excused: {
    label: 'غياب بعذر',
    short: 'ع',
    hex: '#4e6e9e',
    chip: 'bg-exc-100 text-exc-500',
    solid: 'bg-exc-500',
  },
  absent: {
    label: 'غائب',
    short: 'غ',
    hex: '#c24a3f',
    chip: 'bg-bad-100 text-bad-600',
    solid: 'bg-bad-500',
  },
};

export const ATT_ORDER: AttendanceStatus[] = [
  'present',
  'late',
  'excused',
  'absent',
];

export const NOTE_META: Record<
  NoteCategory,
  { label: string; hex: string; chip: string; border: string }
> = {
  academic: {
    label: 'أكاديمية',
    hex: '#2f7d52',
    chip: 'bg-ok-100 text-ok-600',
    border: 'border-ok-500',
  },
  behavior: {
    label: 'سلوكية',
    hex: '#db8a1f',
    chip: 'bg-late-100 text-[#9a6210]',
    border: 'border-late-500',
  },
  health: {
    label: 'صحية',
    hex: '#4e6e9e',
    chip: 'bg-exc-100 text-exc-500',
    border: 'border-exc-500',
  },
  general: {
    label: 'عامة',
    hex: '#64756a',
    chip: 'bg-line/70 text-mute',
    border: 'border-mute',
  },
};

/* ---------- حسابات ---------- */

export interface AttSummary {
  present: number;
  late: number;
  excused: number;
  absent: number;
  total: number;
  rate: number;
}

export function attendanceSummary(
  days: AttendanceDay[],
  studentId?: string,
): AttSummary {
  const c: AttSummary = {
    present: 0,
    late: 0,
    excused: 0,
    absent: 0,
    total: 0,
    rate: 0,
  };
  for (const day of days) {
    if (studentId) {
      const s = day.map[studentId];
      if (s) {
        c[s]++;
        c.total++;
      }
    } else {
      for (const s of Object.values(day.map)) {
        c[s]++;
        c.total++;
      }
    }
  }
  c.rate = c.total
    ? Math.round(((c.present + c.late) / c.total) * 100)
    : 0;
  return c;
}

/** المعدل على 20 نقطة */
export function averageOf(
  grades: GradeEntry[],
  studentId?: string,
  term?: string,
  subject?: string,
): number | null {
  let g = grades;
  if (studentId) g = g.filter((x) => x.studentId === studentId);
  if (term) g = g.filter((x) => x.term === term);
  if (subject) g = g.filter((x) => x.subject === subject);
  if (!g.length) return null;
  const s = g.reduce((a, x) => a + (x.score / x.maxScore) * 20, 0);
  return Math.round((s / g.length) * 10) / 10;
}

export const initials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0] ?? '')
    .join('');
};
