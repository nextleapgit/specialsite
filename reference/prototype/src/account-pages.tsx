import { Linkedin } from './components';
import { useState } from 'react';
import { Check, Mail, ShieldCheck, Unplug, BookOpen, Bookmark, ArrowUpRight } from 'lucide-react';
import { articles } from './data';
import { progress, safeReturn } from './domain';
import { useStudio, useCurriculum, delay } from './store';
import {
  Arrow,
  AuthGate,
  Badge,
  Button,
  Empty,
  Link,
  Meter,
  Modal,
  Notice,
  PageHead,
} from './components';
export function Auth({ mode }: { mode: 'login' | 'register' | 'forgot' }) {
  const { t, setRole, failure } = useStudio();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [verification, setVerification] = useState(false);
  const params = new URLSearchParams(location.hash.split('?')[1]);
  const returnPath = safeReturn(params.get('return'));
  const target = `?return=${encodeURIComponent(returnPath)}`;
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    await delay();
    setBusy(false);
    if (failure === 'error') {
      setError(
        t('تعذّر إكمال الطلب. حاول مجددًا.', 'Could not complete the request. Please retry.'),
      );
      return;
    }
    if (mode === 'login') {
      setRole('learner');
      location.hash = returnPath;
    } else setVerification(true);
  }
  return (
    <div className="auth-layout">
      <div className="auth-story">
        <span className="eyebrow">A SPACE TO GROW</span>
        <h1>
          {t('فكّر بوضوح.', 'Think clearly.')}
          <br />
          {t('تعلّم بعمق.', 'Learn deeply.')}
          <br />
          <em>{t('ابنِ بثقة.', 'Build confidently.')}</em>
        </h1>
        <p>
          {t(
            'احفظ ما يلهمك، وتابع ما تتعلمه، واجعل كل محاولة بداية أفضل.',
            'Save what inspires you, follow your learning, and make each attempt a better beginning.',
          )}
        </p>
        <div className="signature">Abdulnaser.</div>
        <span className="auth-mark" aria-hidden="true">
          AR
        </span>
      </div>
      <div className="auth-form panel">
        <Badge>{t('تجربة الحساب', 'DEMO ACCOUNT')}</Badge>
        <h2>
          {mode === 'register'
            ? t('خطوتك الأولى تبدأ هنا.', 'Your first step starts here.')
            : mode === 'forgot'
              ? t('لنستعد الوصول.', 'Let’s restore access.')
              : t('مرحبًا بعودتك.', 'Welcome back.')}
        </h2>
        <p>
          {t(
            'استخدم بيانات وهمية. لا توجد مصادقة فعلية أو إرسال بريد.',
            'Use fictional details. There is no real authentication or email delivery.',
          )}
        </p>
        {verification ? (
          <Notice tone="success">
            <b>{t('طلبك جاهز للخطوة التالية', 'Your request is ready')}</b>
            <p>
              {mode === 'forgot'
                ? t(
                    'إذا كان البريد مسجلًا، فستصله تعليمات الاستعادة في الإنتاج.',
                    'If the address exists, production will send recovery instructions.',
                  )
                : t(
                    'في الإنتاج يصلك رابط لتأكيد البريد قبل بدء التدريب.',
                    'Production sends an email verification link before training starts.',
                  )}
            </p>
            {mode === 'register' ? (
              <Button
                onClick={() => {
                  setRole('learner');
                  location.hash = returnPath;
                }}
              >
                {t('محاكاة التأكيد والمتابعة', 'Simulate verification & continue')}
              </Button>
            ) : (
              <Link to="/login" className="button">
                {t('العودة للدخول', 'Back to sign in')}
              </Link>
            )}
          </Notice>
        ) : (
          <form onSubmit={submit}>
            {mode === 'register' && (
              <label>
                {t('الاسم', 'Name')}
                <input
                  autoComplete="name"
                  required
                  minLength={2}
                  placeholder={t('اسمك التجريبي', 'Your demo name')}
                />
              </label>
            )}
            <label>
              {t('البريد الإلكتروني', 'Email')}
              <input
                type="email"
                dir="ltr"
                autoComplete="email"
                required
                placeholder="learner@example.com"
              />
            </label>
            {mode !== 'forgot' && (
              <label>
                {t('كلمة المرور التجريبية', 'Demo password')}
                <input
                  type="password"
                  minLength={8}
                  required
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  placeholder="••••••••"
                />
                <small>
                  {t(
                    '8 أحرف على الأقل. لا تُحفظ أو تُرسل.',
                    'At least 8 characters. Never stored or transmitted.',
                  )}
                </small>
              </label>
            )}
            {mode === 'register' && (
              <label className="check-label">
                <input type="checkbox" required />
                {t(
                  'أوافق على استخدام النموذج التجريبي ببيانات وهمية.',
                  'I agree to use fictional details in this prototype.',
                )}
              </label>
            )}
            {mode === 'login' && (
              <Link to="/forgot" className="text-link">
                {t('نسيت كلمة المرور؟', 'Forgot password?')}
              </Link>
            )}
            {error && <Notice tone="error">{error}</Notice>}
            <Button type="submit" disabled={busy}>
              {busy
                ? t('جارٍ المتابعة…', 'Continuing…')
                : mode === 'login'
                  ? t('تسجيل الدخول', 'Sign in')
                  : mode === 'register'
                    ? t('إنشاء حساب', 'Create account')
                    : t('إرسال رابط الاستعادة التجريبي', 'Simulate recovery request')}
              <Arrow />
            </Button>
          </form>
        )}
        <div className="auth-divider">{t('أو استكشف مباشرة', 'OR EXPLORE DIRECTLY')}</div>
        <Button
          variant="secondary"
          onClick={() => {
            setRole('learner');
            location.hash = returnPath;
          }}
        >
          {t('دخول بحساب متدرّب تجريبي', 'Continue as demo learner')}
          <Arrow />
        </Button>
        <p>
          {mode === 'register'
            ? t('لديك حساب؟', 'Already have an account?')
            : t('جديد هنا؟', 'New here?')}{' '}
          <Link
            to={`${mode === 'register' ? '/login' : '/register'}${target}`}
            className="text-link"
          >
            {mode === 'register'
              ? t('سجّل الدخول', 'Sign in')
              : t('أنشئ حسابًا', 'Create an account')}
          </Link>
        </p>
      </div>
    </div>
  );
}
export function AccountNav() {
  const { t, role } = useStudio();
  return (
    <nav className="account-nav" aria-label={t('الحساب', 'Account')}>
      {[
        ['/dashboard', t('مساحتي', 'My space')],
        ['/progress', t('تقدم التدريب', 'Training progress')],
        ['/accounts', t('الحسابات المرتبطة', 'Connected accounts')],
        ['/preferences', t('تفضيلات المظهر', 'Appearance preferences')],
        ['/newsletter', t('تفضيلات النشرة', 'Newsletter preferences')],
        ...(role === 'admin' ? [['/admin', t('الإدارة', 'Administration')]] : []),
      ].map(([to, label]) => (
        <Link key={to} to={to} className={location.hash.split('?')[0] === '#' + to ? 'active' : ''}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
export function Dashboard() {
  const { lessons } = useCurriculum('csharp');
  const { t, c, data } = useStudio();
  const stats = progress(
    data.attempts,
    lessons.map((l) => l.id),
  );
  const next = lessons.find((l) => stats.best[l.id] < 80) || lessons[0];
  return (
    <AuthGate>
      <AccountNav />
      <PageHead
        eyebrow="YOUR PERSONAL SPACE"
        title={t('أهلًا بك، لنكمل الرحلة.', 'Welcome back. Keep your momentum.')}
        description={t(
          'قراءاتك، تدريبك، والأفكار التي تريد العودة إليها.',
          'Your reading, your learning, and the ideas you want to return to.',
        )}
      />
      <div className="stat-grid">
        <div>
          <span>{t('دروس متقنة', 'Lessons mastered')}</span>
          <b>
            {stats.mastered}
            <small>/ {lessons.length}</small>
          </b>
        </div>
        <div>
          <span>{t('محاولات التدريب', 'Practice attempts')}</span>
          <b>{data.attempts.length}</b>
        </div>
        <div>
          <span>{t('مقالات محفوظة', 'Saved articles')}</span>
          <b>{data.saved.length}</b>
        </div>
        <div>
          <span>{t('النشرة', 'Newsletter')}</span>
          <b className="stat-word">
            {data.subscription.active && data.subscription.confirmed
              ? t('مشترك', 'Subscribed')
              : t('غير مفعّلة', 'Not active')}
          </b>
        </div>
      </div>
      <div className="dashboard-grid">
        <section className="panel continue-card">
          <Badge tone="green">{t('خطوتك التالية', 'YOUR NEXT STEP')}</Badge>
          <h2>{c(next.title)}</h2>
          <p>C# Foundations · {c(lessons[lessons.indexOf(next)].title)}</p>
          <Meter value={stats.percent} label={t('إتقان مسار C#', 'C# course mastery')} />
          <Link to={`/lesson/${next.id}`} className="button">
            {t('متابعة التعلّم', 'Continue learning')}
            <Arrow />
          </Link>
        </section>
        <section className="panel">
          <h2>{t('حسابك، على طريقتك', 'Your account, your way')}</h2>
          <Link to="/accounts" className="setting-link">
            <Linkedin size={20} />
            <span>
              {t('الحسابات المرتبطة', 'Connected accounts')}
              <small>
                {data.connected
                  ? t('LinkedIn مرتبط تجريبيًا', 'LinkedIn connected in demo')
                  : t('اربط LinkedIn للنشر', 'Connect LinkedIn for publishing')}
              </small>
            </span>
            <ArrowUpRight size={18} />
          </Link>
          <Link to="/newsletter" className="setting-link">
            <Mail size={20} />
            <span>
              {t('تفضيلات النشرة', 'Newsletter preferences')}
              <small>{t('المواضيع ووتيرة الإرسال', 'Topics and delivery frequency')}</small>
            </span>
            <ArrowUpRight size={18} />
          </Link>
        </section>
      </div>
      <section className="section">
        <h2>
          <Bookmark size={22} /> {t('للعودة إليها لاحقًا', 'Worth coming back to')}
        </h2>
        {data.saved.length ? (
          <div className="saved-list">
            {data.saved.map((id) => {
              const a = [...data.customArticles, ...articles].find((x) => x.id === id);
              return a ? (
                <Link to={`/articles/${id}`} key={id} className="project-row">
                  <BookOpen />
                  <div>
                    <Badge>{a.category}</Badge>
                    <h3>{c(a.title)}</h3>
                  </div>
                  <Arrow />
                </Link>
              ) : null;
            })}
          </div>
        ) : (
          <Empty
            title={t('أفكارك المحفوظة ستظهر هنا', 'A home for your saved ideas')}
            description={t(
              'استخدم علامة الحفظ في أي مقال للعودة إليه لاحقًا.',
              'Use the bookmark on an article to return to it later.',
            )}
          >
            <Link to="/articles" className="button secondary">
              {t('استكشف المقالات', 'Explore articles')}
              <Arrow />
            </Link>
          </Empty>
        )}
      </section>
    </AuthGate>
  );
}
export function Accounts() {
  const { t, data, update, notify, failure } = useStudio();
  const [modal, setModal] = useState<'connect' | 'disconnect' | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function connect() {
    setBusy(true);
    setError('');
    await delay();
    setBusy(false);
    if (failure === 'error') {
      setError(
        t(
          'أُلغي الربط أو انتهت صلاحية الطلب. حاول مجددًا.',
          'Connection cancelled or request expired. Please retry.',
        ),
      );
      return;
    }
    update((d) => ({ ...d, connected: true }));
    setModal(null);
    notify(t('رُبط LinkedIn تجريبيًا', 'LinkedIn connected in demo'));
  }
  return (
    <AuthGate>
      <AccountNav />
      <PageHead
        eyebrow="ACCOUNT / CONNECTIONS"
        title={t('أفكارك، تصل أبعد.', 'Give your ideas a wider reach.')}
        description={t(
          'اربط حسابات النشر، وتابع حالتها من مكان واحد. LinkedIn هو وجهة النشر الافتراضية.',
          'Connect your publishing accounts and manage their status in one place. LinkedIn is the default publishing destination.',
        )}
      />
      <div className="panel connection-card">
        <div className="linkedin-icon">
          <Linkedin size={30} />
        </div>
        <div>
          <h2>
            LinkedIn <Badge tone="green">{t('الافتراضي', 'DEFAULT')}</Badge>
          </h2>
          <p>
            {data.connected
              ? t(
                  'Abdulnaser Ramadan · حساب تجريبي مرتبط',
                  'Abdulnaser Ramadan · Demo account connected',
                )
              : t(
                  'انشر مقتطفًا ورابط المقال بعد نشره على الموقع.',
                  'Publish an excerpt and article link after website publication.',
                )}
          </p>
          <Badge tone={data.connected ? 'green' : 'amber'}>
            {data.connected ? t('متصل', 'Connected') : t('غير متصل', 'Not connected')}
          </Badge>
        </div>
        <Button
          variant={data.connected ? 'secondary' : ''}
          onClick={() => setModal(data.connected ? 'disconnect' : 'connect')}
        >
          {data.connected ? t('فصل الحساب', 'Disconnect') : t('ربط LinkedIn', 'Connect LinkedIn')}
          {data.connected ? <Unplug size={17} /> : <Arrow />}
        </Button>
      </div>
      <Notice>
        <ShieldCheck size={17} />{' '}
        {t(
          'في المنتج الفعلي يتم الربط عبر موافقة LinkedIn الرسمية. لا نطلب كلمة مرور حسابك.',
          'Production connections use LinkedIn authorization. We never ask for your LinkedIn password.',
        )}
      </Notice>
      <div className="panel">
        <h2>{t('صلاحيات النشر', 'Publishing permissions')}</h2>
        <p className="check-line">
          <Check size={17} />
          {t('التعرف على الحساب الذي سيظهر باسم الكاتب', 'Identify the account used as the author')}
        </p>
        <p className="check-line">
          <Check size={17} />
          {t(
            'نشر منشور عند اختيار قناة LinkedIn وتأكيد النشر',
            'Publish a post when LinkedIn is selected and publishing is confirmed',
          )}
        </p>
        <p>
          {t(
            'يمكن فصل الحساب في أي وقت. ربط حساب المتدرّب لا يمنحه صلاحيات إدارة المقالات.',
            'Disconnect at any time. Linking a learner account does not grant article management permissions.',
          )}
        </p>
        <hr />
        <h3>{t('وجهات أخرى لاحقًا', 'More destinations, later')}</h3>
        <p className="muted">
          GitHub · YouTube ·{' '}
          {t('قيد التخطيط؛ لا توجد اتصالات فعلية.', 'Planned; no active integrations.')}
        </p>
      </div>
      <Modal
        open={modal !== null}
        onClose={() => {
          if (!busy) setModal(null);
        }}
        title={
          modal === 'connect'
            ? t('ربط LinkedIn التجريبي', 'Demo LinkedIn connection')
            : t('فصل LinkedIn؟', 'Disconnect LinkedIn?')
        }
      >
        {modal === 'connect' ? (
          <>
            <p>
              {t(
                'هذه محاكاة لنافذة الموافقة. لن يتم فتح مزوّد خارجي أو منح أي صلاحيات فعلية.',
                'This previews the consent step. No external provider opens and no real permissions are granted.',
              )}
            </p>
            <ul>
              <li>{t('قراءة اسم الحساب', 'Read account name')}</li>
              <li>
                {t(
                  'النشر باسم الحساب عند الطلب',
                  'Publish on behalf of the account when requested',
                )}
              </li>
            </ul>
            {error && <Notice tone="error">{error}</Notice>}
            <div className="actions">
              <Button onClick={() => void connect()} disabled={busy}>
                {busy
                  ? t('جارٍ الربط…', 'Connecting…')
                  : t('محاكاة الموافقة والربط', 'Simulate consent & connect')}
              </Button>
              <Button variant="secondary" disabled={busy} onClick={() => setModal(null)}>
                {t('إلغاء', 'Cancel')}
              </Button>
            </div>
          </>
        ) : (
          <>
            <p>
              {t(
                'يتوقف النشر إلى LinkedIn. المقالات المنشورة مسبقًا لن تُحذف.',
                'Future LinkedIn publishing stops. Previously published posts are not deleted.',
              )}
            </p>
            <div className="actions">
              <Button
                variant="danger"
                onClick={() => {
                  update((d) => ({ ...d, connected: false }));
                  setModal(null);
                  notify(t('فُصل الحساب', 'Account disconnected'));
                }}
              >
                {t('تأكيد الفصل', 'Confirm disconnect')}
              </Button>
              <Button variant="secondary" onClick={() => setModal(null)}>
                {t('إلغاء', 'Cancel')}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </AuthGate>
  );
}
