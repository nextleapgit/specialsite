# State matrix

The state lab is available on every page. `Page state` selects Normal, Loading, Empty, or Error; `Request outcome` selects Success, Request failure, or Partial publishing. These are deterministic review controls, not network fault handling.

| Area                    | Initial/empty                                  | Loading                           | Error                                                                   | Success                                        | Recovery                                               |
| ----------------------- | ---------------------------------------------- | --------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------ |
| All routes              | Normal route content or contextual empty       | Skeleton + loading text (lab)     | Persistent error notice (lab)                                           | Route content                                  | Try again returns to normal                            |
| Articles                | Four original sample articles                  | Global loading preview            | Global error preview                                                    | Search/category results                        | Clear filters on no matches                            |
| Article detail          | Unknown id → 404                               | Global preview                    | Missing item                                                            | Saved/unsaved state; clipboard toast           | Navigate back; clipboard failure points to address bar |
| Projects                | Two conceptual case studies                    | Global preview                    | Unknown id → 404                                                        | Detail case study                              | Back to projects                                       |
| Newsletter              | Not subscribed                                 | Form disabled during mock request | Request failure preserves inputs                                        | Pending confirmation → confirmed               | Retry, edit topics/frequency, unsubscribe confirmation |
| Auth                    | Guest; login/register/recovery                 | Submit disabled                   | Generic failure                                                         | Demo persona assigned after login/verification | Retry or demo shortcut; safe internal return           |
| Training catalog        | One course, future tracks marked planned       | Global preview                    | Global preview                                                          | Public outline                                 | Sign in to enter lesson                                |
| Lesson                  | Fresh code; no output or grade                 | Run/evaluate mutually disabled    | Runner unavailable; no attempt written                                  | Output or saved result                         | Retry, reset confirm, example hint                     |
| Evaluation              | Not evaluated                                  | Evaluating                        | Zero/partial score is learning feedback; service failure is not a grade | Score + check outcomes + mastery               | Retry preserves previous attempts                      |
| History                 | No attempts                                    | Global preview                    | Global preview                                                          | Chronological table                            | Open lesson and evaluate                               |
| Dashboard               | Empty bookmarks and progress                   | Global preview                    | Global preview                                                          | Resume next unmastered lesson                  | Explore articles or start course                       |
| Connected account       | Disconnected                                   | Connecting                        | Cancel/expired/request error                                            | Connected badge                                | Retry or disconnect with confirmation                  |
| Admin access            | Guest gate / learner editor-access screen      | Lazy route loading                | Missing permission preview                                              | Editor workspace                               | Explicit demo persona switch                           |
| Article editor          | One empty/local working draft                  | Save/publish disabled             | Validation or save failure                                              | Saved locally, preview, published item         | Preserve input, edit, save                             |
| Publish review          | Website required; newsletter+LinkedIn selected | Simulated publication             | Disconnected provider blocks confirm                                    | Per-channel success                            | Deselect or connect provider                           |
| Delivery                | Pending/skipped                                | Simulated processing              | All fail or LinkedIn alone fails                                        | Success badges                                 | Retry only failures; successful channels unchanged     |
| Course management       | Existing C# + no custom courses                | Create course disabled            | Failure toast                                                           | Draft card + added/reordered sections          | Retry; draft status can be restored                    |
| Lesson-management modal | Blank fields                                   | Not asynchronous                  | Native required validation                                              | Fields complete; explicitly unsaved preview    | Close or edit                                          |
| Local storage           | Fresh namespace                                | N/A                               | Persistent warning if write fails                                       | Changes retained                               | Continue in memory; reset demo                         |

## Production states that need real service contracts

These are specified for the next phase, not claimed as implemented mock screens for every variant:

- Auth: invalid credentials, already-used verification link, expired verification token, resend throttling, revoked session, CSRF failure, account lockout without enumeration.
- Runner: queued, compiling, running, evaluating, passed, partial, compilation error, timeout, output quota, memory limit, cancelled, worker lost. Infrastructure errors do not lower mastery.
- Delivery: queued, processing, sent/published, failed-retryable, failed-permanent, dependency-blocked, consent-revoked, provider-rate-limited, provider-permission-missing. Show traceable operation ID and next retry time.
- Editor: autosave conflict, stale version 409, sanitization errors, duplicate slug, image upload failure, lost edit lock, scheduled/cancelled publication, unpublish without erasing audit trail.
- Subscription: pending, active, unsubscribed, bounced, suppressed, complained; confirmation expiry; preference-token expiry; already unsubscribed is idempotent success.
- Courses: archived, draft, under review, published, version superseded; exercises with unavailable runner; hidden test version mismatch.

For each async production form: retain safe user inputs, associate field errors using aria-describedby, expose retryable/global errors with a trace identifier, and distinguish request acceptance from delivery completion. Never use a success toast as proof that an external email or social post was delivered.

## Revision 2

The expanded proposal/approval state matrix and production test contracts are in 07-curriculum-ai-and-visual-revision.md. Palette choice persists; AI suggestions remain ephemeral until confirmed approval. Generation errors, discarded proposals and canceled approval dialogs do not alter active curricula.

## Appearance preferences

Default → customized (applied and saved locally); invalid persisted values → normalized defaults; blocked storage → applied in memory with explicit unsaved notice; system mode → follows device changes; restore dialog → cancel unchanged / confirm defaults for current persona only. See 09-user-preferences-final-baseline.md.
