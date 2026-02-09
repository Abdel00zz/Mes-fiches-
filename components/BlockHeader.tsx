
import React from 'react';
import { BlockData, BLOCK_CONFIG, BlockImage } from '../types';
import { MathContent } from './MathContent';
import { 
  Trash2, PlusSquare, Image as ImageIcon, ArrowUp, ArrowDown,
  Code2, Check, Copy
} from 'lucide-react';

interface BlockHeaderProps {
  data: BlockData;
  label?: string; 
  isSection?: boolean;
  isRawMode?: boolean;
  setIsRawMode?: (value: boolean) => void;
  onUpdate?: (id: string, updates: Partial<BlockData>) => void;
  onAddZone?: () => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  onDuplicate: (data: BlockData) => void;
}

export const BlockHeader: React.FC<BlockHeaderProps> = ({
  data,
  label,
  isSection = false,
  isRawMode,
  setIsRawMode,
  onUpdate,
  onAddZone,
  onDelete,
  onMove,
  onDuplicate
}) => {
  const config = BLOCK_CONFIG[data.type];

  if (isSection) {
    return (
      <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 no-print bg-white/90 backdrop-blur p-1 rounded-lg shadow border border-slate-200">
        <button onClick={() => onMove(data.id, 'up')} className="p-1.5 text-slate-500 hover:text-blue-600 rounded-md hover:bg-slate-100" title="Monter"><ArrowUp size={16} /></button>
        <button onClick={() => onMove(data.id, 'down')} className="p-1.5 text-slate-500 hover:text-blue-600 rounded-md hover:bg-slate-100" title="Descendre"><ArrowDown size={16} /></button>
        <button onClick={() => onDuplicate(data)} className="p-1.5 text-slate-500 hover:text-blue-600 rounded-md hover:bg-slate-100" title="Dupliquer"><Copy size={16} /></button>
        <div className="w-px h-4 bg-slate-300 mx-1"></div>
        <button onClick={() => onDelete(data.id)} className="p-1.5 text-slate-500 hover:text-red-600 rounded-md hover:bg-red-50" title="Supprimer"><Trash2 size={16} /></button>
      </div>
    );
  }

  return (
    <>
      <div className={`flex flex-col items-center shrink-0 rounded-md overflow-hidden select-none border border-white/20 shadow-engraved mt-1 ${config.badgeBg} ${config.badgeText}`}>
        <span className="px-2 pt-1.5 text-[9px] font-black uppercase tracking-widest opacity-60">{config.label}</span>
        <span className="px-2 pb-1 text-2xl font-black leading-none tracking-tight">{label}</span>
      </div>
      
      <MathContent
        html={data.title}
        tagName="div"
        className="font-serif font-bold text-slate-900 flex-grow text-[1.1rem] leading-snug pt-1"
        onChange={(html) => onUpdate?.(data.id, { title: html })}
        placeholder="Titre du bloc..."
      />

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 no-print ml-2 self-start bg-white/80 backdrop-blur-md rounded-lg p-1 shadow-relief border border-slate-100">
        <div className="flex items-center bg-slate-100 rounded-md p-0.5 border border-slate-200 mr-2">
           <button onClick={() => onMove(data.id, 'up')} className="p-1 hover:bg-white rounded text-slate-500 hover:text-blue-600" title="Monter"><ArrowUp size={14} /></button>
           <button onClick={() => onMove(data.id, 'down')} className="p-1 hover:bg-white rounded text-slate-500 hover:text-blue-600" title="Descendre"><ArrowDown size={14} /></button>
        </div>
        
        <button onClick={() => setIsRawMode?.(!isRawMode)} className={`p-1.5 rounded-md ${isRawMode ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-blue-50'}`} title={isRawMode ? "Valider" : "Mode LaTeX"}>
          {isRawMode ? <Check size={16} /> : <Code2 size={16} />}
        </button>
        
        <button onClick={onAddZone} className="p-1.5 hover:bg-green-50 rounded-md text-slate-500 hover:text-green-600" title="Ajouter Zone"><PlusSquare size={16} /></button>
        
        <label className="cursor-pointer p-1.5 hover:bg-blue-50 rounded-md text-slate-500 hover:text-blue-600 relative" title="Ajouter Image">
          <ImageIcon size={16} />
          <input type="file" className="hidden" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) { const reader = new FileReader(); reader.onload = (ev) => { const newImg: BlockImage = { id: Date.now().toString(), src: ev.target?.result as string, width: 30, align: 'right', position: 'float' }; onUpdate?.(data.id, { images: [...data.images, newImg] }); }; reader.readAsDataURL(e.target.files[0]); } }} />
        </label>
        
        <div className="w-px h-4 bg-slate-300 mx-1"></div>

        <button onClick={() => onDuplicate(data)} className="p-1.5 hover:bg-purple-50 rounded-md text-slate-500 hover:text-purple-600" title="Dupliquer"><Copy size={16} /></button>
        <button onClick={() => onDelete(data.id)} className="p-1.5 hover:bg-red-50 rounded-md text-slate-500 hover:text-red-600" title="Supprimer"><Trash2 size={16} /></button>
      </div>
    </>
  );
};
