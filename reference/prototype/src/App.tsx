import { useEffect, useState } from 'react';
import { Outlet, useRouterState } from '@tanstack/react-router';
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  FlaskConical,
  Menu,
  Moon,
  Sun,
  X,
  LogOut,
} from 'lucide-react';
import { academyPage, BrandMark } from './components';
import { useStudio } from './store';
import { Badge, Button, Empty, Link, Loading, Modal, Notice, PageHead, Arrow } from './components';
export function App() {
  const {
    t,
    theme,
    setTheme,
    lang,
    setLang,
    role,
    setRole,
    toast,
    notify,
    scenario,
    setScenario,
    storageError,
  } = useStudio();
  const [menu, setMenu] = useState(false);
  const [lab, setLab] = useState(false);
  const pathname = useRouterState({
    select: (s) => s.matches.at(-1)?.pathname || s.location.pathname,
  });
  useEffect(() => {
    if (!academyPage() && /^\/(training|lesson|progress)(\/|$)/.test(pathname)) {
      location.replace('./academy.html' + location.hash);
      return;
    }
    setMenu(false);
    window.scrollTo(0, 0);
    document.title = `${pathname === '/' ? 'Studio' : pathname.split('/').filter(Boolean).join(' · ')} | Abdulnaser Ramadan`;
    document.getElementById('main')?.focus({ preventScroll: true });
  }, [pathname]);
  const nav = academyPage()
    ? [
        ['/training', t('الأكاديمية', 'Academy')],
        ['/training/csharp', 'C#'],
        ['/progress', t('تقدمي', 'My progress')],
        ['/dashboard', t('مساحتي', 'My space')],
      ]
    : [
        ['/articles', t('المقالات', 'Articles')],
        ['/projects', t('المشاريع', 'Projects')],
        ['/newsletter', t('النشرة', 'Newsletter')],
        ['/training', t('التدريب', 'Training')],
        ['/about', t('عنّي', 'About')],
      ];
  return (
    <>
      <a
        href="#main"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        {t('تجاوز إلى المحتوى', 'Skip to content')}
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Link to="/" className="brand" aria-label="Abdulnaser Ramadan home">
            <BrandMark />
            <span>
              Abdulnaser
              <br />
              <b>Ramadan {academyPage() ? 'Academy' : ''}</b>
            </span>
          </Link>
          <nav
            className={`main-nav ${menu ? 'is-open' : ''}`}
            aria-label={t('التنقل الرئيسي', 'Main navigation')}
          >
            {nav.map(([to, label]) => (
              <Link
                to={to}
                key={to}
                aria-current={
                  (to === '/training' ? pathname === to : pathname.startsWith(to))
                    ? 'page'
                    : undefined
                }
                className={
                  (to === '/training' ? pathname === to : pathname.startsWith(to)) ? 'active' : ''
                }
              >
                {label}
                {to === '/training' && <span className="new-dot" />}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <Link
              to="/preferences"
              className="icon-button palette-link"
              aria-label={t('تفضيلات المظهر', 'Appearance preferences')}
            >
              ◐
            </Link>
            <button
              type="button"
              className="icon-button"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              aria-label={t('تبديل المظهر', 'Toggle theme')}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button
              type="button"
              className="language-button"
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              aria-label="Change language"
            >
              {lang === 'ar' ? 'EN' : 'ع'}
            </button>
            <span className="header-divider" />
            {role === 'guest' ? (
              <Link to="/login" className="login-link">
                {t('دخول', 'Sign in')}
                <ArrowUpRight size={16} />
              </Link>
            ) : (
              <>
                <Link to="/dashboard" className="user-button">
                  <span className="avatar small">AR</span>
                  <span>{t('مساحتي', 'My space')}</span>
                </Link>
                <button
                  className="icon-button logout"
                  aria-label={t('تسجيل الخروج', 'Sign out')}
                  onClick={() => {
                    setRole('guest');
                    location.hash = '/';
                    notify(t('خرجت من الحساب التجريبي', 'Signed out of the demo account'));
                  }}
                >
                  <LogOut size={16} />
                </button>
              </>
            )}
            <button
              type="button"
              className="icon-button menu-toggle"
              aria-expanded={menu}
              aria-label={t('قائمة التنقل', 'Navigation menu')}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      {academyPage() && (
        <div className="academy-bar">
          <b>{t('أكاديمية عبد الناصر رمضان', 'ABDULNASER RAMADAN ACADEMY')}</b>
          <a href="./index.html#/" className="academy-back">
            {t('العودة إلى الموقع', 'Back to the website')} ↗
          </a>
        </div>
      )}
      <main
        data-route={pathname}
        id="main"
        tabIndex={-1}
        className={`main-content ${pathname.startsWith('/lesson') ? 'wide' : ''}`}
      >
        {storageError && (
          <Notice tone="error">
            {t(
              'التخزين المحلي غير متاح؛ قد تفقد بيانات التجربة عند الإغلاق.',
              'Local storage is unavailable; demo changes may be lost on close.',
            )}
          </Notice>
        )}
        {scenario === 'loading' ? (
          <>
            <Loading />
            <Button onClick={() => setScenario('normal')}>
              {t('إكمال التحميل التجريبي', 'Finish demo loading')}
            </Button>
          </>
        ) : scenario === 'error' ? (
          <div className="state-screen">
            <Notice tone="error">
              <h1>{t('تعذّر تحميل هذه المساحة', 'This space could not load')}</h1>
              <p>
                {t(
                  'بياناتك ما زالت محفوظة. جرّب التحميل مرة أخرى.',
                  'Your data is still saved. Try loading again.',
                )}
              </p>
              <Button onClick={() => setScenario('normal')}>
                {t('إعادة المحاولة', 'Try again')}
              </Button>
            </Notice>
          </div>
        ) : scenario === 'empty' ? (
          <Empty
            title={t('هنا تبدأ الحكاية', 'This is where it begins')}
            description={t(
              'لا توجد عناصر بعد. هذه معاينة للحالة الفارغة.',
              'There are no items yet. This previews an empty state.',
            )}
          >
            <Button onClick={() => setScenario('normal')}>
              {t('عرض المحتوى التجريبي', 'Show demo content')}
            </Button>
          </Empty>
        ) : (
          <Outlet />
        )}
      </main>
      <footer className="site-footer">
        <div>
          <Link to="/" className="brand">
            <BrandMark />
            <span>Abdulnaser Ramadan</span>
          </Link>
          <p>
            {t(
              'أفكار أوضح. برمجيات أفضل. أثر أبقى.',
              'Clearer thinking. Better software. Lasting impact.',
            )}
          </p>
        </div>
        <nav aria-label={t('روابط أسفل الصفحة', 'Footer links')}>
          <Link to="/about">{t('عنّي', 'About')}</Link>
          <Link to="/newsletter">{t('النشرة', 'Newsletter')}</Link>
          <Link to="/design-system">{t('نظام التصميم', 'Design system')}</Link>
          <Link to="/admin">{t('الإدارة التجريبية', 'Demo admin')}</Link>
        </nav>
        <div className="footer-bottom">
          <span>© 2026 Abdulnaser Ramadan</span>
          <span>{t('مصمم بعناية. مبني بهدف.', 'Thoughtfully designed. Built with purpose.')}</span>
        </div>
      </footer>
      <div className="prototype-dock">
        <span className="demo-dot" />
        <span>{t('نموذج تفاعلي', 'INTERACTIVE PROTOTYPE')}</span>
        <button onClick={() => setLab(true)}>
          <FlaskConical size={15} />
          {t('مختبر الحالات', 'State lab')}
          <ChevronDown size={13} />
        </button>
      </div>
      <div className={`toast ${toast ? 'visible' : ''}`} role="status" aria-live="polite">
        {toast && (
          <>
            <Check size={18} />
            <span>{toast}</span>
            <button
              aria-label={t('إغلاق الإشعار', 'Dismiss notification')}
              onClick={() => notify('')}
            >
              <X size={16} />
            </button>
          </>
        )}
      </div>
      <Modal
        open={lab}
        onClose={() => setLab(false)}
        title={t('مختبر النموذج التفاعلي', 'Prototype state lab')}
      >
        <Lab onClose={() => setLab(false)} />
      </Modal>
    </>
  );
}
function Lab({ onClose }: { onClose: () => void }) {
  const { t, role, setRole, scenario, setScenario, failure, setFailure, reset } = useStudio();
  const [resetConfirm, setResetConfirm] = useState(false);
  return (
    <>
      <p>
        {t(
          'استكشف الحالات والأدوار دون أي خدمة خارجية. تغيير الدور لا يغيّر البيانات التجريبية المشتركة في هذا المتصفح.',
          'Explore states and personas without external services. Switching personas keeps the shared demo data in this browser.',
        )}
      </p>
      <fieldset>
        <legend>{t('الدور التجريبي', 'Demo persona')}</legend>
        <div className="chips">
          {(['guest', 'learner', 'admin'] as const).map((r, i) => (
            <button
              key={r}
              aria-pressed={role === r}
              className={role === r ? 'active' : ''}
              onClick={() => setRole(r)}
            >
              {[t('زائر', 'Guest'), t('متدرّب', 'Learner'), t('محرّر', 'Editor')][i]}
            </button>
          ))}
        </div>
      </fieldset>
      <label>
        {t('حالة الصفحة', 'Page state')}
        <select value={scenario} onChange={(e) => setScenario(e.target.value as typeof scenario)}>
          {(['normal', 'loading', 'empty', 'error'] as const).map((s, i) => (
            <option key={s} value={s}>
              {
                [
                  t('طبيعي', 'Normal'),
                  t('تحميل', 'Loading'),
                  t('فارغ', 'Empty'),
                  t('خطأ', 'Error'),
                ][i]
              }
            </option>
          ))}
        </select>
      </label>
      <label>
        {t('نتيجة الطلب التالي', 'Request outcome')}
        <select value={failure} onChange={(e) => setFailure(e.target.value as typeof failure)}>
          <option value="none">{t('نجاح', 'Success')}</option>
          <option value="error">{t('فشل الطلب', 'Request failure')}</option>
          <option value="partial">
            {t('نجاح جزئي للنشر: فشل LinkedIn', 'Partial publishing: LinkedIn fails')}
          </option>
        </select>
      </label>
      <div className="actions">
        <Button onClick={onClose}>
          {t('تطبيق واستكشاف', 'Apply & explore')}
          <Arrow />
        </Button>
        <Link to="/design-system" onClick={onClose} className="button secondary">
          {t('دليل الواجهة', 'UI reference')}
        </Link>
      </div>
      <hr />
      {resetConfirm ? (
        <Notice>
          <p>
            {t(
              'تُحذف محاولات التدريب والمقالات والتفضيلات التجريبية من هذا المتصفح.',
              'This clears demo attempts, articles, and preferences from this browser.',
            )}
          </p>
          <Button
            variant="danger"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            {t('تأكيد مسح بيانات التجربة', 'Confirm reset demo data')}
          </Button>
        </Notice>
      ) : (
        <Button variant="ghost danger" onClick={() => setResetConfirm(true)}>
          {t('إعادة بيانات التجربة', 'Reset demo data')}
        </Button>
      )}
    </>
  );
}
export function DesignSystem() {
  const { t, notify } = useStudio();
  const [modal, setModal] = useState(false);
  return (
    <>
      <PageHead
        eyebrow="DESIGN REFERENCE / V1.0"
        title={t('لغة واحدة، تجارب متسقة.', 'One language. Considered experiences.')}
        description={t(
          'مرجع بصري حي للألوان والطباعة والمكونات والحالات. الوثائق التفصيلية داخل مجلد docs.',
          'A living reference for color, typography, components, and states. Detailed specifications live in the docs folder.',
        )}
      />
      <section className="panel">
        <h2>{t('الألوان الدلالية', 'Semantic colors')}</h2>
        <div className="swatches">
          {[
            '--bg',
            '--surface',
            '--ink',
            '--muted',
            '--accent',
            '--accent-soft',
            '--line',
            '--danger',
          ].map((v) => (
            <div key={v}>
              <span style={{ background: `var(${v})` }} />
              <code>{v}</code>
            </div>
          ))}
        </div>
      </section>
      <div className="dashboard-grid">
        <section className="panel">
          <span className="eyebrow">TYPOGRAPHY</span>
          <h2>{t('الوضوح أولًا.', 'Clarity comes first.')}</h2>
          <p>
            {t(
              'خطوط النظام المحلية للسرعة، وعناوين بتباعد محسوب. حجم النص الأساسي 16px وارتفاع السطر 1.7.',
              'Local system fonts for speed, with deliberate heading spacing. Base text is 16px with 1.7 line height.',
            )}
          </p>
          <code>12 / 14 / 16 / 20 / 28 / 40 / 64</code>
          <hr />
          <span className="eyebrow">SPACING & SHAPE</span>
          <p>4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96</p>
          <p>
            {t(
              'حواف 8–16px · محتوى بعرض 1184px · قراءة بعرض 720px',
              '8–16px radii · 1184px content width · 720px reading width',
            )}
          </p>
        </section>
        <section className="panel">
          <h2>{t('الأزرار والشارات', 'Buttons & badges')}</h2>
          <div className="actions">
            <Button onClick={() => notify(t('تم الإجراء بنجاح', 'Action completed'))}>
              {t('أساسي', 'Primary')}
              <Arrow />
            </Button>
            <Button variant="secondary" onClick={() => setModal(true)}>
              {t('ثانوي', 'Secondary')}
            </Button>
            <Button disabled>{t('غير متاح', 'Disabled')}</Button>
          </div>
          <div className="chips">
            <Badge tone="green">{t('نجاح', 'Success')}</Badge>
            <Badge tone="amber">{t('قيد المراجعة', 'Needs attention')}</Badge>
            <Badge>{t('مسودة', 'Draft')}</Badge>
          </div>
          <Notice tone="success">{t('تم حفظ التغييرات.', 'Changes saved.')}</Notice>
          <Notice tone="error">
            {t('تعذّر الحفظ. حاول مجددًا.', 'Could not save. Please retry.')}
          </Notice>
        </section>
      </div>
      <section className="panel">
        <h2>{t('إمكانية الوصول والاستجابة', 'Accessibility & responsive behavior')}</h2>
        <div className="reference-grid">
          {[
            t(
              'لوحة المفاتيح: تركيز واضح، رابط تجاوز، ونافذة حوار أصلية تحصر التركيز.',
              'Keyboard: visible focus, skip link, and native dialog focus containment.',
            ),
            t(
              'الحالات: النص والأيقونة يشرحان المعنى، وليس اللون وحده.',
              'States: text and icons communicate meaning alongside color.',
            ),
            t(
              'الهاتف: عمود واحد، قائمة قابلة للفتح، وجدول قابل للتمرير داخل حدوده.',
              'Mobile: single columns, an expandable menu, and contained scrollable tables.',
            ),
            t(
              'الاتجاه: العربية RTL، الإنجليزية LTR، والكود دائمًا LTR.',
              'Direction: Arabic RTL, English LTR, and code always LTR.',
            ),
          ].map((x) => (
            <p key={x}>
              <Check size={18} />
              {x}
            </p>
          ))}
        </div>
      </section>
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={t('نافذة حوار نموذجية', 'Example dialog')}
      >
        <p>
          {t(
            'Escape يغلق النافذة ويعيد التركيز إلى الزر السابق.',
            'Escape closes the dialog and restores focus to its trigger.',
          )}
        </p>
        <Button onClick={() => setModal(false)}>{t('إغلاق', 'Close')}</Button>
      </Modal>
    </>
  );
}
