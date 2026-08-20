// src/types/attachement.ts

/* ============================================================
   Attachment Types
============================================================ */

export type AttachmentType =
  | "image"
  | "pdf"
  | "text"
  | "document";


/* ============================================================
   Supported MIME Types
============================================================ */

export type AttachmentMimeType =
  // Images
  | "image/png"
  | "image/jpeg"
  | "image/jpg"
  | "image/webp"
  | "image/gif"
  | "image/bmp"
  | "image/svg+xml"

  // PDF
  | "application/pdf"

  // Plain / structured text
  | "text/plain"
  | "text/markdown"
  | "text/csv"
  | "text/html"
  | "text/css"
  | "text/javascript"

  // JSON / XML
  | "application/json"
  | "application/xml"
  | "text/xml"

  // JavaScript / TypeScript
  | "application/javascript"
  | "application/typescript"

  // Documents
  | "application/msword"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

  // Other common document formats
  | "application/rtf"
  | "text/rtf"

  // Unknown / browser-provided
  | string;


/* ============================================================
   Attachment Source
============================================================ */

export type AttachmentSource =
  | "browser"
  | "filesystem";


/* ============================================================
   Chat Attachment
============================================================ */

export interface ChatAttachment {
  /**
   * Unique attachment identifier.
   */
  id: string;

  /**
   * Original filename.
   */
  name: string;

  /**
   * Logical attachment category.
   */
  type: AttachmentType;

  /**
   * MIME type reported by the browser/filesystem.
   */
  mimeType: AttachmentMimeType;

  /**
   * File size in bytes.
   */
  size: number;

  /**
   * Browser File object.
   *
   * Available when the attachment came from
   * an <input type="file">.
   */
  file?: File;

  /**
   * Tauri filesystem path.
   *
   * Useful for files selected through the native
   * filesystem dialog.
   */
  path?: string;

  /**
   * Object URL used for image previews.
   */
  previewUrl?: string;

  /**
   * Extracted textual content.
   *
   * Cached after PDF/text/document extraction.
   */
  extractedText?: string;

  /**
   * Where the attachment originated.
   */
  source?: AttachmentSource;

  /**
   * Whether the attachment has already been processed.
   */
  processed?: boolean;

  /**
   * Optional extraction error.
   */
  extractionError?: string;
}


/* ============================================================
   Attachment Classification
============================================================ */

export function getAttachmentType(
  file: Pick<File, "name" | "type">
): AttachmentType {
  const mime = file.type.toLowerCase();
  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase() ?? "";


  /* ----------------------------------------------------------
     Images
  ---------------------------------------------------------- */

  if (mime.startsWith("image/")) {
    return "image";
  }


  /* ----------------------------------------------------------
     PDF
  ---------------------------------------------------------- */

  if (
    mime === "application/pdf" ||
    extension === "pdf"
  ) {
    return "pdf";
  }


  /* ----------------------------------------------------------
     Text
  ---------------------------------------------------------- */

  if (
    mime.startsWith("text/") ||
    mime === "application/json" ||
    mime === "application/xml" ||
    isTextExtension(extension)
  ) {
    return "text";
  }


  /* ----------------------------------------------------------
     Documents
  ---------------------------------------------------------- */

  if (isDocumentExtension(extension)) {
    return "document";
  }


  /*
   * Unknown files are treated as documents rather than text.
   * This prevents binary files from accidentally being sent
   * through a text extractor.
   */

  return "document";
}


/* ============================================================
   Text Extensions
============================================================ */

export function isTextExtension(
  extension: string
): boolean {
  return [
    "txt",
    "md",
    "markdown",

    "csv",
    "tsv",

    "json",
    "jsonl",

    "xml",

    "yaml",
    "yml",

    "js",
    "jsx",
    "ts",
    "tsx",

    "vue",

    "rs",
    "py",
    "java",
    "cpp",
    "c",
    "h",
    "hpp",

    "html",
    "htm",
    "css",
    "scss",
    "sass",

    "sql",

    "sh",
    "bash",

    "toml",
    "ini",

    "log",
  ].includes(extension);
}


/* ============================================================
   Document Extensions
============================================================ */

export function isDocumentExtension(
  extension: string
): boolean {
  return [
    "doc",
    "docx",

    "rtf",

    "odt",

    "ppt",
    "pptx",

    "odp",

    "xls",
    "xlsx",

    "ods",

    "epub",
  ].includes(extension);
}


/* ============================================================
   Helpers
============================================================ */

export function isImageAttachment(
  attachment: ChatAttachment
): boolean {
  return attachment.type === "image";
}


export function isPdfAttachment(
  attachment: ChatAttachment
): boolean {
  return attachment.type === "pdf";
}


export function isTextAttachment(
  attachment: ChatAttachment
): boolean {
  return attachment.type === "text";
}


export function isDocumentAttachment(
  attachment: ChatAttachment
): boolean {
  return attachment.type === "document";
}


export function hasAttachmentFile(
  attachment: ChatAttachment
): boolean {
  return Boolean(
    attachment.file || attachment.path
  );
}