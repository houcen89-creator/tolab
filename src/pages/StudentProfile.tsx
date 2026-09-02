import { useMemo, useState } from 'react';
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Printer,
  StickyNote,
  Trash2,
  TrendingUp,
  UserRound,
} from 'lucide-react';
import { useStore } from '../store';
import type { NoteCategory, Page } from '../types';
import {
  ATT_META,
  ATT_ORDER,
  ageOf,
  attendanceSummary,
  averageOf,
  fmtDate,
  fmtDateFull,
  lastSchoolDays,
  NOTE_META,
  relDate,
  SUBJECTS,
  TERMS,
  todayStr,
} from '../utils';
import {
  Avatar,
  Confirm,
  EmptyState,
  useToast,
} from '../components/ui';
import { Donut, HBar } from '../components/Charts';
import StudentForm from '../components/StudentForm';
import GradeForm from '../components/GradeForm';

type Tab = 'attendance' | 'grades' | 'notes';

export default function StudentProfile({
  id,
  go,
}: {
  id: string;
  go: (p: Page, id?: string) => void;
}) {
  const {
    state,
    deleteStudent,
    addNote,
    deleteNote,
    deleteGrade,
  } = useStore();
  const toast = useToast();
  const { students, attendance, grades, notes } = state;
  const student = students.find((s) => s.id === id);

  const [tab, setTab] = useState<Tab>('attendance');
  const [editOpen, setEditOpen] = useState(false);
  const [gradeOpen, setGradeOpen] = useState(false);
  const [confirmStudent, setConfirmStudent] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    kind: 'note' | 'grade';
    id: string;
  } | null>(null);

  /* ملاحظات جديدة */
  const [noteCat, setNoteCat] = useState<NoteCategory>('academic');
  const [noteText, setNoteText] = useState('');

  const att = useMemo(
    () => attendanceSummary(attendance, id),
    [attendance, id],
  );
  const avg = useMemo(() => averageOf(grades, id), [grades, id]);
  const myGrades = useMemo(
    () => grades.filter((g) => g.studentId === id),
    [grades, id],
  );
  const myNotes = useMemo(
    () => notes.filter((n) => n.studentId === id),
    [notes, id],
  );
  const dayByDate = useMemo(
    () => Object.fromEntries(attendance.map((d) => [d.date, d])),
    [attendance],
  );

  if (!student) {
    return (
      <EmptyState
        icon={<UserRound className="h-8 w-8" />}
        title="التلميذ غير موجود"
        body="ربما تم حذف هذا السجل. يمكنك العودة إلى قائمة التلاميذ."
      >
        <button className="btn btn-brass" onClick={() => go('students')}>
          <ChevronRight className="h-4 w-4" />
          العودة للتلاميذ
        </button>
      </EmptyState>
    );
  }

  const subjectAvgs = SUBJECTS.map((s) => ({
    s,
    avg: averageOf(grades, id, undefined, s),
  })).filter((x) => x.avg !== null);

  const recentDays = lastSchoolDays(20);
  const termAvg = (t: string) => averageOf(grades, id, t);

  const submitNote = () => {
    if (!noteText.trim()) {
      toast('اكتبي نص الملاحظة أولاً', 'err');
      return;
    }
    addNote({
      studentId: id,
      category: noteCat,
      text: noteText.trim(),
      date: todayStr(),
    });
    setNoteText('');
    toast('أضيفت الملاحظة إلى السجل');
  };

  const pct = (g: { score: number; maxScore: number }) =>
    Math.round((g.score / g.maxScore) * 100);

  return (
    <div className="space-y-5">
      <button
        onClick={() => go('students')}
        className="group flex items-center gap-1 text-sm font-bold text-board-700 transition hover:text-brass-600 print:hidden"
      >
        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        العودة إلى قائمة التلاميذ
      </button>

      {/* رأس السجل */}
      <div className="card overflow-hidden">
        <div className="border-s-[6px] border-brass-500 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar name={student.name} color={student.color} size={80} />
              <div>
                <p className="text-xs font-bold text-mute">
                  السجل المدرسي — {student.level}
                </p>
                <h1 className="font-display mt-1 text-4xl leading-none text-board-900">
                  {student.name}
                </h1>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <span className="chip bg-board-100/80 text-board-700">
                    {student.gender === 'm' ? 'ذكر' : 'أنثى'}
                  </span>
                  <span className="chip bg-brass-100 text-brass-600">
                    العمر {ageOf(student.birthDate)} سنوات
                  </span>
                  <span className="chip bg-ok-100 text-ok-600">
                    التحق في {fmtDate(student.joinedAt)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 print:hidden">
              <button className="btn btn-ghost" onClick={() => setEditOpen(true)}>
                <Pencil className="h-4 w-4" />
                تعديل
              </button>
              <button className="btn btn-dark" onClick={() => window.print()}>
                <Printer className="h-4 w-4" />
                طباعة السجل
              </button>
              <button
                className="btn btn-danger"
                onClick={() => setConfirmStudent(true)}
              >
                <Trash2 className="h-4 w-4" />
                حذف
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4 lg:grid-cols-4">
            {[
              {
                icon: <CalendarDays className="h-4 w-4" />,
                label: 'تاريخ الازدياد',
                value: fmtDateFull(student.birthDate),
              },
              {
                icon: <UserRound className="h-4 w-4" />,
                label: 'ولي الأمر',
                value: student.guardianName,
              },
              {
                icon: <Phone className="h-4 w-4" />,
                label: 'الهاتف',
                value: student.phone || '—',
                ltr: !!student.phone,
              },
              {
                icon: <MapPin className="h-4 w-4" />,
                label: 'العنوان',
                value: student.address || '—',
              },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-2.5">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-paper text-board-600">
                  {item.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-mute">
                    {item.label}
                  </p>
                  <p
                    className={`truncate text-sm font-bold text-ink ${item.ltr ? 'text-left' : ''}`}
                    dir={item.ltr ? 'ltr' : undefined}
                  >
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* مؤشرات سريعة */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <p className="flex items-center gap-1.5 text-xs font-bold text-mute">
            <ClipboardCheck className="h-3.5 w-3.5" />
            نسبة الحضور
          </p>
          <p className="font-display mt-1 text-3xl leading-none" style={{ color: att.total ? (att.rate >= 90 ? 'var(--color-ok-500)' : att.rate >= 75 ? 'var(--color-late-500)' : 'var(--color-bad-500)') : 'var(--color-mute)' }}>
            {att.total ? `${att.rate}٪` : '—'}
          </p>
          <div className="mt-2">
            <HBar
              value={att.rate}
              color={att.rate >= 90 ? 'var(--color-ok-500)' : att.rate >= 75 ? 'var(--color-late-500)' : 'var(--color-bad-500)'}
            />
          </div>
          <p className="mt-1.5 text-[11px] font-semibold text-mute">
            {att.total} يوماً مسجلاً · {att.absent + att.excused} غياب
          </p>
        </div>
        <div className="card p-4">
          <p className="flex items-center gap-1.5 text-xs font-bold text-mute">
            <TrendingUp className="h-3.5 w-3.5" />
            المعدل العام
          </p>
          <p className="font-display mt-1 text-3xl leading-none text-board-800">
            {avg !== null ? (
              <>
                {avg}
                <span className="text-base text-mute">/20</span>
              </>
            ) : (
              '—'
            )}
          </p>
          <div className="mt-2">
            <HBar
              value={avg !== null ? (avg / 20) * 100 : 0}
              color={avg !== null && avg >= 10 ? 'var(--color-ok-500)' : 'var(--color-bad-500)'}
            />
          </div>
          <p className="mt-1.5 text-[11px] font-semibold text-mute">
            {TERMS.map((t) => {
              const a = termAvg(t);
              return `${t}: ${a !== null ? a : '—'}`;
            }).join(' · ')}
          </p>
        </div>
        <div className="card p-4">
          <p className="flex items-center gap-1.5 text-xs font-bold text-mute">
            <StickyNote className="h-3.5 w-3.5" />
            الملاحظات
          </p>
          <p className="font-display mt-1 text-3xl leading-none text-board-800">
            {myNotes.length}
          </p>
          <p className="mt-2 text-[11px] font-semibold leading-5 text-mute">
            {myNotes.length
              ? `آخر ملاحظة: ${relDate(myNotes[0].date)}`
              : 'لا ملاحظات في السجل بعد'}
          </p>
        </div>
      </div>

      {/* التبويبات */}
      <div className="flex flex-wrap gap-2 print:hidden">
        {(
          [
            ['attendance', 'الحضور والغياب', att.total],
            ['grades', 'النتائج', myGrades.length],
            ['notes', 'الملاحظات', myNotes.length],
          ] as [Tab, string, number][]
        ).map(([t, label, count]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition-all ${
              tab === t
                ? 'border-board-800 bg-board-800 text-paper shadow-md'
                : 'border-line bg-card text-mute hover:border-board-600/40 hover:text-ink'
            }`}
          >
            {label}
            <span
              className={`chip ${tab === t ? 'bg-board-700 text-brass-500' : 'bg-paper text-mute'}`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* محتوى التبويب */}
      {tab === 'attendance' && (
        <div className="anim-rise grid grid-cols-1 gap-5 lg:grid-cols-5">
          <div className="card p-5 lg:col-span-2">
            <h3 className="font-display text-xl text-board-900">
              ملخص الحضور
            </h3>
            <div className="mt-4 flex items-center justify-center">
              <Donut
                size={150}
                segments={ATT_ORDER.map((k) => ({
                  value: att[k],
                  color: ATT_META[k].hex,
                }))}
                center={
                  <>
                    <span className="font-display text-4xl leading-none text-board-900">
                      {att.rate}٪
                    </span>
                    <span className="text-[10px] font-bold text-mute">حضور</span>
                  </>
                }
              />
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-2">
              {ATT_ORDER.map((k) => (
                <li
                  key={k}
                  className="flex items-center justify-between rounded-lg bg-paper px-3 py-2 text-xs font-bold"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ATT_META[k].hex }} />
                    {ATT_META[k].label}
                  </span>
                  <span className="font-display text-base leading-none text-board-800">
                    {att[k]}
                  </span>
                </li>
              ))}
            </ul>
            <button
              className="btn btn-dark mt-4 w-full print:hidden"
              onClick={() => go('attendance')}
            >
              <ClipboardCheck className="h-4 w-4" />
              فتح ورقة الحضور اليومية
            </button>
          </div>

          <div className="card p-5 lg:col-span-3">
            <h3 className="font-display text-xl text-board-900">
              آخر {recentDays.length} يوم دراسة
            </h3>
            <p className="text-xs font-semibold text-mute">
              مرّري المؤشر فوق أي خانة للتفاصيل
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {recentDays.map((d) => {
                const st = dayByDate[d]?.map[id];
                return (
                  <div
                    key={d}
                    title={`${fmtDate(d)} — ${st ? ATT_META[st].label : 'غير مسجل'}`}
                    className="grid h-9 w-9 cursor-default place-items-center rounded-lg text-xs font-bold text-white transition-transform hover:scale-110"
                    style={{
                      backgroundColor: st ? ATT_META[st].hex : 'var(--color-line)',
                      color: st ? '#fff' : 'var(--color-mute)',
                    }}
                  >
                    {st ? ATT_META[st].short : '·'}
                  </div>
                );
              })}
            </div>

            <h4 className="mt-6 text-xs font-bold text-mute">
              الأيام المسجلة في السجل
            </h4>
            {attendance.filter((d) => d.map[id]).length === 0 ? (
              <p className="mt-2 text-sm text-mute">
                لم تُسجل أيام بعد — استعملي ورقة الحضور اليومية.
              </p>
            ) : (
              <ul className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {attendance
                  .filter((d) => d.map[id])
                  .slice(0, 12)
                  .map((d) => {
                    const st = d.map[id];
                    return (
                      <li
                        key={d.date}
                        className="flex items-center justify-between rounded-lg border border-line bg-white/60 px-3 py-2 text-xs font-semibold"
                      >
                        <span className="text-ink">{fmtDateFull(d.date)}</span>
                        <span className={`chip ${ATT_META[st].chip}`}>
                          {ATT_META[st].label}
                        </span>
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>
        </div>
      )}

      {tab === 'grades' && (
        <div className="anim-rise space-y-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="card p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl text-board-900">
                  المعدل حسب المادة
                </h3>
                <button
                  className="btn btn-brass px-3 py-1.5 text-xs print:hidden"
                  onClick={() => setGradeOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  نتيجة
                </button>
              </div>
              {subjectAvgs.length === 0 ? (
                <p className="mt-4 text-sm text-mute">لا نتائج مسجلة بعد.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {subjectAvgs.map(({ s, avg: a }) => {
                    const v = a as number;
                    const color = v >= 12 ? 'var(--color-ok-500)' : v >= 10 ? 'var(--color-late-500)' : 'var(--color-bad-500)';
                    return (
                      <li key={s}>
                        <div className="mb-1 flex justify-between text-xs font-bold">
                          <span>{s}</span>
                          <span className="font-display text-base leading-none" style={{ color }}>
                            {v}
                            <span className="text-[10px] text-mute">/20</span>
                          </span>
                        </div>
                        <HBar value={(v / 20) * 100} color={color} />
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="card p-5 lg:col-span-2">
              <h3 className="font-display text-xl text-board-900">
                تفاصيل النتائج
              </h3>
              {myGrades.length === 0 ? (
                <div className="py-8 text-center">
                  <BookOpen className="mx-auto h-8 w-8 text-mute" />
                  <p className="mt-2 text-sm text-mute">
                    أضيفي أول نتيجة لهذا التلميذ
                  </p>
                  <button
                    className="btn btn-brass mt-3 print:hidden"
                    onClick={() => setGradeOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    إضافة نتيجة
                  </button>
                </div>
              ) : (
                TERMS.map((term) => {
                  const rows = myGrades.filter((g) => g.term === term);
                  if (!rows.length) return null;
                  const tAvg = termAvg(term);
                  return (
                    <div key={term} className="mt-4">
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="text-sm font-bold text-board-700">
                          {term}
                        </h4>
                        <span className="chip bg-brass-100 text-brass-600">
                          المعدل: {tAvg !== null ? `${tAvg}/20` : '—'}
                        </span>
                      </div>
                      <div className="overflow-x-auto rounded-xl border border-line">
                        <table className="w-full min-w-105 text-sm">
                          <thead>
                            <tr className="bg-paper text-[11px] font-bold text-mute">
                              <th className="px-3 py-2 text-start">المادة</th>
                              <th className="px-3 py-2 text-start">التقييم</th>
                              <th className="px-3 py-2 text-start">التاريخ</th>
                              <th className="px-3 py-2 text-start">النقطة</th>
                              <th className="px-3 py-2 text-start">٪</th>
                              <th className="w-8 print:hidden" />
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-line/70 bg-white/50">
                            {rows.map((g) => {
                              const p = pct(g);
                              const good = p >= 50;
                              return (
                                <tr key={g.id} className="group/row transition hover:bg-brass-100/30">
                                  <td className="px-3 py-2.5 font-bold text-ink">
                                    {g.subject}
                                  </td>
                                  <td className="px-3 py-2.5 text-xs text-mute">
                                    {g.type}
                                  </td>
                                  <td className="px-3 py-2.5 text-xs text-mute">
                                    {fmtDate(g.date)}
                                  </td>
                                  <td className="px-3 py-2.5">
                                    <span className="font-display text-base text-board-800">
                                      {g.score}
                                    </span>
                                    <span className="text-[11px] text-mute">
                                      /{g.maxScore}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2.5">
                                    <span className={`chip ${good ? 'bg-ok-100 text-ok-600' : 'bg-bad-100 text-bad-600'}`}>
                                      {p}٪
                                    </span>
                                  </td>
                                  <td className="px-2 py-2.5 print:hidden">
                                    <button
                                      className="grid h-7 w-7 place-items-center rounded-lg text-mute opacity-0 transition hover:bg-bad-100 hover:text-bad-600 group-hover/row:opacity-100"
                                      onClick={() =>
                                        setConfirmDelete({ kind: 'grade', id: g.id })
                                      }
                                      aria-label="حذف النتيجة"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'notes' && (
        <div className="anim-rise grid grid-cols-1 gap-5 lg:grid-cols-5">
          <div className="card h-fit p-5 lg:col-span-2 print:hidden">
            <h3 className="font-display text-xl text-board-900">
              ملاحظة جديدة
            </h3>
            <p className="text-xs font-semibold text-mute">
              تُحفظ بتاريخ اليوم في سجل التلميذ
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(Object.keys(NOTE_META) as NoteCategory[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setNoteCat(c)}
                  className={`chip border transition-all ${
                    noteCat === c
                      ? `${NOTE_META[c].chip} ${NOTE_META[c].border} scale-105`
                      : 'border-line bg-white text-mute hover:text-ink'
                  }`}
                >
                  {NOTE_META[c].label}
                </button>
              ))}
            </div>
            <textarea
              className="field mt-3 resize-none"
              rows={4}
              placeholder="مثال: تحسّن ملحوظ في القراءة الجهرية هذا الأسبوع…"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            <button className="btn btn-brass mt-3 w-full" onClick={submitNote}>
              <Plus className="h-4 w-4" />
              إضافة الملاحظة
            </button>
          </div>

          <div className="lg:col-span-3">
            {myNotes.length === 0 ? (
              <div className="card p-10 text-center">
                <StickyNote className="mx-auto h-8 w-8 text-mute" />
                <p className="font-display mt-2 text-2xl text-ink">
                  السجل فارغ من الملاحظات
                </p>
                <p className="mt-1 text-sm text-mute">
                  دوّني هنا كل ما يستحق التذكر: أكاديمياً، سلوكياً أو صحياً.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {myNotes.map((n) => {
                  const meta = NOTE_META[n.category];
                  return (
                    <li
                      key={n.id}
                      className="card group anim-rise border-s-4 bg-white/70 p-4"
                      style={{ borderInlineStartColor: meta.hex }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`chip ${meta.chip}`}>{meta.label}</span>
                          <span className="text-[11px] font-semibold text-mute">
                            {relDate(n.date)} · {fmtDate(n.date)}
                          </span>
                        </div>
                        <button
                          className="grid h-8 w-8 place-items-center rounded-lg text-mute opacity-0 transition hover:bg-bad-100 hover:text-bad-600 group-hover:opacity-100 print:hidden"
                          onClick={() =>
                            setConfirmDelete({ kind: 'note', id: n.id })
                          }
                          aria-label="حذف الملاحظة"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-2 text-sm leading-7 text-ink">{n.text}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* النوافذ */}
      <StudentForm open={editOpen} onClose={() => setEditOpen(false)} initial={student} />
      <GradeForm open={gradeOpen} onClose={() => setGradeOpen(false)} fixedStudentId={id} />
      <Confirm
        open={confirmStudent}
        onClose={() => setConfirmStudent(false)}
        onConfirm={() => {
          deleteStudent(id);
          toast('تم حذف التلميذ وجميع بياناته');
          go('students');
        }}
        title="حذف تلميذ"
        body={`سيتم حذف «${student.name}» نهائياً مع جميع حضوره ونتائجه وملاحظاته. لا يمكن التراجع عن هذا الإجراء.`}
      />
      <Confirm
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (!confirmDelete) return;
          if (confirmDelete.kind === 'note') {
            deleteNote(confirmDelete.id);
            toast('حُذفت الملاحظة');
          } else {
            deleteGrade(confirmDelete.id);
            toast('حُذفت النتيجة');
          }
        }}
        title={confirmDelete?.kind === 'note' ? 'حذف ملاحظة' : 'حذف نتيجة'}
        body="سيتم الحذف نهائياً من سجل التلميذ. هل أنت متأكدة؟"
      />
    </div>
  );
}
