import { Linkedin } from './components';
import { useState } from 'react';
import {
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Mail,
  Plus,
  Save,
  Send,
  Globe,
  Eye,
  RotateCcw,
  Layers3,
} from 'lucide-react';
import { articles, categories, copy } from './data';
import { initialDeliveries, settleDeliveries, type Delivery } from './domain';
import { useStudio, useCurriculum, delay } from './store';
import { allCurricula } from './curriculum-engine';
import { Arrow, AuthGate, Badge, Button, Empty, Link, Modal, Notice, PageHead } from './components';
export function AdminNav() {
  const { t } = useStudio();
  return (
    <nav className="account-nav" aria-label={t('إدارة المحتوى', 'Content administration')}>
      {[
        ['/admin', t('نظرة عامة', 'Overview')],
        ['/admin/editor', t('محرر المقالات', 'Article editor')],
        ['/admin/courses', t('إدارة الدورات', 'Course management')],
        ['/admin/curriculum-ai', t('مساعد المنهج', 'Curriculum assistant')],
        ['/accounts', t('حسابات النشر', 'Publishing accounts')],
      ].map(([to, label]) => (
        <Link key={to} to={to} className={location.hash.split('?')[0] === '#' + to ? 'active' : ''}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
export function Admin() {
  const { t, c, data } = useStudio();
  const [filter, setFilter] = useState('all');
  const all = [...data.customArticles, ...articles];
  const list = all.filter((x) => filter === 'all' || x.status === filter);
  return (
    <AuthGate admin>
      <AdminNav />
      <PageHead
        eyebrow="EDITOR WORKSPACE"
        title={t('مساحة صناعة المحتوى.', 'Make something worth sharing.')}
        description={t(
          'تابع مقالاتك ومسارات التدريب ونتائج النشر عبر القنوات.',
          'Manage articles, learning paths, and publishing across your channels.',
        )}
      >
        <div className="actions">
          <Link to="/admin/editor" className="button">
            <Plus size={17} />
            {t('مقال جديد', 'New article')}
          </Link>
          <Link to="/admin/courses" className="button secondary">
            {t('إدارة الدورات', 'Manage courses')}
            <Arrow />
          </Link>
        </div>
      </PageHead>
      <Notice>
        {t(
          'لوحة تجريبية: الأرقام أدناه من بيانات هذا المتصفح فقط، وليست تحليلات جمهور حقيقي.',
          'Demo workspace: counts below come only from this browser, not real audience analytics.',
        )}
      </Notice>
      <div className="stat-grid">
        <div>
          <span>{t('مقالات منشورة', 'Published articles')}</span>
          <b>{all.filter((x) => x.status === 'published').length}</b>
        </div>
        <div>
          <span>{t('مسودة قيد العمل', 'Working drafts')}</span>
          <b>{data.draft.title ? 1 : 0}</b>
        </div>
        <div>
          <span>{t('دورات في الكتالوج', 'Courses in catalog')}</span>
          <b>{allCurricula(data.curricula).length + data.courseDrafts.length}</b>
        </div>
        <div>
          <span>{t('مهام نشر تحتاج مراجعة', 'Deliveries needing attention')}</span>
          <b>{data.deliveries.filter((d) => d.status === 'failed').length}</b>
        </div>
      </div>
      <div className="section-title">
        <h2>{t('مكتبة المقالات', 'Article library')}</h2>
        <label className="sort-label">
          {t('الحالة', 'Status')}
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">{t('الكل', 'All')}</option>
            <option value="published">{t('منشور', 'Published')}</option>
            <option value="draft">{t('مسودة', 'Draft')}</option>
          </select>
        </label>
      </div>
      {list.length ? (
        <div className="table-scroll panel">
          <table>
            <caption className="sr-only">{t('المقالات المنشورة', 'Published articles')}</caption>
            <thead>
              <tr>
                <th>{t('المقال', 'Article')}</th>
                <th>{t('التصنيف', 'Category')}</th>
                <th>{t('الحالة', 'Status')}</th>
                <th>{t('التاريخ', 'Date')}</th>
                <th>{t('الإجراء', 'Action')}</th>
              </tr>
            </thead>
            <tbody>
              {list.map((a) => (
                <tr key={a.id}>
                  <td>
                    <b>{c(a.title)}</b>
                  </td>
                  <td>{a.category}</td>
                  <td>
                    <Badge tone="green">{t('منشور', 'Published')}</Badge>
                  </td>
                  <td>{a.date}</td>
                  <td>
                    <Link to={`/articles/${a.id}`} className="text-link">
                      {t('عرض', 'View')}
                      <ArrowUpRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty
          title={t('لا توجد عناصر بهذا التصنيف', 'No items with this status')}
          description={t(
            'المسودة الحالية متاحة في محرر المقالات.',
            'Your current working draft is available in the article editor.',
          )}
        >
          <Link to="/admin/editor" className="button secondary">
            {t('فتح المحرر', 'Open editor')}
          </Link>
        </Empty>
      )}
      <section className="section">
        <h2>{t('آخر عملية نشر', 'Latest publishing operation')}</h2>
        {data.deliveries.length ? (
          <DeliverySummary items={data.deliveries} />
        ) : (
          <Empty
            title={t('لم تبدأ عملية نشر بعد', 'No publishing operation yet')}
            description={t(
              'انشر مقالًا من المحرر لمراجعة نتيجة كل قناة هنا.',
              'Publish from the editor to review each channel’s result here.',
            )}
          />
        )}
      </section>
    </AuthGate>
  );
}
function DeliverySummary({ items }: { items: Delivery[] }) {
  const { t } = useStudio();
  return (
    <div className="deliveries">
      {items.map((d) => {
        const I = d.channel === 'website' ? Globe : d.channel === 'newsletter' ? Mail : Linkedin;
        return (
          <div key={d.channel}>
            <I size={22} />
            <div>
              <b>
                {d.channel === 'website'
                  ? t('الموقع', 'Website')
                  : d.channel === 'newsletter'
                    ? t('النشرة البريدية', 'Newsletter')
                    : 'LinkedIn'}
              </b>
              <small>
                {d.status === 'success'
                  ? t(
                      'اكتملت المحاكاة؛ لم يتم إرسال خارجي',
                      'Simulation complete; no external delivery',
                    )
                  : d.status === 'failed'
                    ? t('تعذّر الإكمال؛ يمكن إعادة المحاولة', 'Could not complete; retry available')
                    : d.status === 'skipped'
                      ? t('غير محددة لهذه العملية', 'Not selected for this operation')
                      : t('بانتظار النشر على الموقع', 'Waiting for website publication')}
              </small>
            </div>
            <Badge tone={d.status === 'success' ? 'green' : d.status === 'failed' ? 'amber' : ''}>
              {d.status === 'success'
                ? t('نجاح', 'Success')
                : d.status === 'failed'
                  ? t('فشل', 'Failed')
                  : d.status === 'skipped'
                    ? t('متجاوز', 'Skipped')
                    : t('انتظار', 'Pending')}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}
export function Editor() {
  const { t, data, update, notify, failure, lang } = useStudio();
  const [draft, setDraft] = useState({ ...data.draft });
  const [preview, setPreview] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [newsletter, setNewsletter] = useState(true);
  const [linkedin, setLinkedin] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [publishedId, setPublishedId] = useState('');
  const [dirty, setDirty] = useState(false);
  function field(key: keyof typeof draft, value: string) {
    setDraft((d) => ({ ...d, [key]: value }));
    setDirty(true);
    setDeliveries([]);
    setPublishedId('');
  }
  function validate() {
    if (
      draft.title.trim().length < 8 ||
      draft.summary.trim().length < 20 ||
      draft.body.trim().length < 60
    ) {
      setError(
        t(
          'أكمل العنوان (8 أحرف)، والملخص (20 حرفًا)، والمحتوى (60 حرفًا) على الأقل.',
          'Provide a title (8 characters), excerpt (20 characters), and body (60 characters) at minimum.',
        ),
      );
      return false;
    }
    setError('');
    return true;
  }
  async function save() {
    setBusy(true);
    await delay();
    setBusy(false);
    if (failure === 'error') {
      setError(
        t(
          'تعذّر حفظ المسودة؛ نصك ما زال في المحرر.',
          'Could not save the draft; your text is still in the editor.',
        ),
      );
      return;
    }
    update((d) => ({ ...d, draft }));
    setDirty(false);
    notify(t('حُفظت المسودة محليًا', 'Draft saved locally'));
  }
  async function publish(retry = false) {
    if (busy) return;
    setBusy(true);
    await delay();
    const settled = settleDeliveries(
      retry ? deliveries : initialDeliveries(newsletter, linkedin),
      failure,
      data.connected,
    );
    const id = publishedId || `note-${crypto.randomUUID().slice(0, 8)}`;
    setDeliveries(settled);
    update((d) => ({
      ...d,
      draft,
      deliveries: settled,
      customArticles:
        settled[0].status === 'success' && !d.customArticles.some((a) => a.id === id)
          ? [
              {
                id,
                title: copy(draft.title, draft.title),
                summary: copy(draft.summary, draft.summary),
                category: draft.category,
                minutes: Math.max(1, Math.ceil(draft.body.split(/\s+/).length / 180)),
                art: 'architecture',
                date: new Date().toISOString().slice(0, 10),
                status: 'published',
                body: [
                  copy(t('الفكرة', 'The idea'), t('الفكرة', 'The idea')),
                  copy(draft.body, draft.body),
                ],
              },
              ...d.customArticles,
            ]
          : d.customArticles,
    }));
    setPublishedId(id);
    setDirty(false);
    setBusy(false);
    notify(
      t(
        'اكتملت محاولة النشر التجريبية؛ راجع نتائج القنوات',
        'Demo publishing attempt complete; review channel results',
      ),
    );
  }
  return (
    <AuthGate admin>
      <AdminNav />
      <div className="editor-heading">
        <PageHead
          eyebrow="CONTENT / ARTICLE EDITOR"
          title={t('أعطِ الفكرة مساحة.', 'Give the idea some space.')}
        />
        <div className="actions">
          <Badge tone={dirty ? 'amber' : 'green'}>
            {dirty
              ? t('تعديلات غير محفوظة', 'Unsaved changes')
              : t('محفوظ محليًا', 'Saved locally')}
          </Badge>
          <Button variant="secondary" disabled={busy} onClick={() => void save()}>
            <Save size={16} />
            {t('حفظ المسودة', 'Save draft')}
          </Button>
          <Button
            onClick={() => {
              if (validate()) setPublishOpen(true);
            }}
            disabled={busy || deliveries[0]?.status === 'success'}
          >
            <Send size={16} />
            {t('مراجعة ونشر', 'Review & publish')}
          </Button>
        </div>
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="article-editor-layout">
        <div className="panel">
          <div className="result-tabs">
            <button className={!preview ? 'active' : ''} onClick={() => setPreview(false)}>
              <FileText size={16} />
              {t('كتابة', 'Write')}
            </button>
            <button className={preview ? 'active' : ''} onClick={() => setPreview(true)}>
              <Eye size={16} />
              {t('معاينة', 'Preview')}
            </button>
          </div>
          {preview ? (
            <article className="prose editor-preview">
              <Badge>{draft.category}</Badge>
              <h1>{draft.title || t('عنوان المقال', 'Article title')}</h1>
              <p className="article-lead">{draft.summary}</p>
              <p className="preserve-lines">
                {draft.body || t('يظهر محتوى المقال هنا.', 'Your article body appears here.')}
              </p>
            </article>
          ) : (
            <div className="editor-fields">
              <label>
                {t('عنوان المقال', 'Article title')}
                <input
                  maxLength={140}
                  value={draft.title}
                  onChange={(e) => field('title', e.target.value)}
                  placeholder={t('فكرة تستحق المشاركة…', 'An idea worth sharing…')}
                />
              </label>
              <label>
                {t('ملخص المقال', 'Article excerpt')}
                <textarea
                  rows={3}
                  maxLength={320}
                  value={draft.summary}
                  onChange={(e) => field('summary', e.target.value)}
                />
                <small>{draft.summary.length}/320</small>
              </label>
              <label>
                {t('المحتوى', 'Article body')}
                <textarea
                  className="article-body-input"
                  rows={14}
                  value={draft.body}
                  onChange={(e) => field('body', e.target.value)}
                  placeholder={t(
                    'ابدأ بالمشكلة، ثم الفكرة، ثم الخطوة العملية.',
                    'Start with the problem, then the idea, then an actionable step.',
                  )}
                />
              </label>
              <p className="fine-print">
                {t(
                  'نص عادي آمن في النموذج؛ تنسيق النص الغني وإدارة الصور ضمن مرحلة الإنتاج.',
                  'Safe plain text in the prototype; rich text and asset management belong to production.',
                )}
              </p>
            </div>
          )}
        </div>
        <aside>
          <div className="panel">
            <h3>{t('تفاصيل النشر', 'Publishing details')}</h3>
            <label>
              {t('التصنيف', 'Category')}
              <select value={draft.category} onChange={(e) => field('category', e.target.value)}>
                {categories.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label>
              {t('الكاتب', 'Author')}
              <input value="Abdulnaser Ramadan" readOnly />
            </label>
            <p>
              {t('لغة المقال', 'Article language')}: {lang === 'ar' ? 'العربية' : 'English'}
            </p>
            <hr />
            <h3>{t('قائمة المراجعة', 'Before you publish')}</h3>
            {[
              [draft.title.length >= 8, t('عنوان واضح', 'A clear title')],
              [draft.summary.length >= 20, t('ملخص مفيد', 'A useful excerpt')],
              [draft.body.length >= 60, t('محتوى مكتمل', 'Complete body copy')],
            ].map(([ok, text]) => (
              <p className="check-line" key={String(text)}>
                <CheckCircle2 size={17} className={ok ? 'text-green' : 'muted'} />
                {text}
              </p>
            ))}
            <Notice>
              {t(
                'احفظ المسودة قبل مغادرة الصفحة. المحتوى المنشور يبقى في هذا المتصفح فقط.',
                'Save your draft before leaving. Published content stays in this browser only.',
              )}
            </Notice>
          </div>
          <div className="panel">
            <h3>{t('معاينة نتائج البحث', 'Search preview')}</h3>
            <small>abdulnaser.example / articles / …</small>
            <p className="text-green">{draft.title || t('عنوان المقال', 'Article title')}</p>
            <small>{draft.summary || t('يظهر الملخص هنا', 'Your excerpt appears here')}</small>
          </div>
        </aside>
      </div>
      {deliveries.length > 0 && (
        <section className="panel">
          <h2>{t('نتيجة النشر', 'Publishing result')}</h2>
          <DeliverySummary items={deliveries} />
          <div className="actions">
            {deliveries.some((x) => x.status === 'failed') && (
              <Button disabled={busy} onClick={() => void publish(true)}>
                <RotateCcw size={16} />
                {t('إعادة القنوات الفاشلة فقط', 'Retry failed channels only')}
              </Button>
            )}
            {deliveries[0].status === 'success' && (
              <Link to={`/articles/${publishedId}`} className="button secondary">
                {t('عرض المقال المنشور', 'View published article')}
                <Arrow />
              </Link>
            )}
          </div>
        </section>
      )}
      <Modal
        open={publishOpen}
        onClose={() => {
          if (!busy) setPublishOpen(false);
        }}
        title={t('فكرة واحدة، ثلاث وجهات.', 'One idea. Three destinations.')}
      >
        <p>
          {t(
            'راجع القنوات قبل النشر. الموقع يُنشر أولًا، ثم تُحاكى القنوات المختارة.',
            'Review your channels. The website publishes first, followed by simulated delivery to selected channels.',
          )}
        </p>
        <div className="publish-choice">
          <Globe />
          <label className="check-label">
            <input type="checkbox" checked disabled />
            {t('نشر على الموقع · مطلوب', 'Publish on website · required')}
          </label>
        </div>
        <div className="publish-choice">
          <Mail />
          <label className="check-label">
            <input
              type="checkbox"
              checked={newsletter}
              onChange={(e) => setNewsletter(e.target.checked)}
              disabled={busy || deliveries.length > 0}
            />
            {t('إرسال النشرة للمشتركين المؤكدين', 'Send newsletter to confirmed subscribers')}
          </label>
        </div>
        <div className="publish-choice">
          <Linkedin />
          <label className="check-label">
            <input
              type="checkbox"
              checked={linkedin}
              onChange={(e) => setLinkedin(e.target.checked)}
              disabled={busy || deliveries.length > 0}
            />
            {t('النشر على LinkedIn · الافتراضي', 'Publish on LinkedIn · default')}
          </label>
        </div>
        {linkedin && !data.connected && (
          <Notice tone="error">
            {t(
              'اربط LinkedIn من صفحة الحسابات، أو ألغِ هذه القناة للمتابعة.',
              'Connect LinkedIn in account settings, or uncheck this channel to continue.',
            )}{' '}
            <Link
              to="/accounts"
              onClick={() => {
                update((d) => ({ ...d, draft }));
                setPublishOpen(false);
              }}
              className="text-link"
            >
              {t('حفظ والذهاب للربط', 'Save & connect')}
            </Link>
          </Notice>
        )}
        <small>
          {t(
            'الإرسال يحترم التصنيف والوتيرة وإلغاء الاشتراك. لا توجد رسائل فعلية في النموذج.',
            'Delivery respects topic, frequency, and unsubscribe preferences. No real messages are sent.',
          )}
        </small>
        {deliveries.length > 0 ? (
          <>
            <DeliverySummary items={deliveries} />
            <Button variant="secondary" onClick={() => setPublishOpen(false)}>
              {t('عرض التفاصيل', 'View details')}
            </Button>
          </>
        ) : (
          <div className="actions">
            <Button disabled={busy || (linkedin && !data.connected)} onClick={() => void publish()}>
              {busy
                ? t('جارٍ النشر…', 'Publishing…')
                : t('تأكيد النشر التجريبي', 'Confirm demo publication')}
              <Send size={16} />
            </Button>
            <Button variant="secondary" disabled={busy} onClick={() => setPublishOpen(false)}>
              {t('العودة للتحرير', 'Back to editing')}
            </Button>
          </div>
        )}
      </Modal>
    </AuthGate>
  );
}
export function CourseManagement() {
  const { lessons, sections } = useCurriculum('csharp');
  const { t, c, data, update, notify, failure } = useStudio();
  const [modal, setModal] = useState(false);
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('Python');
  const [selected, setSelected] = useState('csharp');
  const [sectionName, setSectionName] = useState('');
  const [lessonModal, setLessonModal] = useState(false);
  const [lessonDraft, setLessonDraft] = useState({
    title: '',
    explanation: '',
    task: '',
    starter: '',
  });
  const [lessonSaved, setLessonSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const current = data.courseDrafts.find((x) => x.id === selected);
  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await delay();
    setBusy(false);
    if (failure === 'error') {
      notify(t('تعذّر الحفظ. حاول مجددًا.', 'Save failed. Please retry.'));
      return;
    }
    const id = crypto.randomUUID();
    update((d) => ({
      ...d,
      courseDrafts: [...d.courseDrafts, { id, title, language, sections: [], status: 'draft' }],
    }));
    setSelected(id);
    setModal(false);
    setTitle('');
    notify(t('أُنشئت مسودة الدورة', 'Course draft created'));
  }
  return (
    <AuthGate admin>
      <AdminNav />
      <PageHead
        eyebrow="LEARNING / COURSE MANAGEMENT"
        title={t('ابنِ رحلة تعلّم متكاملة.', 'Design a complete learning journey.')}
        description={t(
          'لغات، دورات، أقسام ودروس؛ بنية قابلة للتوسع بعد المسار الأول.',
          'Languages, courses, sections, and lessons. A structure that grows beyond the first course.',
        )}
      >
        <Button onClick={() => setModal(true)}>
          <Plus size={17} />
          {t('إضافة دورة', 'Add course')}
        </Button>
      </PageHead>
      <div className="ai-entry">
        <div>
          <h2>{t('مساعد تصميم المناهج بالذكاء الاصطناعي', 'AI curriculum designer')}</h2>
          <p>
            {t(
              'من فكرة إلى منهج: اقترح، راجع، عدّل، ثم اعتمد.',
              'From a brief to a curriculum: propose, review, edit, then approve.',
            )}
          </p>
        </div>
        <Link to="/admin/curriculum-ai" className="button">
          {t('افتح مساعد المنهج', 'Open curriculum assistant')}
          <Arrow />
        </Link>
      </div>
      <div className="course-management">
        <aside className="panel">
          <h2>{t('الدورات', 'Courses')}</h2>
          <button
            className={`course-select ${selected === 'csharp' ? 'active' : ''}`}
            onClick={() => setSelected('csharp')}
          >
            <CodeSymbol />
            C# Foundations<Badge tone="green">{t('منشور', 'Published')}</Badge>
          </button>
          {data.courseDrafts.map((x) => (
            <button
              className={`course-select ${selected === x.id ? 'active' : ''}`}
              key={x.id}
              onClick={() => setSelected(x.id)}
            >
              <Layers3 size={20} />
              <span>
                {x.title}
                <small>{x.language}</small>
              </span>
              <Badge>{x.status === 'draft' ? t('مسودة', 'Draft') : t('منشور', 'Published')}</Badge>
            </button>
          ))}
        </aside>
        <section className="panel">
          <div className="section-title">
            <div>
              <span className="eyebrow">{current?.language || 'C#'} / CURRICULUM</span>
              <h2>{current?.title || t('أساسيات C#', 'C# Foundations')}</h2>
            </div>
            {current && (
              <Button
                variant="secondary"
                disabled={!current.sections.length}
                onClick={() => {
                  update((d) => ({
                    ...d,
                    courseDrafts: d.courseDrafts.map((x) =>
                      x.id === selected
                        ? { ...x, status: x.status === 'draft' ? 'published' : 'draft' }
                        : x,
                    ),
                  }));
                  notify(t('حُدثت حالة بطاقة الدورة', 'Course card status updated'));
                }}
              >
                {current.status === 'draft'
                  ? t('نشر بطاقة الدورة', 'Publish course card')
                  : t('إعادة إلى مسودة', 'Return to draft')}
              </Button>
            )}
          </div>
          <Notice>
            {t(
              'نموذج إدارة: يمكنك إنشاء دورة وترتيب أقسامها. محرر الدرس معاينة مؤقتة؛ لا يغير منهج C# المنشور.',
              'Management mockup: create a course and order its sections. The lesson editor is a temporary preview; it does not change the published C# curriculum.',
            )}
          </Notice>
          {(current ? current.sections : sections.map((s) => c(s))).map((name, i) => (
            <details className="management-section" key={`${selected}-${i}`} open>
              <summary>
                <b>
                  0{i + 1} / {name}
                </b>
                <Badge>
                  {current
                    ? t('قسم مبدئي', 'Draft section')
                    : lessons.filter((l) => l.section === i).length + ' ' + t('دروس', 'lessons')}
                </Badge>
              </summary>
              {!current &&
                lessons
                  .filter((l) => l.section === i)
                  .map((l) => (
                    <div className="management-lesson" key={l.id}>
                      <span>{c(l.title)}</span>
                      <span>
                        {l.minutes} {t('د', 'min')}
                      </span>
                      <Link to={`/lesson/${l.id}`} className="text-link">
                        {t('معاينة', 'Preview')}
                        <Eye size={15} />
                      </Link>
                    </div>
                  ))}
              {current && (
                <div className="actions">
                  <Button
                    variant="ghost"
                    disabled={i === 0}
                    onClick={() =>
                      update((d) => ({
                        ...d,
                        courseDrafts: d.courseDrafts.map((x) => {
                          if (x.id !== selected) return x;
                          const ss = [...x.sections];
                          [ss[i], ss[i - 1]] = [ss[i - 1], ss[i]];
                          return { ...x, sections: ss };
                        }),
                      }))
                    }
                  >
                    {t('نقل لأعلى', 'Move up')}
                  </Button>
                </div>
              )}
              <Button
                variant="ghost"
                onClick={() => {
                  setLessonModal(true);
                  setLessonSaved(false);
                }}
              >
                <Plus size={15} />
                {t('معاينة إضافة درس', 'Preview adding a lesson')}
              </Button>
            </details>
          ))}
          {current && (
            <form
              className="inline-form"
              onSubmit={(e) => {
                e.preventDefault();
                update((d) => ({
                  ...d,
                  courseDrafts: d.courseDrafts.map((x) =>
                    x.id === selected ? { ...x, sections: [...x.sections, sectionName] } : x,
                  ),
                }));
                setSectionName('');
              }}
            >
              <label>
                {t('عنوان القسم الجديد', 'New section title')}
                <input
                  required
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                />
              </label>
              <Button type="submit">
                <Plus size={16} />
                {t('إضافة قسم', 'Add section')}
              </Button>
            </form>
          )}
          <p className="fine-print">
            {t(
              'نشر بطاقة لا يجعل دروس الدورة متاحة. تفعيل دورة كاملة يتطلب محتوى واختبارات ومراجعة في الإنتاج.',
              'Publishing a card does not make course lessons available. Activating a complete course requires content, tests, and production review.',
            )}
          </p>
        </section>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title={t('دورة جديدة', 'New course')}>
        <form onSubmit={add}>
          <label>
            {t('عنوان الدورة', 'Course title')}
            <input
              required
              minLength={3}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label>
            {t('اللغة أو المسار', 'Language or track')}
            <input
              required
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              list="languages"
            />
            <datalist id="languages">
              {['C#', 'Python', 'JavaScript', 'SQL', 'ASP.NET Core'].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </datalist>
          </label>
          <Button type="submit" disabled={busy}>
            {t('إنشاء مسودة', 'Create draft')}
          </Button>
        </form>
      </Modal>
      <Modal
        open={lessonModal}
        onClose={() => setLessonModal(false)}
        title={t('محرر الدرس · معاينة', 'Lesson editor · preview')}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setLessonSaved(true);
          }}
        >
          {(['title', 'explanation', 'task', 'starter'] as const).map((key, i) => (
            <label key={key}>
              {
                [
                  t('عنوان الدرس', 'Lesson title'),
                  t('الشرح', 'Explanation'),
                  t('التمرين', 'Exercise'),
                  t('كود البداية', 'Starter code'),
                ][i]
              }
              <textarea
                required
                value={lessonDraft[key]}
                onChange={(e) => setLessonDraft({ ...lessonDraft, [key]: e.target.value })}
                dir={key === 'starter' ? 'ltr' : undefined}
              />
            </label>
          ))}
          <Notice>
            {t(
              'عقد التقييم: 4 فحوص، درجة من 100، إتقان عند 80%. محتوى الاختبارات الفعلي يُدار على الخادم لاحقًا.',
              'Evaluation contract: 4 checks, a score out of 100, mastery at 80%. Real test contents will be managed on the server.',
            )}
          </Notice>
          <Button type="submit">{t('التحقق من النموذج', 'Validate preview')}</Button>
          {lessonSaved && (
            <Notice tone="success">
              {t(
                'الحقول مكتملة. هذه معاينة غير محفوظة ضمن الدورة.',
                'Fields are complete. This preview is not saved into the course.',
              )}
            </Notice>
          )}
        </form>
      </Modal>
    </AuthGate>
  );
}
function CodeSymbol() {
  return <span className="small-code">C#</span>;
}
