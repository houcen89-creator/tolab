import { useMemo, useState } from 'react';
import {
  BookOpen,
  ChevronLeft,
  Plus,
  Search,
  Trash2,
  Trophy,
} from 'lucide-react';
import { useStore } from '../store';
import type { Page } from '../types';
import {
  averageOf,
  fmtDate,
  SUBJECTS,
  TERMS,
} from '../utils';
import { Avatar, Confirm, EmptyState, Reveal, useToast } from '../components/ui';
import GradeForm from '../components/GradeForm';

export default function Grades({ go }: { go: (p: Page, id?: string) => void }) {
  const { state, deleteGrade } = useStore();
  const toast = useToast();
  const { students, grades } = state;

  const [q, setQ] = useState('');
  const [subject, setSubject] = useState('all');
  const [term, setTerm] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      grades
        .filter((g) => (subject === 'all' ? true : g.subject === subject))
        .filter((g) => (term === 'all' ? true : g.term === term))
        .filter((g) => {
          const st = students.find((s) => s.id === g.studentId);
          return q.trim() === '' || (st ? st.name.includes(q.trim()) : false);
        }),
    [grades, students, q, subject, term],
  );

  const toppers = useMemo(() => {
    const g = grades.filter((x) => (term === 'all' ? true : x.term === term));
    return students
      .map((s) => ({
        s,
        avg: averageOf(g.filter((x) => x.studentId === s.id)),
      }))
      .filter((x): x is { s: (typeof students)[number]; avg: number } => x.avg !== null)
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 5);
  }, [students, grades, term]);

  const studentName = (id: string) => students.find((s) => s.id === id)?.name ?? '—';
  const studentOf = (id: string) => students.find((s) => s.id === id);

  if (students.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen className="h-8 w-8" />}
        title="دفتر النتائج فارغ"
        body="أضيفي التلاميذ أولاً، ثم سجّلي نقاط الفروض والمشاركة لتظهر هنا مع المعدلات والترتيب."
      >
        <button className="btn btn-brass" onClick={() => go('students')}>
          الذهاب إلى التلاميذ
        </button>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl leading-tight text-board-900 sm:text-5xl">
            دفتر النتائج
          </h1>
          <p className="mt-1 text-sm text-mute">
            {grades.length} نقطة مسجلة · المعدلات على 20 نقطة
          </p>
        </div>
        <button className="btn btn-brass" onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          إضافة نتيجة
        </button>
      </header>

      {/* الفلاتر */}
      <div className="card flex flex-wrap items-center gap-3 p-3.5">
        <div className="relative min-w-52 flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
          <input
            className="field ps-9"
            placeholder="ابحثي باسم التلميذ…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select className="field w-auto" value={subject} onChange={(e) => setSubject(e.target.value)}>
          <option value="all">كل المواد</option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select className="field w-auto" value={term} onChange={(e) => setTerm(e.target.value)}>
          <option value="all">كل الدورات</option>
          {TERMS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* الجدول */}
        <Reveal className="xl:col-span-2">
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-125 text-sm">
                <thead>
                  <tr className="border-b border-line bg-paper text-[11px] font-bold text-mute">
                    <th className="px-4 py-3 text-start">التلميذ</th>
                    <th className="px-3 py-3 text-start">المادة</th>
                    <th className="px-3 py-3 text-start">التقييم</th>
                    <th className="px-3 py-3 text-start">الدورة</th>
                    <th className="px-3 py-3 text-start">النقطة</th>
                    <th className="px-3 py-3 text-start">التاريخ</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/70">
                  {filtered.slice(0, 40).map((g) => {
                    const st = studentOf(g.studentId);
                    const p = Math.round((g.score / g.maxScore) * 100);
                    const good = p >= 50;
                    return (
                      <tr key={g.id} className="group transition hover:bg-brass-100/30">
                        <td className="px-4 py-2.5">
                          <button
                            className="flex items-center gap-2.5 text-start"
                            onClick={() => go('profile', g.studentId)}
                          >
                            {st && <Avatar name={st.name} color={st.color} size={32} />}
                            <span className="font-bold text-ink underline-offset-4 group-hover:underline">
                              {studentName(g.studentId)}
                            </span>
                          </button>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="chip bg-board-100/80 text-board-700">{g.subject}</span>
                        </td>
                        <td className="px-3 py-2.5 text-xs font-semibold text-mute">{g.type}</td>
                        <td className="px-3 py-2.5 text-xs font-semibold text-mute">{g.term}</td>
                        <td className="px-3 py-2.5">
                          <span className="font-display text-lg leading-none text-board-800">
                            {g.score}
                          </span>
                          <span className="text-[11px] text-mute">/{g.maxScore}</span>
                          <span className={`chip ms-2 ${good ? 'bg-ok-100 text-ok-600' : 'bg-bad-100 text-bad-600'}`}>
                            {p}٪
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-xs font-semibold text-mute">{fmtDate(g.date)}</td>
                        <td className="px-2 py-2.5">
                          <button
                            className="grid h-8 w-8 place-items-center rounded-lg text-mute opacity-0 transition hover:bg-bad-100 hover:text-bad-600 group-hover:opacity-100"
                            onClick={() => setToDelete(g.id)}
                            aria-label="حذف النقطة"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center">
                        <BookOpen className="mx-auto h-7 w-7 text-mute" />
                        <p className="mt-2 text-sm font-semibold text-mute">
                          لا نتائج مطابقة للفلاتر الحالية
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {filtered.length > 40 && (
              <p className="border-t border-line bg-paper px-4 py-2 text-center text-xs font-semibold text-mute">
                يعرض الجدول أحدث 40 نقطة من أصل {filtered.length}
              </p>
            )}
          </div>
        </Reveal>

        {/* الترتيب */}
        <Reveal delay={120}>
          <div className="card p-5">
            <h2 className="font-display flex items-center gap-2 text-2xl text-board-900">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brass-100 text-brass-600">
                <Trophy className="h-4.5 w-4.5" />
              </span>
              أوائل القسم
            </h2>
            <p className="text-xs font-semibold text-mute">
              {term === 'all' ? 'حسب المعدل العام' : `حسب معدل ${term}`}
            </p>
            {toppers.length === 0 ? (
              <p className="mt-4 text-sm text-mute">لا نتائج بعد لحساب الترتيب.</p>
            ) : (
              <ol className="mt-4 space-y-2">
                {toppers.map(({ s, avg }, i) => (
                  <li key={s.id}>
                    <button
                      onClick={() => go('profile', s.id)}
                      className="group flex w-full items-center gap-3 rounded-xl border border-line bg-white/60 p-2.5 text-start transition-all hover:-translate-y-0.5 hover:border-brass-500/50 hover:shadow-md"
                    >
                      <span
                        className={`font-display grid h-8 w-8 shrink-0 place-items-center rounded-full text-base leading-none ${
                          i === 0
                            ? 'bg-brass-500 text-board-950'
                            : i === 1
                              ? 'bg-board-100 text-board-800'
                              : i === 2
                                ? 'bg-late-100 text-[#9a6210]'
                                : 'bg-paper text-mute'
                        }`}
                      >
                        {i + 1}
                      </span>
                      <Avatar name={s.name} color={s.color} size={36} />
                      <span className="min-w-0 flex-1 truncate text-sm font-bold text-ink">
                        {s.name}
                      </span>
                      <span className="font-display text-xl leading-none text-board-800">
                        {avg}
                        <span className="text-[10px] text-mute">/20</span>
                      </span>
                      <ChevronLeft className="h-4 w-4 text-mute transition-all group-hover:-translate-x-1 group-hover:text-brass-600" />
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </Reveal>
      </div>

      <GradeForm open={formOpen} onClose={() => setFormOpen(false)} />
      <Confirm
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) {
            deleteGrade(toDelete);
            toast('حُذفت النقطة من الدفتر');
          }
        }}
        title="حذف نقطة"
        body="سيتم حذف هذه النقطة نهائياً وسيُعاد حساب المعدلات. هل أنت متأكدة؟"
      />
    </div>
  );
}
