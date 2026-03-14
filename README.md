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


## Generate cinematic front cover and KDP wrap

```bash
python -m pip install pillow
python generate_covers.py
```

This produces:

- `clarity_loop_front_cover.png` (front cover, 6x9 @ 300 DPI)
- `clarity_loop_kdp_wrap.png` (full KDP spread including back + spine + front, with bleed for 350 pages)
