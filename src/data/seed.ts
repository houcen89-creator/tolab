import type {
  AppState,
  AttendanceDay,
  GradeEntry,
  NoteCategory,
  NoteEntry,
  Student,
} from '../types';
import {
  addDays,
  AVATAR_COLORS,
  clamp,
  lastSchoolDays,
  todayStr,
  uid,
} from '../utils';

interface SeedRow {
  name: string;
  gender: 'm' | 'f';
  level: string;
  birthDate: string;
  guardianName: string;
  phone: string;
  address: string;
  ability: number;
  attendanceBias: number;
}

const ROWS: SeedRow[] = [
  { name: 'آدم بناني', gender: 'm', level: 'المستوى الرابع', birthDate: '2016-03-14', guardianName: 'كريم بناني', phone: '0661234501', address: 'حي الرياض، فاس', ability: 0.9, attendanceBias: 1 },
  { name: 'سلمى العلوي', gender: 'f', level: 'المستوى الرابع', birthDate: '2016-07-02', guardianName: 'حسن العلوي', phone: '0661234502', address: 'حي المسيرة، فاس', ability: 0.85, attendanceBias: 1 },
  { name: 'يوسف التازي', gender: 'm', level: 'المستوى الرابع', birthDate: '2016-01-25', guardianName: 'محمد التازي', phone: '0661234503', address: 'دوار العين، صفرو', ability: 0.55, attendanceBias: 0.66 },
  { name: 'مريم الإدريسي', gender: 'f', level: 'المستوى الرابع', birthDate: '2016-09-11', guardianName: 'سعيد الإدريسي', phone: '0661234504', address: 'حي الأطلس، فاس', ability: 0.8, attendanceBias: 1 },
  { name: 'عمر الفاسي', gender: 'm', level: 'المستوى الخامس', birthDate: '2015-12-05', guardianName: 'عبد الله الفاسي', phone: '0661234505', address: 'شارع الحسن الثاني، فاس', ability: 0.75, attendanceBias: 1 },
  { name: 'خديجة العمراني', gender: 'f', level: 'المستوى الرابع', birthDate: '2016-04-19', guardianName: 'رشيد العمراني', phone: '0661234506', address: 'حي النهضة، فاس', ability: 0.7, attendanceBias: 1 },
  { name: 'أمين السباعي', gender: 'm', level: 'المستوى الرابع', birthDate: '2016-06-30', guardianName: 'نور الدين السباعي', phone: '0661234507', address: 'حي باب بوجلود، فاس', ability: 0.6, attendanceBias: 1 },
  { name: 'نورة الحسني', gender: 'f', level: 'المستوى الرابع', birthDate: '2016-02-08', guardianName: 'جمال الحسني', phone: '0661234508', address: 'حي عوينات الحجاج، فاس', ability: 0.88, attendanceBias: 1 },
  { name: 'ريان المهدي', gender: 'f', level: 'المستوى الرابع', birthDate: '2016-08-23', guardianName: 'مصطفى المهدي', phone: '0661234509', address: 'تجزئة الياسمين، فاس', ability: 0.48, attendanceBias: 1 },
  { name: 'حسن البقالي', gender: 'm', level: 'المستوى الرابع', birthDate: '2015-11-17', guardianName: 'إبراهيم البقالي', phone: '0661234510', address: 'حي المرجة، فاس', ability: 0.65, attendanceBias: 1 },
];

const SUBJECTS_6 = [
  'اللغة العربية',
  'الرياضيات',
  'النشاط العلمي',
  'التربية الإسلامية',
  'الاجتماعيات',
  'اللغة الفرنسية',
];

const NOTE_POOL: Record<NoteCategory, string[]> = {
  academic: [
    'يحتاج إلى دعم إضافي في جدول الضرب والقسمة.',
    'تحسّن ملحوظ في القراءة الجهرية هذا الشهر.',
    'يُخطئ في تمييز الهمزات أثناء الإملاء.',
    'يستوعب الدروس العلمية بسرعة ويحب التجارب العملية.',
    'يُنجز التمارين بسرعة لكن دون انتباه للتفاصيل.',
  ],
  behavior: [
    'يُكثر من الحديث مع جاره أثناء الشرح.',
    'أظهر تعاوناً رائعاً في العمل الجماعي اليوم.',
    'يحتاج إلى تذكير متكرر باحترام أدوار الكلام.',
    'سلوك مهذب مع الجميع وقدوة حسنة لزملائه.',
  ],
  health: [
    'يعاني من ضعف في النظر — يُفضَّل إجلاسه في الصف الأمامي.',
    'غادر مبكراً اليوم بسبب وعكة صحية خفيفة.',
  ],
  general: [
    'نسي أدواته المدرسية مرتين هذا الأسبوع.',
    'تم التواصل مع ولي الأمر بخصوص الواجبات المنزلية.',
    'شارك بإلقاء نشيد في الإذاعة المدرسية صباح اليوم.',
  ],
};

const randBetween = (from: string, to: string): string => {
  const a = new Date(from + 'T12:00:00').getTime();
  const b = new Date(to + 'T12:00:00').getTime();
  return todayStr(new Date(a + Math.random() * (b - a)));
};

export function buildSeedState(): AppState {
  const students: Student[] = ROWS.map((r, i) => ({
    id: uid(),
    name: r.name,
    gender: r.gender,
    level: r.level,
    birthDate: r.birthDate,
    guardianName: r.guardianName,
    phone: r.phone,
    address: r.address,
    joinedAt: '2025-09-08',
    color: AVATAR_COLORS[i % AVATAR_COLORS.length],
  }));

  /* --- الحضور: آخر 26 يوم دراسة --- */
  const days = lastSchoolDays(26);
  const attendance: AttendanceDay[] = days.map((date) => {
    const map: Record<string, 'present' | 'late' | 'excused' | 'absent'> = {};
    for (let i = 0; i < students.length; i++) {
      const bias = ROWS[i].attendanceBias;
      const r = Math.random();
      const pPresent = 0.88 * bias;
      const pLate = pPresent + 0.05 * bias;
      const pExc = pLate + 0.03;
      let s: 'present' | 'late' | 'excused' | 'absent' = 'absent';
      if (r < pPresent) s = 'present';
      else if (r < pLate) s = 'late';
      else if (r < pExc) s = 'excused';
      map[students[i].id] = s;
    }
    return { date, map };
  });
  attendance.sort((a, b) => b.date.localeCompare(a.date));

  /* --- النتائج --- */
  const grades: GradeEntry[] = [];
  students.forEach((st, i) => {
    const ability = ROWS[i].ability;
    const score = (max: number) =>
      clamp(Math.round(max * ability * (0.85 + Math.random() * 0.28) * 2) / 2, Math.round(max * 0.2 * 2) / 2, max);

    for (const subject of SUBJECTS_6) {
      grades.push({
        id: uid(),
        studentId: st.id,
        subject,
        term: 'الدورة الأولى',
        type: 'فرض كتابي',
        maxScore: 20,
        score: score(20),
        date: randBetween('2025-11-10', '2026-01-15'),
      });
      grades.push({
        id: uid(),
        studentId: st.id,
        subject,
        term: 'الدورة الأولى',
        type: 'مشاركة صفية',
        maxScore: 10,
        score: score(10),
        date: randBetween('2025-10-01', '2026-01-20'),
      });
    }
    /* فروض الدورة الثانية لثلاث مواد فقط (ما زالت جارية) */
    for (const subject of SUBJECTS_6.slice(0, 3)) {
      grades.push({
        id: uid(),
        studentId: st.id,
        subject,
        term: 'الدورة الثانية',
        type: 'فرض كتابي',
        maxScore: 20,
        score: score(20),
        date: randBetween('2026-02-10', todayStr()),
      });
    }
  });
  grades.sort((a, b) => b.date.localeCompare(a.date));

  /* --- الملاحظات --- */
  const notes: NoteEntry[] = [];
  const cats = Object.keys(NOTE_POOL) as NoteCategory[];
  students.forEach((st) => {
    const count = 1 + Math.floor(Math.random() * 3);
    for (let k = 0; k < count; k++) {
      const category = cats[Math.floor(Math.random() * cats.length)];
      const pool = NOTE_POOL[category];
      notes.push({
        id: uid(),
        studentId: st.id,
        category,
        text: pool[Math.floor(Math.random() * pool.length)],
        date: addDays(todayStr(), -Math.floor(Math.random() * 45)),
      });
    }
  });
  notes.sort((a, b) => b.date.localeCompare(a.date));

  return {
    teacherName: 'الأستاذة نادية',
    students,
    attendance,
    grades,
    notes,
  };
}
