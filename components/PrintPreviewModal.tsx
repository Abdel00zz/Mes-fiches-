
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SheetState, BlockData } from '../types';
import { PrintLayout } from './PrintLayout';
import { X, Printer, Settings, FileText, MoveHorizontal, Text, Maximize2 } from 'lucide-react';
import { generatePrintCSS, PrintOptions } from '../utils/print';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sheet: SheetState;
  blocks: (BlockData & { label: string })[];
}

const Control: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{label}</label>
        {children}
    </div>
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <select {...props} className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm font-medium text-slate-800 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
);


export const PrintPreviewModal: React.FC<Props> = ({ isOpen, onClose, sheet, blocks }) => {
    const [options, setOptions] = useState<PrintOptions>({
        paper: 'a4',
        orientation: 'landscape',
        columns: 1,
        fontSize: 12,
        margin: 'normal'
    });

    const printStyles = useMemo(() => generatePrintCSS(options), [options]);

    const handlePrint = useCallback(async () => {
        // Ensure MathJax renders before printing
        const w = window as any;
        if (w.MathJax?.typesetPromise) {
            await w.MathJax.typesetPromise();
        }
        await new Promise(r => setTimeout(r, 50)); // Small delay for rendering flush

        const styleEl = document.createElement('style');
        styleEl.id = 'dynamic-print-styles';
        styleEl.innerHTML = printStyles;
        document.head.appendChild(styleEl);
        document.body.classList.add('printing-active');

        window.print();

        // Cleanup
        document.body.classList.remove('printing-active');
        document.head.removeChild(styleEl);

    }, [printStyles]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-slate-800/50 flex flex-col animate-in fade-in duration-200 screen-only">
            <style>{`
                @media print {
                    .print-preview-modal, .print-preview-controls { display: none !important; }
                    .print-preview-content {
                        position: absolute;
                        top: 0; left: 0;
                        width: 100vw; height: 100vh;
                        overflow: visible;
                    }
                }
            `}</style>
            
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-lg shadow-md h-16 flex items-center justify-between px-6 z-20 shrink-0">
                <div className="flex items-center gap-3">
                    <Settings size={20} className="text-blue-600" />
                    <h2 className="text-lg font-bold text-slate-800 font-serif">Options d'impression</h2>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="text-sm font-semibold text-slate-600 hover:text-slate-900">Fermer</button>
                    <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                        <Printer size={16} />
                        Lancer l'impression
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex bg-slate-200 overflow-hidden">
                {/* Controls Panel */}
                <aside className="w-64 bg-white p-6 overflow-y-auto space-y-6 shrink-0 border-r border-slate-200">
                    <Control label="Format Papier">
                        <Select value={options.paper} onChange={(e) => setOptions(o => ({...o, paper: e.target.value as any}))}>
                            <option value="a4">A4 (210 x 297mm)</option>
                            <option value="letter">US Letter (8.5 x 11in)</option>
                        </Select>
                    </Control>
                     <Control label="Orientation">
                        <Select value={options.orientation} onChange={(e) => setOptions(o => ({...o, orientation: e.target.value as any}))}>
                            <option value="landscape">Paysage</option>
                            <option value="portrait">Portrait</option>
                        </Select>
                    </Control>
                    <Control label="Colonnes">
                       <Select value={options.columns} onChange={(e) => setOptions(o => ({...o, columns: parseInt(e.target.value)}))}>
                            <option value={1}>1 Colonne</option>
                            <option value={2}>2 Colonnes</option>
                        </Select>
                    </Control>
                     <Control label="Taille Police">
                        <Select value={options.fontSize} onChange={(e) => setOptions(o => ({...o, fontSize: parseInt(e.target.value)}))}>
                            <option value={10}>Petite (10pt)</option>
                            <option value={11}>Normale (11pt)</option>
                            <option value={12}>Grande (12pt)</option>
                        </Select>
                    </Control>
                     <Control label="Marges">
                        <Select value={options.margin} onChange={(e) => setOptions(o => ({...o, margin: e.target.value as any}))}>
                            <option value="normal">Normales (9mm)</option>
                            <option value="narrow">Étroites (5mm)</option>
                            <option value="wide">Larges (15mm)</option>
                        </Select>
                    </Control>
                </aside>

                {/* Preview Area */}
                <div className="flex-grow p-8 overflow-auto">
                    <style>{printStyles}</style>
                    <div id="print-preview-sheet" className="mx-auto bg-white shadow-2xl">
                         <PrintLayout sheet={sheet} blocks={blocks} />
                    </div>
                </div>
            </main>
        </div>
    );
};
