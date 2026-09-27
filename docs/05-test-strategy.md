# Strict verification strategy

## Release gates

Every production pull request: typecheck, lint, unit/component/integration tests, dependency/secret scans and build. Required checks are blocking. End-to-end and accessibility run for changed critical flows. Nightly: full browser/device/locale matrix, visual comparison, performance budgets, worker abuse suite, migration and restoration drills. Release candidate: all gates, human visual/screen-reader review, and staging provider tests. Do not equate coverage percentage with correctness.

Suggested production coverage: domain rules ≥95% branches; UI behavioral modules ≥85%; critical state transitions each have positive, negative, cancellation and retry cases. Mutation testing for mastery, authorization, idempotency and suppression rules; all relevant mutants must be killed. No requirement to test generated code or mirror implementation details. Each defect receives a regression test tied to observable behavior.

## Test matrix

| Layer             | Cases / assertions                                                                                                                                 | Tools / fixtures                                                 | Gate                                                          |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------- |
| Unit              | Score weighting, mastery thresholds, best score, course completion, slug/category rules, consent, state transitions, retries                       | Vitest/.NET test runner; boundary/property-based cases           | No failures; branch targets above                             |
| Component         | Required fields, submit disable, local/server errors, radio/checkbox state, editor controls, empty states, modal focus, announcements              | Testing Library; deterministic API mocks                         | Behavioral assertions; no implementation-only snapshots       |
| Integration       | PostgreSQL constraints, owned-resource filtering, session/CSRF, revision conflicts, transactional outbox, queued runner results, email suppression | Disposable real PostgreSQL and queue adapters                    | No mocks of the storage behavior being verified               |
| E2E               | Reader→registration→verification→lesson→run→evaluate→retry→progress; author→draft→connect→publish→partial fail→retry                               | Playwright; deterministic seeded accounts                        | Chromium, Firefox, WebKit; mobile and desktop                 |
| Accessibility     | WCAG 2.2 AA automated scans per route/state/theme; keyboard order, labels, focus restore, reflow, errors, screen-reader grade feedback             | axe + NVDA/VoiceOver manual checklist                            | Zero serious/critical violations; all lower issues triaged    |
| Visual            | Page/state/theme/locale breakpoints, code overflow, long Arabic headings, tables, dialog, score outcomes                                           | Playwright baseline screenshots                                  | Human review of intended diffs; no blind baseline replacement |
| Performance       | Static bytes, LCP, INP, CLS, CPU under editor input, route transitions, runner queue p95                                                           | Lighthouse + browser performance + production RUM                | Targets below, measured on defined profiles                   |
| Security contract | Role/ownership bypass, CSRF/CORS, injection, OAuth state/PKCE, token secrecy, runner isolation, idempotency                                        | API tests, threat-model-driven abuse tests, SAST/dependency scan | No critical/high exploitable findings                         |

## Critical scenarios with acceptance criteria

### IDENTITY (AUTH-01..12)

1. Unauthenticated lesson/deep link → login with allowlisted internal return → verified user returns to same lesson. External/protocol-relative/malformed return URLs never navigate off origin.
2. Signup validation, duplicate email response privacy, expired/used verification token, resend rate limit, unverified user denied training, generic recovery response.
3. Failed login never yields an authenticated cookie; logout clears cookie and cache; stale in-flight response cannot restore previous user data.
4. Role escalation attempt from request body/storage fails. Learner cannot POST admin resources. Other user’s session and attempt IDs return 403/404 without data.
5. Cookies have Secure/HttpOnly/SameSite; CSRF rejected on all mutations, including social linking. Password/OTP/reset tokens absent from logs and client storage.

### TRAINING (LEARN-01..20)

1. Run does not create a grade; Evaluate creates one immutable attempt; double-click/network retry with same key creates exactly one attempt.
2. Empty/malformed/infinite/output-heavy code yields bounded diagnostics. Worker loss yields ungraded infrastructure failure, not an invented score.
3. All-pass, all-fail, one-fail, weighted-score rounding, exact mastery boundary 79/80/81. Best score cannot regress after a lower retry.
4. Reset clears editor/result but not history. Retry increments attempt history only after accepted evaluation. Different lessons remain isolated.
5. Cancellation and route/account switch during run cannot leak results across users or record stale jobs to wrong session.
6. Hidden tests absent from JS/source maps/API output. Feedback does not reveal test inputs, secrets, paths or stack traces.
7. Course adds sections/lessons in stable order; archived exercises cannot accept new attempts. Old attempts refer to their original content/test versions.
8. Progress correct for zero lessons, no attempts, repeated attempts, deleted/unpublished lesson, full completion, course revision migration.
9. Keyboard editor exits with Tab, completion accessible with keyboard, paste works, code remains LTR in Arabic; long code stays inside editor.

### PUBLISHING (PUB-01..18)

1. Invalid fields block publish. Save error retains safe content. Conflicting revision returns 409 with recoverable compare/reload flow.
2. Website mandatory. Newsletter and LinkedIn optional and independently reported. Disconnected/expired social consent prevents dispatch.
3. Article transaction rollback emits no outbox job. Website success + downstream failure leaves article public and shows partial result.
4. Retrying only failed channels preserves successful provider receipts. Repeated idempotency key, browser reload, duplicate queue message and webhook never create duplicate public posts/emails.
5. Authorization rechecked at job execution: revoked editor or disconnected provider follows documented policy.
6. Rate limits respect Retry-After; permanent permission failure stops automatic retries; dead-letter item has safe manual recovery and audit trail.
7. Sanitized rich content resists stored/reflected XSS, malicious SVG and javascript URLs. External links obey safe target/rel policies.

### NEWSLETTER (NEWS-01..12)

1. Missing consent/empty topics/invalid email rejected. Pending subscribers receive no article mail. Confirm is one-use and safely repeatable.
2. Each article sends once to confirmed matching every-article subscribers; weekly subscribers receive it once in a digest.
3. Unsubscribe concurrent with queued delivery suppresses sending. Bounce/complaint suppressions override active subscriptions.
4. Provider webhooks require signature and freshness; duplicate/out-of-order receipt handling is deterministic. Preference token cannot change another subscriber or grant login.

### UI / RESILIENCE (UI-01..16)

1. Every route has initial/loading/empty/error/success coverage appropriate to its task. Unknown IDs render 404; no silent blank page.
2. Arabic RTL and English LTR at 320/390/768/1440/1920 widths, 200% zoom, longest translated labels, missing optional fields, long tables and code.
3. Theme preference persistence with unavailable/corrupt storage; reduced motion; forced-colors; touch targets; keyboard-only menu/dialog/tab operation.
4. No accidental horizontal document scrolling. Dialog content remains scrollable above on-screen keyboard. Focus visible and not covered by dock/toast.
5. Offline, slow request, timeout, cancellation, repeated clicks, unauthorized response, 429 and partial response have intentional outcomes.

## Performance budgets (production targets)

- Public first route JS ≤150 kB gzip, CSS ≤25 kB gzip; initial total transfer ≤250 kB before editorial images.
- LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1 at p75 on specified mobile/4G profile; report cold and warm cache separately.
- Editor loads on training routes only; real Monaco/runtime packages must not enter the home bundle.
- Common API p95 ≤300 ms excluding code jobs; run/evaluation queue wait and execution limits measured separately.
- Search/filter local response ≤100 ms for prototype corpus; production search budgets based on realistic data volume.
- CI rejects budget regressions rather than claiming performance from bundle size alone. Field performance cannot be verified by this local mock.

## Current executable suite

`src/domain.test.ts`: fixture score/output for every lesson, partial/empty source, no evaluation of supplied JS, best-score preservation, zero-length curriculum, channel defaults/partial failure/retry/disconnection, safe return URLs.

`src/components.test.tsx`: category/search recovery, auth gate, newsletter confirmation and non-persistence of email.

`tests/prototype.spec.ts`: route smoke and runtime errors; registration return; run/evaluate/reset/history; completion and runner failure; newsletter lifecycle; LinkedIn + partial publish retry dedupe; course cards/section ordering; native dialog focus; state recovery/theme/locale; light/dark axe; mobile RTL overflow; reviewed visual baselines.

No production integration, real C# correctness, live OAuth, email deliverability, penetration test, cross-browser run, or field-performance result is implied. Historical execution reports are intentionally omitted from this production-start collection. Run the checks in the new workspace and record fresh evidence under docs/phases before claiming phase readiness.
