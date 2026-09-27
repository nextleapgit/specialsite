import { useState } from 'react';
import { Check, Monitor, RotateCcw, Type, Palette } from 'lucide-react';
import { useStudio } from './store';
import { AccountNav } from './account-pages';
import { AuthGate, Badge, Button, Link, Modal, Notice, PageHead } from './components';
import type { AppearanceSettings } from './preferences-model';
const colors = [
  ['blue', 'أزرق احترافي', 'Professional blue', '#2563eb'],
  ['indigo', 'نيلي تقني', 'Technical indigo', '#4f46e5'],
  ['violet', 'بنفسجي عصري', 'Modern violet', '#7c3aed'],
  ['teal', 'فيروزي هادئ', 'Calm teal', '#0f766e'],
  ['slate', 'رمادي أنيق', 'Editorial slate', '#475569'],
] as const;
export function Preferences() {
  const { t, appearance, setAppearance, resetAppearance, appearanceStorageError, notify } =
    useStudio();
  const [resetOpen, setResetOpen] = useState(false);
  return (
    <AuthGate>
      <AccountNav />
      <PageHead
        eyebrow="YOUR SPACE / PREFERENCES"
        title={t('مساحتك، كما تحبها.', 'Make this space your own.')}
        description={t(
          'ألوان تريحك، وخط يناسبك، وتجربة قراءة على طريقتك. تفضيلاتك ترافقك بين الموقع والأكاديمية.',
          'Colors you enjoy, type that feels right, and reading at your pace. Your preferences follow you across the website and academy.',
        )}
      />
      <div className="preferences-status" role="status">
        <Check size={17} />
        {appearanceStorageError
          ? t(
              'تُطبّق التغييرات الآن، لكن تعذّر حفظها على هذا الجهاز.',
              'Changes are applied, but could not be saved on this device.',
            )
          : t(
              'تُحفظ اختياراتك تلقائيًا على هذا الجهاز.',
              'Your choices are saved automatically on this device.',
            )}
      </div>
      <div className="preferences-layout">
        <div>
          <section className="panel">
            <h2>
              <Palette size={22} /> {t('الألوان والمظهر', 'Color & appearance')}
            </h2>
            <fieldset>
              <legend>{t('لوحة الألوان', 'Color palette')}</legend>
              <div className="preference-palettes">
                {colors.map(([id, ar, en, color]) => (
                  <label
                    className={`preference-option ${appearance.palette === id ? 'selected' : ''}`}
                    key={id}
                  >
                    <input
                      type="radio"
                      name="palette"
                      value={id}
                      checked={appearance.palette === id}
                      onChange={() => setAppearance({ palette: id })}
                    />
                    <span
                      className="preference-color"
                      style={{ background: color }}
                      aria-hidden="true"
                    />
                    <span>
                      {t(ar, en)}
                      {id === 'blue' && (
                        <small>{t('هوية الموقع الافتراضية', 'Site default')}</small>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>{t('وضع العرض', 'Display mode')}</legend>
              <div className="preference-segments">
                {[
                  ['light', 'فاتح', 'Light'],
                  ['dark', 'داكن', 'Dark'],
                  ['system', 'حسب الجهاز', 'System'],
                ].map(([id, ar, en]) => (
                  <label
                    className={`preference-option ${appearance.mode === id ? 'selected' : ''}`}
                    key={id}
                  >
                    <input
                      type="radio"
                      name="mode"
                      checked={appearance.mode === id}
                      onChange={() => setAppearance({ mode: id as AppearanceSettings['mode'] })}
                    />
                    {t(ar, en)}
                  </label>
                ))}
              </div>
              <p className="fine-print">
                {t(
                  '«حسب الجهاز» يتبع إعداد المظهر في جهازك تلقائيًا.',
                  'System automatically follows your device’s appearance setting.',
                )}
              </p>
            </fieldset>
          </section>
          <section className="panel">
            <h2>
              <Type size={22} /> {t('الخط والقراءة', 'Typography & reading')}
            </h2>
            <fieldset>
              <legend>{t('خط الواجهة', 'Interface font')}</legend>
              <div className="preference-fonts">
                {[
                  ['system', 'خط النظام', 'System'],
                  ['tahoma', 'تاهوما', 'Tahoma'],
                  ['arial', 'أريال', 'Arial'],
                ].map(([id, ar, en]) => (
                  <label
                    className={`preference-option ${appearance.font === id ? 'selected' : ''}`}
                    key={id}
                  >
                    <input
                      type="radio"
                      name="font"
                      checked={appearance.font === id}
                      onChange={() => setAppearance({ font: id as AppearanceSettings['font'] })}
                    />
                    <span
                      style={{
                        fontFamily: id === 'system' ? 'system-ui, sans-serif' : `${en}, sans-serif`,
                      }}
                    >
                      <b>{t(ar, en)}</b>
                      <small>
                        {t('أفكار أوضح. تعلّم أفضل.', 'Clearer ideas. Better learning.')} — Aa 123
                      </small>
                    </span>
                  </label>
                ))}
              </div>
              <p className="fine-print">
                {t(
                  'نستخدم الخطوط المتاحة على جهازك مع بديل مناسب عند غياب الخط. لا تحتاج إلى تحميل خطوط خارجية.',
                  'Uses fonts available on your device with suitable fallbacks. No external font downloads are needed.',
                )}
              </p>
            </fieldset>
            <fieldset>
              <legend>{t('حجم نص القراءة', 'Reading text size')}</legend>
              <div className="preference-segments">
                {[
                  ['standard', 'عادي', 'Standard'],
                  ['large', 'كبير', 'Large'],
                  ['extra', 'كبير جدًا', 'Extra large'],
                ].map(([id, ar, en]) => (
                  <label
                    className={`preference-option ${appearance.readingSize === id ? 'selected' : ''}`}
                    key={id}
                  >
                    <input
                      type="radio"
                      name="readingSize"
                      checked={appearance.readingSize === id}
                      onChange={() =>
                        setAppearance({ readingSize: id as AppearanceSettings['readingSize'] })
                      }
                    />
                    {t(ar, en)}
                  </label>
                ))}
              </div>
              <p className="fine-print">
                {t(
                  'يغيّر حجم نص المقالات وشرح الدروس. يبقى الكود بخط ثابت مناسب للبرمجة.',
                  'Changes article text and lesson explanations. Code keeps its dedicated monospace font.',
                )}
              </p>
            </fieldset>
          </section>
        </div>
        <aside className="preferences-preview panel">
          <span className="eyebrow">LIVE PREVIEW</span>
          <Badge>{t('يتغير مع اختياراتك', 'Updates with your choices')}</Badge>
          <h2>{t('المعرفة تبدأ بفكرة.', 'Knowledge starts with an idea.')}</h2>
          <p className="reading-sample">
            {t(
              'كل تجربة صغيرة تفتح لك بابًا لفهم أعمق. اختر مظهرًا مريحًا، ثم ركّز على ما تريد تعلّمه وبناءه.',
              'Every small experiment opens a door to deeper understanding. Choose a comfortable appearance, then focus on what you want to learn and build.',
            )}
          </p>
          <code dir="ltr">Console.WriteLine("Keep learning.");</code>
          <Link to="/training" className="button">
            {t('انتقل إلى الأكاديمية', 'Explore the academy')}
          </Link>
          <div className="preference-swatch-strip" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <p className="fine-print">
            <Monitor size={15} />{' '}
            {t('معاينة مباشرة على جميع الصفحات', 'Applied live across all pages')}
          </p>
        </aside>
      </div>
      <section className="preferences-reset panel">
        <div>
          <h2>{t('العودة إلى البداية', 'Back to the defaults')}</h2>
          <p>
            {t(
              'الأزرق الاحترافي، الوضع الفاتح، خط النظام، وحجم القراءة العادي. سجلات تدريبك تبقى محفوظة.',
              'Professional blue, light mode, system font, and standard reading size. Your training history stays intact.',
            )}
          </p>
        </div>
        <Button variant="secondary" onClick={() => setResetOpen(true)}>
          <RotateCcw size={16} />
          {t('استعادة المظهر الافتراضي', 'Restore default appearance')}
        </Button>
      </section>
      <Notice>
        {t(
          'في هذا النموذج تُحفظ التفضيلات محليًا لكل شخصية تجريبية. مزامنتها مع حساب المستخدم عبر الأجهزة تُضاف عند بناء الـBackend.',
          'In this prototype, preferences are local to each demo persona. Account synchronization across devices will be added with the backend.',
        )}
      </Notice>
      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title={t('استعادة المظهر الافتراضي؟', 'Restore default appearance?')}
      >
        <p>
          {t(
            'ستُعاد تفضيلات المظهر فقط. لن تتغير المقالات أو المحاولات أو الاشتراكات.',
            'Only appearance preferences will reset. Articles, attempts, and subscriptions will stay unchanged.',
          )}
        </p>
        <div className="actions">
          <Button
            onClick={() => {
              resetAppearance();
              setResetOpen(false);
              notify(t('استُعيد المظهر الافتراضي', 'Default appearance restored'));
            }}
          >
            {t('تأكيد الاستعادة', 'Confirm restore')}
          </Button>
          <Button variant="secondary" onClick={() => setResetOpen(false)}>
            {t('إلغاء', 'Cancel')}
          </Button>
        </div>
      </Modal>
    </AuthGate>
  );
}
