
import React from 'react';
import { Printer, Undo2, Redo2, ArrowLeft } from 'lucide-react';

interface EditorToolbarProps {
    onBack: () => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    onPrint: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
    onBack,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    onPrint
}) => {
    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 h-16 bg-white/80 backdrop-blur-2xl border border-white/40 z-50 flex items-center justify-between px-4 sm:px-6 shadow-float rounded-2xl w-[95%] max-w-6xl transition-all duration-300">
          {/* Left section */}
          <div className="flex items-center gap-3 w-1/3">
            <button onClick={onBack} className="p-2 hover:bg-slate-200/50 rounded-full text-slate-600 transition-colors" title="Retour au tableau de bord">
                <ArrowLeft size={20} />
            </button>
          </div>

          {/* Center section */}
          <div className="flex items-center justify-center gap-2 w-1/3">
            <button onClick={onUndo} disabled={!canUndo} className="p-2 hover:bg-slate-200/50 rounded-full text-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed" title="Annuler"><Undo2 size={18} /></button>
            <button onClick={onRedo} disabled={!canRedo} className="p-2 hover:bg-slate-200/50 rounded-full text-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed" title="Rétablir"><Redo2 size={18} /></button>
          </div>

          {/* Right section */}
          <div className="flex justify-end gap-2 w-1/3">
            <button onClick={onPrint} className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 hover:bg-black text-white shadow-lg shadow-slate-900/20 transition-all active:scale-95" title="Imprimer">
                <Printer size={20} />
            </button>
          </div>
        </div>
    );
};
