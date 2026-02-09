
import React, { useState } from 'react';
import { AnswerZone as AnswerZoneType, ZoneStyle } from '../types';
import { Trash2, Grid, FileText, MoreHorizontal, Image as ImageIcon, Percent, ChevronsUpDown } from 'lucide-react';

interface Props {
  zone: AnswerZoneType;
  onUpdate?: (updates: Partial<AnswerZoneType>) => void;
  onDelete?: () => void;
  readOnly?: boolean;
}

export const AnswerZone: React.FC<Props> = ({ zone, onUpdate, onDelete, readOnly = false }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // Resize Logic
  const handleResizeStart = (e: React.MouseEvent) => {
    if (readOnly || !onUpdate) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startY = e.clientY;
    const startHeight = zone.height;
    const PX_PER_MM = 3.78;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const currentY = moveEvent.clientY;
      const deltaPx = currentY - startY;
      const deltaMm = deltaPx / PX_PER_MM;
      
      const newHeight = Math.max(10, Math.round(startHeight + deltaMm)); 
      
      if (newHeight !== zone.height) {
        onUpdate({ height: newHeight });
      }
    };

    const onMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };


  const getBackgroundStyle = (): React.CSSProperties => {
    let baseStyle: React.CSSProperties = {};
    const color = '#94a3b8'; // Slate-400 equivalent
    
    // Units converted to MM for consistent print physical size
    switch (zone.style) {
      case 'lines':
        // Standard Seyes/Ruled line height 8mm.
        // We use backgroundSize to force a strict 8mm repeat pattern.
        // This prevents floating point errors seen with repeating-linear-gradient.
        baseStyle = {
          backgroundImage: `linear-gradient(to bottom, transparent 0mm, transparent 7.8mm, ${color} 7.8mm, ${color} 8mm)`,
          backgroundSize: '100% 8mm',
          backgroundRepeat: 'repeat-y',
          backgroundAttachment: 'local',
          lineHeight: '8mm',
          opacity: 0.4
        };
        break;
      case 'grid':
        // 5x5mm grid
        baseStyle = {
          backgroundImage: `linear-gradient(${color} 0.2mm, transparent 0.2mm), linear-gradient(90deg, ${color} 0.2mm, transparent 0.2mm)`,
          backgroundSize: '5mm 5mm',
          opacity: 0.3
        };
        break;
      case 'dots':
        // 5mm spaced dots
        baseStyle = {
          backgroundImage: `radial-gradient(${color} 0.4mm, transparent 0.4mm)`,
          backgroundSize: '5mm 5mm',
          opacity: 0.5
        };
        break;
      default:
        baseStyle = {};
    }
    return { 
        ...baseStyle, 
        printColorAdjust: 'exact', 
        WebkitPrintColorAdjust: 'exact' 
    } as React.CSSProperties;
  };

  const cycleStyle = () => {
    if (readOnly || !onUpdate) return;
    const styles: ZoneStyle[] = ['lines', 'grid', 'dots', 'blank'];
    const nextIndex = (styles.indexOf(zone.style) + 1) % styles.length;
    onUpdate({ style: styles[nextIndex] });
  };

  const handleDrop = (e: React.DragEvent) => {
    if (readOnly || !onUpdate) return;
    e.preventDefault();
    e.stopPropagation(); 
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            onUpdate({ backgroundImage: event.target.result as string, backgroundOpacity: 0.8 });
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const marginClass = readOnly ? 'my-1' : 'my-4';

  return (
    <div className={`group relative w-full transition-all break-inside-avoid ${marginClass}`}>
      {/* Zone Visual with Print Rich Class */}
      <div 
        className={`
            w-full border rounded-sm bg-white transition-all overflow-hidden relative 
            print-rich-zone
            ${isDragOver && !readOnly ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-300'}
        `}
        style={{ height: `${zone.height}mm` }}
        onDragOver={(e) => { if(!readOnly) { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); } }}
        onDragLeave={(e) => { if(!readOnly) { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); } }}
        onDrop={handleDrop}
      >
        <div 
          className="absolute inset-0 z-0 pointer-events-none print:opacity-100" 
          style={getBackgroundStyle()} 
        />
        {zone.backgroundImage && (
          <div className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden pointer-events-none print:opacity-100">
            <img 
              src={zone.backgroundImage} 
              alt="Zone background" 
              className="max-w-full max-h-full object-contain print-hq-image"
              style={{ opacity: zone.backgroundOpacity ?? 0.8 }}
            />
          </div>
        )}
      </div>

      {/* Controls */}
      {!readOnly && onUpdate && onDelete && (
        <>
          <div className="absolute -top-3 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm border border-slate-200 rounded px-1 z-20 no-print">
            {zone.backgroundImage && (
              <div className="flex items-center gap-1 px-1 border-r border-slate-100 mr-1">
                <Percent size={12} className="text-slate-400" />
                <input 
                  type="range" 
                  min="0.1" 
                  max="1" 
                  step="0.1"
                  value={zone.backgroundOpacity ?? 0.8}
                  onChange={(e) => onUpdate({ backgroundOpacity: parseFloat(e.target.value) })}
                  className="w-12 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  title="Opacité"
                />
              </div>
            )}
            {zone.backgroundImage && (
              <button onClick={() => onUpdate({ backgroundImage: undefined })} className="p-1 text-slate-400 hover:text-red-500" title="Supprimer fond">
                <ImageIcon size={12} className="line-through" />
              </button>
            )}
            <button onClick={cycleStyle} className="p-1 text-slate-500 hover:text-blue-600" title="Style">
              {zone.style === 'lines' && <MoreHorizontal size={14} />}
              {zone.style === 'grid' && <Grid size={14} />}
              {zone.style === 'dots' && <MoreHorizontal size={14} className="rotate-90" />}
              {zone.style === 'blank' && <FileText size={14} />}
            </button>
            <button onClick={onDelete} className="p-1 text-slate-400 hover:text-red-600">
              <Trash2 size={14} />
            </button>
          </div>

          {/* MODERN HORIZONTAL RESIZE BAR */}
          <div 
             className={`
                absolute -bottom-2 left-0 w-full h-4 cursor-ns-resize flex justify-center items-center z-20 no-print group/resize
             `}
             onMouseDown={handleResizeStart}
          >
             {/* La barre visuelle qui apparait au survol */}
             <div className={`
                w-full h-px bg-blue-300 opacity-0 group-hover/resize:opacity-100 transition-opacity absolute top-1/2
                ${isResizing ? 'opacity-100 bg-blue-500' : ''}
             `}></div>

             {/* Le bouton central moderne */}
             <div className={`
                flex items-center gap-1 bg-white border border-slate-200 rounded-full px-3 py-0.5 shadow-sm text-slate-400
                hover:text-blue-600 hover:border-blue-400 hover:shadow-md transition-all z-10 scale-90 hover:scale-100
                ${isResizing ? 'text-blue-600 border-blue-500 shadow-md scale-100 ring-2 ring-blue-100' : 'opacity-0 group-hover:opacity-100'}
             `}>
               <ChevronsUpDown size={14} />
               <span className="text-[9px] font-bold uppercase tracking-widest">{zone.height}mm</span>
             </div>
          </div>
        </>
      )}
    </div>
  );
};
