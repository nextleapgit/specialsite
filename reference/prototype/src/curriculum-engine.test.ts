import { describe, expect, it } from 'vitest';
import {
  allCurricula,
  approveProposal,
  proposeCurriculum,
  seedCurriculum,
} from './curriculum-engine';
import { evaluateFixture } from './domain';

const newProposal = () =>
  proposeCurriculum({
    mode: 'new',
    current: seedCurriculum,
    title: 'Practical C#',
    brief: 'Intermediate exercises',
    modules: [4, 5],
    id: 'practical',
  });
describe('expanded curriculum', () => {
  it('has 30 unique lessons across 10 populated sections', () => {
    expect(seedCurriculum.lessons).toHaveLength(30);
    expect(new Set(seedCurriculum.lessons.map((l) => l.id)).size).toBe(30);
    expect(seedCurriculum.sections).toHaveLength(10);
    for (let i = 0; i < 10; i++)
      expect(seedCurriculum.lessons.filter((l) => l.section === i)).toHaveLength(3);
  });
  it.each(seedCurriculum.lessons.slice(12))(
    'example $id satisfies the disclosed fixture contract',
    (lesson) => {
      const result = evaluateFixture(lesson.solution, lesson);
      expect(result.score).toBe(100);
      expect(result.output).toBe(lesson.expected);
    },
  );
});
describe('curriculum review and approval', () => {
  it('isolates a generated proposal from the active catalog', () => {
    const original = JSON.stringify(seedCurriculum);
    const proposal = newProposal();
    proposal.lessons[0].title = { ar: 'مراجعة', en: 'Reviewed title' };
    expect(JSON.stringify(seedCurriculum)).toBe(original);
    expect(allCurricula([])).toHaveLength(1);
    expect(proposal.lessons).toHaveLength(6);
    expect(proposal.lessons.every((l) => l.id.startsWith('practical--'))).toBe(true);
    expect(proposal.lessons.every((l) => l.section < 2)).toBe(true);
  });
  it('publishes only reviewed fields and strips the generation brief', () => {
    const result = approveProposal([], newProposal(), '2026-09-26T00:00:00Z');
    expect(allCurricula(result)).toHaveLength(2);
    expect(result[0].approvedAt).toBe('2026-09-26T00:00:00Z');
    expect(result[0]).not.toHaveProperty('brief');
  });
  it('updates an existing course without duplicating or renaming lesson identities', () => {
    const proposal = proposeCurriculum({
      mode: 'edit',
      current: seedCurriculum,
      title: 'Updated',
      brief: '',
      modules: [4, 5, 9],
      id: 'ignored',
    });
    proposal.lessons[0].explanation = { ar: 'شرح جديد', en: 'Revised explanation' };
    const updated = allCurricula(approveProposal([], proposal, 'now'))[0];
    expect(updated.revision).toBe(2);
    expect(updated.lessons.map((l) => l.id)).toEqual(seedCurriculum.lessons.map((l) => l.id));
    expect(updated.lessons[0].explanation.en).toBe('Revised explanation');
  });
  it('rejects stale approval and duplicate creation', () => {
    const edit = proposeCurriculum({
      mode: 'edit',
      current: seedCurriculum,
      title: 'Update',
      brief: '',
      modules: [0],
      id: 'ignored',
    });
    const approved = approveProposal([], edit, 'now');
    expect(() => approveProposal(approved, edit, 'later')).toThrow('revision-conflict');
    const creation = newProposal();
    expect(() => approveProposal(approveProposal([], creation, 'now'), creation, 'later')).toThrow(
      'revision-conflict',
    );
  });
  it('rejects an incomplete reviewed lesson', () => {
    const proposal = newProposal();
    proposal.lessons[0].explanation = { ar: '', en: '' };
    expect(() => approveProposal([], proposal, 'now')).toThrow('incomplete-proposal');
  });
  it('extends a newly approved course while preserving previous section mapping', () => {
    const first = approveProposal([], newProposal(), 'now')[0];
    const edit = proposeCurriculum({
      mode: 'edit',
      current: first,
      title: first.title.en,
      brief: '',
      modules: [5, 8],
      id: 'ignored',
    });
    expect(edit.lessons).toHaveLength(9);
    expect(edit.sections).toHaveLength(3);
    expect(edit.lessons.slice(6).every((l) => l.section === 2)).toBe(true);
  });
});
