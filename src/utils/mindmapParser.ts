// src/utils/mindmapParser.ts
import type {
  MindmapData,
  AIMindmapNode,
  AIMindmapConnection,
  MindmapSubnode,
} from "../types/mindmap";

/**
 * Convert Qwen AI response to MindmapData
 * Handles both JSON and text formats
 */
export function qwenToMindmapData(raw: any): MindmapData {
  // If raw is already an object, it's parsed JSON
  if (typeof raw === 'object' && raw !== null) {
    return normalizeMindmapData(raw);
  }
  
  // If raw is a string, try to parse it
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return normalizeMindmapData(parsed);
    } catch {
      // If not valid JSON, parse as text
      return parseTextMindmap(raw);
    }
  }
  
  // Fallback: create a basic mindmap from the raw content
  return createFallbackMindmap(raw);
}

/**
 * Normalize mindmap data to ensure it has all required fields
 */
function normalizeMindmapData(data: any): MindmapData {
  const nodes: AIMindmapNode[] = data.nodes || [];
  const connections: AIMindmapConnection[] = data.connections || [];
  const subnodes: MindmapSubnode[] = data.subnodes || [];
  
  // Ensure all nodes have required fields
  const normalizedNodes = nodes.map((node: any) => ({
    id: node.id || `node-${Math.random().toString(36).substr(2, 9)}`,
    text: node.text || node.label || node.name || 'Untitled',
    category: node.category || undefined,
    note: node.note || undefined,
    url: node.url || undefined,
    parentId: node.parentId || node.parent || null,
  }));
  
  // Ensure all connections have required fields
  const normalizedConnections = connections.map((conn: any) => ({
    source: conn.source || conn.from,
    target: conn.target || conn.to,
    curve: conn.curve || undefined,
  }));
  
  // Ensure all subnodes have required fields
  const normalizedSubnodes = subnodes.map((sub: any) => ({
    text: sub.text || '',
    parent: sub.parent || sub.parentId || '',
    color: sub.color || undefined,
    url: sub.url || undefined,
    category: sub.category || undefined,
    note: sub.note || undefined,
  }));
  
  return {
    title: data.title || 'Mindmap',
    nodes: normalizedNodes,
    connections: normalizedConnections,
    subnodes: normalizedSubnodes,
  };
}

/**
 * Parse text format mindmap (indentation-based or bullet points)
 * Creates proper hierarchical structure with parent-child relationships
 */
function parseTextMindmap(text: string): MindmapData {
  const lines = text.split('\n').filter(line => line.trim());
  const nodes: AIMindmapNode[] = [];
  const connections: AIMindmapConnection[] = [];
  const subnodes: MindmapSubnode[] = [];
  
  let rootId = 'root';
  let title = 'Mindmap';
  
  // Try to find a title
  const firstLine = lines[0]?.trim();
  if (firstLine && !firstLine.startsWith('-') && !firstLine.startsWith('•') && !firstLine.match(/^\d/)) {
    title = firstLine.replace(/^#+\s*/, '').trim();
    lines.shift();
  }
  
  // Parse indentation-based structure
  let nodeIdCounter = 0;
  const stack: { id: string; level: number; indent: number }[] = [];
  
  // Create root node
  const rootNodeId = `node-${nodeIdCounter++}`;
  nodes.push({
    id: rootNodeId,
    text: title,
    parentId: null,
  });
  stack.push({ id: rootNodeId, level: 0, indent: 0 });
  rootId = rootNodeId;
  
  for (const line of lines) {
    const indent = line.search(/\S/);
    let text = line.trim();
    
    // Remove bullet points and numbering
    text = text.replace(/^[\s-•*]+/, '');
    text = text.replace(/^\s*\d+\.\s*/, '');
    text = text.replace(/^[└├─│]+/, '');
    text = text.trim();
    
    if (!text) continue;
    
    // Determine level based on indentation
    const level = Math.floor(indent / 2);
    
    // Find parent
    let parentId = rootId;
    for (let i = stack.length - 1; i >= 0; i--) {
      if (stack[i].level < level) {
        parentId = stack[i].id;
        break;
      }
    }
    
    // Check if this is a subnode or main node
    // Subnodes are typically indented more or have a specific pattern
    const isSubnode = level > 2 || text.startsWith('•') || text.startsWith('-');
    
    const nodeId = `node-${nodeIdCounter++}`;
    nodes.push({
      id: nodeId,
      text: text,
      parentId: parentId,
      category: isSubnode ? 'subnode' : 'node',
    });
    
    connections.push({
      source: parentId,
      target: nodeId,
    });
    
    // Update stack
    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }
    stack.push({ id: nodeId, level: level, indent: indent });
  }
  
  return {
    title: title,
    nodes: nodes,
    connections: connections,
    subnodes: subnodes,
  };
}

/**
 * Create a fallback mindmap from raw content
 */
function createFallbackMindmap(raw: any): MindmapData {
  const text = typeof raw === 'string' ? raw : JSON.stringify(raw);
  const lines = text.split('\n').filter(line => line.trim());
  
  const nodes: AIMindmapNode[] = [];
  const connections: AIMindmapConnection[] = [];
  
  // Use the first line as title
  const title = lines[0]?.trim() || 'Mindmap';
  const remainingLines = lines.slice(1);
  
  // Create root node
  const rootId = 'root';
  nodes.push({
    id: rootId,
    text: title,
    parentId: null,
  });
  
  // Add each remaining line as a child node
  for (const line of remainingLines) {
    if (line.trim()) {
      const nodeId = `node-${nodes.length}`;
      const cleanText = line.trim().replace(/^[\s-•*]+/, '').replace(/^\s*\d+\.\s*/, '');
      nodes.push({
        id: nodeId,
        text: cleanText,
        parentId: rootId,
      });
      connections.push({
        source: rootId,
        target: nodeId,
      });
    }
  }
  
  return {
    title: title,
    nodes: nodes,
    connections: connections,
    subnodes: [],
  };
}