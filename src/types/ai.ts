import type { ChatAttachment } from "./attachement";
import type { MindmapData } from "./mindmap";

export type AssistantMessageType =
  | "text"
  | "mindmap";

export interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  type: AssistantMessageType;
  content: string;
  attachments?: ChatAttachment[];
  mindmap?: MindmapData;
  createdAt: string;
}

export interface AIRequest {
  message: string;
  attachments?: ChatAttachment[];
  enableThinking?: boolean;
}

export type KanbanAIAction =
  | "improve_title"
  | "write_description"
  | "expand_task"
  | "make_concise"
  | "generate_subtasks"
  | "suggest_labels";

export interface KanbanAIRequest {
  action: KanbanAIAction;
  title: string;
  description: string;
  labels: string[];
}

export interface KanbanAIResponse {
  title?: string;
  description?: string;
  subtasks?: string[];
  labels?: string[];
}