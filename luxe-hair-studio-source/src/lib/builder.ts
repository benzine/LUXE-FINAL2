/* ── Atelier Console Builder Store ───────────────────────────────
   State management for the 3-rail page builder interface.
   Handles selection, isolation mode, undo/redo history, and element properties. */
import { useSyncExternalStore } from "react";

export interface BuilderSelection {
  type: "section" | "element" | null;
  sectionUid?: string;
  sectionId?: string;
  elementId?: string;
  elementPath?: string[]; // DOM path for nested elements
}

export interface BuilderHistoryItem {
  timestamp: number;
  action: string;
  snapshot: unknown;
}

export interface BuilderState {
  /* Selection */
  selection: BuilderSelection;
  /* Isolation mode - when a section is being edited in isolation */
  isolatedSectionUid: string | null;
  /* Hover state for outlines */
  hoveredElementId: string | null;
  /* History for undo/redo */
  history: BuilderHistoryItem[];
  historyIndex: number;
  /* View mode */
  viewMode: "full" | "isolated";
  /* Device preview */
  devicePreview: "desktop" | "tablet" | "mobile";
  /* Right rail panels */
  activePanel: "design" | "content" | "advanced" | "animations" | "responsive";
  /* Left rail panels */
  leftRailPanel: "tree" | "library" | "actions" | "settings";
}

const DEFAULT_STATE: BuilderState = {
  selection: { type: null },
  isolatedSectionUid: null,
  hoveredElementId: null,
  history: [],
  historyIndex: -1,
  viewMode: "full",
  devicePreview: "desktop",
  activePanel: "design",
  leftRailPanel: "tree",
};

let state: BuilderState = { ...DEFAULT_STATE };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

export const builderStore = {
  subscribe: (fn: () => void) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  get: (): BuilderState => state,
  
  /* Selection */
  selectSection: (uid: string, id: string) => {
    state = { 
      ...state, 
      selection: { type: "section", sectionUid: uid, sectionId: id },
      activePanel: "design"
    };
    emit();
  },
  selectElement: (sectionUid: string, sectionId: string, elementId: string, path?: string[]) => {
    state = { 
      ...state, 
      selection: { type: "element", sectionUid, sectionId, elementId, elementPath: path },
      activePanel: "design"
    };
    emit();
  },
  clearSelection: () => {
    state = { ...state, selection: { type: null } };
    emit();
  },
  
  /* Isolation mode */
  enterIsolatedMode: (uid: string, sectionId?: string) => {
    state = { 
      ...state, 
      isolatedSectionUid: uid,
      viewMode: "isolated",
      selection: { type: "section", sectionUid: uid, sectionId: sectionId || "" }
    };
    emit();
  },
  exitIsolatedMode: () => {
    state = { 
      ...state, 
      isolatedSectionUid: null,
      viewMode: "full",
      selection: { type: null }
    };
    emit();
  },
  
  /* Hover state */
  setHoveredElement: (elementId: string | null) => {
    state = { ...state, hoveredElementId: elementId };
    emit();
  },
  
  /* History (undo/redo) */
  pushHistory: (action: string, snapshot: unknown) => {
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push({ timestamp: Date.now(), action, snapshot });
    state = { 
      ...state, 
      history: newHistory.slice(-50), // Keep last 50 actions
      historyIndex: Math.min(newHistory.length - 1, 49)
    };
    emit();
  },
  undo: () => {
    if (state.historyIndex > 0) {
      state = { ...state, historyIndex: state.historyIndex - 1 };
      // Apply snapshot from previous state
      emit();
    }
  },
  redo: () => {
    if (state.historyIndex < state.history.length - 1) {
      state = { ...state, historyIndex: state.historyIndex + 1 };
      emit();
    }
  },
  canUndo: () => state.historyIndex > 0,
  canRedo: () => state.historyIndex < state.history.length - 1,
  
  /* Device preview */
  setDevicePreview: (device: "desktop" | "tablet" | "mobile") => {
    state = { ...state, devicePreview: device };
    emit();
  },
  
  /* Panels */
  setActivePanel: (panel: "design" | "content" | "advanced" | "animations" | "responsive") => {
    state = { ...state, activePanel: panel };
    emit();
  },
  setLeftRailPanel: (panel: "tree" | "library" | "actions" | "settings") => {
    state = { ...state, leftRailPanel: panel };
    emit();
  },
  
  /* Reset */
  reset: () => {
    state = { ...DEFAULT_STATE };
    emit();
  },
};

export function useBuilder(): BuilderState {
  return useSyncExternalStore(builderStore.subscribe, builderStore.get);
}

/* Action hooks — separate from state to avoid infinite re-renders.
   The methods are stable references on builderStore, so they never trigger
   useSyncExternalStore's change detection. */
export function useBuilderActions(): typeof builderStore {
  return builderStore;
}

/* Keyboard shortcuts for undo/redo */
export function setupBuilderKeyboardShortcuts() {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
      if (e.shiftKey) {
        e.preventDefault();
        builderStore.redo();
      } else {
        e.preventDefault();
        builderStore.undo();
      }
    }
  };
  addEventListener("keydown", handler);
  return () => removeEventListener("keydown", handler);
}
