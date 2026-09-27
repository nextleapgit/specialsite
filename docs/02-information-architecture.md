# Information architecture and user flows

## Route inventory

Hash prefix `#` is omitted below. Every page is reachable through ordinary links or the labelled state lab.

| Route                  | Audience         | Main task                                                                    |
| ---------------------- | ---------------- | ---------------------------------------------------------------------------- |
| /                      | Public           | Understand identity, discover writing and training                           |
| /articles?q=&category= | Public           | Search, category filter, newest/quick-read sort                              |
| /articles/:id          | Public           | Read, save locally, copy link, navigate sections                             |
| /projects              | Public           | Browse conceptual projects                                                   |
| /projects/:id          | Public           | Read context and approach                                                    |
| /newsletter            | Public           | Subscribe, consent, confirmation, topics, frequency, unsubscribe             |
| /training              | Public           | Discover C# and future tracks                                                |
| /training/csharp       | Public           | Inspect course outline and outcomes                                          |
| /lesson/:id            | Learner/editor   | Read → code → run/evaluate → retry                                           |
| /login                 | Public           | Demo login with validated return path                                        |
| /register              | Public           | Demo registration and email verification step                                |
| /forgot                | Public           | Non-enumerating recovery request preview                                     |
| /dashboard             | Learner/editor   | Resume learning and saved articles                                           |
| /progress              | Learner/editor   | Best score per lesson and complete attempt history                           |
| /accounts              | Learner/editor   | Connect/revoke demo LinkedIn consent                                         |
| /admin                 | Editor           | Article inventory and latest delivery results                                |
| /admin/editor          | Editor           | Draft, preview, review channels, publish, retry failures                     |
| /admin/courses         | Editor           | Add course/language/sections; order; card publication; lesson editor preview |
| /about                 | Public           | Editorial introduction (professional details pending approval)               |
| /design-system         | Public/reference | Live UI component and token reference                                        |
| Unknown route          | Public           | 404 with home recovery                                                       |

Additional routes: /appearance (public palette review); /admin/curriculum-ai (editor proposal/review/approval); /training/course/:id (public approved course outline). Training, lessons and progress are canonical to academy.html, with website links loading the separate document.

## Taxonomy

Articles have one primary category in this version: Digital Transformation, Software Architecture, .NET, Business & Operations. Store category identities separately from translated display labels in production. Projects are separate content items. Newsletter is a subscription/delivery capability, not a duplicate article store. Training: Language/Track → Course → Section → Lesson → Exercise version → Attempt.

## Reader journey

Home → Article listing → filter/search → detail → bookmark or newsletter. Query and category are represented in the URL; reading and theme preferences do not require login in this prototype. Production bookmarking should bind to an account (or use an explicitly temporary guest collection and offer migration).

## Training journey

Course outline is public. Every lesson, editor, attempt history, and account progress route is gated. A guest is sent to login with an allowlisted internal return route. Register → validate fictional fields → simulate verified email → return to requested lesson. Demo shortcut skips forms for review convenience only.

Within a lesson: read explanation → inspect task and expected output → edit starter code → optional completion → Run (no saved grade) → Evaluate & save (one attempt) → result and visible/hidden test summary → improve and retry. Reset replaces editor code but preserves attempts. Navigating between lessons starts a fresh editor buffer; code drafts are not saved, only scores and check outcomes. History is displayed newest first; best score never regresses. Mastery threshold is 80%; with four equally weighted mock checks, possible scores are 0/25/50/75/100, so fixture mastery occurs only at 100. Production test weights may permit other scores.

There is no mandatory sequential lock after enrollment. Learners may open any lesson and retry without limit. A next-lesson link does not imply passing the previous lesson. Course completion means every lesson’s best eligible grade meets the mastery threshold, independent of reading time.

## Newsletter journey

Email + at least one topic + delivery frequency (default every matching article) + explicit consent → pending confirmation → simulate email confirmation → active subscription. Preferences update and unsubscribe have distinct flows. Weekly digest is an optional alternative. No email address is persisted by the prototype. Production newsletter subscribers may be independent of user accounts; linking requires verified ownership.

## Connected account journey

Account settings → LinkedIn (default provider) → consent preview → connected state → optional disconnect confirmation. Cancel is safe. Errors can be injected from the state lab. Account linking does not grant editor permission. Future providers must be adapters with explicit capabilities, not hardcoded columns on a user record.

## Publishing journey

Editor → working draft → title/excerpt/body/category validation → save/preview → review modal. Website is required. Newsletter and LinkedIn initially selected. If LinkedIn is disconnected, the confirm action is disabled until the editor connects it or deselects the channel. Connecting from the modal first saves the working text.

Confirm → website result → selected downstream channel results. Failure simulation: request error = no successful website publication; partial = website and newsletter succeed, LinkedIn fails. Retry ignores successful and skipped channels. A website success creates exactly one local article for the current operation. Latest channel results are shown in Admin; retry remains in the current Editor instance. Reload-safe operation resumption is a production requirement.

## Management journey

Editor → Course Management → add title/language → draft → add/reorder sections → publish a catalog card. A course card is deliberately distinct from an active learning course. C# has 30 lessons in 10 sections. The new /admin/curriculum-ai workspace creates or edits an active learnable curriculum through review and explicit approval; see 07-curriculum-ai-and-visual-revision.md. Lesson editor previews required explanation, exercise, starter code and evaluation contract; validation is temporary and explicitly labelled.

## Persistence boundaries

Persisted: demo attempts, connection boolean, subscription flags/topics/frequency, bookmarks, custom articles, one draft, latest deliveries, new course-card drafts, approved curriculum overrides, locale/theme/palette. Demo persona persists in sessionStorage for document navigation; it is not an auth credential. In-memory only: code buffers, passwords, supplied email, loading/error scenario, pending form state. All personas share a single demo dataset. No production session or secret is in localStorage.

## Personal preferences

/preferences is a learner/editor account route. Guest login returns to the same destination. Palette, display mode, local font and reading size apply live across website and academy. Restore defaults changes only appearance. See 09-user-preferences-final-baseline.md for state, storage and future backend ownership contracts. /appearance remains the original visual-reference gallery; Professional blue is now the selected site identity.
