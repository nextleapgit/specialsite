# Backend derivation blueprint (proposed, not implemented)

This document makes the UI’s data and trust boundaries explicit before schema/API design. Endpoint names are a draft contract, not claims about existing services. Prefer a modular ASP.NET Core API and PostgreSQL for the user’s established backend conventions. Public rendering can use pre-rendered/static pages plus the same API; avoid a second application backend without a clear reason.

## Bounded areas and candidate entities

| Area       | Entities                                                                                     | Key relationships / invariants                                                                                                    |
| ---------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Identity   | User, Role, UserRole, Session, VerificationToken                                             | Verified email uniqueness; normalized identity; expiring/revocable sessions; hashed one-use tokens                                |
| Content    | Article, ArticleRevision, Category, ArticleCategory, MediaAsset, Bookmark                    | Stable UUID + unique slug; draft/published/archived; optimistic concurrency; bookmark unique per user/article                     |
| Portfolio  | Project, ProjectRevision, ProjectTag                                                         | Public conceptual/published distinction; optional verified external links                                                         |
| Newsletter | Subscriber, SubscriptionPreference, ConsentEvent, Suppression, Delivery                      | Email uniqueness; topic memberships; every-article/weekly; consent timestamp and policy version; suppression checked at send time |
| Learning   | Track, Course, CourseVersion, Section, Lesson, LessonVersion                                 | Ordered children; language/runtime metadata separate from translated titles; immutable published content versions                 |
| Exercises  | ExerciseVersion, PublicExample, HiddenTestSuiteVersion, GradingPolicy                        | Tests and secrets never serialized to client; score/weights/threshold versioned                                                   |
| Practice   | Enrollment, PracticeSession, Submission, EvaluationJob, Attempt, CheckResult, LessonProgress | Immutable attempts; user ownership; exercise version pinned; best eligible score; infrastructure failure excluded                 |
| Social     | Provider, ConnectedAccount, ProviderCredential, AuthorizationRequest                         | Provider adapters; granted scopes and expiry; encrypted tokens server-side only; unlink revokes future use                        |
| Publishing | PublicationOperation, ChannelDelivery, OutboxMessage, ProviderReceipt                        | Required website commit precedes fan-out; per-channel state; operation idempotency; retry never repeats successful channel        |
| Governance | AuditEvent, ContentReview, RetentionPolicy                                                   | Actor/time/target/change; traceable administrative changes without secret or submission-body logging                              |

### Suggested keys and indexes

- UUID primary keys; UTC timestamps; separate localized content fields/table. Never use UI labels as foreign keys.
- Unique `(UserId, ArticleId)` bookmark; `(CourseVersionId, Order)` section; `(SectionId, Order)` lesson; transactional reorder to avoid duplicate positions.
- Unique `(UserId, ExerciseVersionId, ClientAttemptKey)` submission for retry deduplication.
- Unique `(OperationId, Channel)` delivery; unique `(Provider, ProviderReceiptId)` webhook receipt.
- Unique subscriber normalized email; index subscription status/frequency and category membership for campaigns. Email verification required before linking a newsletter subscriber to an authenticated account.
- Index attempts `(UserId, LessonId, CreatedAt DESC)` and jobs `(Status, AvailableAt)`. Progress derived from immutable attempts or materialized with a rebuild procedure.
- Soft deletion is not automatically appropriate for every entity. Define legal/operational retention before final migration; use explicit purge/anonymization jobs where needed.

## Practice contract

Start a practice session for one authenticated learner and one published lesson/exercise version. Allow repeated attempts. A session groups lesson practice, not a general-purpose persistent development environment. Store each evaluated submission and grade according to a declared retention policy; Run is a sandbox execution without a grade. The prototype only stores result summaries and discards code buffers on navigation.

`POST /api/practice/sessions` → session ID, exercise version, execution limits.

`POST /api/practice/sessions/{id}/runs` → queued run ID (no grade).

`POST /api/practice/sessions/{id}/submissions` with idempotency key → queued evaluation ID.

`GET /api/evaluations/{id}` → status, bounded stdout/stderr, diagnostic summary, public checks, hidden-check aggregate, score, policy version, attempt ID.

`GET /api/me/progress?courseId=` and `GET /api/me/attempts?lessonId=&cursor=` → owner-scoped pagination. Never accept a client-provided final score, user ownership, mastery boolean, or hidden-test outcome.

State machine: queued → compiling → running → evaluating → graded OR compilation-error / runtime-error / timeout / infrastructure-error / cancelled. Define whether compilation/runtime errors count as scored attempts; recommended: learner errors are eligible 0-score attempts, infrastructure errors are ungraded and retryable. Best mastery cannot regress after an ordinary retry. Course-version migration may reset or carry progress only through an explicit rule.

### Untrusted execution boundary

C# compilation/execution belongs in dedicated disposable workers, separate from the web API and database. Restrict CPU, memory, execution time, output bytes, process count, filesystem, and network egress. No host mounts, credentials, privileged container, or database/network access. Pin runtime images and compiler versions; tear down workers after a job. Treat source, output, and diagnostics as untrusted text. Test cancellation, infinite loops, fork/process bombs, reflection/filesystem/network attempts and oversized output before enabling real execution. Prefer no network at all. A container alone is not a complete isolation design; complete a threat model and select a hardened execution boundary before release.

## Publication contract

`POST /api/admin/articles` creates a draft. `PUT /api/admin/articles/{id}` uses an expected revision/ETag. `POST /api/admin/articles/{id}/publication-operations` accepts `{revisionId, channels, idempotencyKey}`.

Within one database transaction: validate permission and revision; commit the public article snapshot; create per-channel work and outbox messages. A publisher performs downstream delivery asynchronously after commit. Newsletter selection resolves active verified recipients against topic preferences, frequency and current suppression. Digest subscribers enqueue content for a digest instead of immediate email. Social publishing uses the editor’s configured authorized account (not an arbitrary learner’s connection).

`GET /api/admin/publication-operations/{id}` returns per-channel delivery state. `POST /api/admin/publication-operations/{id}/retry` only retries eligible failed jobs. Repeated calls with the same idempotency key return the same operation. Successful website publication should remain visible even if LinkedIn fails. Retrying after a browser reload must resume the server operation instead of constructing a duplicate article.

Clarify semantic difference between queued, accepted by provider and delivered/published. Provider callbacks can arrive late, out of order or twice. Validate signatures and timestamps; store receipt IDs; enforce legal state transitions. Provider-specific permissions and posting capability must be verified against current official documentation during integration, rather than inferred from this mock consent screen.

## Newsletter contract

`POST /api/newsletter/subscriptions` accepts email, topics, frequency, consent and returns a generic acceptance without revealing existing subscriber status. Double opt-in token is one-use, hashed and expiring. Confirmation can be repeated safely. Preference and unsubscribe links require limited-scope expiring tokens; no full login session is implied. Unsubscribe should be idempotent and suppression checked just before delivery. Store consent changes and webhook events. Never resurrect unsubscribed users through retry or imports. Bounce/complaint suppression is distinct from voluntary unsubscribe.

## Authentication, authorization and transport

Use HttpOnly, Secure cookies, same-origin `/api` where feasible, CSRF protection on mutations, restricted CORS and validated internal return routes. No access/refresh tokens in browser storage. Roles must be checked server-side, as must ownership of sessions, attempts, bookmarks and social accounts. Editor access should be assigned by an administrative provisioning process, never a public signup field.

Return structured errors `{type,title,status,code,traceId,errors?}`. Define 400/401/403/404/409/422/429 and retry semantics. A 401 should invalidate local user state once; a 403 should not cause a login loop. Redact passwords, tokens, code and provider secrets from logs. Sanitize any future rich HTML before storage/rendering; React escaping alone suffices only for this prototype’s plain text.

## Operational acceptance

Backups and restore drills; schema migrations forward/backward strategy; queue retry/dead-letter policies; alerts for runner failure and delivery backlog; provider-token key rotation; deletion/export procedures; aggregate performance telemetry without source-code capture. Cache public immutable revisions independently of personalized state. Generate an OpenAPI contract and typed client only after these schemas and state transitions are agreed and implemented.
