import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { initials } from '../utils';

/* ---------------- التنبيهات (Toasts) ---------------- */

type ToastKind = 'ok' | 'err';
interface Toast {
  id: number;
  msg: string;
  kind: ToastKind;
}

const ToastCtx = createContext<(msg: string, kind?: ToastKind) => void>(
  () => {},
);

export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(1);

  const push = useCallback((msg: string, kind: ToastKind = 'ok') => {
    const id = idRef.current++;
    setToasts((t) => [...t.slice(-3), { id, msg, kind }]);
    window.setTimeout(
      () => setToasts((t) => t.filter((x) => x.id !== id)),
      3400,
    );
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed bottom-5 left-5 z-[90] flex flex-col gap-2 print:hidden">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="anim-toast flex items-center gap-3 rounded-xl bg-board-900 py-3 pe-5 ps-3 text-sm font-semibold text-paper shadow-xl shadow-board-950/30"
          >
            <span
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                t.kind === 'ok' ? 'bg-ok-500/20 text-[#7fd6a4]' : 'bg-bad-500/25 text-[#f2a79e]'
              }`}
            >
              {t.kind === 'ok' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
            </span>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ---------------- النوافذ المنبثقة ---------------- */

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center print:hidden">
      <div
        className="anim-fade absolute inset-0 bg-board-950/55 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        className={`anim-pop relative w-full overflow-hidden rounded-2xl border border-line bg-card shadow-2xl ${
          wide ? 'max-w-2xl' : 'max-w-md'
        }`}
      >
        <div className="flex items-center justify-between border-b border-line bg-board-800 px-5 py-3.5">
          <h3 className="font-display text-lg leading-none text-paper">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-board-100 transition hover:bg-board-700 hover:text-white"
            aria-label="إغلاق"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

export function Confirm({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel = 'نعم، تأكيد الحذف',
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body: string;
  confirmLabel?: string;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-bad-100 text-bad-600">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <p className="pt-1 text-sm leading-7 text-ink">{body}</p>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button className="btn btn-ghost" onClick={onClose}>
          تراجع
        </button>
        <button
          className="btn bg-bad-500 text-white hover:bg-bad-600"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

/* ---------------- الظهور عند التمرير ---------------- */

export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { threshold: 0.06 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-500 ease-out ${
        show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ---------------- عناصر صغيرة ---------------- */

export function Avatar({
  name,
  color,
  size = 44,
  className = '',
}: {
  name: string;
  color: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`grid shrink-0 select-none place-items-center rounded-full font-display leading-none text-white shadow-inner ring-2 ring-white/70 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        fontSize: size * 0.4,
      }}
    >
      {initials(name)}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  children,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <div className="card anim-pop flex flex-col items-center px-6 py-14 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-board-100/70 text-board-700">
        {icon}
      </span>
      <h3 className="font-display mt-4 text-2xl text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-sm leading-7 text-mute">{body}</p>
      {children && <div className="mt-5 flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  );
}

export function Field({
  label,
  error,
  children,
  className = '',
}: {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-bold text-board-700">
        {label}
      </span>
      {children}
      {error && (
        <span className="mt-1 block text-xs font-semibold text-bad-600">
          {error}
        </span>
      )}
    </label>
  );
}

/* ---------------- عدّاد متحرك ---------------- */

export function useCountUp(target: number, dur = 900): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, dur]);
  return v;
}
