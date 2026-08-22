import { invoke } from "@tauri-apps/api/core";

export interface AiChatOptions {
  useWeb?: boolean;
  searxngUrl?: string;
  attachments?: any[];
}

export async function aiChat(
  prompt: string,
  options: AiChatOptions = {}
): Promise<string> {
  return await invoke<string>("ai_chat", {
    prompt,
    useWeb: options.useWeb ?? false,
    searxngUrl: options.searxngUrl ?? "",
    attachments: options.attachments ?? [],
  });
}