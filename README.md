# Clarity-Loop

This repository provides a reproducible generator for a long-form Clarity Loop book.

## Generate the book PDF

```bash
python -m pip install fpdf2 pypdf
python generate_book.py
```

This produces:

- `clarity_loop.pdf` (163 pages total by default)

## Validate page count

```bash
python - <<'PY'
from pypdf import PdfReader
print(len(PdfReader('clarity_loop.pdf').pages))
PY
```


## Generate the technical-novel PDF

```bash
python -m pip install fpdf2
python generate_novel_pdf.py
```

This produces:

- `clarity_loop_novel.pdf`
