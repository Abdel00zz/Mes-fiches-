
import { SheetState } from '../types';

const PREFIX = 'fb_pro_';
const INDEX_KEY = 'fb_pro_index';

export interface SheetMeta {
  id: string;
  title: string;
  subtitle: string;
  updatedAt: number;
  preview?: string; // Could be extended for thumbnails later
}

// Get all sheets metadata (fast loading)
export const getSheetIndex = (): SheetMeta[] => {
  try {
    const data = localStorage.getItem(INDEX_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Storage Error", e);
    return [];
  }
};

// Save a sheet (updates both content and index)
export const saveSheet = (sheet: SheetState, id?: string): string => {
  const sheetId = id || sheet.id || Date.now().toString(36) + Math.random().toString(36).substr(2);
  const now = Date.now();

  // 1. Save Content
  const sheetWithId = { ...sheet, id: sheetId, updatedAt: now };
  try {
    localStorage.setItem(`${PREFIX}sheet_${sheetId}`, JSON.stringify(sheetWithId));
  } catch (e) {
    alert("Mémoire locale pleine ! Impossible de sauvegarder.");
    throw e;
  }

  // 2. Update Index
  const index = getSheetIndex();
  const existingIdx = index.findIndex(i => i.id === sheetId);
  
  const meta: SheetMeta = {
    id: sheetId,
    title: sheet.title || "Sans titre",
    subtitle: sheet.subtitle || "",
    updatedAt: now
  };

  if (existingIdx >= 0) {
    index[existingIdx] = meta;
  } else {
    index.unshift(meta);
  }

  localStorage.setItem(INDEX_KEY, JSON.stringify(index));
  return sheetId;
};

// Load full sheet content
export const loadSheet = (id: string): SheetState | null => {
  try {
    const data = localStorage.getItem(`${PREFIX}sheet_${id}`);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

// Delete sheet
export const deleteSheet = (id: string) => {
  localStorage.removeItem(`${PREFIX}sheet_${id}`);
  const index = getSheetIndex().filter(i => i.id !== id);
  localStorage.setItem(INDEX_KEY, JSON.stringify(index));
};

// Import JSON Helper
export const importSheetFromJSON = (jsonString: string): string => {
  try {
    const parsed = JSON.parse(jsonString);
    // Basic validation
    if (!parsed.blocks || !Array.isArray(parsed.blocks)) throw new Error("Format invalide");
    
    // Sanitize ID to force new save or keep existing if managing sync
    // Here we generate a new ID to avoid conflicts on import
    const newId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    const formatted: SheetState = {
      ...parsed,
      id: newId,
      blocks: parsed.blocks.map((b: any) => ({
         ...b,
         id: b.id || Math.random().toString(36).substr(2, 9),
         content: b.content || b.body || '',
         zones: b.zones || b.answerZones || [],
         images: b.images || [],
         type: b.type.toLowerCase()
      }))
    };
    
    return saveSheet(formatted, newId);
  } catch (e) {
    throw new Error("Fichier JSON corrompu ou invalide.");
  }
};
