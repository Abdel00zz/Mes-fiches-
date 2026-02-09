
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
           <header className="print-section mb-6 pb-3 text-center border-b-2 border-slate-900 avoid-break">
              <MathContent 
                html={sheet.title} 
                tagName="h1" 
                className="text-4xl font-serif font-black text-slate-900 mb-2 uppercase tracking-tighter"
                readOnly
              />
              <MathContent 
                html={sheet.subtitle} 
                tagName="div" 
                className="text-lg text-slate-600 font-medium font-mono tracking-tight"
                readOnly
              />
           </header>

           {/* Standard Flow Layout (Single Column) */}
           <div className="print-flow space-y-3">
              {blocks.map((block) => (
                <PrintBlock 
                  key={block.id} 
                  data={block} 
                  label={block.label} 
                />
              ))}
           </div>

           {/* Print Footer */}
           <div className="print-footer mt-6 pt-3 border-t border-slate-200 flex justify-between text-[9px] text-slate-500 font-mono uppercase tracking-[0.2em] avoid-break">
              <span>Généré avec FicheBuilder Pro</span>
              <span>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
           </div>
       </div>
    </div>
  );
};
