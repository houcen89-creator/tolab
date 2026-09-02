import { useRef, useState } from 'react';
import {
  Database,
  Download,
  Eraser,
  RotateCcw,
  Save,
  Upload,
  UserRound,
} from 'lucide-react';
import { useStore } from '../store';
import { todayStr } from '../utils';
import { Confirm, useToast } from '../components/ui';

export default function Settings() {
  const { state, setTeacherName, importJson, loadDemo, eraseAll } = useStore();
  const toast = useToast();
  const [name, setName] = useState(state.teacherName);
  const [confirmDemo, setConfirmDemo] = useState(false);
  const [confirmErase, setConfirmErase] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `تلاميذي-نسخة-احتياطية-${todayStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('تم تنزيل النسخة الاحتياطية');
  };

  const onImportFile = async (file: File | undefined) => {
    if (!file) return;
    const ok = importJson(await file.text());
    if (ok) toast('تم استيراد البيانات بنجاح');
    else toast('تعذّرت القراءة — تأكدي أنه ملف نسخة احتياطية صحيح', 'err');
  };

  const counts = [
    ['تلميذ مسجل', state.students.length],
    ['يوم حضور', state.attendance.length],
    ['نقطة في الدفتر', state.grades.length],
    ['ملاحظة', state.notes.length],
  ] as const;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-4xl leading-tight text-board-900 sm:text-5xl">
          الإعدادات
        </h1>
        <p className="mt-1 text-sm text-mute">
          بياناتك محفوظة محلياً في متصفحك — لا تُرسل إلى أي خادم
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* الاسم */}
        <div className="card p-5">
          <h3 className="font-display flex items-center gap-2 text-xl text-board-900">
            <UserRound className="h-5 w-5 text-board-600" />
            اسم المعلمة
          </h3>
          <p className="text-xs font-semibold text-mute">
            يظهر في الترحيب بلوحة المتابعة
          </p>
          <div className="mt-4 flex gap-2">
            <input
              className="field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: الأستاذة نادية"
            />
            <button
              className="btn btn-brass shrink-0"
              onClick={() => {
                setTeacherName(name.trim() || 'الأستاذة');
                toast('تم حفظ الاسم');
              }}
            >
              <Save className="h-4 w-4" />
              حفظ
            </button>
          </div>
        </div>

        {/* حجم البيانات */}
        <div className="card p-5">
          <h3 className="font-display flex items-center gap-2 text-xl text-board-900">
            <Database className="h-5 w-5 text-board-600" />
            حجم السجل
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {counts.map(([label, v]) => (
              <div key={label} className="rounded-xl bg-paper p-3 text-center">
                <p className="font-display text-3xl leading-none text-board-800">
                  {v}
                </p>
                <p className="mt-1 text-[11px] font-bold text-mute">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* النسخ الاحتياطي */}
        <div className="card p-5">
          <h3 className="font-display text-xl text-board-900">
            النسخ الاحتياطي
          </h3>
          <p className="text-xs font-semibold leading-6 text-mute">
            صدّري كل البيانات (تلاميذ، حضور، نتائج، ملاحظات) في ملف واحد،
            واستورديه متى شئت أو على جهاز آخر.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn btn-dark" onClick={exportData}>
              <Download className="h-4 w-4" />
              تصدير البيانات
            </button>
            <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" />
              استيراد نسخة
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                void onImportFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </div>
        </div>

        {/* إدارة البيانات */}
        <div className="card border-bad-100 p-5">
          <h3 className="font-display text-xl text-bad-600">منطقة الحذر</h3>
          <p className="text-xs font-semibold leading-6 text-mute">
            الاستعادة التجريبية تستبدل بياناتك الحالية بقسم تجريبي كامل، والمسح
            الكلي يفرغ التطبيق نهائياً.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn btn-ghost" onClick={() => setConfirmDemo(true)}>
              <RotateCcw className="h-4 w-4" />
              استعادة القسم التجريبي
            </button>
            <button className="btn btn-danger" onClick={() => setConfirmErase(true)}>
              <Eraser className="h-4 w-4" />
              مسح جميع البيانات
            </button>
          </div>
        </div>
      </div>

      <div className="card flex items-center gap-3 bg-board-800 p-4 text-paper">
        <span className="font-display grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brass-500 text-2xl text-board-950">
          ت
        </span>
        <p className="text-sm leading-6">
          <b className="font-display text-base">تلاميذي</b> — دفتر متابعة رقمي
          صُمم ليختصر على المعلمة أوراق الحضور ودفاتر النتائج في مكان واحد،
          يعمل دون اتصال ويحفظ كل شيء على جهازك.
        </p>
      </div>

      <Confirm
        open={confirmDemo}
        onClose={() => setConfirmDemo(false)}
        onConfirm={() => {
          loadDemo();
          toast('تمت استعادة القسم التجريبي');
        }}
        title="استعادة البيانات التجريبية"
        body="سيتم استبدال جميع بياناتك الحالية بالقسم التجريبي (10 تلاميذ مع حضور ونتائج وملاحظات). هل تريدين المتابعة؟"
        confirmLabel="نعم، استعادة"
      />
      <Confirm
        open={confirmErase}
        onClose={() => setConfirmErase(false)}
        onConfirm={() => {
          eraseAll();
          toast('مُسحت جميع البيانات');
        }}
        title="مسح جميع البيانات"
        body="سيتم حذف كل التلاميذ والحضور والنتائج والملاحظات نهائياً من هذا المتصفح. ننصح بتصدير نسخة احتياطية أولاً."
        confirmLabel="نعم، امسحي الكل"
      />
    </div>
  );
}
