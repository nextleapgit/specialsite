import { copy, lessons, sections, type Lesson, type Copy } from './data';
import { extendedLessons, extraSections } from './extended-curriculum';
export type Curriculum = {
  id: string;
  title: Copy;
  language: string;
  revision: number;
  sections: Copy[];
  lessons: Lesson[];
  approvedAt?: string;
};
export type Proposal = Curriculum & {
  targetId: string | null;
  baseRevision: number;
  brief: string;
};
export const seedCurriculum: Curriculum = {
  id: 'csharp',
  title: copy('C# من الأساسيات إلى التطبيق', 'C# from foundations to practice'),
  language: 'C#',
  revision: 1,
  sections: [...sections, ...extraSections],
  lessons: [...lessons, ...extendedLessons],
};
export function allCurricula(overrides: Curriculum[]) {
  return [
    overrides.find((x) => x.id === 'csharp') || seedCurriculum,
    ...overrides.filter((x) => x.id !== 'csharp'),
  ];
}
export function proposeCurriculum(input: {
  mode: 'new' | 'edit';
  current: Curriculum;
  title: string;
  brief: string;
  modules: number[];
  id: string;
}): Proposal {
  const selected = input.modules.length ? input.modules : [0, 1, 2, 3];
  const chosenSections = selected.map((i) => seedCurriculum.sections[i]);
  const generated = seedCurriculum.lessons
    .filter((l) => selected.includes(l.section))
    .map((l) => ({
      ...l,
      id:
        input.mode === 'edit' && input.current.id === 'csharp'
          ? l.id
          : `${input.mode === 'edit' ? input.current.id : input.id}--${l.id}`,
      section: selected.indexOf(l.section),
    }));
  // This local provider is intentionally deterministic. It never claims to call an LLM.
  const merged =
    input.mode === 'edit'
      ? [
          ...input.current.lessons.map((l) => ({ ...l })),
          ...generated.filter((l) => !input.current.lessons.some((old) => old.id === l.id)),
        ]
      : generated;
  const resultSections = input.mode === 'edit' ? [...input.current.sections] : chosenSections;
  if (input.mode === 'edit') {
    for (const newLesson of merged.filter(
      (l) => !input.current.lessons.some((old) => old.id === l.id),
    )) {
      const heading = chosenSections[newLesson.section];
      let index = resultSections.findIndex((s) => s.en === heading.en);
      if (index < 0) {
        index = resultSections.length;
        resultSections.push(heading);
      }
      newLesson.section = index;
    }
  }
  return {
    id: input.mode === 'edit' ? input.current.id : input.id,
    targetId: input.mode === 'edit' ? input.current.id : null,
    baseRevision: input.mode === 'edit' ? input.current.revision : 0,
    revision: input.mode === 'edit' ? input.current.revision + 1 : 1,
    title: input.title ? copy(input.title, input.title) : input.current.title,
    language: 'C#',
    sections: resultSections,
    lessons: merged,
    brief: input.brief,
  };
}
export function approveProposal(
  overrides: Curriculum[],
  proposal: Proposal,
  now: string,
): Curriculum[] {
  const current = allCurricula(overrides).find((x) => x.id === proposal.targetId);
  if (proposal.targetId && current?.revision !== proposal.baseRevision)
    throw new Error('revision-conflict');
  if (
    !proposal.title.en.trim() ||
    !proposal.sections.length ||
    !proposal.lessons.length ||
    proposal.lessons.some(
      (l) => !l.title.en.trim() || !l.explanation.en.trim() || !l.task.en.trim(),
    )
  )
    throw new Error('incomplete-proposal');
  if (!proposal.targetId && allCurricula(overrides).some((x) => x.id === proposal.id))
    throw new Error('revision-conflict');
  const curriculum: Curriculum = {
    id: proposal.id,
    title: proposal.title,
    language: proposal.language,
    revision: proposal.revision,
    sections: proposal.sections,
    lessons: proposal.lessons,
  };
  return [...overrides.filter((x) => x.id !== curriculum.id), { ...curriculum, approvedAt: now }];
}
