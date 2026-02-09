import React, { memo } from 'react';
import { BlockImage } from '../types';
import { ArrowUpFromLine, ArrowDownFromLine, WrapText } from 'lucide-react';

interface BlockImageProps {
  img: BlockImage;
  onUpdate: (updates: Partial<BlockImage>) => void;
  onDelete: () => void;
}

export const BlockImageComponent: React.FC<BlockImageProps> = memo(({ img, onUpdate, onDelete }) => {
  const containerStyle: React.CSSProperties = { width: `${img.width}%`, marginBottom: '0.5rem', position: 'relative', zIndex: 20 };
  let containerClass = "relative group/img transition-all duration-300 ease-out ";
  
  if (img.position === 'float') {
    containerClass += img.align === 'left' ? "float-left mr-6 mb-2 clear-left" : "float-right ml-6 mb-2 clear-right";
  } else {
    containerClass += "flex w-full mb-4 ";
    containerClass += img.align === 'left' ? "justify-start" : img.align === 'right' ? "justify-end" : "justify-center";
  }

  return (
    <div className={containerClass} style={img.position === 'float' ? containerStyle : undefined}>
      <div className="relative shadow-md rounded-md overflow-hidden bg-white hover:shadow-xl transition-shadow border border-slate-100" style={img.position !== 'float' ? { width: `${img.width}%` } : { width: '100%' }}>
        <img src={img.src} alt="" className="w-full h-auto object-cover" />
        
        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover/img:opacity-100 transition-opacity bg-white/95 shadow-lg rounded-lg border border-slate-100 z-50 no-print p-1 scale-90 group-hover/img:scale-100 origin-top-right">
           <div className="flex gap-1 justify-center mb-1">
            <button onClick={() => onUpdate({ position: 'top', align: 'center', width: 60 })} className={`p-1.5 rounded hover:bg-blue-50 ${img.position === 'top' ? 'text-blue-600 bg-blue-50' : 'text-slate-600'}`} title="Haut"><ArrowUpFromLine size={14} /></button>
            <button onClick={() => onUpdate({ position: 'float', align: 'right', width: 30 })} className={`p-1.5 rounded hover:bg-blue-50 ${img.position === 'float' ? 'text-blue-600 bg-blue-50' : 'text-slate-600'}`} title="Intégré"><WrapText size={14} /></button>
            <button onClick={() => onUpdate({ position: 'bottom', align: 'center', width: 60 })} className={`p-1.5 rounded hover:bg-blue-50 ${img.position === 'bottom' ? 'text-blue-600 bg-blue-50' : 'text-slate-600'}`} title="Bas"><ArrowDownFromLine size={14} /></button>
          </div>
          <div className="px-1 py-1 border-t border-slate-100">
             <label className="text-[9px] text-slate-400 uppercase font-bold">Taille: {img.width}%</label>
             <input type="range" min="15" max="100" step="5" value={img.width} onChange={(e) => onUpdate({ width: parseInt(e.target.value) })} className="w-full h-1.5 bg-slate-200 rounded-full cursor-pointer accent-blue-600 mt-1" />
          </div>
          <button onClick={onDelete} className="mt-1 p-1 w-full text-center hover:bg-red-50 text-red-500 rounded text-[10px] font-bold uppercase tracking-wider transition-colors">Supprimer</button>
        </div>
      </div>
    </div>
  );
});