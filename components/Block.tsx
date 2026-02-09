import React, { useState, memo, useMemo, useCallback } from 'react';
import { BlockData, BLOCK_CONFIG, BlockImage } from '../types';
import { MathContent } from './MathContent';
import { AnswerZone } from './AnswerZone';
import { processContentForDisplay } from '../utils';
import { 
  Trash2, PlusSquare, Image as ImageIcon, 
  ArrowUpFromLine, ArrowDownFromLine, WrapText, ArrowUp, ArrowDown,
  Code2, Check, Copy
} from 'lucide-react';
import { BlockImageComponent } from './BlockImage';

interface BlockProps {
  data: BlockData;
  index: number;
  label: string; 
  onUpdate: (id: string, updates: Partial<BlockData>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  onDuplicate: (data: BlockData) => void;
}

export const Block: React.FC<BlockProps> = memo(({ 
  data, 
  label,
  onUpdate, 
  onDelete, 
  onMove,
  onDuplicate
}) => {
  const config = BLOCK_CONFIG[data.type];
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragLocation, setDragLocation] = useState<'top' | 'bottom' | 'float' | null>(null);
  const [isRawMode, setIsRawMode] = useState(false);

  // Performance: Memoize the processed content to avoid re-calculating on every render
  const processedContent = useMemo(() => processContentForDisplay(data.content), [data.content]);

  // --- Section Rendering (Partie A, B...) ---
  if (data.type === 'section') {
    return (
      <div className="group relative mt-10 mb-8 pb-4 border-b-2 border-slate-900 page-break-avoid break-after-avoid">
        <div className="flex items-baseline gap-4">
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
         {/* Controls for Section */}
         <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 no-print bg-white/90 backdrop-blur p-1 rounded-lg shadow border border-slate-200">
            <button onClick={() => onMove(data.id, 'up')} className="p-1.5 text-slate-500 hover:text-blue-600 rounded-md hover:bg-slate-100 transition-colors" title="Monter"><ArrowUp size={16} /></button>
            <button onClick={() => onMove(data.id, 'down')} className="p-1.5 text-slate-500 hover:text-blue-600 rounded-md hover:bg-slate-100 transition-colors" title="Descendre"><ArrowDown size={16} /></button>
            <button onClick={() => onDuplicate(data)} className="p-1.5 text-slate-500 hover:text-blue-600 rounded-md hover:bg-slate-100 transition-colors" title="Dupliquer"><Copy size={16} /></button>
            <div className="w-px h-4 bg-slate-300 mx-1"></div>
            <button onClick={() => onDelete(data.id)} className="p-1.5 text-slate-500 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors" title="Supprimer"><Trash2 size={16} /></button>
        </div>
      </div>
    );
  }

  // --- Drag & Drop Logic ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!e.dataTransfer.types.includes('Files')) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const relY = (e.clientY - rect.top) / rect.height;
    
    let newLoc: 'top' | 'bottom' | 'float' = 'float';
    
    if (relY < 0.25) newLoc = 'top';
    else if (relY > 0.75) newLoc = 'bottom';
    else newLoc = 'float';
    
    setDragLocation(newLoc);
    setIsDragOver(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    setIsDragOver(false);
    setDragLocation(null);

    const files = Array.from(e.dataTransfer.files) as File[];
    const imageFiles = files.filter(f => f.type.match(/^image\/(png|jpeg|jpg|gif)$/));

    if (imageFiles.length > 0) {
      const file = imageFiles[0]; 
      const reader = new FileReader();
      
      let position: BlockImage['position'] = 'float';
      let align: BlockImage['align'] = 'right';
      let width = 30; 

      if (dragLocation === 'top') { 
        position = 'top'; 
        align = 'center'; 
        width = 60; 
      } else if (dragLocation === 'bottom') { 
        position = 'bottom'; 
        align = 'center'; 
        width = 60; 
      }

      reader.onload = (ev) => {
        if (ev.target?.result) {
          const newImage: BlockImage = {
            id: Date.now().toString(),
            src: ev.target.result as string,
            width,
            align,
            position
          };
          onUpdate(data.id, { images: [...data.images, newImage] });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addZone = () => onUpdate(data.id, { zones: [...data.zones, { id: Date.now().toString(), height: 40, style: 'lines' }] });
  
  const updateImage = useCallback((imgId: string, updates: Partial<BlockImage>) => {
    onUpdate(data.id, { images: data.images.map(img => img.id === imgId ? { ...img, ...updates } : img) });
  }, [data.id, data.images, onUpdate]);

  const deleteImage = useCallback((imgId: string) => {
    onUpdate(data.id, { images: data.images.filter(i => i.id !== imgId) });
  }, [data.id, data.images, onUpdate]);

  const topImages = data.images.filter(img => img.position === 'top');
  const bottomImages = data.images.filter(img => img.position === 'bottom');
  const floatImages = data.images.filter(img => img.position === 'float');

  return (
    <div 
      className={`
        block-container group relative mb-6 rounded-lg transition-all duration-300 page-break-avoid 
        ${config.containerBg} ${config.borderColor} border
        ${isDragOver ? 'ring-4 ring-blue-400/50 border-blue-500' : 'shadow-sm hover:shadow-relief'}
        print:shadow-none print:break-inside-avoid
      `}
      onDragOver={handleDragOver}
      onDragLeave={() => { setIsDragOver(false); setDragLocation(null); }}
      onDrop={handleDrop}
    >
      {/* INTELLIGENT DRAG OVERLAY */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 rounded-lg overflow-hidden flex flex-col pointer-events-none bg-white/40 backdrop-blur-[1px]">
           <div className={`flex-1 transition-all duration-200 flex items-center justify-center border-b-2 border-dashed border-blue-300 ${dragLocation === 'top' ? 'bg-blue-100/80' : 'bg-transparent'}`}>
             {dragLocation === 'top' && <div className="px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg font-bold text-sm flex items-center gap-2 animate-in fade-in zoom-in"><ArrowUpFromLine size={18} /> Mettre au-dessus</div>}
           </div>
           <div className={`flex-[2] transition-all duration-200 flex items-center justify-center ${dragLocation === 'float' ? 'bg-blue-100/80' : 'bg-transparent'}`}>
             {dragLocation === 'float' && <div className="px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg font-bold text-sm flex items-center gap-2 animate-in fade-in zoom-in"><WrapText size={18} /> Intégrer au contenu</div>}
           </div>
           <div className={`flex-1 transition-all duration-200 flex items-center justify-center border-t-2 border-dashed border-blue-300 ${dragLocation === 'bottom' ? 'bg-blue-100/80' : 'bg-transparent'}`}>
             {dragLocation === 'bottom' && <div className="px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg font-bold text-sm flex items-center gap-2 animate-in fade-in zoom-in"><ArrowDownFromLine size={18} /> Mettre en dessous</div>}
           </div>
        </div>
      )}

      {/* Header - Artistic Badge & Numbering */}
      <div className="flex items-start gap-3 px-5 pt-5 pb-2 cursor-default">
        
        {/* Badge */}
        <div className={`
          flex flex-col items-center shrink-0 rounded-md overflow-hidden select-none border border-white/20
          shadow-engraved mt-1
          ${config.badgeBg} ${config.badgeText}
          print:border-slate-300 print:shadow-none
        `}>
             <span className="px-2 pt-1.5 text-[9px] font-black uppercase tracking-widest opacity-60">
               {config.label}
             </span>
             <span className="px-2 pb-1 text-2xl font-black leading-none tracking-tight">
               {label}
             </span>
        </div>
        
        {/* Title Content */}
        <MathContent
          html={data.title}
          tagName="div"
          className="font-serif font-bold text-slate-900 flex-grow text-[1.1rem] leading-snug pt-1 border-b border-transparent hover:border-slate-300/50 focus:border-slate-400 transition-colors"
          onChange={(html) => onUpdate(data.id, { title: html })}
          placeholder="Titre du bloc..."
        />

        {/* Action Toolbar */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 no-print ml-2 self-start bg-white/80 backdrop-blur-md rounded-lg p-1 shadow-relief border border-slate-100">
          
          <div className="flex items-center bg-slate-100 rounded-md p-0.5 border border-slate-200 mr-2">
             <button onClick={() => onMove(data.id, 'up')} className="p-1 hover:bg-white hover:shadow-sm rounded text-slate-500 hover:text-blue-600 transition-all" title="Monter"><ArrowUp size={14} /></button>
             <button onClick={() => onMove(data.id, 'down')} className="p-1 hover:bg-white hover:shadow-sm rounded text-slate-500 hover:text-blue-600 transition-all" title="Descendre"><ArrowDown size={14} /></button>
          </div>
          
          <button onClick={() => setIsRawMode(!isRawMode)} className={`p-1.5 rounded-md transition-all font-bold flex items-center justify-center ${isRawMode ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-200' : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'}`} title={isRawMode ? "Enregistrer les modifications" : "Modifier le code source LaTeX"}>
            {isRawMode ? <Check size={16} /> : <Code2 size={16} />}
          </button>
          
          <button onClick={addZone} className="p-1.5 hover:bg-green-50 rounded-md text-slate-500 hover:text-green-600 transition-colors" title="Ajouter Zone de réponse"><PlusSquare size={16} /></button>
          
          <label className="cursor-pointer p-1.5 hover:bg-blue-50 rounded-md text-slate-500 hover:text-blue-600 transition-colors relative" title="Importer Image">
            <ImageIcon size={16} />
            <input type="file" className="hidden" accept="image/png, image/jpeg, image/jpg, image/gif" onChange={(e) => { if (e.target.files?.[0]) { const reader = new FileReader(); reader.onload = (ev) => { const newImg: BlockImage = { id: Date.now().toString(), src: ev.target?.result as string, width: 30, align: 'right', position: 'float' }; onUpdate(data.id, { images: [...data.images, newImg] }); }; reader.readAsDataURL(e.target.files[0]); } }} />
          </label>
          
          <div className="w-px h-4 bg-slate-300 mx-1"></div>

          <button onClick={() => onDuplicate(data)} className="p-1.5 hover:bg-purple-50 rounded-md text-slate-500 hover:text-purple-600 transition-colors" title="Dupliquer"><Copy size={16} /></button>
          
          <button onClick={() => onDelete(data.id)} className="p-1.5 hover:bg-red-50 rounded-md text-slate-500 hover:text-red-600 transition-colors" title="Supprimer"><Trash2 size={16} /></button>
        </div>
      </div>

      {/* Content Body */}
      <div className="px-5 pb-5 pt-2 flow-root text-slate-800">
        
        {topImages.length > 0 && <div className="flex flex-col w-full mb-4 items-center">{topImages.map(img => <BlockImageComponent key={img.id} img={img} onUpdate={(updates) => updateImage(img.id, updates)} onDelete={() => deleteImage(img.id)} />)}</div>}
        
        {/* Float images */}
        {floatImages.map(img => <BlockImageComponent key={img.id} img={img} onUpdate={(updates) => updateImage(img.id, updates)} onDelete={() => deleteImage(img.id)} />)}

        {isRawMode ? (
            <div className="relative animate-in fade-in zoom-in duration-200">
                <div className="absolute -top-3 right-0 bg-blue-600 text-white text-[9px] px-2 py-0.5 rounded-b-md font-bold uppercase tracking-wider shadow-sm z-10">
                    Mode Éditeur Source
                </div>
                <textarea
                    className="w-full min-h-[150px] p-4 bg-slate-900 text-blue-100 font-mono text-sm rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y leading-relaxed"
                    value={data.content}
                    onChange={(e) => onUpdate(data.id, { content: e.target.value })}
                    placeholder="Saisissez votre texte et LaTeX ici..."
                    spellCheck={false}
                    autoFocus
                />
            </div>
        ) : (
            <MathContent
              html={processedContent}
              className="text-[1rem] text-justify min-h-[1.5em] leading-relaxed selection:bg-blue-200/50"
              onChange={(html) => onUpdate(data.id, { content: html })}
              placeholder="Contenu du bloc... (Supporte LaTeX $\\LaTeX$)"
            />
        )}

        {bottomImages.length > 0 && <div className="flex flex-col w-full mt-4 items-center">{bottomImages.map(img => <BlockImageComponent key={img.id} img={img} onUpdate={(updates) => updateImage(img.id, updates)} onDelete={() => deleteImage(img.id)} />)}</div>}

        {data.zones.length > 0 && (
          <div className="mt-4 space-y-3 clear-both">
            {data.zones.map((zone) => (
              <AnswerZone
                key={zone.id}
                zone={zone}
                onUpdate={(updates) => {
                  const newZones = data.zones.map(z => z.id === zone.id ? { ...z, ...updates } : z);
                  onUpdate(data.id, { zones: newZones });
                }}
                onDelete={() => onUpdate(data.id, { zones: data.zones.filter(z => z.id !== zone.id) })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});