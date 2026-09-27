# Revision 2 — appearance, academy, and curriculum authoring

## Review links

- /#/appearance: three live, persistent palette options. Historical three-option gallery; Professional blue was subsequently selected as the default (see revision 3).
- /academy.html#/training: separate academy document with its own navigation and return-to-site link.
- /#/admin/curriculum-ai: editor-only proposal and approval workspace. Switch to Editor in State lab for review.

## Appearance

Option 01: technical indigo (#4F46E5 light action, #0B1020 dark canvas), closest in spirit to the inspected reference. Option 02: modern violet (#7C3AED, #141021). Option 03: professional blue (#2563EB, #0B1220). These are designed palette choices, not claimed exact sampled reference values. Actual accessible dark-mode action colors are lighter than the primary swatches.

Professional blue is now the approved default; five personal palette choices are available in /preferences. tokens.css owns spacing/typography and fallback values; palettes.css overrides semantic color tokens, imported by revision.css. Logos and artwork were generated from scratch using the built-in tool; see 08-generated-assets.md for originals and exact prompts.

## Academy boundary

The build emits index.html and academy.html. Navigation to training, lessons, or progress loads academy.html; old website hash links redirect there. Shared code, demo data, locale, appearance, and mock persona survive this document navigation. Persona is in sessionStorage (ar-demo-persona), not a production auth token. Local data is shared by all demo personas. Back-to-site loads index.html.

Thirty bilingual C# lessons are organized in ten sections. Additional material covers interfaces, inheritance, records, generics, dictionaries, sets, delegates, closures, extension methods, nullable types, pattern matching, JSON, cancellation, parallel tasks, disposal, validation, unit testing, and an integration exercise. Each has an explanation, exercise, starter, worked example and expected fixture output. Examples are prototype lesson content; their textual fixture success is not evidence of compilation.

## AI authoring flow and state matrix

| State               | Interaction                                                      | Effect                                                   |
| ------------------- | ---------------------------------------------------------------- | -------------------------------------------------------- |
| Brief               | New/existing curriculum, title, notes, module selection          | No active data change                                    |
| Generating          | Disabled controls, progress status                               | Deterministic local provider; error can be injected      |
| Failed              | Error + retry                                                    | Published curriculum unchanged                           |
| Proposed            | Section/lesson preview and editable lesson content               | Ephemeral proposal only                                  |
| Reviewing           | Inspect counts/revision, edit title/explanation/exercise/starter | Active curriculum unchanged                              |
| Approval modal      | Keep reviewing or explicit confirm                               | Cancel has no effect                                     |
| Approved            | Version increases; academy link                                  | Reviewed content persisted to local curriculum overrides |
| Conflict/incomplete | Recoverable validation error                                     | No replacement of approved version                       |
| Discarded           | Return to brief                                                  | No change to current curriculum or training records      |

The prototype **does not call an AI model**. Selected modules assemble prepared C# material; free-text notes are attached for reviewer context and are not interpreted. This is disclosed beside the workflow. Existing lessons retain identity and content until the editor changes them. Approval replaces the active local version while retaining attempt records. Newly approved courses receive independent lesson identities and become learnable cards. Progress allows choosing the active course.

## Future backend derivation

Add CurriculumRevision (draft/proposed/approved/superseded), GenerationRequest, GenerationRun, ProposalChange and ApprovalRecord. Stable Course/Lesson IDs are separate from immutable lesson/exercise versions. Store reviewer, timestamp, provider/model, prompt-template version, input hashes, schema version, generation status and token/cost accounting server-side. Approval uses an expected base version/ETag and a transaction; duplicate requests require idempotency keys. Attempts must bind to the immutable exercise version used, so later teaching edits do not silently change historical grades.

The production AI provider receives a structured brief (audience, proficiency, objectives, language, duration, selected topics, existing revision) and returns a schema-validated course proposal. Validate unique identities, references, nonempty bilingual content, prerequisite graph, code/examples/tests, allowed resource limits and assessment coverage. Treat prompts, existing content, and generated content as untrusted. Never execute generated code on the application server. Compile and test examples in the isolated runner; keep solutions/hidden tests out of learner payloads. Provider keys, quotas, cost limits and retries belong on the backend.

Only an authorized editor can generate and edit; only an authorized approver can publish. Require explicit approval after any material edit; reject stale approval and retain an audit trail. Include a semantic before/after comparison and rollback to approved immutable versions. Do not overwrite the current production curriculum merely because generation succeeded.

## Required production tests

- Unit: schema validation, stable-ID mapping, diff detection, prerequisites, revision conflicts and idempotency.
- Component: generating/error/retry, review fields, approval cancel/confirm, disabled-state announcements, focus management.
- Integration: transactional publication, attempt-version retention, rollback, queue cancellation, provider timeout/rate limit/malformed JSON, cost budget exhaustion.
- E2E: editor proposes → reviewer edits → approves → learner sees version; stale review blocked; learner cannot generate/approve; draft absent from learner catalog.
- Security contracts: prompt injection, malicious markdown/HTML/code, secret exfiltration, resource exhaustion, role escalation, cross-user draft access, CSRF and audit immutability.
- Visual/accessibility: three palettes × two themes × Arabic/English × mobile/desktop; outline navigation, expanded lesson forms, errors and modal keyboard/screen reader behavior.
- Performance: large course proposals, lazy loading, image transfer budgets, worker isolation and service-level objectives for generation/evaluation.

Historical execution reports are omitted from this production-start collection. Re-run the relevant checks and record fresh phase evidence. Existing prototype tests cannot certify any unimplemented backend or live model.
