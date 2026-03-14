from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from pathlib import Path
import re

from fpdf import FPDF

TITLE = "Clarity Loop: A Practical Guide to Thinking, Building, and Improving"
AUTHOR = "Paul A.K. Iyogun"
SOURCE_FILE = Path("manuscript_novel.md")
OUTPUT_FILE = Path("clarity_loop_novel.pdf")


@dataclass
class Block:
    kind: str
    text: str


class NovelPDF(FPDF):
    def header(self):
        if self.page_no() <= 2:
            return
        self.set_font("Helvetica", "I", 9)
        self.set_text_color(90, 90, 90)
        self.cell(0, 7, TITLE, border=0, new_x="RIGHT", new_y="TOP", align="L")
        self.cell(0, 7, f"Page {self.page_no() - 2}", border=0, new_x="LMARGIN", new_y="NEXT", align="R")
        self.ln(2)

    def footer(self):
        if self.page_no() <= 2:
            return
        self.set_y(-11)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(100, 100, 100)
        self.cell(0, 7, f"Technical Novel Edition - {date.today().isoformat()}", border=0, new_x="RIGHT", new_y="TOP", align="C")




def sanitize_text(text: str) -> str:
    replacements = {
        "—": "-",
        "–": "-",
        "•": "-",
        "’": "'",
        "‘": "'",
        "“": '"',
        "”": '"',
        "…": "...",
        "→": "->",
    }
    for src, dst in replacements.items():
        text = text.replace(src, dst)
    return text


def clean_inline_markdown(text: str) -> str:
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
    text = re.sub(r"\*(.+?)\*", r"\1", text)
    text = re.sub(r"`(.+?)`", r"\1", text)
    return sanitize_text(text.strip())


def parse_markdown(md_text: str) -> list[Block]:
    blocks: list[Block] = []
    for raw in md_text.splitlines():
        line = raw.rstrip()
        if not line.strip():
            blocks.append(Block("blank", ""))
            continue

        if line.strip() in {"---", "***"}:
            blocks.append(Block("rule", ""))
            continue

        if line.startswith("### "):
            blocks.append(Block("h3", clean_inline_markdown(line[4:])))
            continue
        if line.startswith("## "):
            blocks.append(Block("h2", clean_inline_markdown(line[3:])))
            continue
        if line.startswith("# "):
            blocks.append(Block("h1", clean_inline_markdown(line[2:])))
            continue

        stripped = line.lstrip()
        if stripped.startswith("- "):
            blocks.append(Block("bullet", clean_inline_markdown(stripped[2:])))
            continue
        if re.match(r"^\d+\.\s", stripped):
            blocks.append(Block("numbered", clean_inline_markdown(stripped)))
            continue

        blocks.append(Block("p", clean_inline_markdown(stripped)))

    return blocks


def mc(pdf: NovelPDF, text: str, h: int = 7, align: str = "L"):
    pdf.set_x(pdf.l_margin)
    pdf.multi_cell(0, h, text, align=align)


def add_title_pages(pdf: NovelPDF):
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 24)
    pdf.ln(35)
    mc(pdf, TITLE, h=12, align="C")
    pdf.ln(6)
    pdf.set_font("Helvetica", "I", 13)
    mc(pdf, "A Technical Novel of GIS Modernization, AI Automation, and IT Governance", h=9, align="C")
    pdf.ln(14)
    pdf.set_font("Helvetica", "", 12)
    mc(pdf, f"by {AUTHOR}", h=8, align="C")

    pdf.add_page()
    pdf.set_font("Helvetica", "B", 16)
    pdf.set_x(pdf.l_margin)
    pdf.cell(0, 12, "Production Notes", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 11)
    mc(
        pdf,
        "This PDF is generated from manuscript_novel.md. "
        "The manuscript is formatted as a narrative technical novel and rendered with lightweight markdown parsing.",
    )
    pdf.ln(2)
    mc(pdf, f"Source: {SOURCE_FILE}")
    mc(pdf, f"Output: {OUTPUT_FILE}")
    mc(pdf, f"Generated: {date.today().isoformat()}")


def render_blocks(pdf: NovelPDF, blocks: list[Block]):
    for block in blocks:
        if block.kind == "blank":
            pdf.ln(2)
            continue

        if block.kind == "rule":
            y = pdf.get_y() + 1
            pdf.line(pdf.l_margin, y, pdf.w - pdf.r_margin, y)
            pdf.ln(4)
            continue

        if block.kind == "h1":
            pdf.ln(3)
            pdf.set_font("Helvetica", "B", 18)
            mc(pdf, block.text, h=10)
            pdf.ln(1)
            continue

        if block.kind == "h2":
            if block.text.lower().startswith("chapter "):
                pdf.add_page()
            else:
                pdf.ln(3)
            pdf.set_font("Helvetica", "B", 15)
            mc(pdf, block.text, h=9)
            pdf.ln(1)
            continue

        if block.kind == "h3":
            pdf.set_font("Helvetica", "B", 12)
            mc(pdf, block.text, h=7)
            continue

        if block.kind == "bullet":
            pdf.set_font("Helvetica", "", 11)
            mc(pdf, f"- {block.text}", h=6)
            continue

        if block.kind == "numbered":
            pdf.set_font("Helvetica", "", 11)
            mc(pdf, block.text, h=6)
            continue

        pdf.set_font("Helvetica", "", 11)
        mc(pdf, block.text, h=7)


def build_pdf(source_file: Path = SOURCE_FILE, output_file: Path = OUTPUT_FILE):
    if not source_file.exists():
        raise FileNotFoundError(f"Source manuscript not found: {source_file}")

    blocks = parse_markdown(source_file.read_text(encoding="utf-8"))
    pdf = NovelPDF(format="Letter")
    pdf.set_auto_page_break(auto=True, margin=12)
    pdf.set_margins(18, 14, 18)

    add_title_pages(pdf)
    render_blocks(pdf, blocks)
    pdf.output(str(output_file))


if __name__ == "__main__":
    build_pdf()
    print(f"Generated {OUTPUT_FILE}")
