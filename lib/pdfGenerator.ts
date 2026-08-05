import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";
import type { InitialEntry } from "@/lib/contractStore";
import type { ContractLang } from "@/lib/contractContent";
import { t } from "@/lib/uiStrings";

export type GeneratePdfParams = {
  lang?: ContractLang;
  introText?: string;
  contractText: string;
  signerName: string;
  signerEmail?: string;
  signatureDataUrl: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  contractId: string;
  hash: string;
  initials?: InitialEntry[];
};

const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89;
const MARGIN = 50;
const FONT_SIZE = 10;
const LINE_HEIGHT = 14;

function wrapText(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number
): string[] {
  const lines: string[] = [];
  text.split("\n").forEach((paragraph) => {
    if (paragraph.trim() === "") {
      lines.push("");
      return;
    }
    const words = paragraph.split(" ");
    let currentLine = "";
    words.forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, fontSize);
      if (width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) lines.push(currentLine);
  });
  return lines;
}

export async function generateContractPdf(
  params: GeneratePdfParams
): Promise<Uint8Array> {
  const {
    lang,
    introText,
    contractText,
    signerName,
    signerEmail,
    signatureDataUrl,
    timestamp,
    ip,
    userAgent,
    contractId,
    hash,
    initials,
  } = params;
  const s = t(lang).pdf;

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const maxWidth = PAGE_WIDTH - MARGIN * 2;

  let page: PDFPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  function addPageIfNeeded(spaceNeeded: number) {
    if (y - spaceNeeded < MARGIN) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
  }

  function drawParagraphBlock(text: string, fontSize = FONT_SIZE) {
    const wrapped = wrapText(text, font, fontSize, maxWidth);
    wrapped.forEach((line) => {
      addPageIfNeeded(LINE_HEIGHT);
      page.drawText(line, {
        x: MARGIN,
        y,
        size: fontSize,
        font,
        color: rgb(0.15, 0.16, 0.2),
      });
      y -= LINE_HEIGHT;
    });
  }

  // Page de garde — lettre de bienvenue
  if (introText) {
    page.drawText(s.welcomeHeading, {
      x: MARGIN,
      y,
      size: 16,
      font: fontBold,
      color: rgb(0.07, 0.09, 0.15),
    });
    y -= 28;
    drawParagraphBlock(introText);
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - MARGIN;
  }

  // Titre du contrat
  page.drawText(s.contractHeading, {
    x: MARGIN,
    y,
    size: 16,
    font: fontBold,
    color: rgb(0.07, 0.09, 0.15),
  });
  y -= 28;

  // Corps du contrat
  drawParagraphBlock(contractText);

  // Section signature
  addPageIfNeeded(180);
  y -= 20;
  page.drawText(s.signatureHeading, { x: MARGIN, y, size: 13, font: fontBold });
  y -= 20;

  if (signatureDataUrl?.includes(",")) {
    const base64 = signatureDataUrl.split(",")[1];
    const imgBytes = Uint8Array.from(Buffer.from(base64, "base64"));
    const pngImage = await pdfDoc.embedPng(imgBytes);
    const imgDims = pngImage.scale(0.35);
    addPageIfNeeded(imgDims.height + 10);
    page.drawImage(pngImage, {
      x: MARGIN,
      y: y - imgDims.height,
      width: imgDims.width,
      height: imgDims.height,
    });
    y -= imgDims.height + 10;
  }

  page.drawText(`${s.signedBy}: ${signerName}`, { x: MARGIN, y, size: FONT_SIZE, font });
  y -= LINE_HEIGHT;
  page.drawText(`${s.dateTime}: ${timestamp}`, { x: MARGIN, y, size: FONT_SIZE, font });
  y -= LINE_HEIGHT;

  // Initiales de confirmation (autorisation par article)
  if (initials && initials.length > 0) {
    addPageIfNeeded(140);
    y -= 20;
    page.drawText(s.initialsHeading, {
      x: MARGIN,
      y,
      size: 13,
      font: fontBold,
    });
    y -= 20;

    for (const initial of initials) {
      addPageIfNeeded(40);
      if (initial.dataUrl?.includes(",")) {
        try {
          const base64 = initial.dataUrl.split(",")[1];
          const imgBytes = Uint8Array.from(Buffer.from(base64, "base64"));
          const pngImage = await pdfDoc.embedPng(imgBytes);
          const imgDims = pngImage.scale(0.15);
          page.drawImage(pngImage, {
            x: MARGIN,
            y: y - imgDims.height + 8,
            width: imgDims.width,
            height: imgDims.height,
          });
          page.drawText(initial.label, {
            x: MARGIN + imgDims.width + 12,
            y,
            size: 9,
            font,
            color: rgb(0.3, 0.3, 0.3),
          });
          y -= Math.max(imgDims.height, LINE_HEIGHT) + 6;
        } catch {
          page.drawText(`${initial.label}: ${s.initialRecorded}`, {
            x: MARGIN,
            y,
            size: 9,
            font,
            color: rgb(0.3, 0.3, 0.3),
          });
          y -= LINE_HEIGHT;
        }
      }
    }
  }

  // Certificat de traçabilité
  addPageIfNeeded(150);
  y -= 20;
  page.drawText(s.certHeading, {
    x: MARGIN,
    y,
    size: 13,
    font: fontBold,
  });
  y -= 20;

  const certLines = [
    `${s.certId}: ${contractId}`,
    `${s.certSigner}: ${signerName}`,
    `${s.certEmail}: ${signerEmail || s.certEmailMissing}`,
    `${s.certDate}: ${timestamp}`,
    `${s.certIp}: ${ip}`,
    `${s.certAgent}: ${userAgent}`,
    `${s.certHash}: ${hash}`,
  ];
  certLines.forEach((line) => {
    addPageIfNeeded(LINE_HEIGHT);
    page.drawText(line, {
      x: MARGIN,
      y,
      size: 8.5,
      font,
      color: rgb(0.35, 0.37, 0.42),
    });
    y -= LINE_HEIGHT;
  });

  return pdfDoc.save();
}
