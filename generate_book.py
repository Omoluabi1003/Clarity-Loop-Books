from fpdf import FPDF
from datetime import date

TITLE = "Clarity Loop: A Practical Guide to Thinking, Building, and Improving"
AUTHOR = "Generated for Clarity-Loop"
OUTPUT_FILE = "clarity_loop.pdf"
TOTAL_CONTENT_PAGES = 160
CHAPTERS = [
    "Foundations of Clear Thinking",
    "Attention and Focus",
    "Systems and Feedback Loops",
    "Problem Framing",
    "Decision Design",
    "Communication for Alignment",
    "Learning in Public",
    "Habits and Rituals",
    "Documentation as a Force Multiplier",
    "Planning and Execution",
    "Quality, Testing, and Reliability",
    "Creativity Under Constraints",
    "Collaboration at Scale",
    "Leadership Through Clarity",
    "Product Discovery",
    "Metrics that Matter",
    "Change Management",
    "Resilience and Recovery",
    "Long-Term Mastery",
    "Building Your Own Clarity Loop",
]

PAGE_PROMPTS = [
    "Core idea",
    "Applied example",
    "Practice exercise",
    "Reflection questions",
    "Common pitfalls",
    "Advanced notes",
    "Team adaptation",
    "Daily implementation",
]


class BookPDF(FPDF):
    def header(self):
        if self.page_no() <= 3:
            return
        self.set_font("Helvetica", "I", 9)
        self.set_text_color(90, 90, 90)
        self.cell(0, 8, TITLE, border=0, ln=0, align="L")
        self.cell(0, 8, f"Page {self.page_no() - 3}", border=0, ln=1, align="R")
        self.ln(2)

    def footer(self):
        if self.page_no() <= 3:
            return
        self.set_y(-12)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(110, 110, 110)
        self.cell(0, 8, f"Clarity Loop Edition - {date.today().isoformat()}", 0, 0, "C")


def chapter_for_page(content_page_number: int) -> tuple[int, str]:
    pages_per_chapter = TOTAL_CONTENT_PAGES // len(CHAPTERS)
    chapter_index = min((content_page_number - 1) // pages_per_chapter, len(CHAPTERS) - 1)
    return chapter_index + 1, CHAPTERS[chapter_index]


def draw_title_page(pdf: BookPDF):
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 28)
    pdf.ln(45)
    pdf.multi_cell(0, 14, TITLE, align="C")
    pdf.ln(10)
    pdf.set_font("Helvetica", "", 14)
    pdf.multi_cell(0, 8, "A long-form workbook for deliberate progress", align="C")
    pdf.ln(25)
    pdf.set_font("Helvetica", "I", 12)
    pdf.multi_cell(0, 8, AUTHOR, align="C")
    pdf.ln(4)
    pdf.multi_cell(0, 8, f"Generated on {date.today().isoformat()}", align="C")


def draw_copyright_page(pdf: BookPDF):
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 12, "Publication Notes", ln=1)
    pdf.set_font("Helvetica", "", 12)
    note = (
        "This book was generated as a structured writing artifact for the Clarity-Loop repository. "
        "It is designed as a practical handbook with chapter-driven progression and page-based exercises.\n\n"
        "Usage: Read one chapter at a time, complete the embedded prompts, and adapt each model to your own work."
    )
    pdf.multi_cell(0, 8, note)


def draw_toc(pdf: BookPDF):
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 18)
    pdf.cell(0, 12, "Table of Contents", ln=1)
    pdf.ln(4)
    pdf.set_font("Helvetica", "", 12)
    pages_per_chapter = TOTAL_CONTENT_PAGES // len(CHAPTERS)
    for idx, chapter in enumerate(CHAPTERS, start=1):
        start_page = (idx - 1) * pages_per_chapter + 1
        end_page = idx * pages_per_chapter
        if idx == len(CHAPTERS):
            end_page = TOTAL_CONTENT_PAGES
        dots = "." * max(4, 78 - len(chapter))
        pdf.cell(0, 8, f"Chapter {idx}: {chapter} {dots} {start_page}-{end_page}", ln=1)


def draw_content_page(pdf: BookPDF, content_page_number: int):
    chapter_num, chapter_title = chapter_for_page(content_page_number)
    slot = (content_page_number - 1) % len(PAGE_PROMPTS)
    prompt_type = PAGE_PROMPTS[slot]

    pdf.add_page()
    pdf.set_font("Helvetica", "B", 14)
    pdf.multi_cell(0, 8, f"Chapter {chapter_num}: {chapter_title}")
    pdf.set_font("Helvetica", "", 12)
    pdf.cell(0, 8, f"Content Page {content_page_number} - {prompt_type}", ln=1)
    pdf.ln(2)

    paragraphs = [
        (
            f"The clarity loop begins with disciplined observation. On page {content_page_number}, "
            f"we translate abstract intent into a concrete next action and make progress visible. "
            "A clear system reduces friction by naming assumptions, constraints, and expected outcomes."
        ),
        (
            "Use this page to map one current challenge. Describe what you know, what remains uncertain, "
            "and what signal would prove that your direction is working. Favor short feedback cycles over "
            "perfect plans; each loop should improve both your model and your execution."
        ),
        (
            "Practice prompt: write a small experiment you can run within 24 hours. Capture the minimum "
            "evidence needed to decide whether to continue, pivot, or stop. Then identify one collaborator "
            "who can pressure-test your reasoning and strengthen the final decision."
        ),
        (
            "Reflection: what made your process clearer today? Which part stayed fuzzy? Document one "
            "principle you will carry into the next cycle. Repeated reflection turns isolated wins into "
            "a reliable operating system for long-term growth."
        ),
    ]

    for p in paragraphs:
        pdf.multi_cell(0, 8, p)
        pdf.ln(1)

    pdf.ln(3)
    pdf.set_font("Helvetica", "I", 11)
    pdf.multi_cell(0, 7, "Notes:\n- ____________________________________________\n- ____________________________________________\n- ____________________________________________")


def main():
    pdf = BookPDF(format="LETTER")
    pdf.set_auto_page_break(auto=True, margin=15)

    draw_title_page(pdf)
    draw_copyright_page(pdf)
    draw_toc(pdf)

    for page_num in range(1, TOTAL_CONTENT_PAGES + 1):
        draw_content_page(pdf, page_num)

    pdf.output(OUTPUT_FILE)
    print(f"Generated {OUTPUT_FILE} with {pdf.page_no()} total pages.")


if __name__ == "__main__":
    main()
