
import React from 'react';
import { Printer, Undo2, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface EditorToolbarProps {
    onBack: () => void;
    sheetTitle: string;
    saveStatus: 'saved' | 'saving' | 'unsaved';
    onUndo: () => void;
    onPrint: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
    onBack,
    sheetTitle,
    saveStatus,
    onUndo,
    onPrint
}) => {
    const SaveStatusIndicator = () => {
        switch(saveStatus) {
            case 'saving':
                return <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><Loader2 size={14} className="animate-spin" /><span>Sauvegarde...</span></div>;
            case 'saved':
                return <div className="flex items-center gap-1.5 text-xs font-medium text-green-600"><CheckCircle size={14} /><span>Enregistré</span></div>;
            case 'unsaved':
                return <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600"><AlertCircle size={14} /><span>Modifications non enregistrées</span></div>;
            default:
                return null;
        }
    };

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 h-16 bg-white/80 backdrop-blur-2xl border border-white/40 z-50 flex items-center justify-between px-4 sm:px-6 shadow-float rounded-2xl w-[95%] max-w-6xl transition-all duration-300">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-slate-200/50 rounded-full text-slate-600 transition-colors mr-1">
                <ArrowLeft size={20} />
            </button>
            <span className="font-semibold text-slate-800 hidden sm:inline tracking-tight line-clamp-1 max-w-[150px]">{sheetTitle || "Nouvelle Fiche"}</span>
            <div className="h-5 w-px bg-slate-300 mx-2 opacity-50"></div>
            <button onClick={onUndo} className="p-2 hover:bg-slate-200/50 rounded-full text-slate-600 transition-colors" title="Annuler"><Undo2 size={18} /></button>
            <SaveStatusIndicator />
          </div>

          <div className="flex gap-2">
            <button onClick={onPrint} className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-slate-900 hover:bg-black text-white shadow-lg shadow-slate-900/20 text-xs font-bold uppercase tracking-wider transition-all active:scale-95">
                <Printer size={14} />
                <span className="hidden sm:inline">Imprimer</span>
            </button>
          </div>
        </div>
    );
};
