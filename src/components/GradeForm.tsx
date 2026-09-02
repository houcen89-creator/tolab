import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { EXAM_TYPES, SUBJECTS, TERMS, todayStr } from '../utils';
import { Field, Modal, useToast } from './ui';

interface Props {
  open: boolean;
  onClose: () => void;
  fixedStudentId?: string;
}

export default function GradeForm({ open, onClose, fixedStudentId }: Props) {
  const { state, addGrade } = useStore();
  const toast = useToast();
  const [f, setF] = useState({
    studentId: '',
    subject: SUBJECTS[0],
    term: TERMS[1],
    type: EXAM_TYPES[0],
    maxScore: '20',
    score: '',
    date: todayStr(),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setF({
        studentId: fixedStudentId ?? state.students[0]?.id ?? '',
        subject: SUBJECTS[0],
        term: TERMS[1],
        type: EXAM_TYPES[0],
        maxScore: '20',
        score: '',
        date: todayStr(),
      });
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, fixedStudentId]);

  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  const submit = () => {
    const e: Record<string, string> = {};
    const max = parseFloat(f.maxScore);
    const score = parseFloat(f.score);
    if (!f.studentId) e.studentId = 'اختاري التلميذ';
    if (!f.maxScore || isNaN(max) || max <= 0) e.maxScore = 'قيمة غير صحيحة';
    if (f.score === '' || isNaN(score) || score < 0)
      e.score = 'أدخلي النقطة المحصَّلة';
    else if (!isNaN(max) && score > max) e.score = `النقطة تتجاوز الحد الأقصى (${max})`;
    setErrors(e);
    if (Object.keys(e).length) return;

    addGrade({
      studentId: f.studentId,
      subject: f.subject,
      term: f.term,
      type: f.type,
      maxScore: max,
      score,
      date: f.date,
    });
    toast('تمت إضافة النتيجة');
    onClose();
  };

  const max = parseFloat(f.maxScore) || 20;
  const score = parseFloat(f.score);
  const preview =
    !isNaN(score) && score >= 0 && score <= max
      ? Math.round((score / max) * 20 * 10) / 10
      : null;

  return (
    <Modal open={open} onClose={onClose} title="إضافة نتيجة جديدة" wide>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {!fixedStudentId && (
          <Field label="التلميذ *" error={errors.studentId} className="sm:col-span-2">
            <select
              className="field"
              value={f.studentId}
              onChange={(e) => set('studentId', e.target.value)}
            >
              {state.students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.level}
                </option>
              ))}
            </select>
          </Field>
        )}

        <Field label="المادة">
          <select
            className="field"
            value={f.subject}
            onChange={(e) => set('subject', e.target.value)}
          >
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>

        <Field label="الدورة">
          <select
            className="field"
            value={f.term}
            onChange={(e) => set('term', e.target.value)}
          >
            {TERMS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>

        <Field label="نوع التقييم">
          <select
            className="field"
            value={f.type}
            onChange={(e) => set('type', e.target.value)}
          >
            {EXAM_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>

        <Field label="التاريخ">
          <input
            type="date"
            className="field"
            value={f.date}
            max={todayStr()}
            onChange={(e) => set('date', e.target.value)}
          />
        </Field>

        <Field label="النقطة من (الحد الأقصى)" error={errors.maxScore}>
          <input
            type="number"
            className="field"
            value={f.maxScore}
            min={1}
            step={0.5}
            onChange={(e) => set('maxScore', e.target.value)}
          />
        </Field>

        <Field label={`النقطة المحصَّلة (من ${max})`} error={errors.score}>
          <input
            type="number"
            className="field"
            value={f.score}
            min={0}
            max={max}
            step={0.25}
            placeholder="مثال: 14.5"
            onChange={(e) => set('score', e.target.value)}
          />
        </Field>
      </div>

      {preview !== null && (
        <div className="anim-fade mt-4 flex items-center justify-between rounded-xl bg-board-100/60 px-4 py-3 text-sm font-semibold text-board-800">
          <span>المعدل المكافئ على 20:</span>
          <span className="font-display text-xl leading-none">
            {preview}
            <span className="text-sm text-mute"> /20</span>
          </span>
        </div>
      )}

      <div className="mt-6 flex justify-end gap-2 border-t border-line pt-4">
        <button className="btn btn-ghost" onClick={onClose}>
          إلغاء
        </button>
        <button className="btn btn-brass" onClick={submit}>
          حفظ النتيجة
        </button>
      </div>
    </Modal>
  );
}
