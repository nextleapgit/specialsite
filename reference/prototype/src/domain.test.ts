import { describe, expect, it } from 'vitest';
import { lessons } from './data';
import {
  evaluateFixture,
  progress,
  safeReturn,
  initialDeliveries,
  settleDeliveries,
  type Attempt,
} from './domain';
describe('learning fixture contract', () => {
  it.each(lessons)('worked example for $id reaches the expected fixture output', (lesson) => {
    const result = evaluateFixture(lesson.solution, lesson);
    expect(result.score).toBe(100);
    expect(result.output).toBe(lesson.expected);
    expect(result.checks).toEqual([true, true, true, true]);
  });
  it('empty source has no successful checks', () =>
    expect(evaluateFixture('', lessons[0]).score).toBe(0));
  it('partial source produces a recoverable partial result', () =>
    expect(evaluateFixture('Console.WriteLine()', lessons[0]).score).toBe(50));
  it('never executes arbitrary submitted code', () => {
    evaluateFixture('globalThis.pwned = true;', lessons[0]);
    expect('pwned' in globalThis).toBe(false);
  });
  it('keeps best mastery when a later attempt is worse', () => {
    const attempt = (score: number): Attempt => ({
      id: String(score),
      lessonId: 'hello',
      score,
      at: '2026-09-26',
      checks: [],
      mode: 'fixture',
    });
    const result = progress([attempt(25), attempt(100)], ['hello', 'variables']);
    expect(result).toEqual({ best: { hello: 100, variables: 0 }, mastered: 1, percent: 50 });
  });
  it('empty curriculum never divides by zero', () => expect(progress([], []).percent).toBe(0));
});
describe('publishing contract', () => {
  it('website is always selected and other channels are optional', () =>
    expect(initialDeliveries(false, false).map((x) => x.status)).toEqual([
      'pending',
      'skipped',
      'skipped',
    ]));
  it('partial failure preserves website and newsletter success', () =>
    expect(
      settleDeliveries(initialDeliveries(true, true), 'partial', true).map((x) => x.status),
    ).toEqual(['success', 'success', 'failed']));
  it('retry only processes unsuccessful channels', () => {
    const partial = settleDeliveries(initialDeliveries(true, true), 'partial', true);
    const retry = settleDeliveries(partial, 'none', true);
    expect(retry.map((x) => x.attempts)).toEqual([1, 1, 2]);
    expect(retry.every((x) => x.status === 'success')).toBe(true);
  });
  it('cannot report LinkedIn success without a connected account', () =>
    expect(settleDeliveries(initialDeliveries(true, true), 'none', false)[2].status).toBe(
      'failed',
    ));
  it('website failure prevents successful downstream delivery', () =>
    expect(
      settleDeliveries(initialDeliveries(true, true), 'error', true).every(
        (x) => x.status === 'failed',
      ),
    ).toBe(true));
});
describe('redirect contract', () => {
  it.each([
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    'javascript:alert(1)',
    '/admin?next=https://evil.example',
    '/unknown',
    null,
  ])('rejects untrusted return %s', (path) => expect(safeReturn(path)).toBe('/dashboard'));
  it.each([
    '/lesson/hello',
    '/lesson/course-a8b2c901--interfaces',
    '/progress',
    '/accounts',
    '/admin/editor',
    '/admin/curriculum-ai',
  ])('allows internal route %s', (path) => expect(safeReturn(path)).toBe(path));
});
