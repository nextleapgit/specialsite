# Personal preferences and final visual baseline

Professional blue is the user-selected default identity. The earlier three-palette selection banner has been removed from Home. The /appearance page remains a reference gallery; primary navigation now points to /preferences, also available from account navigation. Existing academy, curriculum authoring, generated artwork and AR identity are retained.

## User experience

- Sign in → Appearance preferences. A guest login preserves the requested return route.
- Five palettes: Professional blue (default), Technical indigo, Modern violet, Calm teal, Editorial slate.
- Three display modes: light (default), dark, system. System responds to live OS preference changes; the header toggle deliberately switches to an explicit light/dark choice.
- Three local font stacks: System, Tahoma and Arial. Each uses fallbacks when unavailable; no font files or external font requests are added.
- Standard / large / extra-large reading text: 16 / 19 / 22 px, applied to article prose, lesson explanation/exercise text, and the live sample. Code uses its existing monospace stack.
- Changes apply immediately, save automatically, survive document navigation/reload, and show a live sample. A storage failure reports that changes are applied but not saved.
- Restore defaults requires confirmation and resets only the active persona's appearance. Training history, articles, subscriptions and other personas' settings remain unchanged.

## Prototype storage boundary

The ar-studio-appearance-v2 localStorage namespace contains separate guest, learner and admin preference objects. This distinguishes the prototype personas without inventing real user accounts. It is not account authentication or cross-device synchronization. The previous ar-studio-palette/ar-studio-theme preview keys are no longer used, so the old provisional identity does not override the newly approved blue baseline. Learning data in ar-studio-demo-v1 is not migrated or cleared.

All stored values are allowlisted and normalized. Malformed data falls back to the approved defaults. The storage event updates another open document, while the active persona remains scoped to its sessionStorage demo role. Concurrent multi-device editing is outside this local prototype's guarantees.

## Production contract to derive later

UserPreferences belongs to the authenticated User ID, with palette, displayMode, fontFamily, readingTextSize and revision fields. Validate enums server-side and define defaults/migration behavior centrally. Use authenticated GET/PATCH endpoints with ownership checks, CSRF protection and an ETag/expected revision to avoid overwriting concurrent changes. Guest appearance may remain a separate local preference. At sign-in load account preferences; decide explicitly whether to offer importing guest preferences. At logout apply guest settings without exposing another account's data. Never use preference keys as authentication credentials.

Accessibility remains a release gate for every supported palette, mode, font and size. The prototype includes axe checks for five palettes × two modes, 320px Arabic reflow checks across all fonts at maximum reading size, device-mode switching, approval-default selection, persistence/navigation, restore cancellation/confirmation, persona isolation, storage failure, and desktop/mobile screenshot baselines. Historical results are omitted from this collection; execute the checks in the new workspace and record fresh phase evidence.

## Reference handoff

The prototype is a reference for implementation; it still uses simulated authentication, AI curriculum generation, evaluation and publishing. The selected blue visual identity is approved. The final preference flow is implemented for review, and the existing database/backend roadmap remains the next implementation phase.
