export type palette =
  | "forest"
  | "ocean"
  | "sakura"
  | "sunset"
  | "midnight"
  | "fauvist";

export interface Board {
  id: number;
  name: string;
  palette?: palette;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface Label {
  id: number;
  boardId: number;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: number;
  boardId: number;
  title: string;
  position: number;
  color?: string;
  collapsed?: boolean;
}

export interface Card {
  id: number;
  columnId: number;
  title: string;
  description: string;
  content: any;
  labels: number[];
  dueDate?: string;
  favorite: boolean;
  archived: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}