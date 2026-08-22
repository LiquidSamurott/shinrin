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

VARY THE QUESTION TYPES. Use a mix of the following formats:

1. **Definition**: "What is [term]?" / "Define [concept]."
2. **Explanation**: "Explain why [phenomenon] happens." / "How does [process] work?"
3. **Comparison**: "How does [A] differ from [B]?" / "What is the relationship between [A] and [B]?"
4. **Cause and Effect**: "What causes [X]?" / "What is the effect of [Y]?"
5. **Sequence/Process**: "What are the steps of [process]?" / "What happens first when [X] occurs?"
6. **Example**: "Give an example of [concept]." / "What is a real-world example of [X]?"
7. **Application**: "How would you apply [concept] in [situation]?" / "When should you use [technique]?"
8. **Significance**: "Why is [concept] important?" / "What is the significance of [event]?"
9. **Characteristics**: "What are the key characteristics of [X]?" / "What makes [X] unique?"
10. **Fill in the Blank**: "_____ is the process of..." / "The main purpose of [X] is _____."
11. **True/False**: "Is it true that [statement]?" / "True or False: [statement]"
12. **Multiple Choice** (as a question): "Which of the following best describes [X]?" / "What is the primary function of [Y]?"
13. **Quote/Analysis**: "What does [quote/statement] mean?" / "What is the implication of [statement]?"
14. **Problem/Solution**: "What problem does [concept] solve?" / "How does [X] address [issue]?"
15. **Historical/Timeline**: "When did [event] occur?" / "What happened before [event]?"

Return exactly this structure:

{
  "deckName": "Short descriptive deck name (max 5 words)",
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

  // Fix: Add attachments parameter (empty array since we don't need attachments)
  const raw = await invoke<string>("ai_chat", {
    prompt,
    attachments: [], 
    useWeb: false,
    searxngUrl: ""
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