import type { AIRequest, AssistantMessage } from "../types/ai";
import { invoke } from "@tauri-apps/api/core";
import { generateMindmap } from "./mindmapService";
import { extractFileContent } from "../utils/fileExtractor";
import { now } from "../utils/date";

export async function sendAssistantMessage(
  request: AIRequest
): Promise<AssistantMessage> {
  const rawAttachments = request.attachments ?? [];

  // Extract content in frontend for non-native or complex files (e.g. PDFs/Docs)
  // and construct the payload matching Rust's `AiAttachment` struct
  const processedAttachments = await Promise.all(
    rawAttachments.map(async (attachment) => {
      let extractedText = "";

      if (
        attachment.type === "pdf" ||
        attachment.type === "document" ||
        attachment.type === "text"
      ) {
        try {
          extractedText = await extractFileContent(attachment);
        } catch (error) {
          console.error(
            `Failed to extract text from ${attachment.name}:`,
            error
          );
        }
      }

      return {
        id: attachment.id,
        name: attachment.name,
        attachmentType: attachment.type, // Map 'type' to Rust's 'attachment_type'
        mimeType: attachment.mimeType,
        size: attachment.size,
        path: (attachment as { path?: string }).path || undefined, // Native OS path if available
        extractedText: extractedText || undefined,
      };
    })
  );

  const imageAttachments = rawAttachments.filter(
    (attachment) => attachment.type === "image"
  );

  const wantsMindmap = /mind ?map|mindmap|concept map/i.test(request.message);

  if (wantsMindmap) {
    const combinedText = processedAttachments
      .map((a) => a.extractedText)
      .filter(Boolean)
      .join("\n\n");

    const mindmap = await generateMindmap({
      prompt: request.message,
      text: combinedText,
      images: imageAttachments,
    });

    return {
      id: crypto.randomUUID(),
      role: "assistant",
      type: "mindmap",
      content: "I've generated a mindmap from the provided material.",
      mindmap,
      createdAt: now(),
    };
  }

  // Invoke Tauri command with all required parameters expected by Rust
  const content = await invoke<string>("ai_chat", {
    prompt: request.message,
    attachments: processedAttachments,
    useWeb: false,
    searxngUrl: "",
  });

  return {
    id: crypto.randomUUID(),
    role: "assistant",
    type: "text",
    content,
    attachments: [],
    createdAt: now(),
  };
}