import React, { useState, memo } from 'react';
import { BlockData, BlockImage } from '../types';
import { MathContent } from './MathContent';
import { AnswerZone } from './AnswerZone';
import { BlockHeader } from './BlockHeader';
import { BlockImageComponent } from './BlockImage';
import { processContentForDisplay } from '../utils';
import { 
  ArrowUpFromLine, ArrowDownFromLine, WrapText,
  GripVertical
} from 'lucide-react';

interface BlockProps {
  data: BlockData;
  index: number;
  label: string; 
  onUpdate: (id: string, updates: Partial<BlockData>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  onDuplicate: (data: BlockData) => void;
  onAddZone: (blockId: string) => void;
}

export const Block: React.FC<BlockProps> = memo(({ 
  data, 
  label,
  onUpdate, 
  onDelete, 
  onMove,
  onDuplicate,
  onAddZone
}) => {
  const [isImgDragOver, setIsImgDragOver] = useState(false);
  const [dragLocation, setDragLocation] = useState<'top' | 'bottom' | 'float' | null>(null);
  const [isRawMode, setIsRawMode] = useState(false);

  // --- Section Rendering ---
  if (data.type === 'section') {
    return (
      <div 
        className={`group relative mt-10 mb-8 page-break-avoid break-after-avoid`}
      >
        <div className="flex items-baseline gap-4 mb-4">
          <div className="flex items-center justify-center w-14 h-14 bg-slate-900 text-white text-3xl font-serif font-black rounded-sm shadow-relief transform group-hover:scale-105 transition-transform">
            {label}
          </div>
          <MathContent
            html={data.title}
            tagName="h2"
            className="text-3xl font-serif font-bold text-slate-900 flex-grow tracking-tight pt-2"
            onChange={(html) => onUpdate(data.id, { title: html })}
            placeholder="Titre de la partie..."
          />
        </div>
        <div className="h-px bg-gradient-to-r from-slate-300 via-slate-200 to-transparent"></div>
         <BlockHeader 
            isSection={true}
            data={data}
            onMove={onMove}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
         />
      </div>
    );
  }

  const handleImageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.dataTransfer.types.includes('Files')) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const relY = (e.clientY - rect.top) / rect.height;
    setDragLocation(relY < 0.25 ? 'top' : relY > 0.75 ? 'bottom' : 'float');
    setIsImgDragOver(true);
  };
  
  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    // FIX: Convert FileList to an array using spread syntax for reliable type inference.
    const files = [...e.dataTransfer.files].filter(f => f.type.startsWith('image/'));
    if (files.length > 0) {
      const reader = new FileReader();
      const position = dragLocation || 'float';
      reader.onload = (ev) => {
        if (ev.target?.result) {
          const newImage: BlockImage = {
            id: Date.now().toString(),
            src: ev.target.result as string,
            width: position === 'float' ? 30 : 60,
            align: position === 'float' ? 'right' : 'center',
            position
          };
          onUpdate(data.id, { images: [...data.images, newImage] });
        }
      };
      reader.readAsDataURL(files[0]);
    }
    setIsImgDragOver(false);
    setDragLocation(null);
  };
  
  const topImages = data.images.filter(img => img.position === 'top');
  const bottomImages = data.images.filter(img => img.position === 'bottom');
  const floatImages = data.images.filter(img => img.position === 'float');

  return (
    <div 
      className={`block-container group relative mb-6 rounded-lg transition-all duration-300 page-break-avoid border bg-amber-50/60 border-amber-200/50
        ${isImgDragOver ? 'ring-4 ring-blue-400/50 border-blue-500' : 'shadow-sm hover:shadow-relief'}
        print:shadow-none`}
      onDragOver={handleImageDragOver}
      onDragLeave={() => { setIsImgDragOver(false); setDragLocation(null); }}
      onDrop={handleImageDrop}
    >
      {isImgDragOver && (
        <div className="absolute inset-0 z-50 rounded-lg overflow-hidden flex flex-col pointer-events-none bg-white/40 backdrop-blur-[1px]">
           <div className={`flex-1 transition-all duration-200 flex items-center justify-center border-b-2 border-dashed border-blue-300 ${dragLocation === 'top' ? 'bg-blue-100/80' : ''}`}>
             {dragLocation === 'top' && <div className="px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg font-bold text-sm flex items-center gap-2"><ArrowUpFromLine size={18} /> Mettre au-dessus</div>}
           </div>
           <div className={`flex-[2] transition-all duration-200 flex items-center justify-center ${dragLocation === 'float' ? 'bg-blue-100/80' : ''}`}>
             {dragLocation === 'float' && <div className="px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg font-bold text-sm flex items-center gap-2"><WrapText size={18} /> Intégrer au contenu</div>}
           </div>
           <div className={`flex-1 transition-all duration-200 flex items-center justify-center border-t-2 border-dashed border-blue-300 ${dragLocation === 'bottom' ? 'bg-blue-100/80' : ''}`}>
             {dragLocation === 'bottom' && <div className="px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg font-bold text-sm flex items-center gap-2"><ArrowDownFromLine size={18} /> Mettre en dessous</div>}
           </div>
        </div>
      )}

      <div className="flex items-start gap-3 px-5 pt-5 pb-2">
        <BlockHeader
            data={data}
            label={label}
            isRawMode={isRawMode}
            setIsRawMode={setIsRawMode}
            onUpdate={onUpdate}
            onAddZone={() => onAddZone(data.id)}
            onDelete={onDelete}
            onMove={onMove}
            onDuplicate={onDuplicate}
        />
      </div>

      <div className="px-5 pb-5 pt-2 flow-root text-slate-800">
        {topImages.map(img => <BlockImageComponent key={img.id} img={img} onUpdate={(u) => onUpdate(data.id, { images: data.images.map(i => i.id === img.id ? {...i, ...u} : i) })} onDelete={() => onUpdate(data.id, { images: data.images.filter(i => i.id !== img.id) })} />)}
        {floatImages.map(img => <BlockImageComponent key={img.id} img={img} onUpdate={(u) => onUpdate(data.id, { images: data.images.map(i => i.id === img.id ? {...i, ...u} : i) })} onDelete={() => onUpdate(data.id, { images: data.images.filter(i => i.id !== img.id) })} />)}

        {isRawMode ? (
            <div className="relative animate-in fade-in zoom-in duration-200">
                <div className="absolute -top-3 right-0 bg-blue-600 text-white text-[9px] px-2 py-0.5 rounded-b-md font-bold uppercase tracking-wider shadow-sm z-10">Mode Éditeur Source</div>
                <textarea className="w-full min-h-[150px] p-4 bg-slate-900 text-blue-100 font-mono text-sm rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" value={data.content} onChange={(e) => onUpdate(data.id, { content: e.target.value })} placeholder="Saisissez votre texte et LaTeX ici..." spellCheck={false} autoFocus />
            </div>
        ) : (
            <MathContent html={processContentForDisplay(data.content)} className="text-[1rem] text-justify min-h-[1.5em] leading-relaxed" onChange={(html) => onUpdate(data.id, { content: html })} placeholder="Contenu du bloc... (Supporte LaTeX $\\LaTeX$)" />
        )}

        {bottomImages.map(img => <BlockImageComponent key={img.id} img={img} onUpdate={(u) => onUpdate(data.id, { images: data.images.map(i => i.id === img.id ? {...i, ...u} : i) })} onDelete={() => onUpdate(data.id, { images: data.images.filter(i => i.id !== img.id) })} />)}

        {data.zones.length > 0 && (
          <div className="mt-4 space-y-3 clear-both">
            {data.zones.map((zone) => (
              <AnswerZone key={zone.id} zone={zone} onUpdate={(updates) => onUpdate(data.id, { zones: data.zones.map(z => z.id === zone.id ? { ...z, ...updates } : z) })} onDelete={() => onUpdate(data.id, { zones: data.zones.filter(z => z.id !== zone.id) })} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});