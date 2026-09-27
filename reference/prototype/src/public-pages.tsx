import { useState } from 'react';
import {
  Bookmark,
  Clock3,
  Check,
  Code2,
  Layers3,
  Mail,
  ArrowUpRight,
  BookOpen,
} from 'lucide-react';
import { articles, categories, projects, type Article } from './data';
import { useStudio, delay } from './store';
import {
  Art,
  Arrow,
  Badge,
  Button,
  Empty,
  Link,
  Modal,
  Notice,
  PageHead,
  SearchBox,
  SectionTitle,
} from './components';

export function ArticleCard({
  article,
  featured = false,
}: {
  article: Article;
  featured?: boolean;
}) {
  const { c, t } = useStudio();
  return (
    <article className={`article-card ${featured ? 'featured' : ''}`}>
      <Link to={`/articles/${article.id}`} className="art-link" aria-label={c(article.title)}>
        <Art kind={article.art} />
      </Link>
      <div className="article-card-body">
        <div className="card-meta">
          <span>{article.category}</span>
          <span>
            <Clock3 size={13} />
            {article.minutes} {t('د', 'min')}
          </span>
        </div>
        <h3>
          <Link to={`/articles/${article.id}`}>{c(article.title)}</Link>
        </h3>
        <p>{c(article.summary)}</p>
        <div className="article-bottom">
          <time dateTime={article.date}>
            {new Date(article.date).toLocaleDateString(t('ar-SA', 'en-GB'), {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              calendar: 'gregory',
            })}
          </time>
          <ArrowUpRight size={19} />
        </div>
      </div>
    </article>
  );
}
export function Home() {
  const { t, c, data } = useStudio();
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="availability">
            <span />
            {t('أفكار عملية. أثر حقيقي.', 'PRACTICAL IDEAS. REAL-WORLD IMPACT.')}
          </div>
          <h1>
            {t('بين التقنية والأعمال،', 'Where technology')}
            <br />
            {t('نصنع ', 'meets ')}
            <em>{t('فرقًا.', 'possibility.')}</em>
          </h1>
          <p>
            {t(
              'أنا عبد الناصر رمضان. أكتب عن بناء برمجيات أفضل، وتحويل الأفكار إلى أنظمة تعمل، وتعلّم ما يصنع الفرق.',
              'I’m Abdulnaser Ramadan. I write about building better software, turning ideas into systems that work, and learning what matters.',
            )}
          </p>
          <div className="actions">
            <Link to="/articles" className="button">
              {t('استكشف المقالات', 'Explore articles')}
              <Arrow />
            </Link>
            <Link to="/training" className="button secondary">
              {t('ابدأ رحلة التعلّم', 'Start learning')}
              <BookOpen size={17} />
            </Link>
          </div>
          <div className="hero-signature">
            <span className="signature">Abdulnaser.</span>
            <div>
              <b>{t('التقنية برؤية أوسع', 'Technology. With perspective.')}</b>
              <small>BUSINESS · ARCHITECTURE · CODE</small>
            </div>
          </div>
        </div>
        <img
          className="hero-generated"
          src="./assets/systems.jpg"
          alt=""
          width="1536"
          height="1024"
          fetchPriority="high"
        />
      </section>
      <div className="topic-strip">
        <span>{t('أكتب وأتعلّم في', 'THINKING & WRITING ABOUT')}</span>
        {categories.map((x) => (
          <Link key={x} to={`/articles?category=${encodeURIComponent(x)}`}>
            {x}
            <span>↗</span>
          </Link>
        ))}
      </div>
      <section className="section">
        <SectionTitle
          number="01 / FIELD NOTES"
          title={t('أفكار تستحق القراءة', 'A few things worth reading')}
          to="/articles"
          label={t('كل المقالات', 'All articles')}
        />
        <div className="article-grid">
          {[...data.customArticles.filter((a) => a.status === 'published'), ...articles]
            .slice(0, 3)
            .map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
        </div>
      </section>
      <section className="learning-banner">
        <div>
          <Badge tone="green">{t('تعلّم بالتطبيق', 'LEARN BY DOING')}</Badge>
          <h2>
            {t('المعرفة بداية.', 'Understanding is a start.')}
            <br />
            {t('الممارسة تصنع الإتقان.', 'Practice makes it yours.')}
          </h2>
          <p>
            {t(
              'افهم الفكرة، اكتب الكود، واكتشف ما يمكنك تحسينه. مسار C# خطوة بخطوة وبالسرعة التي تناسبك.',
              'Understand the idea. Write the code. See what you can improve. Learn C# step by step, at your own pace.',
            )}
          </p>
          <Link to="/training/csharp" className="button">
            {t('استكشف مسار C#', 'Explore the C# course')}
            <Arrow />
          </Link>
        </div>
        <div className="mini-editor" dir="ltr">
          <div>
            <i />
            <i />
            <i />
            <span>your-next-step.cs</span>
            <Code2 size={15} />
          </div>
          <pre>
            <span className="code-muted">01 // Small steps. Real progress.</span>
            {'\n'}
            <span className="code-muted">02 </span>
            <span className="code-purple">var</span> journey ={' '}
            <span className="code-purple">new</span> LearningPath();{'\n'}
            <span className="code-muted">03 </span>
            {'\n'}
            <span className="code-muted">04 </span>journey.<span className="code-green">Learn</span>
            ();{'\n'}
            <span className="code-muted">05 </span>journey.
            <span className="code-green">Practice</span>();{'\n'}
            <span className="code-muted">06 </span>journey.
            <span className="code-green">Improve</span>();
          </pre>
          <div className="editor-success">
            <Check size={15} /> Your next chapter starts here.
          </div>
        </div>
      </section>
      <section className="section">
        <SectionTitle
          number="02 / SELECTED WORK"
          title={t('من الفكرة إلى التنفيذ', 'From thinking to building')}
          to="/projects"
          label={t('استعرض المشاريع', 'View projects')}
        />
        <div className="project-grid">
          {projects.map((p) => (
            <Link to={`/projects/${p.id}`} className="project-row" key={p.id}>
              <div className="project-icon">
                <Layers3 />
              </div>
              <div>
                <span className="eyebrow">{p.category}</span>
                <h3>{c(p.name)}</h3>
                <p>{c(p.description)}</p>
              </div>
              <ArrowUpRight />
            </Link>
          ))}
        </div>
      </section>
      <NewsletterBanner />
    </>
  );
}
export function NewsletterBanner() {
  const { t } = useStudio();
  return (
    <section className="newsletter-banner">
      <div className="mail-symbol">
        <Mail size={31} />
      </div>
      <div>
        <span className="eyebrow">THE RAMADAN LETTER</span>
        <h2>{t('فكرة جديدة، تصل إليك.', 'A new perspective. In your inbox.')}</h2>
        <p>
          {t(
            'مقالات عن التقنية والأعمال والتعلّم. بلا ضجيج، وبلا رسائل زائدة.',
            'Thoughtful notes on technology, business, and learning. No noise. Just substance.',
          )}
        </p>
      </div>
      <Link to="/newsletter" className="button">
        {t('اشترك في النشرة', 'Join the newsletter')}
        <Arrow />
      </Link>
    </section>
  );
}
export function Articles() {
  const { t, data } = useStudio();
  const params = new URLSearchParams(location.hash.split('?')[1]);
  const [query, setQuery] = useState(params.get('q') || '');
  const [category, setCategory] = useState(params.get('category') || 'All');
  const [sort, setSort] = useState('new');
  const all = [...data.customArticles.filter((a) => a.status === 'published'), ...articles];
  const items = all
    .filter(
      (a) =>
        (category === 'All' || a.category === category) &&
        `${a.title.ar} ${a.title.en} ${a.summary.ar} ${a.summary.en}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) => (sort === 'short' ? a.minutes - b.minutes : b.date.localeCompare(a.date)));
  function filter(q: string, cat: string) {
    setQuery(q);
    setCategory(cat);
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (cat !== 'All') p.set('category', cat);
    history.replaceState(null, '', `#/articles${p.size ? '?' + p.toString() : ''}`);
  }
  return (
    <>
      <PageHead
        eyebrow="FIELD NOTES / ARTICLES"
        title={t('أفكار أوضح. أنظمة أفضل.', 'Clearer thinking. Better systems.')}
        description={t(
          'ملاحظات عملية عند تقاطع الأعمال والهندسة والتحول الرقمي.',
          'Practical notes at the intersection of business, engineering, and digital transformation.',
        )}
      />
      <div className="filters">
        <SearchBox
          value={query}
          onChange={(v) => filter(v, category)}
          label={t('ابحث عن فكرة أو موضوع…', 'Search for an idea or topic…')}
        />
        <label className="sort-label">
          {t('الترتيب', 'Sort')}
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="new">{t('الأحدث أولًا', 'Newest first')}</option>
            <option value="short">{t('الأقصر قراءة', 'Quick reads')}</option>
          </select>
        </label>
      </div>
      <div className="chips" aria-label={t('تصنيفات المقالات', 'Article categories')}>
        {['All', ...categories].map((cat) => (
          <button
            type="button"
            key={cat}
            className={cat === category ? 'active' : ''}
            aria-pressed={cat === category}
            onClick={() => filter(query, cat)}
          >
            {cat === 'All' ? t('كل المقالات', 'All articles') : cat}
          </button>
        ))}
      </div>
      <p className="result-count" role="status">
        {items.length} {t('مقالات للقراءة', 'articles to explore')}
      </p>
      {items.length ? (
        <div className="article-grid listing">
          {items.map((a) => (
            <ArticleCard article={a} key={a.id} />
          ))}
        </div>
      ) : (
        <Empty
          title={t('لم نجد مقالات بهذا البحث', 'No matching articles')}
          description={t(
            'جرّب كلمة أخرى أو امسح التصنيف.',
            'Try another search or clear your filters.',
          )}
        >
          <Button onClick={() => filter('', 'All')}>{t('مسح البحث', 'Clear filters')}</Button>
        </Empty>
      )}
      <NewsletterBanner />
    </>
  );
}
export function ArticleDetails({ id }: { id: string }) {
  const { t, c, data, update, notify } = useStudio();
  const a = [...data.customArticles, ...articles].find(
    (x) => x.id === id && x.status === 'published',
  );
  if (!a) return <NotFound />;
  const saved = data.saved.includes(id);
  return (
    <>
      <Link to="/articles" className="text-link back">
        {t('المقالات', 'Articles')} / {a.category}
      </Link>
      <div className="article-layout">
        <article className="long-article">
          <Badge>{a.category}</Badge>
          <h1>{c(a.title)}</h1>
          <p className="article-lead">{c(a.summary)}</p>
          <div className="author-row">
            <div className="avatar">AR</div>
            <div>
              <b>Abdulnaser Ramadan</b>
              <small>
                {a.date} · {a.minutes} {t('دقائق قراءة', 'min read')}
              </small>
            </div>
            <button
              className={`icon-button ${saved ? 'selected' : ''}`}
              aria-label={t('حفظ المقال', 'Save article')}
              aria-pressed={saved}
              onClick={() => {
                update((d) => ({
                  ...d,
                  saved: saved ? d.saved.filter((x) => x !== id) : [...d.saved, id],
                }));
                notify(
                  saved
                    ? t('أُزيل من المحفوظات', 'Removed from saved')
                    : t('حُفظ المقال', 'Article saved'),
                );
              }}
            >
              <Bookmark size={20} />
            </button>
          </div>
          <Art kind={a.art} large />
          <div className="prose">
            {a.body.map((p, i) =>
              i % 2 === 0 ? (
                <h2 id={`part-${i}`} key={i}>
                  {c(p)}
                </h2>
              ) : (
                <p key={i}>{c(p)}</p>
              ),
            )}
            <blockquote>
              {t(
                'البساطة ليست غياب التفكير، بل نتيجة التفكير الجيد.',
                'Simplicity is not the absence of thought. It is the result of careful thought.',
              )}
            </blockquote>
            <h2>{t('جرّب هذا الأسبوع', 'Try this this week')}</h2>
            <p>
              {t(
                'اختر قرارًا واحدًا في عملك. اكتب المشكلة، والبدائل، ومقياس النجاح. راجعه مع زميل قبل إضافة أداة جديدة.',
                'Choose one decision in your work. Write down the problem, alternatives, and success measure. Review it with a colleague before adding a new tool.',
              )}
            </p>
          </div>
          <Notice>
            {t('مقال تجريبي مكتوب خصيصًا للنموذج.', 'Sample article written for this prototype.')}
          </Notice>
        </article>
        <aside className="article-aside">
          <span className="eyebrow">{t('في هذا المقال', 'IN THIS ARTICLE')}</span>
          {a.body
            .filter((_, i) => i % 2 === 0)
            .map((p, i) => (
              <button
                className="toc-link"
                key={i}
                onClick={() =>
                  document.getElementById(`part-${i * 2}`)?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                {c(p)}
              </button>
            ))}
          <div className="aside-letter">
            <Mail />
            <h3>{t('لنواصل التفكير.', 'Keep thinking.')}</h3>
            <p>{t('يصلك كل مقال جديد، وفق تفضيلاتك.', 'Every new article, on your terms.')}</p>
            <Link to="/newsletter" className="button secondary">
              {t('اشترك', 'Subscribe')}
              <Arrow />
            </Link>
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              void navigator.clipboard
                ?.writeText(location.href)
                .then(() => notify(t('نُسخ رابط المقال', 'Article link copied')))
                .catch(() =>
                  notify(
                    t(
                      'تعذّر النسخ. انسخ الرابط من شريط العنوان.',
                      'Copy unavailable. Use the address bar.',
                    ),
                  ),
                );
            }}
          >
            {t('نسخ رابط المقال', 'Copy article link')}
            <ArrowUpRight size={16} />
          </Button>
        </aside>
      </div>
      <section className="section">
        <SectionTitle number="KEEP EXPLORING" title={t('قد ترغب بقراءة', 'You might also enjoy')} />
        <div className="article-grid">
          {articles
            .filter((x) => x.id !== id)
            .slice(0, 3)
            .map((x) => (
              <ArticleCard key={x.id} article={x} />
            ))}
        </div>
      </section>
    </>
  );
}
export function Projects({ id }: { id?: string }) {
  const { t, c } = useStudio();
  const p = projects.find((x) => x.id === id);
  if (id && !p) return <NotFound />;
  if (p)
    return (
      <>
        <Link to="/projects" className="text-link back">
          {t('العودة للمشاريع', 'Back to projects')}
          <Arrow />
        </Link>
        <PageHead
          eyebrow="PROJECT / CONCEPT CASE STUDY"
          title={c(p.name)}
          description={c(p.description)}
        />
        <Art kind={p.art} large />
        <div className="case-grid">
          <div>
            <span className="eyebrow">01 / CONTEXT</span>
            <h2>{t('مشكلة تستحق الحل', 'A problem worth solving')}</h2>
            <p>
              {t(
                'تتوزع المعلومات بين أدوات متعددة، فيصعب تتبع القرار ومعرفة المسؤول عن الخطوة التالية. يختبر هذا المفهوم تجربة موحدة تربط الهدف بالعمل اليومي.',
                'Information is scattered across tools, making decisions and ownership hard to trace. This concept explores one workspace connecting goals to everyday work.',
              )}
            </p>
          </div>
          <div>
            <span className="eyebrow">02 / APPROACH</span>
            <h2>{t('وضوح قبل التعقيد', 'Clarity before complexity')}</h2>
            <p>
              {t(
                'حدود واضحة، مسار أساسي قصير، وحالات استثناء يمكن فهمها. تُقاس النتائج لاحقًا بزمن إنجاز المهمة ومعدل إعادة العمل.',
                'Clear boundaries, a short primary flow, and understandable exceptions. Future validation will measure task completion time and rework rate.',
              )}
            </p>
            <div className="chips">
              {p.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          </div>
        </div>
        <Notice>
          {t(
            'دراسة حالة تصورية؛ لا تتضمن نتائج عملاء أو أرقام نجاح فعلية.',
            'Concept case study; no client outcomes or actual success metrics are claimed.',
          )}
        </Notice>
      </>
    );
  return (
    <>
      <PageHead
        eyebrow="SELECTED WORK"
        title={t('أفكار تحوّلت إلى تجارب.', 'Ideas, put into practice.')}
        description={t(
          'دراسات تصورية توضح كيف تلتقي التقنية باحتياجات العمل.',
          'Concept studies exploring where technology meets real business needs.',
        )}
      />
      <div className="project-grid">
        {projects.map((p) => (
          <article className="project-card" key={p.id}>
            <Art kind={p.art} />
            <div>
              <Badge>{p.category}</Badge>
              <h2>{c(p.name)}</h2>
              <p>{c(p.description)}</p>
              <Link to={`/projects/${p.id}`} className="text-link">
                {t('استكشف دراسة الحالة', 'Explore case study')}
                <Arrow />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
export function Newsletter() {
  const { t, data, update, notify, failure } = useStudio();
  const [email, setEmail] = useState('');
  const [selected, setSelected] = useState(
    data.subscription.categories.length ? data.subscription.categories : [...categories],
  );
  const [frequency, setFrequency] = useState<'each' | 'weekly'>(data.subscription.frequency);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [unsubscribe, setUnsubscribe] = useState(false);
  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    await delay();
    setBusy(false);
    if (failure === 'error') {
      setError(
        t(
          'تعذّر حفظ الاشتراك. حاول مجددًا؛ مدخلاتك محفوظة في النموذج.',
          'Could not save your subscription. Retry; your inputs are preserved.',
        ),
      );
      return;
    }
    update((d) => ({
      ...d,
      subscription: {
        active: true,
        confirmed: d.subscription.confirmed,
        categories: selected,
        frequency,
      },
    }));
    setPending(!data.subscription.confirmed);
    notify(t('حُفظت التفضيلات التجريبية', 'Demo preferences saved'));
  }
  return (
    <div className="newsletter-page">
      <div className="newsletter-intro">
        <div className="mail-symbol">
          <Mail size={32} />
        </div>
        <PageHead
          eyebrow="THE RAMADAN LETTER"
          title={t('مساحة هادئة للأفكار الجيدة.', 'A quiet space for good ideas.')}
          description={t(
            'تأملات عملية في هندسة البرمجيات والتحول الرقمي والأعمال، تصل مباشرة إلى بريدك.',
            'Practical perspectives on software engineering, digital transformation, and business. Delivered to your inbox.',
          )}
        />
        {[
          t('مقال جديد، فكرة قابلة للتطبيق', 'A new article. An idea you can use.'),
          t('اختر المواضيع ووتيرة الإرسال', 'Choose your topics and delivery rhythm.'),
          t('إلغاء الاشتراك في أي وقت', 'Unsubscribe whenever you like.'),
        ].map((s) => (
          <p className="check-line" key={s}>
            <Check size={18} />
            {s}
          </p>
        ))}
        <div className="letter-sample">
          <span className="eyebrow">ISSUE 001 / PREVIEW</span>
          <h3>{t('ابنِ ما يستحق أن يبقى.', 'Build something worth keeping.')}</h3>
          <p>
            {t(
              'هذا الأسبوع: كيف نقلل التعقيد دون التضحية بمرونة المستقبل؟',
              'This week: how do we reduce complexity without sacrificing future flexibility?',
            )}
          </p>
          <Link to="/articles/systems-that-scale" className="text-link">
            {t('اقرأ نموذجًا', 'Read a sample')}
            <Arrow />
          </Link>
        </div>
      </div>
      <div className="panel newsletter-form">
        <Badge tone={data.subscription.confirmed ? 'green' : ''}>
          {data.subscription.confirmed
            ? t('مشترك ومؤكد', 'Subscribed & confirmed')
            : t('مجانية دائمًا', 'ALWAYS FREE')}
        </Badge>
        <h2>{t('لنواصل التعلّم معًا.', 'Let’s keep learning together.')}</h2>
        <form onSubmit={subscribe}>
          <label>
            {t('البريد الإلكتروني', 'Email address')}
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <fieldset>
            <legend>{t('المواضيع التي تهمك', 'Topics you care about')}</legend>
            {categories.map((cat) => (
              <label className="check-label" key={cat}>
                <input
                  type="checkbox"
                  checked={selected.includes(cat)}
                  onChange={(e) =>
                    setSelected(
                      e.target.checked ? [...selected, cat] : selected.filter((x) => x !== cat),
                    )
                  }
                />
                {cat}
              </label>
            ))}
          </fieldset>
          <label>
            {t('وتيرة الإرسال', 'Delivery frequency')}
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as 'each' | 'weekly')}
            >
              <option value="each">
                {t('عند نشر كل مقال ضمن اختياراتي', 'Every new article in my topics')}
              </option>
              <option value="weekly">{t('ملخص أسبوعي', 'Weekly digest')}</option>
            </select>
          </label>
          <label className="check-label">
            <input type="checkbox" required />
            {t(
              'أوافق على استلام النشرة وفق التفضيلات أعلاه.',
              'I agree to receive the newsletter with these preferences.',
            )}
          </label>
          {error && <Notice tone="error">{error}</Notice>}
          <Button type="submit" disabled={busy || !selected.length}>
            {busy
              ? t('جارٍ الحفظ…', 'Saving…')
              : data.subscription.active
                ? t('حفظ التفضيلات', 'Save preferences')
                : t('اشترك في النشرة', 'Subscribe to the letter')}
            <Arrow />
          </Button>
          <p className="fine-print">
            {t(
              'تجربة محلية. لا يُرسل بريد فعلي ولا يُحفظ عنوان بريدك.',
              'Local demo. No email is sent and your email address is not stored.',
            )}
          </p>
        </form>
        {(pending || (data.subscription.active && !data.subscription.confirmed)) && (
          <Notice>
            <b>{t('بانتظار تأكيد البريد', 'Awaiting email confirmation')}</b>
            <p>
              {t(
                'في الإنتاج يصلك رابط تأكيد. هنا يمكنك معاينة الخطوة التالية.',
                'Production sends a confirmation link. Preview the next step here.',
              )}
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                update((d) => ({ ...d, subscription: { ...d.subscription, confirmed: true } }));
                setPending(false);
                notify(t('تم تأكيد الاشتراك التجريبي', 'Demo subscription confirmed'));
              }}
            >
              {t('محاكاة تأكيد البريد', 'Simulate email confirmation')}
            </Button>
          </Notice>
        )}
        {data.subscription.active && (
          <Button variant="ghost danger" onClick={() => setUnsubscribe(true)}>
            {t('إلغاء الاشتراك', 'Unsubscribe')}
          </Button>
        )}
      </div>
      <Modal
        open={unsubscribe}
        onClose={() => setUnsubscribe(false)}
        title={t('إلغاء الاشتراك؟', 'Unsubscribe?')}
      >
        <p>
          {t(
            'ستتوقف رسائل النشرة، ويمكنك الاشتراك مجددًا متى شئت.',
            'The newsletter will stop. You can subscribe again anytime.',
          )}
        </p>
        <div className="actions">
          <Button
            variant="danger"
            onClick={() => {
              update((d) => ({
                ...d,
                subscription: { ...d.subscription, active: false, confirmed: false },
              }));
              setPending(false);
              setUnsubscribe(false);
              notify(t('أُلغي الاشتراك', 'Unsubscribed'));
            }}
          >
            {t('تأكيد الإلغاء', 'Confirm unsubscribe')}
          </Button>
          <Button variant="secondary" onClick={() => setUnsubscribe(false)}>
            {t('الاحتفاظ بالاشتراك', 'Keep subscription')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
export function About() {
  const { t } = useStudio();
  return (
    <div className="about-page">
      <PageHead
        eyebrow="ABOUT / ABDULNASER RAMADAN"
        title={t('فضول يقود إلى أثر.', 'Curiosity, with a purpose.')}
        description={t(
          'مساحة شخصية لمشاركة الأفكار عند تقاطع الأعمال والتقنية وهندسة البرمجيات.',
          'A personal space for ideas at the intersection of business, technology, and software engineering.',
        )}
      />
      <div className="about-monogram" aria-hidden="true">
        AR<span>THINK. BUILD. SHARE.</span>
      </div>
      <div className="prose">
        <h2>{t('لماذا هذه المساحة؟', 'Why this space?')}</h2>
        <p>
          {t(
            'لأن المعرفة تصبح أكثر قيمة عندما نشاركها ونختبرها. هنا تجد مقالات للتفكير، ومشاريع للاستكشاف، وتدريبًا للتطبيق.',
            'Knowledge grows more useful when we share and test it. Here you’ll find articles to think with, projects to explore, and training to put ideas into practice.',
          )}
        </p>
        <Notice>
          {t(
            'هذه نبذة تحريرية أولية، تُستكمل بالمعلومات المهنية المعتمدة قبل الإطلاق.',
            'This introductory biography will be completed with approved professional information before launch.',
          )}
        </Notice>
      </div>
    </div>
  );
}
export function NotFound() {
  const { t } = useStudio();
  return (
    <Empty
      title={t('هذه الصفحة غير موجودة', 'This page isn’t here')}
      description={t(
        'ربما تغيّر الرابط. يمكنك البدء من الصفحة الرئيسية.',
        'The link may have changed. Start again from the homepage.',
      )}
    >
      <Link to="/" className="button">
        {t('الصفحة الرئيسية', 'Back home')}
        <Arrow />
      </Link>
    </Empty>
  );
}
