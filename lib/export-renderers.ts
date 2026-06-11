import { AlignmentType, BorderStyle, Document, HeadingLevel, HeightRule, ImageRun, Packer, PageBreak, Paragraph, ShadingType, Table, TableCell, TableRow, TextRun, VerticalAlign, WidthType } from "docx";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { assembleManuscript } from "./manuscript";
import type { Book } from "./types";

const MIME = { pdf: "application/pdf", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" } as const;
const MIDNIGHT = "101D35", GOLD = "C89A4B", IVORY = "F7F0E3";
const BRAND_LOGO_PATH = path.join(process.cwd(), "public", "assets", "branding", "clarity-loop-logo.png");

async function readBrandLogo(): Promise<Buffer> {
  return readFile(BRAND_LOGO_PATH);
}

export function safeFilename(title: string, extension: keyof typeof MIME): string {
  const base = title.normalize("NFKD").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "book";
  return `${base}.${extension}`;
}

function paragraphToDocx(text: string): Paragraph {
  if (text.startsWith("## ")) return new Paragraph({ text: text.slice(3), heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 }, keepNext: true });
  if (text.startsWith("# ")) return new Paragraph({ text: text.slice(2), heading: HeadingLevel.HEADING_1, spacing: { before: 280, after: 160 }, keepNext: true });
  return new Paragraph({ children: [new TextRun({ text, size: 23, font: "Georgia", color: "243247" })], spacing: { after: 180, line: 330 }, widowControl: true });
}

function designedDocxCover(book: Book, logo: Buffer): Table {
  const noBorders = { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } };
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE }, borders: noBorders,
    rows: [new TableRow({ height: { value: 11520, rule: HeightRule.EXACT }, children: [new TableCell({
      verticalAlign: VerticalAlign.CENTER, shading: { fill: MIDNIGHT, type: ShadingType.CLEAR }, margins: { top: 900, bottom: 900, left: 720, right: 720 },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 360 }, children: [new ImageRun({ data: logo, transformation: { width: 92, height: 92 }, type: "png" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [new TextRun({ text: book.title.toUpperCase(), color: IVORY, bold: true, size: 54, font: "Georgia" })] }),
        ...(book.subtitle ? [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 900 }, children: [new TextRun({ text: book.subtitle, color: "D9CDBA", italics: true, size: 25, font: "Georgia" })] })] : []),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 700 }, children: [new TextRun({ text: book.authorName.toUpperCase(), color: GOLD, bold: true, size: 25, font: "Aptos" })] }),
        ...(book.publisherCredit ? [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 420 }, children: [new TextRun({ text: book.publisherCredit, color: "B9B3A8", size: 17, font: "Aptos" })] })] : []),
      ],
    })] })],
  });
}

export async function renderDocx(book: Book): Promise<Buffer> {
  const manuscript = assembleManuscript(book);
  const logo = await readBrandLogo();
  const children: (Paragraph | Table)[] = [];
  manuscript.sections.forEach((section, index) => {
    if (index > 0 && section.pageBreakBefore) children.push(new Paragraph({ children: [new PageBreak()] }));
    if (section.kind === "cover") { children.push(designedDocxCover(book, logo)); return; }
    if (section.kind === "title_page") children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 720, after: 360 }, children: [new ImageRun({ data: logo, transformation: { width: 72, height: 72 }, type: "png" })] }));
    const centered = section.kind === "title_page" || section.kind === "part_divider";
    children.push(new Paragraph({ text: section.title, heading: section.kind === "chapter" ? HeadingLevel.HEADING_1 : HeadingLevel.TITLE, alignment: centered ? AlignmentType.CENTER : AlignmentType.LEFT, spacing: { before: centered ? 1200 : 0, after: 280 }, pageBreakBefore: false }));
    section.paragraphs.forEach((paragraph) => children.push(paragraphToDocx(paragraph)));
  });
  const document = new Document({
    creator: book.authorName, title: book.title, description: book.subtitle,
    sections: [{ properties: { page: { margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 }, pageNumbers: { start: 1 } } }, children }],
    styles: { default: { document: { run: { font: "Georgia", size: 23, color: "243247" }, paragraph: { spacing: { line: 330 } } } } },
  });
  return Buffer.from(await Packer.toBuffer(document));
}

function wrapText(text: string, font: { widthOfTextAtSize(text: string, size: number): number }, size: number, maxWidth: number): string[] {
  const words = text.replace(/^#{1,6}\s+/, "").split(/\s+/); const lines: string[] = []; let line = "";
  for (const word of words) { const candidate = line ? `${line} ${word}` : word; if (font.widthOfTextAtSize(candidate, size) <= maxWidth) line = candidate; else { if (line) lines.push(line); line = word; } }
  if (line) lines.push(line); return lines;
}

export async function renderPdf(book: Book): Promise<Buffer> {
  const manuscript = assembleManuscript(book);
  const logoBytes = await readBrandLogo();
  const pdf = await PDFDocument.create(); pdf.setTitle(book.title); pdf.setAuthor(book.authorName); pdf.setSubject(book.subtitle);
  const brandLogo = await pdf.embedPng(logoBytes);
  const bodyFont = await pdf.embedFont(StandardFonts.TimesRoman); const boldFont = await pdf.embedFont(StandardFonts.TimesRomanBold); const sans = await pdf.embedFont(StandardFonts.HelveticaBold);
  const width = 612, height = 792, margin = 72, maxWidth = width - margin * 2;
  let page = pdf.addPage([width, height]); let y = height - margin; let pageNumber = 0; let numberPages = false;
  const footer = () => { if (numberPages) page.drawText(String(pageNumber), { x: width / 2 - 3, y: 32, size: 9, font: bodyFont, color: rgb(.35, .39, .45) }); };
  const addPage = () => { footer(); page = pdf.addPage([width, height]); y = height - margin; if (numberPages) pageNumber += 1; };
  const draw = (text: string, size = 11, bold = false, gap = 16, centered = false, color = rgb(.12, .18, .27)) => { const font = bold ? boldFont : bodyFont; for (const line of wrapText(text, font, size, maxWidth)) { if (y < margin + 24) addPage(); const x = centered ? (width - font.widthOfTextAtSize(line, size)) / 2 : margin; page.drawText(line, { x, y, size, font, color }); y -= gap; } y -= gap * .5; };
  manuscript.sections.forEach((section, index) => {
    if (index > 0 && section.pageBreakBefore) { if (section.kind === "chapter" && !numberPages) { numberPages = true; pageNumber = 0; } addPage(); }
    if (section.kind === "cover") {
      page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(.063, .114, .208) });
      page.drawImage(brandLogo, { x: width / 2 - 46, y: 630, width: 92, height: 92 });
      page.drawCircle({ x: 142, y: 595, size: 68, borderColor: rgb(.78, .60, .29), borderWidth: 4 });
      page.drawCircle({ x: 222, y: 595, size: 39, borderColor: rgb(.78, .60, .29), borderWidth: 3 });
      page.drawLine({ start: { x: 257, y: 595 }, end: { x: 475, y: 595 }, thickness: 4, color: rgb(.78, .60, .29) });
      [335, 405, 475].forEach((x, i) => page.drawCircle({ x, y: 595 - i * 24, size: 7, color: rgb(.78, .60, .29) }));
      y = 470; const titleSize = book.title.length > 28 ? 34 : 43; for (const line of wrapText(book.title.toUpperCase(), boldFont, titleSize, maxWidth)) { page.drawText(line, { x: (width - boldFont.widthOfTextAtSize(line, titleSize)) / 2, y, size: titleSize, font: boldFont, color: rgb(.97, .94, .88) }); y -= titleSize * 1.12; }
      y -= 22; if (book.subtitle) draw(book.subtitle, 16, false, 22, true, rgb(.85, .80, .70));
      page.drawText(book.authorName.toUpperCase(), { x: (width - sans.widthOfTextAtSize(book.authorName.toUpperCase(), 14)) / 2, y: 92, size: 14, font: sans, color: rgb(.78, .60, .29) });
      if (book.publisherCredit) page.drawText(book.publisherCredit, { x: (width - bodyFont.widthOfTextAtSize(book.publisherCredit, 9)) / 2, y: 57, size: 9, font: bodyFont, color: rgb(.72, .70, .66) });
      return;
    }
    const centered = section.kind === "title_page" || section.kind === "part_divider";
    if (section.kind === "title_page") { page.drawImage(brandLogo, { x: width / 2 - 36, y: 610, width: 72, height: 72 }); y = 555; }
    else if (centered) y = height * .65;
    draw(section.title, section.kind === "chapter" ? 20 : section.kind === "part_divider" ? 28 : 24, true, section.kind === "part_divider" ? 34 : 27, centered);
    section.paragraphs.forEach((paragraph) => { const heading = /^#{1,6}\s+/.test(paragraph); draw(paragraph, heading ? 14 : 11, heading, heading ? 20 : 16, centered && section.kind !== "title_page"); });
  });
  footer(); return Buffer.from(await pdf.save());
}

export { MIME };
