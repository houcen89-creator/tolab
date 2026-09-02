import { useEffect, useState } from 'react';
import { useStore } from '../store';
import type { Gender, Student } from '../types';
import { AVATAR_COLORS, LEVELS, todayStr, uid } from '../utils';
import { Field, Modal, useToast } from './ui';

interface Props {
  open: boolean;
  onClose: () => void;
  initial?: Student;
}

const empty = {
  name: '',
  gender: 'm' as Gender,
  level: LEVELS[3],
  birthDate: '2016-01-01',
  guardianName: '',
  phone: '',
  address: '',
};

export default function StudentForm({ open, onClose, initial }: Props) {
  const { state, saveStudent } = useStore();
  const toast = useToast();
  const [f, setF] = useState(empty);
  const [color, setColor] = useState(AVATAR_COLORS[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setF({
        name: initial.name,
        gender: initial.gender,
        level: initial.level,
        birthDate: initial.birthDate,
        guardianName: initial.guardianName,
        phone: initial.phone,
        address: initial.address,
      });
      setColor(initial.color);
    } else {
      setF(empty);
      setColor(AVATAR_COLORS[state.students.length % AVATAR_COLORS.length]);
    }
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  const set = (k: keyof typeof empty, v: string) =>
    setF((p) => ({ ...p, [k]: v }));

  const submit = () => {
    const e: Record<string, string> = {};
    if (f.name.trim().length < 3) e.name = 'أدخلي الاسم الكامل (3 أحرف على الأقل)';
    if (!f.birthDate) e.birthDate = 'أدخلي تاريخ الازدياد';
    else if (f.birthDate > todayStr()) e.birthDate = 'التاريخ لا يمكن أن يكون مستقبلاً';
    if (f.phone && !/^[0-9+\s-]{6,15}$/.test(f.phone.trim()))
      e.phone = 'رقم هاتف غير صحيح';
    setErrors(e);
    if (Object.keys(e).length) return;

    saveStudent({
      id: initial?.id ?? uid(),
      name: f.name.trim(),
      gender: f.gender,
      level: f.level,
      birthDate: f.birthDate,
      guardianName: f.guardianName.trim(),
      phone: f.phone.trim(),
      address: f.address.trim(),
      joinedAt: initial?.joinedAt ?? todayStr(),
      color,
    });
    toast(initial ? 'تم تحديث بيانات التلميذ' : `أضيف «${f.name.trim()}» إلى القسم`);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'تعديل بيانات التلميذ' : 'إضافة تلميذ جديد'}
      wide
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="الاسم الكامل *" error={errors.name} className="sm:col-span-2">
          <input
            className="field"
            value={f.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="مثال: مريم الإدريسي"
            autoFocus
          />
        </Field>

        <Field label="الجنس">
          <div className="flex rounded-xl border border-line bg-white p-1">
            {(
              [
                ['m', 'ذكر'],
                ['f', 'أنثى'],
              ] as [Gender, string][]
            ).map(([g, label]) => (
              <button
                type="button"
                key={g}
                onClick={() => set('gender', g)}
                className={`flex-1 rounded-lg py-1.5 text-sm font-bold transition-all ${
                  f.gender === g
                    ? 'bg-board-800 text-paper shadow-sm'
                    : 'text-mute hover:text-ink'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="المستوى الدراسي">
          <select
            className="field"
            value={f.level}
            onChange={(e) => set('level', e.target.value)}
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </Field>

        <Field label="تاريخ الازدياد *" error={errors.birthDate}>
          <input
            type="date"
            className="field"
            value={f.birthDate}
            max={todayStr()}
            onChange={(e) => set('birthDate', e.target.value)}
          />
        </Field>

        <Field label="اسم ولي الأمر">
          <input
            className="field"
            value={f.guardianName}
            onChange={(e) => set('guardianName', e.target.value)}
            placeholder="الأب أو الأم"
          />
        </Field>

        <Field label="هاتف ولي الأمر" error={errors.phone}>
          <input
            className="field"
            dir="ltr"
            inputMode="tel"
            value={f.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="06XXXXXXXX"
          />
        </Field>

        <Field label="العنوان">
          <input
            className="field"
            value={f.address}
            onChange={(e) => set('address', e.target.value)}
            placeholder="الحي، المدينة"
          />
        </Field>

        <div className="sm:col-span-2">
          <span className="mb-1.5 block text-xs font-bold text-board-700">
            لون البطاقة
          </span>
          <div className="flex flex-wrap gap-2">
            {AVATAR_COLORS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                aria-label={`اختيار اللون ${c}`}
                className={`h-9 w-9 rounded-full transition-transform hover:scale-110 ${
                  color === c
                    ? 'scale-110 ring-2 ring-board-800 ring-offset-2 ring-offset-card'
                    : ''
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2 border-t border-line pt-4">
        <button className="btn btn-ghost" onClick={onClose}>
          إلغاء
        </button>
        <button className="btn btn-brass" onClick={submit}>
          {initial ? 'حفظ التعديلات' : 'إضافة التلميذ'}
        </button>
      </div>
    </Modal>
  );
}
