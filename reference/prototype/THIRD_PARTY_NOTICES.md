# Dependencies and attribution

The interface, content and layout are original prototype work. The current editorial illustrations and AR monogram were generated from scratch using the built-in image generation tool; exact prompts and preserved originals are documented in ../../docs/08-generated-assets.md. No internet photos, remote fonts, paid templates or paid UI components are included. Font declarations use system fallbacks; they do not redistribute proprietary font files.

Runtime dependencies: React and React DOM (MIT), TanStack Router (MIT), Lucide React (ISC). The LinkedIn marker is plain text identifying a future connection provider, not a bundled third-party logo asset or an endorsement.

Development tools include Vite (MIT), TypeScript (Apache-2.0), Vitest (MIT), Playwright (Apache-2.0), Testing Library (MIT), axe-core (MPL-2.0, test tooling only), ESLint (MIT), typescript-eslint (MIT), Prettier (MIT), and jsdom (MIT). See the generated inventory for all installed transitive dependencies and exact versions.

- `docs/dependency-inventory.json`: package/license/version inventory generated from the actual lockfile and installed package metadata.
- `docs/third-party-licenses.txt`: bundled license/notice texts from installed packages.
- Regenerate after dependency changes with `node scripts/licenses.mjs`.

TypeScript 6.0.3 is deliberately pinned because the current typescript-eslint 8.70.1 supports TypeScript below 6.1; TypeScript 7.0.2 was not retained with an unsupported linter peer dependency. Node 24.12.0 meets the installed Vite runtime requirements.

Design inspiration: [Milan Jovanović](https://milanjovanovic.tech/) for content-first structure and restrained navigation. No source code, paid course assets, articles, identity, testimonials or imagery were copied.
