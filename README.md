# Clarity Loop AI Book Studio

**Developed by ETL GIS Consulting LLC**

## Synopsis of Project

Clarity Loop AI Book Studio is a premium, non-technical SaaS writing environment that transforms a simple idea, title, or concept into a fully structured, publication-ready book.

The core author journey is:

> **idea → blueprint → table of contents → chapter outlines → chapter content → manuscript → PDF/DOCX/EPUB export**

Clarity Loop is designed for authors, coaches, pastors, consultants, speakers, content creators, and other subject-matter experts who have something valuable to say without wanting to learn complicated writing software or technical AI workflows.

## Product experience

- A manuscript-first Author Workspace instead of a generic analytics dashboard
- A guided New Book Wizard for title, idea, reader, genre, tone, style, chapter count, chapter size, page target, and preferred AI assistance
- An editable Book Blueprint with synopsis, Book DNA, table of contents, chapter summaries, estimated length, and reading time
- A focused Chapter Studio with chapter navigation, writing and rewriting actions, editable manuscript content, word count, page estimate, and chapter locking
- An Export Center with visible PDF, DOCX, and EPUB paths plus publishing assets such as book descriptions, back-cover copy, author bios, keywords, and category suggestions
- Six starting templates: Self-Help, Christian Devotional, Memoir, Business Book, Biography, and Children’s Book
- Browser-local project persistence for the current studio demonstration
- Deterministic API fallbacks so the complete experience works without external credentials

## Run the studio

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`OPENAI_API_KEY` is optional in the current build. The `/api/blueprint` and `/api/chapter` routes use deterministic studio content until a production AI provider is connected.

## Quality checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Production integration notes

Before a hosted release, connect the existing integration points to:

1. Authentication and a persistent database using the `Book` and `Chapter` structures in `lib/types.ts`.
2. A production AI provider in `app/api/blueprint/route.ts` and `app/api/chapter/route.ts`.
3. Dedicated PDF, DOCX, and EPUB renderers. The current PDF path uses the browser print dialog, while DOCX and EPUB are clearly labeled preview downloads.
4. Stripe plans for Free, Pro, and Publisher tiers.
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
