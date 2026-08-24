// src/services/mindmapService.ts
import { invoke } from "@tauri-apps/api/core";
import type { MindmapData, AIMindmapNode, AIMindmapConnection } from "../types/mindmap";

interface MindmapRequest {
  prompt: string;
  text: string;
}

/**
 * Generate a mindmap from content using the backend's TaskMode::Mindmap
 * 
 * This uses:
 * - 16384 token context (plenty for 4000+ words)
 * - Temperature: 0.40 (deterministic, structured output)
 * - Top-P: 0.90
 * - Top-K: 40
 * - Repeat penalty: 1.12
 * 
 * The backend handles all the heavy lifting with optimized settings.
 */
export async function generateMindmap(request: MindmapRequest): Promise<MindmapData> {
  const content = request.text.trim();
  
  if (!content) {
    throw new Error("No content provided to generate mindmap from.");
  }

  // Count words to set expectations
  const wordCount = content.split(/\s+/).length;
  console.log(`Generating mindmap from ${wordCount} words...`);

  // Build a clean prompt for the mindmap
  const prompt = buildMindmapPrompt(content);

  try {
    // SINGLE LLM CALL - uses your backend's TaskMode::Mindmap
    const raw = await invoke<string>("ai_chat", {
      prompt,
      attachments: [],      // No attachments for mindmap
      useWeb: false,        // No web search needed
      searxngUrl: "",       // Not using SearXNG
      mode: "mindmap",      // CRITICAL: Uses your TaskMode::Mindmap!
    });

    // Parse and validate the response
    const result = parseMindmapResponse(raw);
    
    // Log success
    console.log(`Generated mindmap with ${result.nodes.length} nodes`);
    return result;

  } catch (error) {
    console.error("Mindmap generation failed:", error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : "Failed to generate mindmap. Please try again."
    );
  }
}

/**
 * Build a clean prompt for the mindmap generation
 * The backend handles the chat template, we just provide the content
 */
function buildMindmapPrompt(content: string): string {
  // Limit to a reasonable size (your 16K context can handle much more)
  // This is just to prevent extremely large documents from causing issues
  const MAX_CHARS = 15000;
  const truncated = content.length > MAX_CHARS 
    ? content.slice(0, MAX_CHARS) + "\n\n[Content truncated for length]"
    : content;

  return `
Create a structured mindmap from the following content.

IMPORTANT RULES:
1. Return ONLY valid JSON - no markdown, no explanations.
2. Maximum 20 nodes total.
3. Maximum depth: 3 levels.
4. Root node MUST have parentId: null.
5. Every parentId MUST reference an existing node ID.
6. Use clear, concise labels (max 5 words per node).

Return exactly this JSON structure:
{
  "title": "Main topic of the mindmap",
  "nodes": [
    {"id": "root", "text": "Main Topic", "parentId": null},
    {"id": "n1", "text": "Subtopic 1", "parentId": "root"},
    {"id": "n2", "text": "Subtopic 2", "parentId": "root"},
    {"id": "n1-1", "text": "Detail", "parentId": "n1"}
  ],
  "connections": [
    {"source": "root", "target": "n1"},
    {"source": "root", "target": "n2"},
    {"source": "n1", "target": "n1-1"}
  ]
}

CONTENT TO ORGANIZE:
${truncated}
`;
}

/**
 * Parse and validate the mindmap response
 */
function parseMindmapResponse(raw: string): MindmapData {
  // Clean the response
  let cleaned = raw.trim();
  
  // Remove markdown code fences if present
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');
  
  // Find JSON object
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("No JSON found in response:", raw.slice(0, 200));
    return createFallbackMindmap(raw);
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate structure
    if (!parsed.title) {
      parsed.title = "Mindmap";
    }
    
    // Ensure nodes array exists
    const nodes: AIMindmapNode[] = (parsed.nodes || []).map((node: any) => ({
      id: node.id || `node-${Math.random().toString(36).substr(2, 6)}`,
      text: node.text || "Untitled",
      parentId: node.parentId ?? null,
    }));

    // Ensure connections array exists
    const connections: AIMindmapConnection[] = (parsed.connections || []).map((conn: any) => ({
      source: conn.source,
      target: conn.target,
    }));

    // Validate connections reference existing nodes
    const nodeIds = new Set(nodes.map(n => n.id));
    const validConnections = connections.filter(
      c => nodeIds.has(c.source) && nodeIds.has(c.target)
    );

    // Ensure there's a root node
    const hasRoot = nodes.some(n => n.parentId === null);
    if (!hasRoot && nodes.length > 0) {
      // Promote first node to root if no root exists
      nodes[0].parentId = null;
    }

    // Limit nodes to prevent overflow
    const limitedNodes = nodes.slice(0, 30);
    const limitedConnections = validConnections.filter(
      c => limitedNodes.some(n => n.id === c.source) && 
           limitedNodes.some(n => n.id === c.target)
    );

    return {
      title: parsed.title,
      nodes: limitedNodes,
      connections: limitedConnections,
      subnodes: [],
    };

  } catch (error) {
    console.error("Failed to parse mindmap:", error);
    return createFallbackMindmap(raw);
  }
}

/**
 * Create a simple fallback mindmap from text
 */
function createFallbackMindmap(text: string): MindmapData {
  // Try to extract meaningful lines
  const lines = text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0 && l.length < 100);
  
  const title = lines[0] || "Mindmap";
  const contentLines = lines.slice(1, Math.min(lines.length, 11));
  
  const nodes: AIMindmapNode[] = [
    { id: "root", text: title, parentId: null }
  ];
  const connections: AIMindmapConnection[] = [];

  for (let i = 0; i < contentLines.length; i++) {
    const nodeId = `n${i + 1}`;
    nodes.push({
      id: nodeId,
      text: contentLines[i].slice(0, 60),
      parentId: "root",
    });
    connections.push({
      source: "root",
      target: nodeId,
    });
  }

  return {
    title,
    nodes,
    connections,
    subnodes: [],
  };
}

/**
 * Get the word count of a text
 */
export function getWordCount(text: string): number {
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Check if content is suitable for mindmap generation
 */
export function isContentValid(content: string): boolean {
  return content.trim().length > 20;
}

/**
 * Get a suggested title from content
 */
export function suggestTitle(content: string): string {
  const lines = content.split('\n').filter(l => l.trim());
  if (lines.length === 0) return "Mindmap";
  
  // Look for a heading or first sentence
  const firstLine = lines[0].trim();
  if (firstLine.length < 60) return firstLine;
  
  // Use first few words
  const words = firstLine.split(/\s+/).slice(0, 5).join(' ');
  return words + (firstLine.split(/\s+/).length > 5 ? '...' : '');
}