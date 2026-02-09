
import React, { memo } from 'react';
import { BlockData, BLOCK_CONFIG, BlockImage } from '../types';
import { MathContent } from './MathContent';
import { AnswerZone } from './AnswerZone';
import { processContentForDisplay } from '../utils';

interface PrintBlockProps {
  data: BlockData;
  label: string; 
}

export const PrintBlock: React.FC<PrintBlockProps> = memo(({ data, label }) => {
  const config = BLOCK_CONFIG[data.type];

  // --- Section Rendering ---
  if (data.type === 'section') {
    return (
      <div className="relative mt-6 mb-4 pb-1 border-b-2 border-slate-900 avoid-break">
        <div className="flex items-baseline gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-slate-900 text-white text-2xl font-serif font-black rounded-sm print:shadow-none">
            {label}
          </div>
          <MathContent
            html={data.title}
            tagName="h2"
            className="text-2xl font-serif font-bold text-slate-900 flex-grow tracking-tight pt-1"
            readOnly
          />
        </div>
      </div>
    );
  }

  const renderSingleImage = (img: BlockImage) => {
    const containerStyle: React.CSSProperties = { width: `${img.width}%`, marginBottom: '0.25rem', position: 'relative', zIndex: 20 };
    let containerClass = "relative ";
    
    if (img.position === 'float') {
      containerClass += img.align === 'left' ? "float-left mr-4 mb-1 clear-left" : "float-right ml-4 mb-1 clear-right";
    } else {
      containerClass += "flex w-full mb-2 ";
      containerClass += img.align === 'left' ? "justify-start" : img.align === 'right' ? "justify-end" : "justify-center";
    }

    return (
      <div key={img.id} className={containerClass} style={img.position === 'float' ? containerStyle : undefined}>
        <div className="relative rounded-sm overflow-hidden bg-white border border-slate-100" style={img.position !== 'float' ? { width: `${img.width}%` } : { width: '100%' }}>
          <img src={img.src} alt="" className="w-full h-auto" />
        </div>
      </div>
    );
  };

  const topImages = data.images.filter(img => img.position === 'top');
  const bottomImages = data.images.filter(img => img.position === 'bottom');
  const floatImages = data.images.filter(img => img.position === 'float');

  // PRINT: Using shadow-engraved instead of borders for "cadre ordure gravé naturellement" look
  return (
    <div className={`
      relative mb-3 rounded-lg avoid-break
      bg-white/40
      print:shadow-engraved
      print:bg-opacity-50
      print:border-none
    `}>
      {/* Header - Compact */}
      <div className="flex items-center gap-2 px-3 pt-2 pb-1 border-b border-dashed border-slate-300/30">
        <div className={`
          flex flex-col items-center justify-center shrink-0 rounded shadow-sm overflow-hidden select-none border border-slate-200 h-8 min-w-[2.5rem]
          ${config.badgeBg} ${config.badgeText}
          print:border-0 print:shadow-none
        `}>
             <span className="text-[7px] font-black uppercase tracking-widest opacity-80 leading-none mb-0.5">
               {config.label.substring(0, 3)}.
             </span>
             <span className="text-sm font-bold leading-none">
               {label}
             </span>
        </div>
        
        <MathContent
          html={data.title}
          tagName="div"
          className="font-serif font-bold text-slate-900 flex-grow text-[1rem] leading-tight"
          readOnly
        />
      </div>

      {/* Body - Compact Padding */}
      <div className="px-3 pb-2 pt-2 flow-root text-slate-900 text-sm">
        {topImages.length > 0 && <div className="flex flex-col w-full mb-2">{topImages.map(renderSingleImage)}</div>}
        {floatImages.map(renderSingleImage)}

        <MathContent
          html={processContentForDisplay(data.content)}
          className="text-justify leading-snug"
          readOnly
        />

        {bottomImages.length > 0 && <div className="flex flex-col w-full mt-2">{bottomImages.map(renderSingleImage)}</div>}

        {data.zones.length > 0 && (
          <div className="mt-2 space-y-1 clear-both">
            {data.zones.map((zone) => (
              <AnswerZone
                key={zone.id}
                zone={zone}
                readOnly
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
