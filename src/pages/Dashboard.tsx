import { useMemo } from 'react';
import {
  ArrowLeft,
  ClipboardCheck,
  GraduationCap,
  Plus,
  StickyNote,
  TrendingUp,
  UserRound,
  Users,
} from 'lucide-react';
import { useStore } from '../store';
import type { Page } from '../types';
import {
  ATT_META,
  ATT_ORDER,
  attendanceSummary,
  averageOf,
  fmtDate,
  fmtDateFull,
  lastSchoolDays,
  NOTE_META,
  relDate,
  todayStr,
} from '../utils';
import {
  Avatar,
  EmptyState,
  Reveal,
  useCountUp,
  useToast,
} from '../components/ui';
import { Donut, HBar, Sparkline } from '../components/Charts';

function StatCard({
  icon,
  label,
  value,
  suffix,
  foot,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  foot?: React.ReactNode;
  delay: number;
}) {
  const v = useCountUp(value);
  return (
    <Reveal delay={delay}>
      <div className="card group p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-mute">{label}</p>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-board-800 text-brass-500 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
            {icon}
          </span>
        </div>
        <p className="font-display mt-2 text-[2.6rem] leading-none text-board-900">
          {Math.round(v)}
          {suffix && <span className="text-2xl">{suffix}</span>}
        </p>
        {foot && <div className="mt-2 text-xs font-semibold text-mute">{foot}</div>}
      </div>
    </Reveal>
  );
}

export default function Dashboard({
  go,
}: {
  go: (p: Page, id?: string) => void;
}) {
  const { state, loadDemo } = useStore();
  const toast = useToast();
  const { teacherName, students, attendance, grades, notes } = state;
  const today = todayStr();

  const todayDay = attendance.find((d) => d.date === today);
  const attAll = useMemo(() => attendanceSummary(attendance), [attendance]);
  const classAvg = useMemo(() => averageOf(grades), [grades]);
  const weekNotes = useMemo(
    () =>
      notes.filter(
        (n) =>
          Date.now() - new Date(n.date + 'T12:00:00').getTime() <=
          7 * 86400000,
      ).length,
    [notes],
  );

  const subjectAvgs = useMemo(
    () =>
      ['اللغة العربية', 'الرياضيات', 'النشاط العلمي', 'التربية الإسلامية']
        .map((s) => ({ s, avg: averageOf(grades, undefined, undefined, s) }))
        .filter((x): x is { s: string; avg: number } => x.avg !== null),
    [grades],
  );

  const trend = useMemo(() => {
    const days = lastSchoolDays(14);
    return days.map((d) => {
      const day = attendance.find((x) => x.date === d);
      return day ? attendanceSummary([day]).rate : 0;
    });
  }, [attendance]);

  const needsFollowUp = useMemo(() => {
    return students
      .map((st) => {
        const a = attendanceSummary(attendance, st.id);
        const avg = averageOf(grades, st.id);
        let score = 0;
        if (a.total >= 5 && a.rate < 85) score += 2;
        if (avg !== null && avg < 10) score += 2;
        else if (avg !== null && avg < 12) score += 1;
        if (a.absent >= 3) score += 1;
        return { st, rate: a.rate, avg, total: a.total, score };
      })
      .filter((x) => x.score >= 2)
      .sort((x, y) => y.score - x.score)
      .slice(0, 4);
  }, [students, attendance, grades]);

  const latestNotes = notes.slice(0, 4);

  if (students.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-8 w-8" />}
        title="أهلاً بك في دفتر تلاميذك"
        body="سجلّك فارغ حالياً. أضيفي أول تلميذ لبدء المتابعة، أو استعيدي القسم التجريبي لاستكشاف جميع ميزات التطبيق."
      >
        <button className="btn btn-brass" onClick={() => go('students')}>
          <Plus className="h-4 w-4" />
          إضافة تلميذ
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => {
            loadDemo();
            toast('تمت استعادة البيانات التجريبية');
          }}
        >
          <GraduationCap className="h-4 w-4" />
          استعادة القسم التجريبي
        </button>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-6">
      {/* الترويسة */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-mute">{fmtDateFull(today)}</p>
          <h1 className="font-display mt-1 text-4xl leading-tight text-board-900 sm:text-5xl">
            صباح الخير، {teacherName}
          </h1>
          <p className="mt-1.5 text-sm text-mute">
            هذا ملخص يومك الدراسي — كل شيء محفوظ على جهازك أولاً بأول.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost" onClick={() => go('students')}>
            <Plus className="h-4 w-4" />
            تلميذ جديد
          </button>
          <button className="btn btn-brass" onClick={() => go('attendance')}>
            <ClipboardCheck className="h-4 w-4" />
            تسجيل حضور اليوم
          </button>
        </div>
      </header>

      {/* الإحصاءات */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          delay={0}
          icon={<Users className="h-4.5 w-4.5" />}
          label="تلاميذ القسم"
          value={students.length}
          foot={
            <>
              {students.filter((s) => s.gender === 'm').length} ذكور ·{' '}
              {students.filter((s) => s.gender === 'f').length} إناث
            </>
          }
        />
        <StatCard
          delay={70}
          icon={<ClipboardCheck className="h-4.5 w-4.5" />}
          label="حضور اليوم"
          value={todayDay ? attendanceSummary([todayDay]).rate : 0}
          suffix="٪"
          foot={
            todayDay ? (
              <span className="font-bold text-ok-600">مسجَّل ✓</span>
            ) : (
              <button
                className="font-bold text-bad-600 underline decoration-dotted underline-offset-4 transition hover:text-bad-500"
                onClick={() => go('attendance')}
              >
                لم يُسجَّل بعد — اضغطي للتسجيل
              </button>
            )
          }
        />
        <StatCard
          delay={140}
          icon={<TrendingUp className="h-4.5 w-4.5" />}
          label="المعدل العام"
          value={classAvg ?? 0}
          foot={classAvg !== null ? `${grades.length} نقطة في الدفتر` : 'لا نتائج بعد'}
        />
        <StatCard
          delay={210}
          icon={<StickyNote className="h-4.5 w-4.5" />}
          label="ملاحظات هذا الأسبوع"
          value={weekNotes}
          foot={`${notes.length} ملاحظة إجمالاً`}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* الحضور */}
        <Reveal delay={100} className="xl:col-span-2">
          <div className="card h-full p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-board-900">
                الحضور والغياب
              </h2>
              <button
                className="btn btn-ghost px-3 py-1.5 text-xs"
                onClick={() => go('attendance')}
              >
                فتح ورقة الحضور
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>
            </div>

            {attAll.total === 0 ? (
              <p className="mt-6 rounded-xl bg-paper p-4 text-sm leading-7 text-mute">
                لا توجد أيام حضور مسجلة بعد. من ورقة الحضور يمكنك تسجيل حالة
                كل تلميذ بنقرة واحدة، وسيظهر الملخص هنا فوراً.
              </p>
            ) : (
              <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row">
                <Donut
                  segments={ATT_ORDER.map((k) => ({
                    value: attAll[k],
                    color: ATT_META[k].hex,
                  }))}
                  center={
                    <>
                      <span className="font-display text-4xl leading-none text-board-900">
                        {attAll.rate}٪
                      </span>
                      <span className="text-[11px] font-bold text-mute">حضور</span>
                    </>
                  }
                />
                <ul className="flex-1 space-y-3 self-stretch">
                  {ATT_ORDER.map((k) => (
                    <li key={k}>
                      <div className="mb-1 flex items-center justify-between text-xs font-bold">
                        <span className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: ATT_META[k].hex }}
                          />
                          {ATT_META[k].label}
                        </span>
                        <span className="font-display text-base text-board-800">
                          {attAll[k]}
                        </span>
                      </div>
                      <HBar
                        value={attAll.total ? (attAll[k] / attAll.total) * 100 : 0}
                        color={ATT_META[k].hex}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 border-t border-dashed border-line pt-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-mute">
                  اتجاه الحضور — آخر 14 يوم دراسة
                </p>
                <Sparkline values={trend} width={140} />
              </div>
            </div>
          </div>
        </Reveal>

        {/* المعدل حسب المادة */}
        <Reveal delay={180}>
          <div className="card h-full p-5">
            <h2 className="font-display text-2xl text-board-900">
              المعدل حسب المادة
            </h2>
            {subjectAvgs.length === 0 ? (
              <p className="mt-4 text-sm leading-7 text-mute">
                أضيفي نتائج من دفتر النتائج لتظهر معدلات المواد هنا.
              </p>
            ) : (
              <ul className="mt-4 space-y-4">
                {subjectAvgs.map(({ s, avg }) => (
                  <li key={s}>
                    <div className="mb-1 flex items-center justify-between text-sm font-semibold">
                      <span>{s}</span>
                      <span className="font-display text-lg leading-none text-board-800">
                        {avg}
                        <span className="text-xs text-mute">/20</span>
                      </span>
                    </div>
                    <HBar
                      value={(avg / 20) * 100}
                      color={
                        avg >= 12
                          ? 'var(--color-ok-500)'
                          : avg >= 10
                            ? 'var(--color-late-500)'
                            : 'var(--color-bad-500)'
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
            <button
              className="btn btn-dark mt-5 w-full"
              onClick={() => go('grades')}
            >
              فتح دفتر النتائج
            </button>
          </div>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* بحاجة إلى متابعة */}
        <Reveal delay={120} className="xl:col-span-2">
          <div className="card h-full p-5">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-bad-100 text-bad-600">
                <UserRound className="h-4.5 w-4.5" />
              </span>
              <div>
                <h2 className="font-display text-2xl leading-none text-board-900">
                  بحاجة إلى متابعة
                </h2>
                <p className="text-xs font-semibold text-mute">
                  تلاميذ انخفض حضورهم أو معدلاتهم
                </p>
              </div>
            </div>
            {needsFollowUp.length === 0 ? (
              <p className="mt-5 rounded-xl bg-ok-100/70 p-4 text-sm font-semibold text-ok-600">
                ممتاز! لا مؤشرات قلق حالياً — جميع التلاميذ في مستوى مطمئن.
              </p>
            ) : (
              <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {needsFollowUp.map(({ st, rate, avg, total }) => (
                  <li key={st.id}>
                    <button
                      onClick={() => go('profile', st.id)}
                      className="group flex w-full items-center gap-3 rounded-xl border border-line bg-white/60 p-3 text-start transition-all duration-200 hover:-translate-y-0.5 hover:border-bad-500/40 hover:shadow-md"
                    >
                      <Avatar name={st.name} color={st.color} size={42} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold">
                          {st.name}
                        </span>
                        <span className="mt-1 flex flex-wrap gap-1">
                          {total >= 5 && rate < 90 && (
                            <span className="chip bg-bad-100 text-bad-600">
                              حضور {rate}٪
                            </span>
                          )}
                          {avg !== null && avg < 12 && (
                            <span
                              className={`chip ${
                                avg < 10
                                  ? 'bg-bad-100 text-bad-600'
                                  : 'bg-late-100 text-[#9a6210]'
                              }`}
                            >
                              معدل {avg}
                            </span>
                          )}
                        </span>
                      </span>
                      <ArrowLeft className="h-4 w-4 shrink-0 text-mute transition-all group-hover:-translate-x-1 group-hover:text-bad-600" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Reveal>

        {/* آخر الملاحظات */}
        <Reveal delay={200}>
          <div className="card h-full p-5">
            <h2 className="font-display text-2xl text-board-900">آخر الملاحظات</h2>
            {latestNotes.length === 0 ? (
              <p className="mt-4 text-sm leading-7 text-mute">
                دوّني ملاحظاتك من سجل كل تلميذ لتظهر هنا.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {latestNotes.map((n) => {
                  const st = students.find((s) => s.id === n.studentId);
                  if (!st) return null;
                  return (
                    <li key={n.id}>
                      <button
                        onClick={() => go('profile', st.id)}
                        className="w-full rounded-xl border border-line border-s-4 bg-white/60 p-3 text-start transition-all hover:bg-white hover:shadow-sm"
                        style={{ borderInlineStartColor: NOTE_META[n.category].hex }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-xs font-bold text-board-800">
                            {st.name}
                          </span>
                          <span className="shrink-0 text-[10px] font-semibold text-mute">
                            {relDate(n.date)}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink">
                          {n.text}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Reveal>
      </div>

      {/* شريط سريع: حضور آخر 5 أيام */}
      <Reveal delay={140}>
        <div className="card relative overflow-hidden bg-board-800 p-5 text-paper print:bg-white print:text-ink">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12] print:hidden"
            style={{
              backgroundImage:
                'radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '18px 18px',
            }}
          />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl">ورقة حضور اليوم</h2>
              {todayDay ? (
                <p className="mt-1 text-sm text-board-100">
                  سُجِّل {Object.keys(todayDay.map).length} من {students.length} —
                  نسبة الحضور{' '}
                  <b className="font-display text-lg text-brass-500">
                    {attendanceSummary([todayDay]).rate}٪
                  </b>
                </p>
              ) : (
                <p className="mt-1 text-sm leading-7 text-board-100 print:text-mute">
                  لم يُسجَّل حضور اليوم بعد
                </p>
              )}
            </div>
            <button className="btn btn-brass" onClick={() => go('attendance')}>
              <ClipboardCheck className="h-4 w-4" />
              {todayDay ? 'مراجعة الورقة' : 'ابدئي التسجيل'}
            </button>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
