export interface AIMindmapNode {
  id: string;
  text: string;
  category?: string;
  note?: string;
  url?: string;
  parentId?: string | null;
}

export interface AIMindmapConnection {
  source: string;
  target: string;
  curve?: {
    x: number;
    y: number;
  };
}

export interface AIMindmapResponse {
  title: string;
  nodes: AIMindmapNode[];
  connections: AIMindmapConnection[];
}

export interface MindmapSubnode {
  text: string;
  parent: string;
  color?: string;
  url?: string;
  category?: string;
  note?: string;
}

export interface MindmapData {
  title: string;
  nodes: AIMindmapNode[];
  connections: AIMindmapConnection[];
  subnodes: MindmapSubnode[];
}