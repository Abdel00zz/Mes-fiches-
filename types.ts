
export type BlockType = 
  | 'activite' 
  | 'definition' 
  | 'theoreme' 
  | 'propriete' 
  | 'application' 
  | 'exemple' 
  | 'remarque' 
  | 'section';

export type ZoneStyle = 'lines' | 'grid' | 'dots' | 'blank';

export interface AnswerZone {
  id: string;
  height: number; // in mm
  style: ZoneStyle;
  backgroundImage?: string;
  backgroundOpacity?: number;
}

export interface BlockImage {
  id: string;
  src: string;
  width: number;
  align: 'left' | 'center' | 'right';
  position: 'top' | 'bottom' | 'float';
}

export interface BlockData {
  id: string;
  type: BlockType;
  title: string; 
  content: string; 
  zones: AnswerZone[];
  images: BlockImage[];
}

export interface SheetState {
  id?: string; // Added for storage identification
  title: string;
  subtitle: string;
  blocks: BlockData[];
  updatedAt?: number;
}

// Config Chic & Moderne (Pastel, box colorées, badges artistiques)
export const BLOCK_CONFIG: Record<BlockType, { label: string; badgeBg: string; badgeText: string; containerBg: string; borderColor: string }> = {
  section:     { label: 'Partie',      badgeBg: 'bg-slate-900',   badgeText: 'text-white',      containerBg: 'bg-white',      borderColor: 'border-slate-900' },
  activite:    { label: 'Activité',    badgeBg: 'bg-amber-200',   badgeText: 'text-amber-950',  containerBg: 'bg-amber-50/60',   borderColor: 'border-amber-200/50' },
  definition:  { label: 'Définition',  badgeBg: 'bg-emerald-200', badgeText: 'text-emerald-950',containerBg: 'bg-emerald-50/60', borderColor: 'border-emerald-200/50' },
  theoreme:    { label: 'Théorème',    badgeBg: 'bg-rose-200',    badgeText: 'text-rose-950',   containerBg: 'bg-rose-50/60',    borderColor: 'border-rose-200/50' },
  propriete:   { label: 'Propriété',   badgeBg: 'bg-indigo-200',  badgeText: 'text-indigo-950', containerBg: 'bg-indigo-50/60', borderColor: 'border-indigo-200/50' },
  application: { label: 'Application', badgeBg: 'bg-sky-200',     badgeText: 'text-sky-950',    containerBg: 'bg-sky-50/60',     borderColor: 'border-sky-200/50' },
  exemple:     { label: 'Exemple',     badgeBg: 'bg-slate-200',   badgeText: 'text-slate-900',  containerBg: 'bg-slate-50/60',   borderColor: 'border-slate-200/50' },
  remarque:    { label: 'Remarque',    badgeBg: 'bg-gray-200',    badgeText: 'text-gray-800',   containerBg: 'bg-gray-50/60',    borderColor: 'border-gray-200/50' },
};
