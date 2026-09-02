import { useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCheck,
  ClipboardCheck,
  Eraser,
  Users,
} from 'lucide-react';
import { useStore } from '../store';
import type { AttendanceStatus, Page } from '../types';
import {
  ATT_META,
  ATT_ORDER,
  attendanceSummary,
  fmtDate,
  todayStr,
} from '../utils';
import { Avatar, EmptyState, useToast } from '../components/ui';
import { HBar } from '../components/Charts';

export default function Attendance({ go }: { go: (p: Page) => void }) {
  const { state, saveAttendanceDay, clearAttendanceDay } = useStore();
  const toast = useToast();
  const { students, attendance } = state;
  const [date, setDate] = useState(todayStr());

  const day = attendance.find((d) => d.date === date);
  const map = useMemo(() => day?.map ?? {}, [day]);

  const counts = useMemo(() => {
    const c: Record<AttendanceStatus, number> = {
      present: 0,
      late: 0,
      excused: 0,
      absent: 0,
    };
    for (const s of Object.values(map)) c[s]++;
    return c;
  }, [map]);

  const marked = Object.keys(map).length;
  const rate = attendanceSummary(day ? [day] : []).rate;

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    const next = { ...map };
    if (next[studentId] === status) delete next[studentId];
    else next[studentId] = status;
    if (Object.keys(next).length === 0) clearAttendanceDay(date);
    else saveAttendanceDay(date, next);
  };

  const allPresent = () => {
    if (!students.length) return;
    const next: Record<string, AttendanceStatus> = {};
    for (const s of students) next[s.id] = 'present';
    saveAttendanceDay(date, next);
    toast('سُجّل الجميع حاضرين — عدّلي الحالات الخاصة');
  };

  const clearDay = () => {
    clearAttendanceDay(date);
    toast('مُسحت ورقة هذا اليوم');
  };

  if (students.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-8 w-8" />}
        title="لا تلاميذ لتسجيل حضورهم"
        body="أضيفي التلاميذ أولاً من صفحة «التلاميذ» ثم عودي لتسجيل الحضور اليومي."
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
            ورقة الحضور
          </h1>
          <p className="mt-1 text-sm text-mute">
            اختاري اليوم، اضغطي على حالة كل تلميذ —
            <span className="font-bold text-ok-600"> الحفظ تلقائي وفوري</span>
          </p>
        </div>
        <span className="chip bg-ok-100 py-1.5 text-ok-600">
          <CheckCheck className="h-3.5 w-3.5" />
          {marked} من {students.length} مسجَّل
        </span>
      </header>

      {/* شريط التحكم */}
      <div className="card flex flex-wrap items-center gap-3 p-3.5">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-board-600" />
          <input
            type="date"
            className="field w-auto"
            value={date}
            max={todayStr()}
            onChange={(e) => e.target.value && setDate(e.target.value)}
          />
        </div>
        <button className="btn btn-dark" onClick={allPresent}>
          <CheckCheck className="h-4 w-4" />
          الكل حاضر
        </button>
        <button
          className="btn btn-danger"
          onClick={clearDay}
          disabled={!day}
        >
          <Eraser className="h-4 w-4" />
          مسح اليوم
        </button>
        <div className="ms-auto flex flex-wrap gap-1.5">
          {ATT_ORDER.map((k) => (
            <span key={k} className={`chip ${ATT_META[k].chip}`}>
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: ATT_META[k].hex }} />
              {ATT_META[k].label}: <b className="font-display text-sm leading-none">{counts[k]}</b>
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        {/* قائمة التلاميذ */}
        <div className="card overflow-hidden lg:col-span-3">
          <ul className="divide-y divide-line/70">
            {students.map((s) => {
              const st = map[s.id];
              return (
                <li
                  key={s.id}
                  className={`flex flex-wrap items-center gap-3 px-4 py-3 transition-colors sm:flex-nowrap ${
                    st === 'absent'
                      ? 'bg-bad-100/40'
                      : st === 'late'
                        ? 'bg-late-100/40'
                        : st === 'excused'
                          ? 'bg-exc-100/30'
                          : ''
                  }`}
                >
                  <Avatar name={s.name} color={s.color} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink">
                      {s.name}
                    </p>
                    <p className="text-[11px] font-semibold text-mute">
                      {s.level}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    {ATT_ORDER.map((k) => {
                      const active = st === k;
                      return (
                        <button
                          key={k}
                          onClick={() => setStatus(s.id, k)}
                          title={ATT_META[k].label}
                          className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                            active
                              ? 'border-transparent text-white shadow-sm'
                              : 'border-line bg-white text-mute hover:border-board-600/40 hover:text-ink'
                          }`}
                          style={active ? { backgroundColor: ATT_META[k].hex } : undefined}
                        >
                          <span className="sm:hidden">{ATT_META[k].short}</span>
                          <span className="hidden sm:inline">
                            {ATT_META[k].label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* الأيام السابقة */}
        <div className="space-y-3">
          <div className="card p-4">
            <h3 className="font-display text-lg text-board-900">
              نسبة هذا اليوم
            </h3>
            <p className="font-display mt-2 text-4xl leading-none text-board-800">
              {day ? `${rate}٪` : '—'}
            </p>
            <div className="mt-2.5">
              <HBar value={day ? rate : 0} color={rate >= 90 ? 'var(--color-ok-500)' : rate >= 75 ? 'var(--color-late-500)' : 'var(--color-bad-500)'} />
            </div>
            <p className="mt-2 text-[11px] font-semibold text-mute">
              تُحتسب التأخيرات ضمن الحضور
            </p>
          </div>

          <div className="card p-4">
            <h3 className="font-display text-lg text-board-900">
              الأيام المسجلة
            </h3>
            {attendance.length === 0 ? (
              <p className="mt-2 text-xs text-mute">لا أيام مسجلة بعد.</p>
            ) : (
              <ul className="mt-2 space-y-1.5">
                {attendance.slice(0, 8).map((d) => {
                  const r = attendanceSummary([d]).rate;
                  const active = d.date === date;
                  return (
                    <li key={d.date}>
                      <button
                        onClick={() => setDate(d.date)}
                        className={`w-full rounded-xl border p-2.5 text-start transition-all ${
                          active
                            ? 'border-brass-500 bg-brass-100/60 shadow-sm'
                            : 'border-line bg-white/60 hover:border-board-600/40'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-ink">{fmtDate(d.date)}</span>
                          <span className="font-display text-base leading-none text-board-800">
                            {r}٪
                          </span>
                        </div>
                        <div className="mt-1.5">
                          <HBar
                            value={r}
                            color={r >= 90 ? 'var(--color-ok-500)' : r >= 75 ? 'var(--color-late-500)' : 'var(--color-bad-500)'}
                          />
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <button className="btn btn-ghost w-full" onClick={() => go('dashboard')}>
            <ClipboardCheck className="h-4 w-4" />
            العودة للوحة المتابعة
          </button>
        </div>
      </div>
    </div>
  );
}
