
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
    <div className="print-layout w-full min-h-screen bg-white text-slate-900 relative antialiased">
       {/* Main Sheet Container */}
       <div className="bg-white mx-auto w-full max-w-none print:w-full">
           
           {/* Print Header */}
           <header className="print-section mb-5 pb-4 text-center avoid-break">
              <MathContent
                html={sheet.title}
                tagName="h1"
                className="text-3xl font-serif font-black text-slate-900 mb-1.5 tracking-tight"
                readOnly
              />
              <MathContent
                html={sheet.subtitle}
                tagName="div"
                className="text-base text-slate-500 font-medium tracking-wide"
                readOnly
              />
           </header>

           {/* Standard Flow Layout */}
           <div className="print-flow space-y-2">
              {blocks.map((block) => (
                <PrintBlock 
                  key={block.id} 
                  data={block} 
                  label={block.label} 
                />
              ))}
           </div>

           {/* Print Footer */}
           <div className="print-footer mt-8 pt-2 flex justify-between text-[8pt] text-slate-400 avoid-break">
              <span>FicheBuilder Pro</span>
              <span>{new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
           </div>
       </div>
    </div>
  );
};
