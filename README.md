# Clarity Loop AI Book Studio

> **Vision 2.0:** Turn an idea into a published book.

**Developed by ETL GIS Consulting LLC**

## Synopsis of Project

Clarity Loop AI Book Studio is a premium, non-technical SaaS writing environment that transforms a simple idea, title, or concept into a fully structured, publication-ready book.

The core author journey is:

> **idea → blueprint → table of contents → chapter outlines → chapter content → manuscript → PDF/DOCX/EPUB export**

Clarity Loop is designed for authors, coaches, pastors, consultants, speakers, content creators, and other subject-matter experts who have something valuable to say without wanting to learn complicated writing software or technical AI workflows.

## Product experience

- An interactive homepage that visibly moves from idea to blueprint, chapter structure, manuscript, and publication-ready export
- A manuscript-first Author Workspace instead of a generic analytics dashboard
- A guided New Book Wizard for title, idea, reader, genre, tone, style, chapter count, chapter size, page target, and preferred AI assistance
- An editable Book Blueprint with synopsis, Book DNA, table of contents, chapter summaries, estimated length, and reading time
- A focused Chapter Studio with chapter navigation, writing and rewriting actions, editable manuscript content, word count, page estimate, and chapter locking
- An Export Center with valid PDF and DOCX downloads plus publishing assets such as book descriptions, back-cover copy, author bios, keywords, and category suggestions
- Clarity Launch Engine foundation for reader strategy, marketability review, positioning, launch assets, review workflow, and author growth pathways
- Dedicated Book DNA, consistency, publishing pipeline, and multi-format export showcases engineered by ETL GIS Consulting LLC
- Six starting templates: Self-Help, Christian Devotional, Memoir, Business Book, Biography, and Children’s Book
- Browser-local beta accounts with create-account, sign-in, persistent-session, and sign-out controls; passwords are stored as PBKDF2-derived hashes rather than plaintext
- Versioned browser-local project persistence with 15-second autosave, immediate edit saves, legacy migration, export history, and beta feedback capture
- Deterministic API fallbacks so the complete experience works without external credentials


## GeoAware OS Governance

This repository follows GeoAware OS v1.0.0, a design and engineering philosophy founded by Paul Iyogun for calm, geography-first digital experiences where technology quietly guides discovery.

Governance is recorded in `.geoaware/constitution.json` and extends the public GeoAware OS source at https://github.com/Omoluabi1003/GeoAware-OS while preserving the Clarity Loop product mission.

## Run the studio

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Set `NEXT_PUBLIC_SITE_URL` to the deployed HTTPS origin in production so Open Graph and Twitter share previews resolve the Clarity Loop logo to an absolute URL. Vercel deployments also fall back to `VERCEL_PROJECT_PRODUCTION_URL` automatically.

### npm proxy configuration

Modern npm versions warn about `npm_config_http_proxy` because it is interpreted as the unsupported `http-proxy` npm setting. This variable is not set by the repository; it can be injected by a shell, container, or CI environment. Remove it before invoking npm:

```bash
unset npm_config_http_proxy
npm install
```

If npm itself needs an explicit proxy setting, use the supported `proxy` key instead while retaining the standard `HTTP_PROXY` variable for other tools:

```bash
export npm_config_proxy="$HTTP_PROXY"
unset npm_config_http_proxy
```

### Browser testing

The current automated tests use Node's built-in test runner and do not require Playwright or downloaded browser binaries. Next.js lists `@playwright/test` as an optional peer dependency in its package metadata, so a Playwright reference may appear in `package-lock.json` even though Playwright is not installed by this project.

`OPENAI_API_KEY` is optional and is read only by server routes in the current build. The `/api/blueprint` and `/api/chapter` routes use deterministic studio content until a production AI provider is connected.

## Quality checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Production integration notes

Before a hosted release, connect the existing integration points to:

1. Replace the browser-local beta account layer with production authentication and a persistent database using the `Book` and `Chapter` structures in `lib/types.ts`.
2. A production AI provider in `app/api/blueprint/route.ts` and `app/api/chapter/route.ts`.
3. Hosted object storage for generated PDF/DOCX artifacts and the export-history URLs. PDF and DOCX are already rendered as valid files by the server export route; EPUB remains a future format.
4. Monetization and paid plan processing after the no-payment beta has been validated.
5. Production analytics, monitoring, content safeguards, and rate limiting.

## Legacy publishing utilities

The repository retains the original Python utilities for generating existing Clarity Loop books and covers:

```bash
python -m pip install fpdf2 pypdf pillow
python generate_book.py
python generate_novel_pdf.py
python generate_covers.py
```

© ETL GIS Consulting LLC. All rights reserved.


## Private beta integrity architecture

- `lib/book-budget.ts` enforces page-to-word budgets, the 90% manuscript gate, and the 85% chapter floor.
- `lib/manuscript.ts` is the canonical deterministic assembly path shared by all exports.
- `lib/export-renderers.ts` creates real multi-page PDF files and valid DOCX ZIP packages with headings and chapter page breaks.
- `lib/quality.ts` normalizes paragraph casing and reports duplicate openings, duplicate paragraphs, broken Markdown, orphan headings, empty sections, and underdeveloped chapters.
- `lib/persistence.ts` defines the versioned saved-state contract for books and beta feedback.
- `lib/auth.ts` defines the browser-local beta account, password-derivation, and session contract.
- `lib/clarity-launch-engine.ts` defines the deterministic Clarity Launch Engine foundation for reader strategy and author growth planning.

Browser-local persistence is appropriate for controlled single-browser beta evaluation, but it is not a substitute for authenticated server-side storage, cross-device synchronization, backups, and conflict handling. Those remain required before public monetization.
