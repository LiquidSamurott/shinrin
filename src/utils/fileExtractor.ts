import {
  readFile,
  readTextFile,
} from "@tauri-apps/plugin-fs";

import * as pdfjsLib from "pdfjs-dist";

import type {
  ChatAttachment,
} from "../types/attachement";

import {
  isPdfAttachment,
  isTextAttachment,
  isDocumentAttachment,
} from "../types/attachement";

// ============================================================
// PDF.js
// ============================================================

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;


// ============================================================
// Main File Extractor
// ============================================================

export async function extractFileContent(
  attachment: ChatAttachment
): Promise<string> {

  // ----------------------------------------------------------
  // Cached extraction
  // ----------------------------------------------------------

  if (
    attachment.extractedText &&
    attachment.extractedText.trim().length > 0
  ) {
    return attachment.extractedText;
  }


  // ----------------------------------------------------------
  // Images
  //
  // Images are NOT converted to text here.
  // They should be sent directly to a vision-capable Qwen
  // model as image data.
  // ----------------------------------------------------------

  if (isImageAttachment(attachment)) {
    return "";
  }


  try {

    // ========================================================
    // PDF
    // ========================================================

    if (isPdfAttachment(attachment)) {

      const bytes =
        await readAttachmentBytes(
          attachment
        );

      if (!bytes) {
        return "";
      }

      const text =
        await parsePdfBytes(bytes);

      cacheExtraction(
        attachment,
        text
      );

      return text;
    }


    // ========================================================
    // Plain / Structured Text
    // ========================================================

    if (isTextAttachment(attachment)) {

      const text =
        await readAttachmentText(
          attachment
        );

      cacheExtraction(
        attachment,
        text
      );

      return text;
    }


    // ========================================================
    // Documents
    // ========================================================

    if (isDocumentAttachment(attachment)) {

      const text =
        await extractDocumentText(
          attachment
        );

      cacheExtraction(
        attachment,
        text
      );

      return text;
    }

  } catch (error) {

    const message =
      error instanceof Error
        ? error.message
        : "Unknown extraction error.";

    console.error(
      `Failed to extract content from ${attachment.name}:`,
      error
    );

    attachment.processed = false;
    attachment.extractionError = message;

    return "";
  }

  return "";
}


// ============================================================
// Read Attachment Bytes
// ============================================================

async function readAttachmentBytes(
  attachment: ChatAttachment
): Promise<Uint8Array | null> {

  // Tauri filesystem path
  if (attachment.path) {
    return await readFile(
      attachment.path
    );
  }

  // Browser File
  if (attachment.file) {

    const buffer =
      await attachment.file.arrayBuffer();

    return new Uint8Array(buffer);
  }

  return null;
}


// ============================================================
// Read Text Attachment
// ============================================================

async function readAttachmentText(
  attachment: ChatAttachment
): Promise<string> {

  // Tauri filesystem
  if (attachment.path) {
    return await readTextFile(
      attachment.path
    );
  }

  // Browser File
  if (attachment.file) {
    return await attachment.file.text();
  }

  return "";
}


// ============================================================
// PDF Extraction
// ============================================================

async function parsePdfBytes(
  bytes: Uint8Array
): Promise<string> {

  const pdf =
    await pdfjsLib.getDocument({
      data: bytes,
    }).promise;

  let fullText = "";

  for (
    let pageNumber = 1;
    pageNumber <= pdf.numPages;
    pageNumber++
  ) {

    const page =
      await pdf.getPage(
        pageNumber
      );

    const textContent =
      await page.getTextContent();

    const pageText =
      textContent.items
        .map(item =>
          "str" in item
            ? item.str
            : ""
        )
        .join(" ");

    fullText +=
      `--- Page ${pageNumber} ---\n` +
      `${pageText.trim()}\n\n`;
  }

  return fullText.trim();
}


// ============================================================
// Document Extraction
// ============================================================

async function extractDocumentText(
  attachment: ChatAttachment
): Promise<string> {

  const extension =
    attachment.name
      .split(".")
      .pop()
      ?.toLowerCase() ?? "";


  // ----------------------------------------------------------
  // DOCX
  // ----------------------------------------------------------

  if (extension === "docx") {

    const bytes =
      await readAttachmentBytes(
        attachment
      );

    if (!bytes) {
      return "";
    }

    return await parseDocxBytes(
      bytes
    );
  }


  // ----------------------------------------------------------
  // RTF
  // ----------------------------------------------------------

  if (extension === "rtf") {

    const text =
      await readAttachmentText(
        attachment
      );

    return stripRtf(
      text
    );
  }


  // ----------------------------------------------------------
  // ODT / PPTX / XLSX
  //
  // These require format-specific parsers.
  // Don't attempt to interpret their binary data as text.
  // ----------------------------------------------------------

  if (
    extension === "odt" ||
    extension === "ppt" ||
    extension === "pptx" ||
    extension === "xls" ||
    extension === "xlsx" ||
    extension === "ods" ||
    extension === "epub"
  ) {

    console.warn(
      `No parser configured for .${extension}`
    );

    return "";
  }


  return "";
}


// ============================================================
// DOCX Parser
// ============================================================
//
// DOCX is a ZIP containing XML.
// This implementation extracts the text from
// word/document.xml.
//
// For a more complete DOCX parser, use mammoth.
// ============================================================

async function parseDocxBytes(
  bytes: Uint8Array
): Promise<string> {
  try {
    const mammoth =
      await import("mammoth");

    // Create a real ArrayBuffer.
    const buffer = new ArrayBuffer(bytes.byteLength);

    new Uint8Array(buffer).set(bytes);

    const result =
      await mammoth.extractRawText({
        arrayBuffer: buffer,
      });

    return result.value.trim();
  } catch (error) {
    console.error(
      "Failed to parse DOCX:",
      error
    );

    return "";
  }
}


// ============================================================
// RTF Parser
// ============================================================

function stripRtf(
  value: string
): string {

  return value
    .replace(
      /\\'[0-9a-fA-F]{2}/g,
      ""
    )
    .replace(
      /\\[a-z]+\d* ?/gi,
      ""
    )
    .replace(
      /[{}]/g,
      ""
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}


// ============================================================
// Cache Extraction
// ============================================================

function cacheExtraction(
  attachment: ChatAttachment,
  text: string
): void {

  attachment.extractedText =
    text;

  attachment.processed =
    true;

  attachment.extractionError =
    undefined;
}


// ============================================================
// Image Helper
// ============================================================

function isImageAttachment(
  attachment: ChatAttachment
): boolean {

  return (
    attachment.type === "image" ||
    attachment.mimeType.startsWith(
      "image/"
    )
  );
}