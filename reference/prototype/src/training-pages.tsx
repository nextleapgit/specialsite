import { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  Code2,
  History,
  LockKeyhole,
  Play,
  RotateCcw,
  Terminal,
  Trophy,
  Lightbulb,
  Clock3,
} from 'lucide-react';
import { allCurricula } from './curriculum-engine';
import { evaluateFixture, progress, MASTERY_THRESHOLD } from './domain';
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
import { NotFound } from './public-pages';
export function Training() {
  const { lessons } = useCurriculum('csharp');
  const { t, data } = useStudio();
  return (
    <>
      <PageHead
        eyebrow="LEARNING STUDIO"
        title={t('تعلّم أقل تشتتًا. ابنِ أكثر.', 'Less wandering. More building.')}
        description={t(
          'مسارات تجمع الشرح الواضح بالممارسة والتقييم. تقدم على مهل، وأعد المحاولة حتى الإتقان.',
          'Clear explanations, deliberate practice, and useful feedback. Learn at your pace. Repeat until it clicks.',
        )}
      />
      <div className="learning-principles">
        {[
          [BookOpen, t('افهم الفكرة', 'Understand')],
          [Code2, t('جرّب بنفسك', 'Practice')],
          [Trophy, t('قِس تقدمك', 'Improve')],
        ].map(([Icon, text], i) => {
          const I = Icon as typeof BookOpen;
          return (
            <div key={i}>
              <span>0{i + 1}</span>
              <I size={21} />
              <b>{text as string}</b>
            </div>
          );
        })}
      </div>
      <div className="course-feature">
        <div className="course-cover generated-cover" aria-hidden="true">
          <img src="./assets/learning.jpg" alt="" width="1536" height="1024" />
        </div>
        <div className="course-info">
          <Badge tone="green">
            {t('متاح الآن · من البداية إلى المتقدم', 'AVAILABLE NOW · BEGINNER TO ADVANCED')}
          </Badge>
          <h2>{t('C#، من الفكرة إلى التطبيق.', 'C#. From foundations to practice.')}</h2>
          <p>
            {t(
              'ابدأ ببرنامجك الأول، وتدرّج إلى الدوال والكائنات وLINQ والبرمجة غير المتزامنة. كل درس ينتهي بتطبيق عملي.',
              'Go from your first program to methods, objects, LINQ, and asynchronous programming. Put every lesson into practice.',
            )}
          </p>
          <div className="course-stats">
            <span>
              <BookOpen size={16} />
              {lessons.length} {t('درسًا', 'lessons')}
            </span>
            <span>
              <Clock3 size={16} />
              {Math.round(lessons.reduce((sum, l) => sum + l.minutes, 0) / 60)}{' '}
              {t('ساعات', 'hours')}
            </span>
            <span>
              <Code2 size={16} />
              {lessons.length} {t('تمرينًا', 'exercises')}
            </span>
          </div>
          <Link to="/training/csharp" className="button">
            {t('استكشف المسار', 'Explore course')}
            <Arrow />
          </Link>
          <small>
            {t('مجاني · التسجيل مطلوب لحفظ التقدم', 'Free · Sign in to save your progress')}
          </small>
        </div>
      </div>
      {allCurricula(data.curricula)
        .filter((x) => x.id !== 'csharp')
        .map((course) => (
          <article className="approved-course" key={course.id}>
            <Badge tone="green">{t('منهج معتمد', 'APPROVED CURRICULUM')}</Badge>
            <h2>{course.title[t('ar', 'en') as 'ar' | 'en']}</h2>
            <p>
              {course.lessons.length} {t('درسًا', 'lessons')} · {course.sections.length}{' '}
              {t('أقسام', 'sections')}
            </p>
            <Link to={'/training/course/' + course.id} className="button">
              {t('استكشف المنهج', 'Explore curriculum')}
              <Arrow />
            </Link>
          </article>
        ))}
      <div className="section-title">
        <h2>{t('مساحة لمسارات جديدة', 'Room for what comes next')}</h2>
      </div>
      <div className="future-grid">
        {['Python', 'JavaScript', 'SQL'].map((name, i) => (
          <div className="future-course" key={name}>
            <span className="language-mark">{['Py', 'JS', 'SQL'][i]}</span>
            <h3>{name}</h3>
            <Badge>{t('قيد التخطيط', 'PLANNED')}</Badge>
            <p>
              {t(
                'مسار مستقبلي؛ لم يُعلن موعد الإتاحة بعد.',
                'A future path. Availability has not been announced.',
              )}
            </p>
          </div>
        ))}
      </div>
      {data.courseDrafts
        .filter((x) => x.status === 'published')
        .map((x) => (
          <Notice key={x.id}>
            {x.title} · {x.language} —{' '}
            {t(
              'معاينة بطاقة دورة منشورة من الإدارة؛ المحتوى لم يجهز بعد.',
              'Course card published from the management mockup; content is not ready yet.',
            )}
          </Notice>
        ))}
    </>
  );
}
export function Curriculum({ current, compact = false }: { current?: string; compact?: boolean }) {
  const { lessons, sections } = useCurriculum();
  const { t, c, data, role } = useStudio();
  const stats = progress(
    data.attempts,
    lessons.map((l) => l.id),
  );
  return (
    <div className={`curriculum ${compact ? 'compact' : ''}`}>
      {sections.map((s, i) => (
        <details key={i} open={compact ? undefined : true}>
          <summary>
            <span className="section-number">{String(i + 1).padStart(2, '0')}</span>
            <span>
              {c(s)}
              <small>
                {lessons.filter((l) => l.section === i).length} {t('دروس', 'lessons')}
              </small>
            </span>
            <ChevronDown size={17} />
          </summary>
          <div>
            {lessons
              .filter((l) => l.section === i)
              .map((l) => (
                <Link
                  key={l.id}
                  to={`/lesson/${l.id}`}
                  className={`lesson-link ${current === l.id ? 'active' : ''}`}
                  aria-current={current === l.id ? 'page' : undefined}
                >
                  {stats.best[l.id] >= MASTERY_THRESHOLD ? (
                    <CheckCircle2 size={17} />
                  ) : role === 'guest' ? (
                    <LockKeyhole size={15} />
                  ) : (
                    <Play size={15} />
                  )}
                  <span>{c(l.title)}</span>
                  <small>
                    {l.minutes}
                    {t('د', 'm')}
                  </small>
                </Link>
              ))}
          </div>
        </details>
      ))}
    </div>
  );
}
export function Course() {
  const { lessons, sections, title } = useCurriculum();
  const { t, c, data, role } = useStudio();
  const requested = location.hash.split('?')[0].match(/^#\/training\/course\/(.+)$/)?.[1];
  if (requested && !allCurricula(data.curricula).some((x) => x.id === requested))
    return <NotFound />;
  const stats = progress(
    data.attempts,
    lessons.map((l) => l.id),
  );
  const next = lessons.find((l) => stats.best[l.id] < MASTERY_THRESHOLD) || lessons[0];
  return (
    <>
      <Link to="/training" className="text-link back">
        {t('التدريب', 'Training')} / C#
      </Link>
      <div className="course-heading">
        <div>
          <Badge tone="green">C# / LEARNING PATH</Badge>
          <PageHead
            eyebrow="THE FOUNDATIONS SERIES"
            title={c(title)}
            description={t(
              'مسار عملي يبني أساسًا متينًا في C#. شرح مختصر، تجربة مركّزة، وملاحظات تساعدك على التحسن.',
              'A practical path to solid C# foundations. Focused explanations, hands-on exercises, and feedback to help you improve.',
            )}
          />
          <div className="actions">
            <Link to={`/lesson/${next.id}`} className="button">
              {role === 'guest'
                ? t('سجّل وابدأ التعلّم', 'Sign in & start learning')
                : stats.mastered
                  ? t('تابع التعلّم', 'Continue learning')
                  : t('ابدأ أول درس', 'Start your first lesson')}
              <Arrow />
            </Link>
            <span className="muted">
              {lessons.length} {t('درسًا', 'lessons')} · {sections.length} {t('أقسام', 'sections')}{' '}
              · {t('مجاني', 'Free')}
            </span>
          </div>
        </div>
        <div className="course-emblem" aria-hidden="true">
          C<span>#</span>
          <small>LEARN. PRACTICE. MASTER.</small>
        </div>
      </div>
      <div className="course-columns">
        <section>
          <h2>{t('رحلتك، خطوة بخطوة', 'Your path, step by step')}</h2>
          <Curriculum />
        </section>
        <aside>
          <div className="panel">
            <h3>{t('ما الذي ستتمكن منه؟', 'What you’ll be able to do')}</h3>
            {[
              t('كتابة برامج C# واضحة وقابلة للفهم', 'Write clear, understandable C# programs'),
              t(
                'التعامل مع البيانات والشروط والمجموعات',
                'Work with data, conditions, and collections',
              ),
              t('تنظيم السلوك في دوال وكائنات', 'Organize behavior into methods and objects'),
              t('فهم LINQ وasync/await', 'Understand LINQ and async/await'),
            ].map((s) => (
              <p key={s} className="check-line">
                <Check size={17} />
                {s}
              </p>
            ))}
            <hr />
            <h3>{t('قبل أن تبدأ', 'Before you start')}</h3>
            <p>
              {t(
                'لا تحتاج خبرة سابقة. لوحة مفاتيح وشاشة واسعة تجعل التطبيق أسهل. المحرر التجريبي متاح على الهاتف أيضًا.',
                'No experience required. A keyboard and a wide screen make practice easier. The demo editor also works on mobile.',
              )}
            </p>
            <Meter value={stats.percent} label={t('إتقان المسار', 'Course mastery')} />
            <p className="fine-print">
              {t(
                'الإتقان: أفضل درجة 80% أو أكثر لكل درس. التقييم هنا محاكاة.',
                'Mastery: best score of at least 80% per lesson. Evaluation is simulated here.',
              )}
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
export function LessonPage({ id }: { id: string }) {
  const { lessons } = useCurriculum();
  const lesson = lessons.find((l) => l.id === id);
  if (!lesson) return <NotFound />;
  return (
    <AuthGate>
      <LessonWorkspace key={id} id={id} />
    </AuthGate>
  );
}
function LessonWorkspace({ id }: { id: string }) {
  const { lessons, id: courseId, title: courseTitle } = useCurriculum();
  const { t, c, data, update, notify, failure } = useStudio();
  const lesson = lessons.find((l) => l.id === id)!;
  const [code, setCode] = useState(lesson.starter);
  const [autocomplete, setAutocomplete] = useState(true);
  const [busy, setBusy] = useState<'run' | 'evaluate' | null>(null);
  const [output, setOutput] = useState('');
  const [result, setResult] = useState<ReturnType<typeof evaluateFixture> | null>(null);
  const [tab, setTab] = useState<'output' | 'evaluation' | 'history'>('output');
  const [resetOpen, setResetOpen] = useState(false);
  const [error, setError] = useState('');
  const [mobileIndex, setMobileIndex] = useState(false);
  const mounted = useRef(true);
  useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );
  const stats = progress(
    data.attempts,
    lessons.map((l) => l.id),
  );
  const attempts = data.attempts.filter((a) => a.lessonId === id);
  const next = lessons[lessons.findIndex((l) => l.id === id) + 1];
  const previous = lessons[lessons.findIndex((l) => l.id === id) - 1];
  async function execute(mode: 'run' | 'evaluate') {
    if (busy) return;
    setBusy(mode);
    setError('');
    await delay();
    if (!mounted.current) return;
    setBusy(null);
    if (failure === 'error') {
      setError(
        t(
          'تعذّرت خدمة التنفيذ التجريبية. لم تُسجّل محاولة. يمكنك المحاولة مجددًا.',
          'Demo runner unavailable. No attempt was recorded. You can retry.',
        ),
      );
      return;
    }
    const evaluated = evaluateFixture(code, lesson);
    setOutput(evaluated.output);
    if (mode === 'evaluate') {
      setResult(evaluated);
      setTab('evaluation');
      update((d) => ({
        ...d,
        attempts: [
          {
            id: crypto.randomUUID(),
            lessonId: id,
            score: evaluated.score,
            checks: evaluated.checks,
            at: new Date().toISOString(),
            mode: 'fixture',
          },
          ...d.attempts,
        ],
      }));
      notify(t('حُفظت نتيجة المحاولة التجريبية', 'Demo attempt result saved'));
    } else {
      setTab('output');
      notify(t('اكتملت محاكاة التشغيل؛ لم تُسجّل درجة', 'Run simulated; no grade recorded'));
    }
  }
  function complete() {
    setCode((s) => s.replace(/Console\.?$/, 'Console.WriteLine()'));
  }
  return (
    <>
      <div className="workspace-top">
        <Link
          to={courseId === 'csharp' ? '/training/csharp' : '/training/course/' + courseId}
          className="text-link"
        >
          {c(courseTitle)}
        </Link>
        <span>/</span>
        <span>{c(lesson.title)}</span>
        <Badge tone="green">{t('مساحة التدريب', 'PRACTICE STUDIO')}</Badge>
      </div>
      <div className="lesson-workspace">
        <aside className={`lesson-sidebar ${mobileIndex ? 'show' : ''}`}>
          <h2>{t('محتوى المسار', 'Course content')}</h2>
          <Meter value={stats.percent} label={t('إتقان المسار', 'Course mastery')} />
          <Curriculum current={id} />
          <Link to="/progress" className="text-link">
            {t('عرض كل التقدم', 'View all progress')}
            <Arrow />
          </Link>
        </aside>
        <div className="lesson-main">
          <Button variant="secondary mobile-index" onClick={() => setMobileIndex(!mobileIndex)}>
            {t('عرض فهرس الدروس', 'Toggle course index')}
            <ChevronDown size={16} />
          </Button>
          <div className="lesson-title">
            <span className="eyebrow">
              SECTION {String(lesson.section + 1).padStart(2, '0')} / LESSON{' '}
              {String(lessons.indexOf(lesson) + 1).padStart(2, '0')}
            </span>
            <h1>{c(lesson.title)}</h1>
            <div className="course-stats">
              <span>
                <Clock3 size={15} />
                {lesson.minutes} {t('دقيقة', 'minutes')}
              </span>
              <span>
                {t('أفضل درجة', 'Best score')}: {stats.best[id]}%
              </span>
              {stats.best[id] >= MASTERY_THRESHOLD && (
                <Badge tone="green">
                  <Check size={13} />
                  {t('متقن', 'Mastered')}
                </Badge>
              )}
            </div>
          </div>
          <div className="lesson-explanation">
            <h2>{t('الفكرة ببساطة', 'The idea, simply')}</h2>
            <p>{c(lesson.explanation)}</p>
            <div className="exercise">
              <Lightbulb size={21} />
              <div>
                <b>{t('حان دورك', 'Your turn')}</b>
                <p>{c(lesson.task)}</p>
                <small>
                  {t('النتيجة المتوقعة', 'Expected output')}:{' '}
                  <code dir="ltr">{lesson.expected.replaceAll('\n', ' · ')}</code>
                </small>
              </div>
            </div>
          </div>
          <section className="code-workbench" aria-label={t('محرر C# تجريبي', 'Demo C# editor')}>
            <div className="workbench-toolbar">
              <span>
                <Code2 size={17} />
                Program.cs <Badge>C#</Badge>
              </span>
              <label className="switch-label">
                <input
                  type="checkbox"
                  role="switch"
                  checked={autocomplete}
                  onChange={(e) => setAutocomplete(e.target.checked)}
                />
                {t('الإكمال التلقائي', 'Autocomplete')}
              </label>
            </div>
            <div className="editor-area" dir="ltr">
              <div className="line-numbers" aria-hidden="true">
                {Array.from({ length: Math.max(8, code.split('\n').length) }, (_, i) => (
                  <span key={i}>{i + 1}</span>
                ))}
              </div>
              <label className="sr-only" htmlFor="code-editor">
                C# code
              </label>
              <textarea
                id="code-editor"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setResult(null);
                }}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                aria-describedby="editor-help"
                disabled={!!busy}
              />
            </div>
            {autocomplete && /Console\.?$/.test(code) && (
              <button className="completion" onClick={complete} type="button">
                <Code2 size={15} />
                Console.WriteLine() <small>{t('إدراج اقتراح', 'Insert suggestion')}</small>
              </button>
            )}
            <div className="workbench-actions">
              <div className="actions">
                <Button
                  onClick={() => void execute('run')}
                  disabled={!!busy || !code.trim()}
                  variant="secondary"
                >
                  <Play size={15} />
                  {busy === 'run' ? t('جارٍ التشغيل…', 'Running…') : t('تشغيل', 'Run')}
                </Button>
                <Button onClick={() => void execute('evaluate')} disabled={!!busy || !code.trim()}>
                  <CheckCircle2 size={16} />
                  {busy === 'evaluate'
                    ? t('جارٍ التقييم…', 'Evaluating…')
                    : t('تقييم وحفظ', 'Evaluate & save')}
                </Button>
              </div>
              <button
                className="icon-button"
                disabled={!!busy}
                aria-label={t('إعادة ضبط الكود', 'Reset code')}
                onClick={() => setResetOpen(true)}
              >
                <RotateCcw size={17} />
              </button>
            </div>
          </section>
          <p id="editor-help" className="fine-print">
            {t(
              'محرر شبيه بـMonaco. Tab ينتقل بين الأدوات. اقتراح واحد عند كتابة Console. التشغيل والاختبارات محاكاة محدودة، وليسا مترجم C# فعليًا.',
              'Monaco-like editor. Tab moves between controls. One suggestion after typing Console. Running and tests are limited fixtures, not a real C# compiler.',
            )}
          </p>
          {error && <Notice tone="error">{error}</Notice>}
          <section className="result-panel">
            <div
              className="result-tabs"
              role="tablist"
              aria-label={t('نتائج التدريب', 'Practice results')}
            >
              {(
                [
                  ['output', Terminal, t('المخرجات', 'Output')],
                  ['evaluation', CheckCircle2, t('التقييم', 'Evaluation')],
                  ['history', History, t('المحاولات', 'History')],
                ] as const
              ).map(([key, I, title]) => (
                <button
                  key={key}
                  id={`tab-${key}`}
                  role="tab"
                  aria-controls={`panel-${key}`}
                  aria-selected={tab === key}
                  onClick={() => setTab(key)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                      e.preventDefault();
                      const keys = ['output', 'evaluation', 'history'] as const;
                      const n = (keys.indexOf(tab) + (e.key === 'ArrowRight' ? 1 : 2)) % 3;
                      setTab(keys[n]);
                      document.getElementById(`tab-${keys[n]}`)?.focus();
                    }
                  }}
                  tabIndex={tab === key ? 0 : -1}
                >
                  <I size={16} />
                  {title}
                  {key === 'history' && <span>{attempts.length}</span>}
                </button>
              ))}
            </div>
            <div
              id={`panel-${tab}`}
              role="tabpanel"
              aria-labelledby={`tab-${tab}`}
              className="result-content"
              aria-live="polite"
            >
              {tab === 'output' ? (
                output ? (
                  <pre dir="ltr">{output}</pre>
                ) : (
                  <div className="result-placeholder">
                    <Terminal size={22} />
                    <p>
                      {t(
                        'شغّل الكود لتظهر المخرجات هنا. التشغيل لا يحفظ درجة.',
                        'Run your code to see output here. Running does not save a score.',
                      )}
                    </p>
                  </div>
                )
              ) : tab === 'evaluation' ? (
                result ? (
                  <>
                    <div className="score-row">
                      <div className={`score-circle ${result.score >= 80 ? 'passed' : ''}`}>
                        {result.score}
                        <small>/ 100</small>
                      </div>
                      <div>
                        <Badge tone={result.score >= 80 ? 'green' : 'amber'}>
                          {result.score >= 80
                            ? t('وصلت إلى الإتقان', 'Mastery achieved')
                            : t('خطوة أخرى نحو الإتقان', 'One step closer')}
                        </Badge>
                        <h3>
                          {result.score >= 80
                            ? t('أحسنت، الفكرة أصبحت أوضح.', 'Well done. Make it yours.')
                            : t('راجع التفاصيل وحاول مجددًا.', 'Review the details and try again.')}
                        </h3>
                        <p>
                          {t(
                            'درجة تجريبية مبنية على مطابقة النص، وليست حكمًا على صحة برنامج C#.',
                            'Fixture score based on text matching, not proof of C# program correctness.',
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="test-results">
                      {result.checks.map((passed, i) => (
                        <div key={i}>
                          <span>
                            {i < 2 ? t('فحص ظاهر', 'Visible check') : t('فحص مخفي', 'Hidden check')}{' '}
                            {i + 1}
                          </span>
                          <Badge tone={passed ? 'green' : 'amber'}>
                            {passed ? t('نجح', 'Passed') : t('راجع الحل', 'Needs work')}
                          </Badge>
                          {i > 1 && <LockKeyhole size={14} />}
                        </div>
                      ))}
                    </div>
                    <p className="fine-print">
                      {t(
                        'الاختبارات المخفية واجهة تمثيلية فقط؛ يجب أن تُنفّذ وتبقى سرية على الخادم لاحقًا.',
                        'Hidden checks are representational only; production tests must run and remain private on the server.',
                      )}
                    </p>
                    <div className="actions">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setResult(null);
                          setTab('output');
                          document.getElementById('code-editor')?.focus();
                        }}
                      >
                        <RotateCcw size={16} />
                        {t('محاولة جديدة', 'Try again')}
                      </Button>
                      {result.score >= 80 && next && (
                        <Link to={`/lesson/${next.id}`} className="button">
                          {t('الدرس التالي', 'Next lesson')}
                          <Arrow />
                        </Link>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="result-placeholder">
                    <CheckCircle2 size={24} />
                    <p>
                      {t(
                        'اختر «تقييم وحفظ» لعرض الدرجة وتسجيل المحاولة.',
                        'Choose Evaluate & save to see your score and record an attempt.',
                      )}
                    </p>
                  </div>
                )
              ) : (
                <AttemptHistory lessonId={id} />
              )}
            </div>
          </section>
          <details className="hint">
            <summary>
              <Lightbulb size={17} />
              {t('تحتاج تلميحًا؟', 'Need a hint?')}
            </summary>
            <p>
              {t(
                'راجع المهمة والنتيجة المتوقعة. يمكنك تحميل مثال مكتمل لتجربة حالة النجاح في النموذج.',
                'Review the task and expected output. Load the worked example to explore the success state.',
              )}
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                setCode(lesson.solution);
                setResult(null);
                notify(t('حُمّل المثال المكتمل', 'Worked example loaded'));
              }}
            >
              {t('تحميل المثال المكتمل', 'Load worked example')}
            </Button>
          </details>
          <div className="lesson-pagination">
            {previous ? (
              <Link to={`/lesson/${previous.id}`} className="text-link">
                {t('السابق', 'Previous')}: {c(previous.title)}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link to={`/lesson/${next.id}`} className="text-link">
                {t('التالي', 'Next')}: {c(next.title)}
                <Arrow />
              </Link>
            ) : (
              <Link to="/progress" className="button">
                {t('راجع رحلتك', 'Review your journey')}
                <Trophy size={17} />
              </Link>
            )}
          </div>
        </div>
      </div>
      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title={t('بدء الكود من جديد؟', 'Reset your code?')}
      >
        <p>
          {t(
            'سيعود المحرر إلى نقطة البداية. تبقى درجات المحاولات السابقة محفوظة.',
            'The editor returns to the starter code. Previous attempt scores are kept.',
          )}
        </p>
        <div className="actions">
          <Button
            onClick={() => {
              setCode(lesson.starter);
              setOutput('');
              setResult(null);
              setResetOpen(false);
            }}
          >
            {t('إعادة الضبط', 'Reset code')}
          </Button>
          <Button variant="secondary" onClick={() => setResetOpen(false)}>
            {t('إلغاء', 'Cancel')}
          </Button>
        </div>
      </Modal>
    </>
  );
}
export function AttemptHistory({ lessonId }: { lessonId?: string }) {
  const { data: curriculumData } = useStudio();
  const lessons = allCurricula(curriculumData.curricula).flatMap((x) => x.lessons);
  const { t, c, data } = useStudio();
  const attempts = data.attempts.filter((a) => !lessonId || a.lessonId === lessonId);
  return attempts.length ? (
    <div className="table-scroll">
      <table>
        <caption className="sr-only">{t('سجل المحاولات', 'Attempt history')}</caption>
        <thead>
          <tr>
            <th>{t('الدرس', 'Lesson')}</th>
            <th>{t('التاريخ والوقت', 'Date & time')}</th>
            <th>{t('الدرجة', 'Score')}</th>
            <th>{t('الحالة', 'Status')}</th>
          </tr>
        </thead>
        <tbody>
          {attempts.map((a) => (
            <tr key={a.id}>
              <td>
                <Link to={`/lesson/${a.lessonId}`}>
                  {lessons.find((l) => l.id === a.lessonId)
                    ? c(lessons.find((l) => l.id === a.lessonId)!.title)
                    : t('درس من إصدار سابق', 'Previous-version lesson')}
                </Link>
              </td>
              <td>
                <time dateTime={a.at}>
                  {new Date(a.at).toLocaleString(t('ar-SA', 'en-GB'), {
                    calendar: 'gregory',
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </time>
              </td>
              <td>
                <b>{a.score}%</b>
              </td>
              <td>
                <Badge tone={a.score >= 80 ? 'green' : 'amber'}>
                  {a.score >= 80 ? t('متقن', 'Mastered') : t('بحاجة لممارسة', 'Practicing')}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <Empty
      title={t('أول محاولة بانتظارك', 'Your first attempt awaits')}
      description={t(
        'تظهر هنا نتائج المحاولات التي تُقيّمها. يمكنك الإعادة بلا حدود.',
        'Evaluated attempts appear here. You can retry as many times as you need.',
      )}
    />
  );
}
export function Progress() {
  const [courseId, setCourseId] = useState('csharp');
  const { lessons, sections } = useCurriculum(courseId);
  const { t, c, data } = useStudio();
  const stats = progress(
    data.attempts,
    lessons.map((l) => l.id),
  );
  return (
    <AuthGate>
      <PageHead
        eyebrow="YOUR LEARNING / PROGRESS"
        title={t('كل محاولة، خطوة للأمام.', 'Every attempt is a step forward.')}
        description={t(
          'أفضل درجاتك تحدد الإتقان. جميع المحاولات تبقى في سجلك، حتى عند الإعادة.',
          'Your best scores determine mastery. Every attempt stays in your history, even when you retry.',
        )}
      />
      <label className="progress-course-select">
        {t('المسار التدريبي', 'Learning path')}
        <select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
          {allCurricula(data.curricula).map((x) => (
            <option key={x.id} value={x.id}>
              {c(x.title)}
            </option>
          ))}
        </select>
      </label>
      <div className="stat-grid">
        <div>
          <span>{t('إتقان المسار', 'Course mastery')}</span>
          <b>
            {stats.percent}
            <small>%</small>
          </b>
        </div>
        <div>
          <span>{t('دروس متقنة', 'Mastered lessons')}</span>
          <b>
            {stats.mastered}
            <small>/ {lessons.length}</small>
          </b>
        </div>
        <div>
          <span>{t('المحاولات', 'Attempts')}</span>
          <b>{data.attempts.filter((a) => lessons.some((l) => l.id === a.lessonId)).length}</b>
        </div>
        <div>
          <span>{t('عتبة الإتقان', 'Mastery threshold')}</span>
          <b>
            80<small>%</small>
          </b>
        </div>
      </div>
      <div className="progress-grid">
        {lessons.map((l) => (
          <Link to={`/lesson/${l.id}`} className="progress-card" key={l.id}>
            <span className="eyebrow">
              {String(l.section + 1).padStart(2, '0')} / {c(sections[l.section])}
            </span>
            <h3>{c(l.title)}</h3>
            <Meter value={stats.best[l.id]} label={t('أفضل نتيجة', 'Best result')} />
            <div className="article-bottom">
              <Badge tone={stats.best[l.id] >= 80 ? 'green' : ''}>
                {stats.best[l.id] >= 80
                  ? t('متقن', 'Mastered')
                  : data.attempts.some((a) => a.lessonId === l.id)
                    ? t('قيد التعلّم', 'In progress')
                    : t('لم يبدأ', 'Not started')}
              </Badge>
              <Arrow />
            </div>
          </Link>
        ))}
      </div>
      <section className="section">
        <h2>{t('سجل التدريب الكامل', 'Your full training history')}</h2>
        <AttemptHistory />
      </section>
    </AuthGate>
  );
}
