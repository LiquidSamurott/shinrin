import { invoke } from "@tauri-apps/api/core";

export interface GeneratedFlashcard {
  front: string;
  back: string;
}

interface GenerateFlashcardsResponse {
  deckName: string;
  cards: GeneratedFlashcard[];
}

export async function generateFlashcards(
  content: string,
  count = 8
): Promise<GenerateFlashcardsResponse> {
  if (!content.trim()) {
    throw new Error("The Kanban card has no content to generate flashcards from.");
  }

  const prompt = `
You are a study flashcard generator.

Generate ${count} high-quality flashcards ONLY from the study material below.

IMPORTANT:
- Do NOT use the Kanban card title.
- Do NOT use the Kanban card description.
- Use ONLY the provided content.
- Do not invent facts.
- Do not repeat the same information unnecessarily.
- Questions should test understanding, definitions, relationships, formulas, or important details.
- Answers should be concise but sufficient.
- Return ONLY valid JSON.
- Do not use markdown fences.

Return exactly this structure:

{
  "deckName": "Short descriptive deck name",
  "cards": [
    {
      "front": "Question",
      "back": "Answer"
    }
  ]
}

STUDY MATERIAL:
${content}
`;

  const raw = await invoke<string>("ai_chat", {
    prompt,
  });

  let parsed: GenerateFlashcardsResponse;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("AI returned invalid flashcard JSON.");
  }

  if (
    !parsed ||
    typeof parsed.deckName !== "string" ||
    !Array.isArray(parsed.cards)
  ) {
    throw new Error("AI returned an invalid flashcard structure.");
  }

  const cards = parsed.cards.filter(
    (card) =>
      typeof card?.front === "string" &&
      typeof card?.back === "string" &&
      card.front.trim().length > 0 &&
      card.back.trim().length > 0
  );

  if (!cards.length) {
    throw new Error("AI did not generate any valid flashcards.");
  }

  return {
    deckName: parsed.deckName.trim() || "Generated Flashcards",
    cards,
  };
}