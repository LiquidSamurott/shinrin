import type {
  AIMindmapResponse,
  MindmapData,
} from "../types/mindmap";

export function qwenToMindmapData(
  response: string
): MindmapData {
  const cleaned = response
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  let parsed: AIMindmapResponse;

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(
      "Qwen returned invalid JSON."
    );
  }

  if (
    !parsed ||
    typeof parsed.title !== "string" ||
    !Array.isArray(parsed.nodes) ||
    !Array.isArray(parsed.connections)
  ) {
    throw new Error(
      "Invalid mindmap structure returned by Qwen."
    );
  }

  const nodes = parsed.nodes.map(
    (node, index) => ({
      id: String(
        node.id ?? `node-${index}`
      ),
      text: String(
        node.text ?? ""
      ),
      category:
        node.category != null
          ? String(node.category)
          : undefined,
      note:
        node.note != null
          ? String(node.note)
          : undefined,
      url:
        node.url != null
          ? String(node.url)
          : undefined,
      parentId:
        node.parentId == null
          ? null
          : String(node.parentId),
    })
  );

  const nodeIds = new Set(
    nodes.map(node => node.id)
  );

  const connections =
    parsed.connections
      .map(connection => ({
        source: String(
          connection.source
        ),
        target: String(
          connection.target
        ),
        curve:
          connection.curve != null
            ? {
                x: Number(
                  connection.curve.x
                ),
                y: Number(
                  connection.curve.y
                ),
              }
            : undefined,
      }))
      .filter(
        connection =>
          nodeIds.has(
            connection.source
          ) &&
          nodeIds.has(
            connection.target
          )
      );

  return {
    title: parsed.title,
    nodes,
    connections,
    subnodes: [],
  };
}