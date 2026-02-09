import React from 'react';
import { Printer, Download, Undo2, ArrowLeft, HelpCircle, Upload, BookOpen, Loader2 } from 'lucide-react';

interface EditorToolbarProps {
  sheetTitle: string;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  isPrinting: boolean;
  canUndo: boolean;
  onBack: () => void;
  onUndo: () => void;
  onOpenHelp: () => void;
  onOpenTemplates: () => void;
  onOpenImport: () => void;
  onExport: () => void;
  onPrint: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  sheetTitle,
  saveStatus,
  isPrinting,
  canUndo,
  onBack,
  onUndo,
  onOpenHelp,
  onOpenTemplates,
  onOpenImport,
  onExport,
  onPrint,
}) => {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 h-14 bg-white/80 backdrop-blur-xl border border-white/40 z-50 flex items-center justify-between px-2 sm:px-4 shadow-float rounded-full w-[95%] max-w-5xl transition-all">
      <div className="flex items-center gap-1 sm:gap-2">
        <button onClick={onBack} className="p-2 hover:bg-slate-200/50 rounded-full text-slate-600 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <span className="font-semibold text-slate-800 hidden sm:inline tracking-tight line-clamp-1 max-w-[150px]">{sheetTitle || "Nouvelle Fiche"}</span>
        <div className="h-5 w-px bg-slate-200/80 mx-1 sm:mx-2"></div>
        <button onClick={onUndo} disabled={!canUndo} className="p-2 hover:bg-slate-200/50 rounded-full text-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed" title="Annuler">
          <Undo2 size={18} />
        </button>
        <div className={`text-xs font-mono ml-2 hidden lg:flex items-center gap-1.5 transition-colors duration-300 ${saveStatus === 'unsaved' ? 'text-amber-500 font-bold' : 'text-slate-400'}`}>
          <div className={`w-2 h-2 rounded-full ${saveStatus === 'saved' ? 'bg-green-400' : saveStatus === 'saving' ? 'bg-blue-400 animate-pulse' : 'bg-amber-400'}`}></div>
          {saveStatus === 'saving' && 'Sauvegarde...'}
          {saveStatus === 'saved' && 'Enregistré'}
          {saveStatus === 'unsaved' && 'Modifications...'}
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <button onClick={onOpenHelp} className="p-2 sm:px-3 sm:py-2 flex items-center gap-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors" title="Guide de formatage">
          <HelpCircle size={18} />
          <span className="hidden xl:inline font-bold text-xs uppercase tracking-wider">Guide</span>
        </button>
        <div className="h-5 w-px bg-slate-200/80 mx-1"></div>
        <button onClick={onOpenTemplates} className="p-2 sm:px-3 sm:py-2 flex items-center gap-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors" title="Charger un modèle">
          <BookOpen size={16} />
          <span className="hidden xl:inline font-bold text-xs uppercase tracking-wider">Modèles</span>
        </button>
        <button onClick={onOpenImport} className="p-2 sm:px-3 sm:py-2 flex items-center gap-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors" title="Importer depuis JSON">
          <Upload size={16} />
          <span className="hidden xl:inline font-bold text-xs uppercase tracking-wider">Importer</span>
        </button>
        <button onClick={onExport} className="p-2 sm:px-3 sm:py-2 flex items-center gap-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors" title="Exporter en JSON">
          <Download size={16} />
          <span className="hidden xl:inline font-bold text-xs uppercase tracking-wider">Exporter</span>
        </button>
        <button onClick={onPrint} disabled={isPrinting} className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-slate-900 hover:bg-black text-white shadow-lg shadow-slate-900/20 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ml-2 disabled:bg-slate-500 disabled:cursor-wait">
          {isPrinting ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />}
          <span className="hidden sm:inline">{isPrinting ? 'Préparation...' : 'Imprimer'}</span>
        </button>
      </div>
    </div>
  );
};