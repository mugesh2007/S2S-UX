import { create } from 'zustand';
import { S2SNode, S2SNodeTree } from '@/types/ast';
import { SAMPLE_INITIAL_AST } from './mockData';

interface HistoryState {
  past: S2SNodeTree[];
  future: S2SNodeTree[];
}

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';

interface EditorStoreState {
  ast: S2SNodeTree;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  viewportMode: ViewportMode;
  zoomLevel: number;
  history: HistoryState;
  projectId: string | null;

  // Actions
  setAST: (tree: S2SNodeTree) => void;
  setProjectId: (id: string | null) => void;
  selectNode: (id: string | null) => void;
  setHoveredNode: (id: string | null) => void;
  setViewportMode: (mode: ViewportMode) => void;
  setZoomLevel: (zoom: number) => void;

  updateNodeProps: (nodeId: string, newProps: Record<string, any>) => void;
  updateNodeStyles: (nodeId: string, tailwindClasses: string) => void;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  moveNode: (nodeId: string, direction: 'up' | 'down') => void;
  addNode: (parentId: string, newNode: S2SNode) => void;

  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  getSelectedNode: () => S2SNode | null;
}

// Deep clone utility
function cloneTree<T>(item: T): T {
  return JSON.parse(JSON.stringify(item));
}

function cloneWithNewIds(node: S2SNode): S2SNode {
  const newId = `${node.type.toLowerCase()}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  return {
    ...cloneTree(node),
    id: newId,
    name: `${node.name} (Copy)`,
    children: node.children ? node.children.map(cloneWithNewIds) : [],
  };
}

function duplicateNodeRecursively(
  node: S2SNode,
  id: string
): { newTree: S2SNode; duplicatedId: string | null } {
  let duplicatedId: string | null = null;

  function traverse(current: S2SNode): S2SNode {
    const cloned = { ...current };
    if (cloned.children) {
      const newChildren: S2SNode[] = [];
      for (const child of cloned.children) {
        if (child.id === id) {
          const dup = cloneWithNewIds(child);
          duplicatedId = dup.id;
          newChildren.push(child);
          newChildren.push(dup);
        } else {
          newChildren.push(traverse(child));
        }
      }
      cloned.children = newChildren;
    }
    return cloned;
  }

  const newTree = traverse(node);
  return { newTree, duplicatedId };
}

function moveNodeRecursively(
  node: S2SNode,
  id: string,
  direction: 'up' | 'down'
): S2SNode {
  const cloned = { ...node };
  if (cloned.children) {
    const index = cloned.children.findIndex((c) => c.id === id);
    if (index !== -1) {
      const newChildren = [...cloned.children];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex >= 0 && targetIndex < newChildren.length) {
        const temp = newChildren[index];
        newChildren[index] = newChildren[targetIndex];
        newChildren[targetIndex] = temp;
      }
      cloned.children = newChildren;
      return cloned;
    }
    cloned.children = cloned.children.map((child) =>
      moveNodeRecursively(child, id, direction)
    );
  }
  return cloned;
}

// Tree traversal helpers
function findNode(node: S2SNode, id: string): S2SNode | null {
  if (node.id === id) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
  }
  return null;
}

function updateNodeRecursively(
  node: S2SNode,
  id: string,
  mutate: (target: S2SNode) => void
): S2SNode {
  const cloned = { ...node, props: { ...node.props }, styles: { ...node.styles } };
  if (cloned.id === id) {
    mutate(cloned);
    return cloned;
  }
  if (cloned.children) {
    cloned.children = cloned.children.map((child) =>
      updateNodeRecursively(child, id, mutate)
    );
  }
  return cloned;
}

function deleteNodeRecursively(node: S2SNode, id: string): S2SNode {
  const cloned = { ...node };
  if (cloned.children) {
    cloned.children = cloned.children
      .filter((child) => child.id !== id)
      .map((child) => deleteNodeRecursively(child, id));
  }
  return cloned;
}

function insertNodeRecursively(
  node: S2SNode,
  parentId: string,
  newNode: S2SNode
): S2SNode {
  const cloned = { ...node };
  if (cloned.id === parentId) {
    cloned.children = [...(cloned.children || []), newNode];
    return cloned;
  }
  if (cloned.children) {
    cloned.children = cloned.children.map((child) =>
      insertNodeRecursively(child, parentId, newNode)
    );
  }
  return cloned;
}

export const useEditorStore = create<EditorStoreState>((set, get) => ({
  ast: cloneTree(SAMPLE_INITIAL_AST),
  selectedNodeId: 'btn-refresh',
  hoveredNodeId: null,
  viewportMode: 'desktop',
  zoomLevel: 1.0,
  history: {
    past: [],
    future: [],
  },

  projectId: null,

  setAST: (newTree) => {
    set((state) => ({
      ast: newTree,
      history: {
        past: [...state.history.past, cloneTree(state.ast)],
        future: [],
      },
    }));
  },

  setProjectId: (id) => set({ projectId: id }),
  selectNode: (id) => set({ selectedNodeId: id }),
  setHoveredNode: (id) => set({ hoveredNodeId: id }),
  setViewportMode: (mode) => set({ viewportMode: mode }),
  setZoomLevel: (zoom) => set({ zoomLevel: Math.max(0.4, Math.min(zoom, 1.8)) }),

  updateNodeProps: (nodeId, newProps) => {
    const current = get().ast;
    const nextTree = updateNodeRecursively(current, nodeId, (target) => {
      target.props = { ...target.props, ...newProps };
    }) as S2SNodeTree;

    set((state) => ({
      ast: nextTree,
      history: {
        past: [...state.history.past, cloneTree(state.ast)],
        future: [],
      },
    }));
  },

  updateNodeStyles: (nodeId, tailwindClasses) => {
    const current = get().ast;
    const nextTree = updateNodeRecursively(current, nodeId, (target) => {
      target.styles = { ...target.styles, tailwindClasses };
    }) as S2SNodeTree;

    set((state) => ({
      ast: nextTree,
      history: {
        past: [...state.history.past, cloneTree(state.ast)],
        future: [],
      },
    }));
  },

  deleteNode: (nodeId) => {
    if (nodeId === get().ast.id) return; // Prevent deleting root
    const current = get().ast;
    const nextTree = deleteNodeRecursively(current, nodeId) as S2SNodeTree;

    set((state) => ({
      ast: nextTree,
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
      history: {
        past: [...state.history.past, cloneTree(state.ast)],
        future: [],
      },
    }));
  },

  duplicateNode: (nodeId) => {
    if (nodeId === get().ast.id) return; // Prevent duplicating root
    const current = get().ast;
    const { newTree, duplicatedId } = duplicateNodeRecursively(current, nodeId);

    set((state) => ({
      ast: newTree as S2SNodeTree,
      selectedNodeId: duplicatedId || state.selectedNodeId,
      history: {
        past: [...state.history.past, cloneTree(state.ast)],
        future: [],
      },
    }));
  },

  moveNode: (nodeId, direction) => {
    if (nodeId === get().ast.id) return; // Cannot move root
    const current = get().ast;
    const nextTree = moveNodeRecursively(current, nodeId, direction) as S2SNodeTree;

    set((state) => ({
      ast: nextTree,
      history: {
        past: [...state.history.past, cloneTree(state.ast)],
        future: [],
      },
    }));
  },

  addNode: (parentId, newNode) => {
    const current = get().ast;
    const nextTree = insertNodeRecursively(current, parentId, newNode) as S2SNodeTree;

    set((state) => ({
      ast: nextTree,
      selectedNodeId: newNode.id,
      history: {
        past: [...state.history.past, cloneTree(state.ast)],
        future: [],
      },
    }));
  },

  undo: () => {
    const { past, future } = get().history;
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    set((state) => ({
      ast: previous,
      history: {
        past: newPast,
        future: [cloneTree(state.ast), ...future],
      },
    }));
  },

  redo: () => {
    const { past, future } = get().history;
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);

    set((state) => ({
      ast: next,
      history: {
        past: [...past, cloneTree(state.ast)],
        future: newFuture,
      },
    }));
  },

  canUndo: () => get().history.past.length > 0,
  canRedo: () => get().history.future.length > 0,

  getSelectedNode: () => {
    const { ast, selectedNodeId } = get();
    if (!selectedNodeId) return null;
    return findNode(ast, selectedNodeId);
  },
}));
