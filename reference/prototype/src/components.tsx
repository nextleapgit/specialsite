import { useEffect, useId, useRef, type ReactNode } from 'react';
import {
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  X,
  Check,
  AlertCircle,
  Search,
  Inbox,
  LoaderCircle,
  LockKeyhole,
} from 'lucide-react';
import { useStudio } from './store';
export function Link({
  to,
  children,
  className = '',
  ...props
}: {
  to: string;
  children: ReactNode;
  className?: string;
  [key: string]: unknown;
}) {
  return (
    <a href={routeHref(to)} className={className} {...props}>
      {children}
    </a>
  );
}
export function Arrow() {
  const { lang } = useStudio();
  return lang === 'ar' ? <ArrowLeft size={17} /> : <ArrowRight size={17} />;
}
export function Button({
  children,
  onClick,
  variant = '',
  disabled = false,
  type = 'button',
  ...rest
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
  [key: string]: unknown;
}) {
  return (
    <button
      type={type}
      className={`button ${variant}`}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
export function Badge({ children, tone = '' }: { children: ReactNode; tone?: string }) {
  return (
    <span dir="auto" className={`badge ${tone}`}>
      {children}
    </span>
  );
}
export function SectionTitle({
  number,
  title,
  to,
  label,
}: {
  number: string;
  title: string;
  to?: string;
  label?: string;
}) {
  return (
    <div className="section-title">
      <div>
        <span className="eyebrow">{number}</span>
        <h2>{title}</h2>
      </div>
      {to && (
        <Link to={to} className="text-link">
          {label}
          <Arrow />
        </Link>
      )}
    </div>
  );
}
export function PageHead({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-head">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
      {children}
    </div>
  );
}
export function Notice({ children, tone = 'info' }: { children: ReactNode; tone?: string }) {
  return (
    <div className={`notice ${tone}`} role={tone === 'error' ? 'alert' : undefined}>
      {tone === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
      <div>{children}</div>
    </div>
  );
}
export function Empty({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty">
      <Inbox size={34} />
      <h2>{title}</h2>
      <p>{description}</p>
      {children}
    </div>
  );
}
export function Loading() {
  const { t } = useStudio();
  return (
    <div className="loading" role="status">
      <LoaderCircle className="spin" />
      {t('جارٍ تحميل المحتوى…', 'Loading content…')}
      <div className="skeleton" />
      <div className="skeleton short" />
      <div className="skeleton" />
    </div>
  );
}
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-labelledby={id}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-head">
        <h2 id={id}>{title}</h2>
        <button type="button" className="icon-button" aria-label="Close" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function SearchBox({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <label className="search">
      <Search size={18} />
      <span className="sr-only">{label}</span>
      <input
        type="search"
        placeholder={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
export function OriginalArt({
  kind = 'architecture',
  large = false,
}: {
  kind?: string;
  large?: boolean;
}) {
  return (
    <div className={`art art-${kind} ${large ? 'large' : ''}`} aria-hidden="true">
      <span className="art-grid" />
      {kind === 'code' ? (
        <div className="art-code">
          <span>// make it clear.</span>
          <b>
            public <i>record</i> Idea
          </b>
          <b>{'{'}</b>
          <b>
            &nbsp; string <em>Purpose</em>;
          </b>
          <b>
            &nbsp; bool <em>WorthBuilding</em>;
          </b>
          <b>{'}'}</b>
        </div>
      ) : kind === 'transformation' ? (
        <div className="art-orbit">
          <i />
          <i />
          <i />
          <span>→</span>
        </div>
      ) : kind === 'operations' ? (
        <div className="art-chart">
          <i />
          <i />
          <i />
          <i />
          <i />
          <span>clarity → impact</span>
        </div>
      ) : (
        <div className="diagram-architecture">
          <span>BUSINESS</span>
          <div>
            <i />
            <i />
            <i />
          </div>
          <span>APPLICATION</span>
          <div>
            <i />
            <i />
          </div>
          <span>INFRASTRUCTURE</span>
        </div>
      )}
      <span className="art-caption">AR / FIELD NOTES</span>
      <ArrowUpRight className="art-arrow" size={22} />
    </div>
  );
}
export function AuthGate({ admin = false, children }: { admin?: boolean; children: ReactNode }) {
  const { role, t, setRole } = useStudio();
  if (role === 'guest')
    return (
      <div className="gate">
        <LockKeyhole size={40} />
        <PageHead
          eyebrow="YOUR LEARNING, SAVED"
          title={t('مساحتك تبدأ بحساب.', 'Your space starts with an account.')}
          description={t(
            'سجّل الدخول لحفظ المحاولات والدرجات ومتابعة رحلتك.',
            'Sign in to keep your attempts, scores, and learning progress.',
          )}
        />
        <Link
          to={`/login?return=${encodeURIComponent(location.hash.slice(1).split('?')[0])}`}
          className="button"
        >
          {t('تسجيل الدخول', 'Sign in')}
          <Arrow />
        </Link>
        <p className="muted">
          {t(
            'حساب تجريبي فقط. لا تُستخدم بيانات اعتماد حقيقية.',
            'Demo account only. Do not use real credentials.',
          )}
        </p>
      </div>
    );
  if (admin && role !== 'admin')
    return (
      <Empty
        title={t('هذه المساحة للمحرّر', 'Editor access required')}
        description={t(
          'جرّب صلاحية المحرّر لاستعراض إدارة المحتوى. هذه محاكاة للصلاحيات.',
          'Switch to the editor persona to explore content management. These permissions are simulated.',
        )}
      >
        <Button onClick={() => setRole('admin')}>
          {t('تجربة حساب المحرّر', 'Try editor persona')}
        </Button>
      </Empty>
    );
  return children;
}
export function Meter({ value, label }: { value: number; label: string }) {
  return (
    <div className="meter">
      <div>
        <span>{label}</span>
        <b>{value}%</b>
      </div>
      <progress value={value} max={100} aria-label={label} />
    </div>
  );
}
export function Linkedin({ size = 20 }: { size?: number }) {
  return (
    <span className="linkedin-mark" style={{ fontSize: size }} aria-hidden="true">
      in
    </span>
  );
}

export const academyPage = () => location.pathname.endsWith('/academy.html');
export function routeHref(to: string) {
  const isLearning = /^\/(training|lesson|progress)(\/|$)/.test(to);
  if (isLearning && !academyPage()) return './academy.html#' + to;
  if (
    academyPage() &&
    /^\/(articles|projects|about|newsletter|appearance|admin|design-system)(\/|$)/.test(to)
  )
    return './index.html#' + to;
  if (academyPage() && to === '/') return './index.html#/';
  return '#' + to;
}
export function BrandMark() {
  return (
    <span className="brand-emblem">
      <img src="./assets/ar-monogram.png" alt="" width="54" height="50" />
    </span>
  );
}

export function Art({ kind = 'architecture', large = false }: { kind?: string; large?: boolean }) {
  return (
    <div className={'art ' + (large ? 'large' : '')} aria-hidden="true">
      <img
        className="generated-art"
        src={
          './assets/' +
          (kind === 'code' || kind === 'transformation' ? 'learning' : 'systems') +
          '.jpg'
        }
        alt=""
        loading="lazy"
        width="1536"
        height="1024"
      />
    </div>
  );
}
