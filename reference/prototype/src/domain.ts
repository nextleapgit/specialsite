import type { Lesson } from './data';
export type Attempt = {
  id: string;
  lessonId: string;
  score: number;
  at: string;
  checks: boolean[];
  mode: 'fixture';
};
export const MASTERY_THRESHOLD = 80;
// Deliberately a UI fixture, never a C# compiler or a security boundary.
export function evaluateFixture(source: string, lesson: Lesson) {
  const normalized = source.replace(/\s+/g, ' ').trim();
  const solution = lesson.solution.replace(/\s+/g, ' ').trim();
  const checks =
    normalized === solution
      ? [true, true, true, true]
      : lesson.tokens.map((token) => normalized.includes(token));
  return {
    checks,
    score: checks.filter(Boolean).length * 25,
    output: checks.every(Boolean)
      ? lesson.expected
      : 'Fixture: solution incomplete. Review the exercise and try again.',
  };
}
export function progress(attempts: Attempt[], ids: string[]) {
  const best = Object.fromEntries(
    ids.map((id) => [
      id,
      Math.max(0, ...attempts.filter((a) => a.lessonId === id).map((a) => a.score)),
    ]),
  );
  const mastered = ids.filter((id) => best[id] >= MASTERY_THRESHOLD).length;
  return { best, mastered, percent: ids.length ? Math.round((mastered / ids.length) * 100) : 0 };
}
export type Channel = 'website' | 'newsletter' | 'linkedin';
export type Delivery = {
  channel: Channel;
  status: 'pending' | 'success' | 'failed' | 'skipped';
  attempts: number;
};
export function initialDeliveries(newsletter: boolean, linkedin: boolean): Delivery[] {
  return [
    { channel: 'website', status: 'pending', attempts: 0 },
    { channel: 'newsletter', status: newsletter ? 'pending' : 'skipped', attempts: 0 },
    { channel: 'linkedin', status: linkedin ? 'pending' : 'skipped', attempts: 0 },
  ];
}
export function settleDeliveries(
  items: Delivery[],
  failure: 'none' | 'error' | 'partial',
  connected: boolean,
): Delivery[] {
  const websiteFailed = failure === 'error';
  return items.map((item) => {
    if (item.status === 'success' || item.status === 'skipped') return item;
    const failed =
      websiteFailed || (item.channel === 'linkedin' && (!connected || failure === 'partial'));
    return { ...item, status: failed ? 'failed' : 'success', attempts: item.attempts + 1 };
  });
}
export function safeReturn(path: string | null) {
  return path &&
    /^\/(lesson\/[a-z0-9-]+|dashboard|progress|accounts|preferences|admin(?:\/editor|\/courses|\/curriculum-ai)?)$/.test(
      path,
    )
    ? path
    : '/dashboard';
}
