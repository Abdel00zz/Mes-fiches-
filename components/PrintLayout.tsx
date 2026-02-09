import React from 'react';
import { SheetState, BlockData } from '../types';
import { PrintBlock } from './PrintBlock';
import { MathContent } from './MathContent';

interface PrintLayoutProps {
  sheet: SheetState;
  blocks: (BlockData & { label: string })[];
}

export const PrintLayout: React.FC<PrintLayoutProps> = ({ sheet, blocks }) => {
  return (
    <div className="w-full h-full bg-white text-black p-0 m-0">
       {/* Print Header */}
       <header className="mb-6 pb-2 text-center border-b border-slate-900">
          <MathContent 
            html={sheet.title} 
            tagName="h1" 
            className="text-3xl font-serif font-black text-slate-900 mb-1 uppercase tracking-tighter"
            readOnly
          />
          <MathContent 
            html={sheet.subtitle} 
            tagName="div" 
            className="text-sm text-slate-600 font-medium font-mono tracking-tight"
            readOnly
          />
       </header>

       {/* Print Blocks - Reduced Gap */}
       <div className="flex flex-col gap-2">
          {blocks.map((block) => (
            <PrintBlock 
              key={block.id} 
              data={block} 
              label={block.label} 
            />
          ))}
       </div>

       {/* Print Footer */}
       <div className="mt-8 pt-2 border-t border-slate-300 flex justify-between text-[8px] text-slate-500 font-mono uppercase tracking-[0.2em]">
          <span>Généré avec FicheBuilder Pro</span>
          <span>{new Date().toLocaleDateString()}</span>
       </div>
    </div>
  );
};