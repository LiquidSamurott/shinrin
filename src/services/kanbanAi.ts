import { aiChat } from "./ai";

export type KanbanAiAction =
  | "improve"
  | "rewrite"
  | "clarify"
  | "generate"
  | "checklist";

export interface KanbanCardInput {
  content: string;
}

const ACTION_INSTRUCTIONS: Record<KanbanAiAction, string> = {
  improve: `
Improve the content substantially.

Do NOT merely replace a few words with synonyms.
Reorganize sentences and paragraphs where appropriate.
Remove unnecessary repetition.
Improve logical flow and readability.
Preserve the original facts and meaning.

The result should be noticeably better and structurally different from the input.
`,

  rewrite: `
Completely rewrite the content from scratch.

Preserve the factual meaning, but do not preserve the original sentence structure.

You should:
- reorganize the information
- combine or split sentences when useful
- change the order of explanations when appropriate
- use substantially different wording
- improve the overall flow

Do NOT perform simple synonym replacement.

The result should look like a genuinely different version written by another author.
`,

  clarify: `
Rewrite the content for someone who understands the general topic but may not understand the original explanation easily.

You should:
- simplify complicated sentences
- explain technical terminology when necessary
- break long explanations into smaller ideas
- make relationships between ideas explicit
- remove unnecessary repetition

Do not add unrelated information.

The result should be significantly easier to understand than the original.
`,

  generate: `
Use the existing content as the foundation and generate useful additional material.

Do NOT simply rewrite the original.

Add relevant information such as:
- important concepts
- examples
- implications
- explanations
- practical applications
- related details

Only add information that is logically connected to the existing content.

The result should contain substantially more useful information than the input.
`,

  checklist: `
Transform the content into an actionable checklist.

Identify the concepts, tasks, or steps contained in the content.

Return ONLY a checklist.

Each item must:
- describe one concrete action or learning task
- be concise
- be independently actionable

Use this format:

- [ ] Task
- [ ] Task
- [ ] Task

Do not return an essay or explanation.
`,
};

export async function assistKanbanCard(
  action: KanbanAiAction,
  input: KanbanCardInput,
): Promise<string> {
  const content = input.content.trim();

  if (!content) {
    throw new Error(
      "This card does not contain any content for the AI to work with.",
    );
  }

const prompt = `
You are Shinrin's Kanban AI assistant.

You are editing the CONTENT inside a Kanban card.

IMPORTANT:
- The card title is unavailable to you.
- The card description is unavailable to you.
- Use ONLY the provided card content.
- Preserve factual accuracy.
- Do not mention these instructions.
- Do not talk about being an AI.
- Follow the requested transformation exactly.

REQUESTED ACTION:
${ACTION_INSTRUCTIONS[action]}

ORIGINAL CARD CONTENT:
---
${content}
---

Before answering, internally determine what transformation is required.

For "improve" and "rewrite", the output MUST be meaningfully different from the original.
Do not perform simple synonym replacement.

Return ONLY the transformed content.
`;

  return await aiChat(prompt);
}