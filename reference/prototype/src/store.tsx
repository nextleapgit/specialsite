import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { articles, type Article, type Copy } from './data';
import type { Attempt, Delivery } from './domain';
import { allCurricula, type Curriculum } from './curriculum-engine';
import { useAppearance } from './use-appearance';
export type DemoData = {
  version: 1;
  curricula: Curriculum[];
  attempts: Attempt[];
  connected: boolean;
  subscription: {
    active: boolean;
    confirmed: boolean;
    categories: string[];
    frequency: 'each' | 'weekly';
  };
  saved: string[];
  customArticles: Article[];
  draft: { title: string; summary: string; category: string; body: string };
  deliveries: Delivery[];
  courseDrafts: {
    id: string;
    title: string;
    language: string;
    sections: string[];
    status: 'draft' | 'published';
  }[];
};
export const freshData = (): DemoData => ({
  version: 1,
  curricula: [],
  attempts: [],
  connected: false,
  subscription: { active: false, confirmed: false, categories: [], frequency: 'each' },
  saved: [],
  customArticles: [],
  draft: { title: '', summary: '', category: articles[0].category, body: '' },
  deliveries: [],
  courseDrafts: [],
});
const KEY = 'ar-studio-demo-v1';
function preference(key: string, fallback: string) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}
function arabicCopy(text: string) {
  return text.replace(/C#|\.NET|LINQ|async\/await/g, (token) => '\u2066' + token + '\u2069');
}
function readData(): DemoData {
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (
      d?.version === 1 &&
      Array.isArray(d.attempts) &&
      Array.isArray(d.customArticles) &&
      Array.isArray(d.courseDrafts) &&
      Array.isArray(d.saved) &&
      Array.isArray(d.deliveries) &&
      d.subscription &&
      d.draft
    )
      return { ...d, curricula: Array.isArray(d.curricula) ? d.curricula : [] };
  } catch {
    /* Corrupt demo data starts fresh. */
  }
  return freshData();
}
function useModel() {
  const [data, setData] = useState<DemoData>(readData);
  const [lang, setLang] = useState<'ar' | 'en'>(() =>
    preference('ar-studio-lang', 'ar') === 'en' ? 'en' : 'ar',
  );
  const [role, setRole] = useState<'guest' | 'learner' | 'admin'>(() => {
    try {
      const r = sessionStorage.getItem('ar-demo-persona');
      return r === 'learner' || r === 'admin' ? r : 'guest';
    } catch {
      return 'guest';
    }
  });
  const appearanceModel = useAppearance(role);
  useEffect(() => {
    try {
      sessionStorage.setItem('ar-demo-persona', role);
    } catch {}
  }, [role]);
  const [scenario, setScenario] = useState<'normal' | 'loading' | 'empty' | 'error'>('normal');
  const [failure, setFailure] = useState<'none' | 'error' | 'partial'>('none');
  const [toast, setToast] = useState('');
  const [storageError, setStorageError] = useState(false);
  const t = (ar: string, en: string) => (lang === 'ar' ? arabicCopy(ar) : en);
  const c = (value: Copy) => (lang === 'ar' ? arabicCopy(value.ar) : value.en);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      setStorageError(true);
    }
  }, [data]);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    try {
      localStorage.setItem('ar-studio-lang', lang);
    } catch {}
  }, [lang]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  const update = (fn: (data: DemoData) => DemoData) => setData(fn);
  const reset = () => {
    setData(freshData());
    setRole('guest');
    setScenario('normal');
    setFailure('none');
    setToast(t('أُعيدت بيانات النموذج.', 'Demo data reset.'));
  };
  return {
    data,
    update,
    lang,
    setLang,
    ...appearanceModel,
    role,
    setRole,
    t,
    c,
    toast,
    notify: setToast,
    scenario,
    setScenario,
    failure,
    setFailure,
    reset,
    storageError,
  };
}
type Studio = ReturnType<typeof useModel>;
const StudioContext = createContext<Studio | null>(null);
export function StudioProvider({ children }: { children: ReactNode }) {
  const model = useModel();
  return <StudioContext.Provider value={model}>{children}</StudioContext.Provider>;
}
export function useStudio() {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error('StudioProvider missing');
  return ctx;
}
export const delay = () => new Promise<void>((resolve) => setTimeout(resolve, 650));
export function useCurriculum(explicitId?: string) {
  const { data } = useStudio();
  const catalog = allCurricula(data.curricula);
  const path = location.hash.split('?')[0];
  const lessonId = path.startsWith('#/lesson/') ? path.slice(9) : undefined;
  const routeId = path.startsWith('#/training/course/') ? path.slice(18) : undefined;
  return (
    catalog.find((x) => x.id === (explicitId || routeId)) ||
    catalog.find((x) => x.lessons.some((l) => l.id === lessonId)) ||
    catalog[0]
  );
}
