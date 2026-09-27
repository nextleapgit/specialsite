import { Check, ArrowUpRight } from 'lucide-react';
import { useStudio } from './store';
import { Button, Link, PageHead, Badge } from './components';
export const palettes = [
  {
    id: 'indigo',
    name: ['نيلي تقني', 'Technical indigo'],
    description: [
      'الأقرب إلى المرجع: نيلي واضح مع أبيض نقي وكحلي عميق.',
      'Closest to the reference: clear indigo, pure white, and deep navy.',
    ],
    colors: ['#4F46E5', '#818CF8', '#FFFFFF', '#0B1020'],
  },
  {
    id: 'violet',
    name: ['بنفسجي عصري', 'Modern violet'],
    description: [
      'هوية أكثر تميزًا، تجمع البنفسجي مع درجات رمادية باردة.',
      'An expressive violet identity with cool neutral grays.',
    ],
    colors: ['#7C3AED', '#A78BFA', '#FAFAFD', '#141021'],
  },
  {
    id: 'blue',
    name: ['أزرق احترافي', 'Professional blue'],
    description: [
      'أزرق ملكي هادئ يناسب التقنية والأعمال والتدريب.',
      'A restrained royal blue for technology, business, and learning.',
    ],
    colors: ['#2563EB', '#60A5FA', '#F8FAFC', '#0B1220'],
  },
];
export function Appearance() {
  const { t, lang, palette, setPalette } = useStudio();
  return (
    <>
      <PageHead
        eyebrow="VISUAL DIRECTIONS / 01—03"
        title={t('هوية معتمدة. ومساحة لاختيارك.', 'An established identity. Room for your taste.')}
        description={t(
          'اعتمدنا الأزرق الاحترافي لهوية الموقع. يمكنك تخصيص ألوانك وخطك وطريقة القراءة من صفحة تفضيلات حسابك.',
          'Professional blue is the approved site identity. Personalize your colors, typography, and reading experience from your account preferences.',
        )}
      />
      <Link to="/preferences" className="button">
        {t('افتح تفضيلات المظهر', 'Open appearance preferences')}
        <ArrowUpRight size={16} />
      </Link>
      <div className="palette-grid">
        {palettes.map((p, i) => (
          <article
            key={p.id}
            className={`palette-card ${palette === p.id ? 'chosen' : ''}`}
            style={{ '--sample': p.colors[0] } as React.CSSProperties}
          >
            <div className="palette-sample">
              <div className="sample-nav">
                <img src="/assets/ar-monogram.png" alt="" />
                <span>Abdulnaser Ramadan</span>
                <i />
              </div>
              <div className="sample-content">
                <small>THINK. BUILD. SHARE.</small>
                <h2>
                  Better ideas.
                  <br />
                  <em>Greater impact.</em>
                </h2>
                <div className="sample-cta">
                  Explore the possibilities <ArrowUpRight size={13} />
                </div>
              </div>
              <div className="sample-dark" style={{ background: p.colors[3] }}>
                <span style={{ color: p.colors[1] }}>Aa</span>
                <span>DARK MODE</span>
              </div>
            </div>
            <div className="palette-info">
              <Badge>
                0{i + 1}
                {i === 0 ? ' / ' + t('الأقرب للمرجع', 'CLOSEST TO REFERENCE') : ''}
              </Badge>
              <h2>{p.name[lang === 'ar' ? 0 : 1]}</h2>
              <p>{p.description[lang === 'ar' ? 0 : 1]}</p>
              <div className="palette-colors">
                {p.colors.map((x) => (
                  <div key={x}>
                    <span style={{ background: x }} />
                    <code>{x}</code>
                  </div>
                ))}
              </div>
              <Button
                variant={palette === p.id ? '' : 'secondary'}
                onClick={() => setPalette(p.id)}
                aria-pressed={palette === p.id}
              >
                {palette === p.id ? <Check size={17} /> : null}
                {palette === p.id
                  ? t('قيد المعاينة', 'Currently previewing')
                  : t('جرّب هذه اللوحة', 'Preview this palette')}
              </Button>
            </div>
          </article>
        ))}
      </div>
      <div className="actions">
        <Link to="/" className="button">
          {t('شاهد الموقع بهذه الألوان', 'View the site in this palette')}
          <ArrowUpRight size={16} />
        </Link>
        <Link to="/training" className="button secondary">
          {t('شاهد الأكاديمية المستقلة', 'Visit the separate academy')}
        </Link>
      </div>
      <section className="brand-review panel">
        <div className="logo-board">
          <img src="/assets/ar-monogram.png" alt="Abdulnaser Ramadan AR monogram" />
        </div>
        <div>
          <span className="eyebrow">A DISTINCTIVE SIGNATURE</span>
          <h2>{t('توقيع بصري جديد.', 'A new visual signature.')}</h2>
          <p>
            {t(
              'مونوجرام هندسي يجمع A وR، بتكوين واضح يناسب الرأس وأيقونة الموقع. تم توليده خصيصًا لهذه الهوية.',
              'A geometric A/R monogram with a clear silhouette for the header and favicon. Generated specifically for this identity.',
            )}
          </p>
          <p className="fine-print">
            {t(
              'الرسوم واللوغو مولّدة من الصفر؛ لم نستخدم صورًا من الإنترنت.',
              'The illustrations and mark were generated from scratch; no web images were used.',
            )}
          </p>
        </div>
      </section>
    </>
  );
}
