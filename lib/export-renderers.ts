import { AlignmentType, Document, HeadingLevel, Packer, PageBreak, Paragraph, TextRun } from "docx";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { assembleManuscript } from "./manuscript";
import type { Book } from "./types";

const MIME = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
} as const;

export function safeFilename(title: string, extension: keyof typeof MIME): string {
  const base = title.normalize("NFKD").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "manuscript";
  return `${base}.${extension}`;
}

function paragraphToDocx(text: string): Paragraph {
  if (text.startsWith("## ")) return new Paragraph({ text: text.slice(3), heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 } });
  if (text.startsWith("# ")) return new Paragraph({ text: text.slice(2), heading: HeadingLevel.HEADING_1, spacing: { before: 280, after: 160 } });
  return new Paragraph({ children: [new TextRun({ text, size: 23, font: "Georgia" })], spacing: { after: 180, line: 330 } });
}

export async function renderDocx(book: Book): Promise<Buffer> {
  const manuscript = assembleManuscript(book);
  const children: Paragraph[] = [];
  manuscript.sections.forEach((section, index) => {
    if (index > 0 && section.pageBreakBefore) children.push(new Paragraph({ children: [new PageBreak()] }));
    children.push(new Paragraph({ text: section.title, heading: section.kind === "chapter" ? HeadingLevel.HEADING_1 : HeadingLevel.TITLE, alignment: section.kind === "title_page" ? AlignmentType.CENTER : AlignmentType.LEFT, spacing: { after: 280 } }));
    section.paragraphs.forEach((paragraph) => children.push(paragraphToDocx(paragraph)));
  });
  const document = new Document({
    creator: book.authorName,
    title: book.title,
    description: book.subtitle,
    sections: [{ properties: { page: { margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } }, children }],
    styles: { default: { document: { run: { font: "Georgia", size: 23, color: "243247" }, paragraph: { spacing: { line: 330 } } } } },
  });
  return Buffer.from(await Packer.toBuffer(document));
}

function wrapText(text: string, font: { widthOfTextAtSize(text: string, size: number): number }, size: number, maxWidth: number): string[] {
  const words = text.replace(/^#{1,6}\s+/, "").split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) line = candidate;
    else { if (line) lines.push(line); line = word; }
  }
  if (line) lines.push(line);
  return lines;
}

export async function renderPdf(book: Book): Promise<Buffer> {
  const manuscript = assembleManuscript(book);
  const pdf = await PDFDocument.create();
  pdf.setTitle(book.title); pdf.setAuthor(book.authorName); pdf.setSubject(book.subtitle);
  const bodyFont = await pdf.embedFont(StandardFonts.TimesRoman);
  const boldFont = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const width = 612, height = 792, margin = 72, maxWidth = width - margin * 2;
  let page = pdf.addPage([width, height]);
  let y = height - margin;
  let pageNumber = 1;
  const addPage = () => { page.drawText(String(pageNumber), { x: width / 2, y: 32, size: 9, font: bodyFont, color: rgb(.35, .39, .45) }); pageNumber += 1; page = pdf.addPage([width, height]); y = height - margin; };
  const draw = (text: string, size = 11, bold = false, gap = 16) => {
    const font = bold ? boldFont : bodyFont;
    for (const line of wrapText(text, font, size, maxWidth)) {
      if (y < margin + 24) addPage();
      page.drawText(line, { x: margin, y, size, font, color: rgb(.12, .18, .27) });
      y -= gap;
    }
    y -= gap * .5;
  };
  manuscript.sections.forEach((section, index) => {
    if (index > 0 && section.pageBreakBefore) addPage();
    draw(section.title, section.kind === "chapter" ? 20 : 24, true, 27);
    section.paragraphs.forEach((paragraph) => {
      const heading = /^#{1,6}\s+/.test(paragraph);
      draw(paragraph, heading ? 14 : 11, heading, heading ? 20 : 16);
    });
  });
  page.drawText(String(pageNumber), { x: width / 2, y: 32, size: 9, font: bodyFont, color: rgb(.35, .39, .45) });
  return Buffer.from(await pdf.save());
}

export { MIME };
