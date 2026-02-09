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
      <div className="relative mt-4 mb-6 pb-2 border-b-2 border-slate-900 avoid-break w-full">
        <div className="flex items-baseline gap-3">
          <div className="flex items-center justify-center w-12 h-12 bg-slate-900 text-white text-2xl font-serif font-black rounded-sm print:shadow-none">
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
    const containerStyle: React.CSSProperties = { width: `${img.width}%`, marginBottom: '0.5rem', position: 'relative', zIndex: 20 };
    let containerClass = "relative ";
    
    if (img.position === 'float') {
      containerClass += img.align === 'left' ? "float-left mr-4 mb-2 clear-left" : "float-right ml-4 mb-2 clear-right";
    } else {
      containerClass += "flex w-full mb-3 ";
      containerClass += img.align === 'left' ? "justify-start" : img.align === 'right' ? "justify-end" : "justify-center";
    }

    return (
      <div key={img.id} className={containerClass} style={img.position === 'float' ? containerStyle : undefined}>
        <div className="relative rounded-sm overflow-hidden bg-white border border-slate-100" style={img.position !== 'float' ? { width: `${img.width}%` } : { width: '100%' }}>
          <img 
            src={img.src} 
            alt="" 
            className="w-full h-auto print-hq-image" 
          />
        </div>
      </div>
    );
  };

  const topImages = data.images.filter(img => img.position === 'top');
  const bottomImages = data.images.filter(img => img.position === 'bottom');
  const floatImages = data.images.filter(img => img.position === 'float');

  // Cleaned up classes - print.css handles the container style
  return (
    <div className="relative mb-4 rounded-lg avoid-break block-container-print w-full">
      {/* Header - Compact */}
      <div className="flex items-start gap-2 px-4 pt-3 pb-1.5">
        <div className={`
          flex flex-col items-center justify-center shrink-0 rounded-md overflow-hidden select-none border border-slate-200/70 h-10 min-w-[2.75rem] mt-0.5
          ${config.badgeBg} ${config.badgeText}
        `}>
             <span className="text-[7px] font-black uppercase tracking-widest opacity-80 leading-none pt-1">
               {config.label}
             </span>
             <span className="text-lg font-bold leading-none pb-0.5">
               {label}
             </span>
        </div>
        
        <MathContent
          html={data.title}
          tagName="div"
          className="font-serif font-bold text-slate-900 flex-grow text-[1.1rem] leading-tight pt-1"
          readOnly
        />
      </div>

      {/* Body - Compact Padding */}
      <div className="px-4 pb-3 pt-2 flow-root text-slate-900 leading-relaxed">
        {topImages.length > 0 && <div className="flex flex-col w-full mb-3">{topImages.map(renderSingleImage)}</div>}
        {floatImages.map(renderSingleImage)}

        <MathContent
          html={processContentForDisplay(data.content)}
          className="text-justify leading-relaxed"
          readOnly
        />

        {bottomImages.length > 0 && <div className="flex flex-col w-full mt-3">{bottomImages.map(renderSingleImage)}</div>}

        {data.zones.length > 0 && (
          <div className="mt-3 space-y-2 clear-both">
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
