
import React from 'react';
import { Printer, Download, Undo2, ArrowLeft, Upload } from 'lucide-react';

interface EditorToolbarProps {
    onBack: () => void;
    sheetTitle: string;
    saveStatus: 'saved' | 'saving' | 'unsaved';
    onUndo: () => void;
    onImport: () => void;
    onExport: () => void;
    onPrint: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
    onBack,
    sheetTitle,
    saveStatus,
    onUndo,
    onImport,
    onExport,
    onPrint
}) => {
    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 h-14 bg-white/80 backdrop-blur-xl border border-white/40 z-50 flex items-center justify-between px-4 sm:px-6 shadow-float rounded-full w-[95%] max-w-5xl transition-all">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-slate-200/50 rounded-full text-slate-600 transition-colors mr-1">
                <ArrowLeft size={20} />
            </button>
            <span className="font-semibold text-slate-800 hidden sm:inline tracking-tight line-clamp-1 max-w-[150px]">{sheetTitle || "Nouvelle Fiche"}</span>
            <div className="h-5 w-px bg-slate-300 mx-2 opacity-50"></div>
            <button onClick={onUndo} className="p-2 hover:bg-slate-200/50 rounded-full text-slate-600 transition-colors" title="Annuler"><Undo2 size={18} /></button>
            <div className={`text-xs font-mono ml-2 flex items-center gap-1 transition-colors duration-300 ${saveStatus === 'unsaved' ? 'text-amber-500 font-bold' : 'text-slate-400'}`}>
                 {saveStatus === 'saving' && 'Sauvegarde...'}
                 {saveStatus === 'saved' && 'Sauvegardé'}
                 {saveStatus === 'unsaved' && 'Non enregistré...'}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={onImport} className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full hover:bg-slate-100 text-xs font-bold uppercase tracking-wider text-slate-600 transition-colors">
                <Upload size={14} />
                <span className="hidden sm:inline">Importer</span>
            </button>
            <button onClick={onExport} className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full hover:bg-slate-100 text-xs font-bold uppercase tracking-wider text-slate-600 transition-colors">
                <Download size={14} />
                <span className="hidden sm:inline">Exporter JSON</span>
            </button>
            <button onClick={onPrint} className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-slate-900 hover:bg-black text-white shadow-lg shadow-slate-900/20 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ml-2">
                <Printer size={14} />
                <span className="hidden sm:inline">Imprimer</span>
            </button>
          </div>
        </div>
    );
};
