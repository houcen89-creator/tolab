import { Component, useState } from 'react';
import type {
  ComponentType,
  CSSProperties,
  ErrorInfo,
  ReactNode,
} from 'react';
import {
  BarChart3,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  Settings as SettingsIcon,
  Users,
} from 'lucide-react';
import { StoreProvider, useStore } from './store';
import { ToastProvider } from './components/ui';
import type { Page } from './types';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentProfile from './pages/StudentProfile';
import Attendance from './pages/Attendance';
import Grades from './pages/Grades';
import Settings from './pages/Settings';

interface Nav {
  page: Page;
  id?: string;
}

const NAV: {
  page: Page;
  label: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  { page: 'dashboard', label: 'لوحة المتابعة', icon: LayoutDashboard },
  { page: 'students', label: 'التلاميذ', icon: Users },
  { page: 'attendance', label: 'ورقة الحضور', icon: ClipboardCheck },
  { page: 'grades', label: 'دفتر النتائج', icon: BarChart3 },
  { page: 'settings', label: 'الإعدادات', icon: SettingsIcon },
];

/** زخارف طباشيرية عائمة في الخلفية */
function Doodles() {
  const items: { el: ReactNode; cls: string; style: CSSProperties }[] = [
    {
      el: <span className="font-display text-8xl">أ ب ت</span>,
      cls: 'top-[12%] start-[8%]',
      style: { ['--r' as string]: '-6deg', animationDelay: '0s' },
    },
    {
      el: (
        <svg width="120" height="60" viewBox="0 0 120 60" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <path d="M4 40 Q 20 8, 40 34 T 76 30 T 116 22" />
        </svg>
      ),
      cls: 'top-[30%] end-[6%]',
      style: { ['--r' as string]: '4deg', animationDelay: '1.2s' },
    },
    {
      el: (
        <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
      cls: 'bottom-[18%] start-[14%]',
      style: { ['--r' as string]: '10deg', animationDelay: '2.1s' },
    },
    {
      el: <span className="font-display text-7xl">٢ + ٢</span>,
      cls: 'bottom-[8%] end-[10%]',
      style: { ['--r' as string]: '-4deg', animationDelay: '0.7s' },
    },
    {
      el: (
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <circle cx="40" cy="40" r="26" strokeDasharray="10 14" />
        </svg>
      ),
      cls: 'top-[60%] start-[45%]',
      style: { ['--r' as string]: '0deg', animationDelay: '1.7s' },
    },
  ];
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden text-board-800/[0.06] print:hidden"
    >
      {items.map((it, i) => (
        <div key={i} className={`floaty absolute ${it.cls}`} style={it.style}>
          {it.el}
        </div>
      ))}
    </div>
  );
}

function Shell() {
  const { state } = useStore();
  const [nav, setNav] = useState<Nav>({ page: 'dashboard' });

  const go = (page: Page, id?: string) => {
    setNav({ page, id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isActive = (p: Page) =>
    nav.page === p || (p === 'students' && nav.page === 'profile');

  const Logo = (
    <div className="flex items-center gap-3">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-brass-500 text-board-950 shadow-lg shadow-brass-600/30">
        <GraduationCap className="h-6 w-6" />
      </span>
      <span>
        <span className="font-display block text-2xl leading-none text-paper">
          تلاميذي
        </span>
        <span className="mt-0.5 block text-[10px] font-bold tracking-wide text-board-100/80">
          دفتر المتابعة اليومية
        </span>
      </span>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Doodles />

      {/* الشريط الجانبي — سطح المكتب */}
      <aside className="fixed inset-y-0 start-0 z-40 hidden w-[264px] flex-col border-e border-board-950/40 bg-board-900 md:flex print:hidden">
        <div className="border-b border-board-800 p-5">{Logo}</div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV.map(({ page, label, icon: Icon }) => {
            const active = isActive(page);
            return (
              <button
                key={page}
                onClick={() => go(page)}
                className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 ${
                  active
                    ? 'bg-board-800 text-brass-500 shadow-md shadow-board-950/40'
                    : 'text-board-100/70 hover:bg-board-800/60 hover:text-paper'
                }`}
              >
                <span
                  className={`absolute inset-y-2.5 start-0 w-1 rounded-e-full bg-brass-500 transition-all duration-300 ${
                    active ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'
                  }`}
                />
                <Icon className={`h-5 w-5 transition-transform duration-200 ${active ? '' : 'group-hover:scale-110'}`} />
                {label}
                {page === 'students' && state.students.length > 0 && (
                  <span
                    className={`chip ms-auto ${
                      active
                        ? 'bg-brass-500/15 text-brass-500'
                        : 'bg-board-800 text-board-100/70'
                    }`}
                  >
                    {state.students.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-board-800 p-4">
          <button
            onClick={() => go('settings')}
            className="flex w-full items-center gap-3 rounded-xl bg-board-800/60 p-3 text-start transition hover:bg-board-800"
          >
            <span className="font-display grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brass-500 text-lg leading-none text-board-950">
              {state.teacherName.replace('الأستاذة ', '').trim().charAt(0) || 'أ'}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-paper">
                {state.teacherName}
              </span>
              <span className="block text-[10px] font-semibold text-board-100/70">
                المعلمة المسؤولة
              </span>
            </span>
          </button>
        </div>
      </aside>

      {/* الشريط العلوي — جوال */}
      <header className="sticky top-0 z-40 border-b border-board-950/40 bg-board-900 px-4 py-3 md:hidden print:hidden">
        {Logo}
      </header>

      {/* المحتوى */}
      <main className="relative z-10 px-4 pb-28 pt-6 sm:px-6 md:ms-[264px] md:px-8 md:pb-12 lg:pt-8">
        <div
          key={nav.page + (nav.id ?? '')}
          className="anim-rise mx-auto max-w-[1160px]"
        >
          {nav.page === 'dashboard' && <Dashboard go={go} />}
          {nav.page === 'students' && <Students go={go} />}
          {nav.page === 'profile' && nav.id && (
            <StudentProfile id={nav.id} go={go} />
          )}
          {nav.page === 'profile' && !nav.id && <Students go={go} />}
          {nav.page === 'attendance' && <Attendance go={go} />}
          {nav.page === 'grades' && <Grades go={go} />}
          {nav.page === 'settings' && <Settings />}
        </div>
      </main>

      {/* شريط التنقل السفلي — جوال */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-board-950/40 bg-board-900/95 backdrop-blur md:hidden print:hidden">
        <div className="grid grid-cols-5">
          {NAV.map(({ page, label, icon: Icon }) => {
            const active = isActive(page);
            return (
              <button
                key={page}
                onClick={() => go(page)}
                className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold transition-colors ${
                  active ? 'text-brass-500' : 'text-board-100/60'
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

/** حاجز أخطاء — يعرض رسالة عربية واضحة بدل صفحة فارغة */
class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Talameethi error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          dir="rtl"
          className="flex min-h-screen flex-col items-center justify-center bg-[#edf1e8] p-6 text-center"
          style={{ fontFamily: "'IBM Plex Sans Arabic', Tahoma, sans-serif" }}
        >
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[#f6e0dd] text-3xl">
            ⚠️
          </span>
          <h1
            className="mt-4 text-3xl text-[#0a2e24]"
            style={{ fontFamily: "'Lalezar', Tahoma, sans-serif" }}
          >
            حدث خطأ غير متوقع
          </h1>
          <p className="mt-2 max-w-md text-sm leading-7 text-[#64756a]">
            بياناتك محفوظة ولن تضيع. جرّبي إعادة تحميل الصفحة، وإن تكرر الخطأ
            فامسحي بيانات الموقع من إعدادات المتصفح ثم أعيدي فتح التطبيق.
          </p>
          <p
            dir="ltr"
            className="mt-3 max-w-md rounded-lg bg-white px-3 py-2 text-[11px] text-[#a93b31]"
          >
            {String(this.state.error?.message || this.state.error)}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-xl bg-[#e8a13c] px-6 py-3 text-sm font-bold text-[#241503] shadow-lg transition hover:bg-[#c9861f] hover:text-white"
          >
            إعادة تحميل التطبيق
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <ToastProvider>
          <Shell />
        </ToastProvider>
      </StoreProvider>
    </ErrorBoundary>
  );
}
