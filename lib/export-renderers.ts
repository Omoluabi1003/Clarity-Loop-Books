import { AlignmentType, BorderStyle, Document, HeadingLevel, HeightRule, Packer, PageBreak, Paragraph, ShadingType, Table, TableCell, TableRow, TextRun, VerticalAlign, WidthType } from "docx";
import fontkit from "@pdf-lib/fontkit";
import notoSansArabicDataUrl from "@fontsource/noto-sans-arabic/files/noto-sans-arabic-arabic-400-normal.woff";
import notoSansScDataUrl from "@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-400-normal.woff";
import notoSansDataUrl from "@fontsource/noto-sans/files/noto-sans-latin-ext-400-normal.woff";
import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import { assembleManuscript } from "./manuscript";
import type { Book } from "./types";

const MIME = { pdf: "application/pdf", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" } as const;
const MIDNIGHT = "101D35", GOLD = "C89A4B", IVORY = "F7F0E3";

export function safeFilename(title: string, extension: keyof typeof MIME): string {
  const base = title.normalize("NFC").replace(/[^\p{L}\p{M}\p{N}]+/gu, "-").replace(/^-|-$/g, "").toLocaleLowerCase() || "book";
  return `${base}.${extension}`;
}

const EXPORT_FONT_DATA = {
  arabic: notoSansArabicDataUrl,
  chinese: notoSansScDataUrl,
  extendedLatin: notoSansDataUrl,
} as const;

function decodeFontData(dataUrl: string): Buffer {
  const encoded = dataUrl.slice(dataUrl.indexOf(",") + 1);
  return Buffer.from(encoded, "base64");
}

type ExportTypography = { fontName: string; fontKind?: keyof typeof EXPORT_FONT_DATA; rtl: boolean; customPdfFont: boolean };

function exportTypography(text: string): ExportTypography {
  if (/\p{Script=Arabic}/u.test(text)) return { fontName: "Noto Sans Arabic", fontKind: "arabic", rtl: true, customPdfFont: true };
  if (/[\u3400-\u9fff\uf900-\ufaff]/u.test(text)) return { fontName: "Noto Sans SC", fontKind: "chinese", rtl: false, customPdfFont: true };
  if (/[^\x00-\x7f]/u.test(text)) return { fontName: "Noto Sans", fontKind: "extendedLatin", rtl: false, customPdfFont: true };
  return { fontName: "Georgia", rtl: false, customPdfFont: false };
}

function paragraphToDocx(text: string, typography: ExportTypography): Paragraph {
  const shared = { bidirectional: typography.rtl, alignment: typography.rtl ? AlignmentType.RIGHT : AlignmentType.LEFT };
  if (text.startsWith("## ")) return new Paragraph({ ...shared, text: text.slice(3), heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 }, keepNext: true });
  if (text.startsWith("# ")) return new Paragraph({ ...shared, text: text.slice(2), heading: HeadingLevel.HEADING_1, spacing: { before: 280, after: 160 }, keepNext: true });
  return new Paragraph({ ...shared, children: [new TextRun({ text, size: 23, font: typography.fontName, color: "243247", rightToLeft: typography.rtl })], spacing: { after: 180, line: 330 }, widowControl: true });
}

function designedDocxCover(book: Book, typography: ExportTypography): Table {
  const noBorders = { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } };
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE }, borders: noBorders,
    rows: [new TableRow({ height: { value: 11520, rule: HeightRule.EXACT }, children: [new TableCell({
      verticalAlign: VerticalAlign.CENTER, shading: { fill: MIDNIGHT, type: ShadingType.CLEAR }, margins: { top: 900, bottom: 900, left: 720, right: 720 },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 420 }, children: [new TextRun({ text: "◯  ━━━  ◇", color: GOLD, size: 34, font: typography.fontName, rightToLeft: typography.rtl })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [new TextRun({ text: book.title.toUpperCase(), color: IVORY, bold: true, size: 54, font: typography.fontName, rightToLeft: typography.rtl })] }),
        ...(book.subtitle ? [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 900 }, children: [new TextRun({ text: book.subtitle, color: "D9CDBA", italics: true, size: 25, font: typography.fontName, rightToLeft: typography.rtl })] })] : []),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 700 }, children: [new TextRun({ text: book.authorName.toUpperCase(), color: GOLD, bold: true, size: 25, font: typography.fontName, rightToLeft: typography.rtl })] }),
        ...(book.publisherCredit ? [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 420 }, children: [new TextRun({ text: book.publisherCredit, color: "B9B3A8", size: 17, font: typography.fontName, rightToLeft: typography.rtl })] })] : []),
      ],
    })] })],
  });
}

export async function renderDocx(book: Book): Promise<Buffer> {
  const manuscript = assembleManuscript(book);
  const fullText = manuscript.sections.flatMap((section) => [section.title, ...section.paragraphs]).join("\n");
  const typography = exportTypography(fullText);
  const children: (Paragraph | Table)[] = [];
  manuscript.sections.forEach((section, index) => {
    if (index > 0 && section.pageBreakBefore) children.push(new Paragraph({ children: [new PageBreak()] }));
    if (section.kind === "cover") { children.push(designedDocxCover(book, typography)); return; }
    const centered = section.kind === "title_page" || section.kind === "part_divider";
    children.push(new Paragraph({ text: section.title, heading: section.kind === "chapter" ? HeadingLevel.HEADING_1 : HeadingLevel.TITLE, alignment: centered ? AlignmentType.CENTER : typography.rtl ? AlignmentType.RIGHT : AlignmentType.LEFT, bidirectional: typography.rtl, spacing: { before: centered ? 1200 : 0, after: 280 }, pageBreakBefore: false }));
    section.paragraphs.forEach((paragraph) => children.push(paragraphToDocx(paragraph, typography)));
  });
  const document = new Document({
    creator: book.authorName, title: book.title, description: book.subtitle,
    sections: [{ properties: { page: { margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 }, pageNumbers: { start: 1 } } }, children }],
    styles: { default: { document: { run: { font: typography.fontName, size: 23, color: "243247", rightToLeft: typography.rtl }, paragraph: { spacing: { line: 330 } } } } },
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
  const pdf = await PDFDocument.create(); pdf.setTitle(book.title); pdf.setAuthor(book.authorName); pdf.setSubject(book.subtitle);
  const fullText = manuscript.sections.flatMap((section) => [section.title, ...section.paragraphs]).join("\n");
  const typography = exportTypography(fullText);
  let bodyFont: PDFFont; let boldFont: PDFFont; let sans: PDFFont;
  if (typography.customPdfFont) {
    pdf.registerFontkit(fontkit);
    const fontBytes = decodeFontData(EXPORT_FONT_DATA[typography.fontKind!]);
    bodyFont = await pdf.embedFont(fontBytes, { subset: true });
    boldFont = bodyFont;
    sans = bodyFont;
  } else {
    bodyFont = await pdf.embedFont(StandardFonts.TimesRoman);
    boldFont = await pdf.embedFont(StandardFonts.TimesRomanBold);
    sans = await pdf.embedFont(StandardFonts.HelveticaBold);
  }
  const width = 612, height = 792, margin = 72, maxWidth = width - margin * 2;
  let page = pdf.addPage([width, height]); let y = height - margin; let pageNumber = 0; let numberPages = false;
  const footer = () => { if (numberPages) page.drawText(String(pageNumber), { x: width / 2 - 3, y: 32, size: 9, font: bodyFont, color: rgb(.35, .39, .45) }); };
  const addPage = () => { footer(); page = pdf.addPage([width, height]); y = height - margin; if (numberPages) pageNumber += 1; };
  const draw = (text: string, size = 11, bold = false, gap = 16, centered = false, color = rgb(.12, .18, .27)) => { const font = bold ? boldFont : bodyFont; for (const line of wrapText(text, font, size, maxWidth)) { if (y < margin + 24) addPage(); const x = centered ? (width - font.widthOfTextAtSize(line, size)) / 2 : typography.rtl ? width - margin - font.widthOfTextAtSize(line, size) : margin; page.drawText(line, { x, y, size, font, color }); y -= gap; } y -= gap * .5; };
  manuscript.sections.forEach((section, index) => {
    if (index > 0 && section.pageBreakBefore) { if (section.kind === "chapter" && !numberPages) { numberPages = true; pageNumber = 0; } addPage(); }
    if (section.kind === "cover") {
      page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(.063, .114, .208) });
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
    if (centered) y = height * .65;
    draw(section.title, section.kind === "chapter" ? 20 : section.kind === "part_divider" ? 28 : 24, true, section.kind === "part_divider" ? 34 : 27, centered);
    section.paragraphs.forEach((paragraph) => { const heading = /^#{1,6}\s+/.test(paragraph); draw(paragraph, heading ? 14 : 11, heading, heading ? 20 : 16, centered && section.kind !== "title_page"); });
  });
  footer(); return Buffer.from(await pdf.save());
}

export { MIME };
