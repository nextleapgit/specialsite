import { useState } from 'react';
import { Sparkles, Check, RotateCcw, BookOpen, WandSparkles } from 'lucide-react';
import { useStudio, delay } from './store';
import { copy } from './data';
import {
  allCurricula,
  seedCurriculum,
  proposeCurriculum,
  approveProposal,
  type Proposal,
} from './curriculum-engine';
import { Arrow, AuthGate, Badge, Button, Empty, Link, Modal, Notice, PageHead } from './components';
import { AdminNav } from './admin-pages';
export function CurriculumAssistant() {
  const { t, c, data, update, notify, failure, lang } = useStudio();
  const catalog = allCurricula(data.curricula);
  const [mode, setMode] = useState<'new' | 'edit'>('edit');
  const [target, setTarget] = useState('csharp');
  const [title, setTitle] = useState('');
  const [brief, setBrief] = useState('');
  const [modules, setModules] = useState([4, 5, 6, 7, 8, 9]);
  const [busy, setBusy] = useState(false);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [approved, setApproved] = useState('');
  const current = catalog.find((x) => x.id === target) || seedCurriculum;
  async function generate() {
    setError('');
    setBusy(true);
    setApproved('');
    await delay();
    setBusy(false);
    if (failure === 'error') {
      setError(
        t(
          'تعذّر توليد الاقتراح. لم يتغير المنهج المعتمد. حاول مجددًا.',
          'Proposal generation failed. The approved curriculum is unchanged. Please retry.',
        ),
      );
      return;
    }
    setProposal(
      proposeCurriculum({
        mode,
        current,
        title,
        brief,
        modules,
        id: `course-${crypto.randomUUID().slice(0, 8)}`,
      }),
    );
    notify(
      t('الاقتراح جاهز للمراجعة؛ لم يُعتمد بعد.', 'Proposal ready for review; not approved yet.'),
    );
  }
  function approve() {
    if (!proposal) return;
    try {
      const curricula = approveProposal(data.curricula, proposal, new Date().toISOString());
      update((d) => ({ ...d, curricula }));
      setApproved(proposal.id);
      setConfirm(false);
      setProposal(null);
      notify(
        t(
          'اعتُمد المنهج وأصبح متاحًا في الأكاديمية.',
          'Curriculum approved and available in the academy.',
        ),
      );
    } catch (e) {
      setConfirm(false);
      setError(
        (e as Error).message === 'revision-conflict'
          ? t(
              'تغير إصدار المنهج. أعد توليد الاقتراح قبل الاعتماد.',
              'The curriculum version changed. Generate a fresh proposal before approval.',
            )
          : t(
              'أكمل عنوان المنهج وعناوين الدروس والشرح والتمارين قبل الاعتماد.',
              'Complete the curriculum title and lesson titles, explanations, and exercises before approval.',
            ),
      );
    }
  }
  return (
    <AuthGate admin>
      <AdminNav />
      <PageHead
        eyebrow="CURRICULUM STUDIO / AI ASSISTANT"
        title={t('من فكرة، إلى رحلة تعلّم.', 'From an idea to a learning journey.')}
        description={t(
          'أنشئ منهجًا جديدًا أو طوّر منهجًا قائمًا. راجع المحتوى والتغييرات قبل الاعتماد، واحتفظ بسجلات التدريب السابقة.',
          'Create a new curriculum or improve an existing one. Review content and changes before approving, while preserving earlier training records.',
        )}
      />
      <Notice>
        <Sparkles size={17} />
        {t(
          'محاكاة مساعد AI داخل الـPrototype: تُركّب الاقتراحات من مكتبة C# المعدّة هنا وفق الأقسام المختارة. الملاحظات تُرفق للمراجعة ولا تُفسّر بواسطة نموذج فعلي؛ ربط مزوّد AI يكون لاحقًا في الـBackend.',
          'Prototype AI assistant simulation: proposals are assembled from this prepared C# library using your selected modules. Notes are attached for review, not interpreted by a live model; an AI provider will connect through the backend later.',
        )}
      </Notice>
      <div className="ai-workspace">
        <aside className="panel ai-brief">
          <h2>{t('موجز المنهج', 'Curriculum brief')}</h2>
          <label>
            {t('نوع العملية', 'Operation')}
            <select
              value={mode}
              disabled={busy || !!proposal}
              onChange={(e) => setMode(e.target.value as 'new' | 'edit')}
            >
              <option value="edit">{t('تطوير منهج قائم', 'Improve existing curriculum')}</option>
              <option value="new">{t('إنشاء منهج جديد', 'Create a new curriculum')}</option>
            </select>
          </label>
          {mode === 'edit' && (
            <label>
              {t('المنهج الحالي', 'Current curriculum')}
              <select
                value={target}
                disabled={busy || !!proposal}
                onChange={(e) => setTarget(e.target.value)}
              >
                {catalog.map((x) => (
                  <option value={x.id} key={x.id}>
                    {c(x.title)} · v{x.revision}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            {t('عنوان المنهج المقترح', 'Proposed curriculum title')}
            <input
              value={title}
              disabled={busy || !!proposal}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                mode === 'edit'
                  ? c(current.title)
                  : t('مثال: C# للمطور العملي', 'Example: Practical C# for developers')
              }
            />
          </label>
          <label>
            {t('الأهداف وملاحظات المراجعة', 'Goals and review notes')}
            <textarea
              rows={4}
              value={brief}
              disabled={busy || !!proposal}
              onChange={(e) => setBrief(e.target.value)}
              placeholder={t(
                'الجمهور، المستوى، الوقت المتاح، وما تريد إضافته أو تحسينه…',
                'Audience, experience, time available, and what you want to add or improve…',
              )}
            />
          </label>
          <fieldset>
            <legend>{t('مواضيع الاقتراح', 'Proposal topics')}</legend>
            <div
              className="ai-module-picks"
              tabIndex={0}
              role="region"
              aria-label={t('قائمة مواضيع الاقتراح', 'Proposal topics list')}
            >
              {seedCurriculum.sections.map((section, i) => (
                <label className="check-label" key={i}>
                  <input
                    type="checkbox"
                    disabled={busy || !!proposal}
                    checked={modules.includes(i)}
                    onChange={(e) =>
                      setModules(
                        e.target.checked
                          ? [...modules, i].sort((a, b) => a - b)
                          : modules.filter((x) => x !== i),
                      )
                    }
                  />
                  {c(section)}
                </label>
              ))}
            </div>
          </fieldset>
          <Button disabled={busy || !modules.length || !!proposal} onClick={() => void generate()}>
            <WandSparkles size={17} />
            {busy
              ? t('جارٍ تجهيز الاقتراح…', 'Preparing proposal…')
              : t('اقتراح وتوليد المنهج', 'Propose & generate curriculum')}
          </Button>
          <p className="fine-print">
            {t(
              'اللغة الحالية: C#. كل درس يتضمن شرحًا وتمرينًا وكود بداية وحلًا نموذجيًا.',
              'Current language: C#. Each lesson includes explanation, exercise, starter code, and a worked example.',
            )}
          </p>
        </aside>
        <section className="ai-proposal">
          {error && <Notice tone="error">{error}</Notice>}
          {approved && (
            <Notice tone="success">
              <h2>{t('المنهج معتمد.', 'Curriculum approved.')}</h2>
              <p>
                {t(
                  'يمكنك فتحه في صفحة الأكاديمية المستقلة الآن.',
                  'Open it in the separate academy page now.',
                )}
              </p>
              <Link
                to={approved === 'csharp' ? '/training/csharp' : '/training/course/' + approved}
                className="button"
              >
                {t('عرض المنهج المعتمد', 'View approved curriculum')}
                <Arrow />
              </Link>
            </Notice>
          )}
          {!proposal && !busy && !approved && (
            <Empty
              title={t('اقتراحك يبدأ من هنا', 'Your proposal starts here')}
              description={t(
                'اختر المواضيع ثم ولّد الاقتراح. لن تتغير الدروس الحالية إلى أن توافق عليه.',
                'Choose topics, then generate. Existing lessons stay unchanged until you approve.',
              )}
            />
          )}{' '}
          {busy && (
            <div className="panel" role="status">
              <Sparkles />
              <h2>{t('نرتّب الأفكار في مسار واضح…', 'Organizing a clear learning path…')}</h2>
              <div className="skeleton" />
              <div className="skeleton short" />
            </div>
          )}
          {proposal && (
            <div className="panel">
              <div className="section-title">
                <div>
                  <Badge tone="amber">{t('اقتراح · غير معتمد', 'PROPOSAL · NOT APPROVED')}</Badge>
                  <h2>{t('راجع، عدّل، ثم اعتمد.', 'Review. Refine. Approve.')}</h2>
                </div>
                <Badge>
                  v{proposal.baseRevision} → v{proposal.revision}
                </Badge>
              </div>
              <label>
                {t('عنوان المنهج للمراجعة', 'Review curriculum title')}
                <input
                  value={proposal.title[lang]}
                  onChange={(e) =>
                    setProposal({ ...proposal, title: copy(e.target.value, e.target.value) })
                  }
                />
              </label>
              <div className="proposal-summary">
                <span>
                  {proposal.sections.length} {t('أقسام', 'sections')}
                </span>
                <span>
                  {proposal.lessons.length} {t('دروس', 'lessons')}
                </span>
                <span>
                  {Math.round(proposal.lessons.reduce((s, l) => s + l.minutes, 0) / 60)}{' '}
                  {t('ساعات تقريبًا', 'estimated hours')}
                </span>
              </div>
              <Notice>
                <b>{t('مقارنة مع الإصدار المعتمد', 'Compared with the approved version')}</b>
                <p>
                  {proposal.targetId
                    ? `${current.lessons.length} → ${proposal.lessons.length} ${t('درسًا؛ الدروس الحالية محفوظة ويمكن تعديل محتواها أدناه.', 'lessons; existing lessons are preserved and can be edited below.')}`
                    : t(
                        'منهج جديد مستقل؛ لا يتم تعديل منهج آخر.',
                        'A new independent curriculum; no existing curriculum changes.',
                      )}
                </p>
                {proposal.brief && (
                  <p>
                    {t('ملاحظاتك', 'Your notes')}: {proposal.brief}
                  </p>
                )}
              </Notice>
              {proposal.sections.map((section, i) => (
                <details className="management-section" key={i} open={i === 0}>
                  <summary>
                    <b>
                      {String(i + 1).padStart(2, '0')} / {c(section)}
                    </b>
                    <Badge>
                      {proposal.lessons.filter((l) => l.section === i).length}{' '}
                      {t('دروس', 'lessons')}
                    </Badge>
                  </summary>
                  {proposal.lessons
                    .filter((l) => l.section === i)
                    .map((l) => (
                      <details className="proposal-lesson" key={l.id}>
                        <summary>
                          <span>
                            <BookOpen size={14} /> {c(l.title)}
                          </span>
                          <small>
                            {l.minutes} {t('د', 'min')}
                          </small>
                        </summary>
                        <div className="lesson-fields">
                          {(['title', 'explanation', 'task'] as const).map((field, index) => (
                            <label key={field}>
                              {
                                [
                                  t('عنوان الدرس', 'Lesson title'),
                                  t('الشرح', 'Explanation'),
                                  t('التمرين', 'Exercise'),
                                ][index]
                              }
                              <textarea
                                rows={field === 'title' ? 1 : 3}
                                value={l[field][lang]}
                                onChange={(e) =>
                                  setProposal({
                                    ...proposal,
                                    lessons: proposal.lessons.map((item) =>
                                      item.id === l.id
                                        ? { ...item, [field]: copy(e.target.value, e.target.value) }
                                        : item,
                                    ),
                                  })
                                }
                              />
                            </label>
                          ))}
                          <label>
                            {t('كود البداية', 'Starter code')}
                            <textarea
                              dir="ltr"
                              rows={3}
                              value={l.starter}
                              onChange={(e) =>
                                setProposal({
                                  ...proposal,
                                  lessons: proposal.lessons.map((item) =>
                                    item.id === l.id ? { ...item, starter: e.target.value } : item,
                                  ),
                                })
                              }
                            />
                          </label>
                          <details>
                            <summary>
                              {t(
                                'معاينة الحل النموذجي والنتيجة',
                                'Preview worked example and expected output',
                              )}
                            </summary>
                            <pre dir="ltr">{l.solution}</pre>
                            <code dir="ltr">{l.expected}</code>
                          </details>
                        </div>
                      </details>
                    ))}
                </details>
              ))}
              <div className="ai-actions">
                <Button onClick={() => setConfirm(true)}>
                  <Check size={17} />
                  {t('مراجعة الاعتماد', 'Review approval')}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setProposal(null);
                    setError('');
                  }}
                >
                  <RotateCcw size={17} />
                  {t('رفض الاقتراح والعودة', 'Discard proposal & return')}
                </Button>
              </div>
              <p className="fine-print">
                {t(
                  'الاعتماد يحدث فقط بعد التأكيد. تبقى درجات المحاولات السابقة محفوظة؛ التقييم ما زال محاكاة.',
                  'Approval occurs only after confirmation. Previous attempt scores remain; evaluation is still simulated.',
                )}
              </p>
            </div>
          )}
        </section>
      </div>
      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title={t('اعتماد هذا المنهج؟', 'Approve this curriculum?')}
      >
        <p>{proposal && c(proposal.title)}</p>
        <p>
          {t(
            'سيصبح المحتوى الذي راجعته هو الإصدار المعتمد في الأكاديمية. لن تُحذف سجلات التدريب السابقة.',
            'The content you reviewed becomes the approved academy version. Previous training records are preserved.',
          )}
        </p>
        <div className="actions">
          <Button onClick={approve}>
            {t('تأكيد واعتماد المنهج', 'Confirm curriculum approval')}
          </Button>
          <Button variant="secondary" onClick={() => setConfirm(false)}>
            {t('متابعة المراجعة', 'Keep reviewing')}
          </Button>
        </div>
      </Modal>
    </AuthGate>
  );
}
