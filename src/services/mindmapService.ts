import { invoke } from "@tauri-apps/api/core";

import type {
  ChatAttachment,
} from "../../src/types/attachement";

import {
  qwenToMindmapData,
} from "../utils/mindmapParser";

import type {
  MindmapData,
} from "../types/mindmap";

interface MindmapRequest {
  prompt: string;
  text: string;
  images: ChatAttachment[];
}

export async function generateMindmap(
  request: MindmapRequest
): Promise<MindmapData> {
  const content = `
Create a mindmap based on the following request.

REQUEST:
${request.prompt}

TEXT CONTENT:
${request.text}
`;

  const attachments =
    await Promise.all(
      request.images.map(
        async image => ({
          id: image.id,
          name: image.name,
          attachmentType: image.type,
          mimeType: image.mimeType,
          size: image.size,
          extractedText:
            image.extractedText ?? null,
          base64:
            image.file
              ? await fileToBase64(image.file)
              : null,
        })
      )
    );

  const raw = await invoke<string>(
    "ai_chat",
    {
      prompt: content,
      attachments,
      useWeb: false,
      searxngUrl: "",
      mode: "mindmap",
    }
  );

  if (typeof raw !== "string") {
    throw new Error(
      "AI returned an invalid mindmap response."
    );
  }

  return qwenToMindmapData(raw);
}

async function fileToBase64(
  file: File
): Promise<string> {
  const buffer =
    await file.arrayBuffer();

  const bytes =
    new Uint8Array(buffer);

  let binary = "";

  const chunkSize = 0x8000;

  for (
    let i = 0;
    i < bytes.length;
    i += chunkSize
  ) {
    binary += String.fromCharCode(
      ...bytes.subarray(
        i,
        i + chunkSize
      )
    );
  }

  return `data:${file.type};base64,${btoa(
    binary
  )}`;
}