
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
      <div className="print-section relative mt-5 mb-3 avoid-break w-full">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 bg-slate-800 text-white text-lg font-serif font-bold rounded print:shadow-none">
            {label}
          </div>
          <MathContent
            html={data.title}
            tagName="h2"
            className="text-xl font-serif font-bold text-slate-800 flex-grow tracking-tight"
            readOnly
          />
        </div>
      </div>
    );
  }

  const renderSingleImage = (img: BlockImage) => {
    const containerStyle: React.CSSProperties = { width: `${img.width}%`, marginBottom: '0.5rem', position: 'relative', zIndex: 20 };
    let containerClass = "relative avoid-break print-image-container ";
    
    if (img.position === 'float') {
      containerClass += img.align === 'left' ? "float-left mr-4 mb-2 clear-left" : "float-right ml-4 mb-2 clear-right";
    } else {
      containerClass += "flex w-full mb-3 ";
      containerClass += img.align === 'left' ? "justify-start" : img.align === 'right' ? "justify-end" : "justify-center";
    }

    return (
      <div key={img.id} className={containerClass} style={img.position === 'float' ? containerStyle : undefined}>
        <div className="relative rounded overflow-hidden" style={img.position !== 'float' ? { width: `${img.width}%` } : { width: '100%' }}>
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

  // PRINT: Clean card with subtle type-colored left accent
  return (
    <div className={`
      print-block relative mb-3 rounded-md avoid-break
      ${config.containerBg}
      print:shadow-none
      w-full
      border-l-[3px] ${config.borderColor}
    `}>
      {/* Header */}
      <div className="print-block-header flex items-center gap-2.5 px-3.5 pt-2.5 pb-2">
        <div className={`
          flex items-center gap-1.5 shrink-0 rounded-md px-2 py-1 select-none
          ${config.badgeBg} ${config.badgeText}
        `}>
             <span className="text-[8px] font-bold uppercase tracking-wider leading-none">
               {config.label}
             </span>
             <span className="text-sm font-bold leading-none">
               {label}
             </span>
        </div>

        <MathContent
          html={data.title}
          tagName="div"
          className="font-serif font-semibold text-slate-800 flex-grow text-[1rem] leading-snug"
          readOnly
        />
      </div>

      {/* Body */}
      <div className="px-3.5 pb-3 pt-1.5 flow-root text-slate-800 text-sm leading-relaxed">
        {topImages.length > 0 && <div className="flex flex-col w-full mb-3">{topImages.map(renderSingleImage)}</div>}
        {floatImages.map(renderSingleImage)}

        <MathContent
          html={processContentForDisplay(data.content)}
          className="text-justify leading-relaxed"
          readOnly
        />

        {bottomImages.length > 0 && <div className="flex flex-col w-full mt-3">{bottomImages.map(renderSingleImage)}</div>}

        {data.zones.length > 0 && (
          <div className="mt-2.5 space-y-1.5 clear-both">
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
