# Clarity Loop — AI Book Studio

Clarity Loop is a guided AI Book Studio for non-technical authors, coaches, pastors, speakers, consultants, and storytellers. It turns an early idea into an editable book blueprint, chapter drafts, and a downloadable manuscript.

The repository also retains the original Python publishing utilities for producing the existing Clarity Loop books and covers.

## Run the web studio

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). An API key is optional: the MVP includes deterministic sample writing so every flow can be tested without an external service.

## Web checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Current MVP behavior

- Dashboard, recent projects, and six guided book templates
- Four-step book creation wizard
- Editable AI-ready chapter blueprint
- Chapter-by-chapter writing, rewriting, expanding, shortening, and locking
- Persistent browser demo projects through local storage
- Book DNA reference panel
- Print/save-as-PDF flow and editable Word-compatible preview download
- API route fallbacks at `/api/blueprint` and `/api/chapter`

`OPENAI_API_KEY`, database, authentication, Stripe billing, and production-grade DOCX/PDF rendering are integration points for the hosted release.

## Original Python generators

```bash
python -m pip install fpdf2 pypdf pillow
python generate_book.py
python generate_novel_pdf.py
python generate_covers.py
```
