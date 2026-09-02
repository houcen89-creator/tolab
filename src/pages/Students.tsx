import { useMemo, useState } from 'react';
import {
  ChevronLeft,
  RotateCcw,
  Search,
  StickyNote,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';
import { useStore } from '../store';
import type { Gender, Page, Student } from '../types';
import { attendanceSummary, averageOf, LEVELS } from '../utils';
import { Avatar, EmptyState, Reveal, useToast } from '../components/ui';
import { HBar } from '../components/Charts';
import StudentForm from '../components/StudentForm';

export default function Students({
  go,
}: {
  go: (p: Page, id?: string) => void;
}) {
  const { state, loadDemo } = useStore();
  const toast = useToast();
  const { students, attendance, grades, notes } = state;

  const [q, setQ] = useState('');
  const [gender, setGender] = useState<'all' | Gender>('all');
  const [level, setLevel] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Student | undefined>(undefined);

  const filtered = useMemo(
    () =>
      students
        .filter((s) => (gender === 'all' ? true : s.gender === gender))
        .filter((s) => (level === 'all' ? true : s.level === level))
        .filter((s) => s.name.includes(q.trim()))
        .sort((a, b) => a.name.localeCompare(b.name, 'ar')),
    [students, q, gender, level],
  );

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl leading-tight text-board-900 sm:text-5xl">
            التلاميذ
          </h1>
          <p className="mt-1 text-sm text-mute">
            <span className="font-bold text-board-600">{filtered.length}</span>{' '}
            من أصل {students.length} تلميذاً مسجلاً
          </p>
        </div>
        <button
          className="btn btn-brass"
          onClick={() => {
            setEditing(undefined);
            setFormOpen(true);
          }}
        >
          <UserPlus className="h-4 w-4" />
          إضافة تلميذ
        </button>
      </header>

      {students.length === 0 ? (
        <EmptyState
          icon={<Users className="h-8 w-8" />}
          title="لا يوجد تلاميذ بعد"
          body="ابدئي بإضافة تلاميذ قسمك واحداً تلو الآخر، أو استعيدي القسم التجريبي لتجربة التطبيق بجميع ميزاته."
        >
          <button
            className="btn btn-brass"
            onClick={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
          >
            <UserPlus className="h-4 w-4" />
            إضافة أول تلميذ
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => {
              loadDemo();
              toast('تمت استعادة البيانات التجريبية');
            }}
          >
            <RotateCcw className="h-4 w-4" />
            استعادة القسم التجريبي
          </button>
        </EmptyState>
      ) : (
        <>
          {/* شريط الأدوات */}
          <div className="card flex flex-wrap items-center gap-3 p-3.5">
            <div className="relative min-w-52 flex-1">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
              <input
                className="field ps-9"
                placeholder="ابحثي عن تلميذ بالاسم…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <div className="flex rounded-xl border border-line bg-white p-1">
              {(
                [
                  ['all', 'الكل'],
                  ['m', 'ذكور'],
                  ['f', 'إناث'],
                ] as ['all' | Gender, string][]
              ).map(([g, label]) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                    gender === g
                      ? 'bg-board-800 text-paper shadow-sm'
                      : 'text-mute hover:text-ink'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <select
              className="field w-auto"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              <option value="all">كل المستويات</option>
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          {/* الشبكة */}
          {filtered.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="font-display text-2xl text-ink">لا نتائج مطابقة</p>
              <p className="mt-1 text-sm text-mute">
                جرّبي تغيير كلمة البحث أو الفلاتر
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((s, i) => {
                const att = attendanceSummary(attendance, s.id);
                const avg = averageOf(grades, s.id);
                const notesCount = notes.filter(
                  (n) => n.studentId === s.id,
                ).length;
                const attColor =
                  att.rate >= 90
                    ? 'var(--color-ok-500)'
                    : att.rate >= 75
                      ? 'var(--color-late-500)'
                      : 'var(--color-bad-500)';
                return (
                  <Reveal key={s.id} delay={Math.min(i, 8) * 50}>
                    <button
                      onClick={() => go('profile', s.id)}
                      className="card group block w-full p-5 text-start transition-all duration-300 hover:-translate-y-1.5 hover:border-brass-500/60 hover:shadow-xl"
                    >
                      <div className="flex items-center gap-3.5">
                        <Avatar
                          name={s.name}
                          color={s.color}
                          size={52}
                          className="transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-bold text-ink">
                            {s.name}
                          </h3>
                          <div className="mt-1 flex flex-wrap gap-1">
                            <span className="chip bg-board-100/80 text-board-700">
                              {s.level}
                            </span>
                            <span className="chip bg-paper text-mute">
                              {s.gender === 'm' ? 'ذكر' : 'أنثى'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-3.5">
                        <div>
                          <p className="text-[10px] font-bold text-mute">
                            الحضور
                          </p>
                          <p
                            className="font-display mt-0.5 text-xl leading-none"
                            style={{ color: att.total ? attColor : 'var(--color-mute)' }}
                          >
                            {att.total ? `${att.rate}٪` : '—'}
                          </p>
                          <div className="mt-1.5">
                            <HBar
                              value={att.total ? att.rate : 0}
                              color={attColor}
                            />
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-mute">
                            المعدل
                          </p>
                          <p className="font-display mt-0.5 flex items-center gap-1 text-xl leading-none text-board-800">
                            <TrendingUp className="h-3.5 w-3.5 text-mute" />
                            {avg !== null ? avg : '—'}
                            {avg !== null && (
                              <span className="text-[10px] text-mute">/20</span>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-mute">
                            ملاحظات
                          </p>
                          <p className="font-display mt-0.5 flex items-center gap-1 text-xl leading-none text-board-800">
                            <StickyNote className="h-3.5 w-3.5 text-mute" />
                            {notesCount}
                          </p>
                        </div>
                      </div>

                      <span className="mt-4 flex items-center justify-center gap-1 rounded-xl bg-paper py-2 text-xs font-bold text-board-700 transition-all group-hover:bg-board-800 group-hover:text-brass-500">
                        فتح السجل الكامل
                        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                      </span>
                    </button>
                  </Reveal>
                );
              })}
            </div>
          )}
        </>
      )}

      <StudentForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initial={editing}
      />
    </div>
  );
}
