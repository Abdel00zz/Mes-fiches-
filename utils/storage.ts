
import { SheetState, BlockData, BlockType, BLOCK_CONFIG, SheetMeta } from '../types';

const PREFIX = 'fb_pro_';
const INDEX_KEY = 'fb_pro_index';

// Validation et réparation des blocs importés
const sanitizeBlock = (block: any): BlockData => {
  const validTypes = Object.keys(BLOCK_CONFIG);
  // Si le type n'existe pas ou est mal écrit, on fallback sur 'remarque' ou 'section'
  let type = (block.type || 'remarque').toLowerCase();
  if (!validTypes.includes(type)) {
      type = 'remarque'; 
  }

  return {
    id: block.id || Math.random().toString(36).substr(2, 9),
    type: type as BlockType,
    title: block.title || '',
    content: block.content || block.body || '', // Support legacy "body"
    zones: Array.isArray(block.zones) ? block.zones : (Array.isArray(block.answerZones) ? block.answerZones : []),
    images: Array.isArray(block.images) ? block.images : []
  };
};

// Validation et réparation de la fiche complète
const sanitizeSheet = (data: any, forceId?: string): SheetState => {
  return {
    id: forceId || data.id || Date.now().toString(36) + Math.random().toString(36).substr(2),
    title: data.title || "Nouvelle Fiche Importée",
    subtitle: data.subtitle || "",
    blocks: Array.isArray(data.blocks) ? data.blocks.map(sanitizeBlock) : [],
    updatedAt: Date.now()
  };
};

// Get all sheets metadata (fast loading)
export const getSheetIndex = (): SheetMeta[] => {
  try {
    const data = localStorage.getItem(INDEX_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Storage Error: Index corrupted", e);
    return [];
  }
};

// Save a sheet (updates both content and index)
export const saveSheet = (sheet: SheetState, id?: string): string => {
  // Ensure we have a clean object structure
  const cleanSheet = sanitizeSheet(sheet, id || sheet.id);
  const sheetId = cleanSheet.id!;
  
  try {
    localStorage.setItem(`${PREFIX}sheet_${sheetId}`, JSON.stringify(cleanSheet));
  } catch (e) {
    console.error("Storage Full or Error", e);
    // On pourrait déclencher un event custom ici pour l'UI
    throw e;
  }

  // Update Index only if title/subtitle changed or if it's new, 
  // to avoid parsing the huge index on every keystroke if we were optimizing further.
  // For now, we update timestamp every time.
  try {
    const index = getSheetIndex();
    const existingIdx = index.findIndex(i => i.id === sheetId);
    
    const meta: SheetMeta = {
      id: sheetId,
      title: cleanSheet.title,
      subtitle: cleanSheet.subtitle,
      updatedAt: cleanSheet.updatedAt!,
      blockCount: cleanSheet.blocks.filter(b => b.type !== 'section').length
    };

    if (existingIdx >= 0) {
      index[existingIdx] = meta;
    } else {
      index.unshift(meta);
    }

    localStorage.setItem(INDEX_KEY, JSON.stringify(index));
  } catch (err) {
    console.warn("Failed to update index", err);
  }

  return sheetId;
};

// Load full sheet content
export const loadSheet = (id: string): SheetState | null => {
  try {
    const data = localStorage.getItem(`${PREFIX}sheet_${id}`);
    if (!data) return null;
    const parsed = JSON.parse(data);
    // On sanitize à la volée au chargement pour être sûr d'avoir une structure valide
    // même si le localStorage a été modifié manuellement
    return sanitizeSheet(parsed, id);
  } catch (e) {
    console.error("Failed to load sheet", id, e);
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
    
    // Générer un nouvel ID pour l'import pour éviter d'écraser une fiche existante si l'ID est le même
    const newId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    // Le sanitizer fait tout le travail de nettoyage
    const formatted = sanitizeSheet(parsed, newId);
    
    return saveSheet(formatted, newId);
  } catch (e) {
    throw new Error("Fichier JSON invalide ou corrompu.");
  }
};