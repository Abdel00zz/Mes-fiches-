
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
    <div className="w-full min-h-screen bg-slate-100 text-slate-900 relative">
       {/* Decorative Top Frame - Fixed on every page */}
       <div className="fixed top-0 left-0 w-full h-2 bg-gradient-to-r from-slate-700 via-slate-500 to-slate-700 z-50 print:fixed print:top-0" style={{printColorAdjust: 'exact'}}></div>

       {/* Main Sheet Container */}
       <div className="bg-white mx-auto min-h-screen p-8 print:p-8 print:w-full max-w-[95%] relative shadow-none print:shadow-none">
           
           {/* Print Header */}
           <header className="mb-8 pb-4 text-center border-b-2 border-slate-900">
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

           {/* Two-Column Flow Layout */}
           <div className="print-columns">
              {blocks.map((block) => (
                <PrintBlock 
                  key={block.id} 
                  data={block} 
                  label={block.label} 
                />
              ))}
           </div>

           {/* Print Footer */}
           <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between text-[9px] text-slate-400 font-mono uppercase tracking-[0.2em]">
              <span>Généré avec FicheBuilder Pro</span>
              <span>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
           </div>
       </div>

       {/* Decorative Bottom Frame - Fixed on every page */}
       <div className="fixed bottom-0 left-0 w-full h-2 bg-gradient-to-r from-slate-600 to-slate-800 z-50 print:fixed print:bottom-0" style={{printColorAdjust: 'exact'}}></div>
    </div>
  );
};
