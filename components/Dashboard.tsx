
import React, { useState, useEffect, useCallback } from 'react';
import { SheetMeta, getSheetIndex, deleteSheet, importSheetFromJSON, loadSheet, saveSheet } from '../utils/storage';
import { Plus, Upload, FileJson, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { JsonEditorModal } from './JsonEditorModal';
import { HelpModal } from './HelpModal';
import { SheetCard } from './SheetCard';

interface DashboardProps {
  onOpen: (id: string) => void;
  onCreate: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpen, onCreate }) => {
  const [sheets, setSheets] = useState<(SheetMeta & { blockCount: number })[]>([]);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const [jsonModal, setJsonModal] = useState<{ isOpen: boolean; sheetId?: string; content: string }>({
    isOpen: false,
    content: ''
  });

  useEffect(() => {
    loadIndex();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadIndex = () => {
    const index = getSheetIndex();
    const sorted = index.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    const enriched = sorted.map(meta => ({
        ...meta,
        blockCount: loadSheet(meta.id)?.blocks.filter(b => b.type !== 'section').length || 0
    }));
    setSheets(enriched);
  };

  const handleDelete = (id: string) => {
    if (confirm("Supprimer définitivement cette fiche ?")) {
      deleteSheet(id);
      loadIndex();
      showNotification("Fiche supprimée");
    }
  };

  const handleOpenJsonEditor = (id: string) => {
    const sheet = loadSheet(id);
    if (!sheet) return;
    setJsonModal({ isOpen: true, sheetId: id, content: JSON.stringify(sheet, null, 2) });
  };
  
  const handleFileDrop = (file: File) => {
    if (file && (file.type === 'application/json' || file.name.endsWith('.json'))) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const newId = importSheetFromJSON(ev.target?.result as string);
                loadIndex();
                showNotification("Fiche importée avec succès !");
                onOpen(newId);
            } catch (err) {
                showNotification("Fichier invalide ou corrompu.", "error");
            }
        };
        reader.readAsText(file);
    }
  };

  const handleJsonSave = (content: string) => {
      if (jsonModal.sheetId) {
          try {
             const parsed = JSON.parse(content);
             saveSheet({ ...parsed, id: jsonModal.sheetId }, jsonModal.sheetId);
             showNotification("Modifications enregistrées");
          } catch(e) {
             showNotification("Erreur de sauvegarde : JSON invalide", "error");
          }
      }
      loadIndex();
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault(); e.stopPropagation();
      setIsDraggingFile(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault(); e.stopPropagation();
      if (e.currentTarget.contains(e.relatedTarget as Node)) return;
      setIsDraggingFile(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
      e.preventDefault(); e.stopPropagation();
      setIsDraggingFile(false);
      if(e.dataTransfer.files?.[0]) handleFileDrop(e.dataTransfer.files[0]);
  }, []);

  return (
    <div 
        className="min-h-screen bg-[#f8fafc] p-8 font-sans text-slate-600 relative"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
    >
      {isDraggingFile && (
          <div className="fixed inset-0 z-[100] bg-blue-600/90 backdrop-blur-sm flex flex-col items-center justify-center text-white animate-in fade-in duration-200 pointer-events-none">
              <div className="bg-white/20 p-8 rounded-full mb-6 animate-bounce"><FileJson size={64} /></div>
              <h2 className="text-4xl font-serif font-black tracking-tight mb-2">Lâchez pour importer</h2>
              <p className="text-blue-100 font-medium">Import instantané de votre fiche JSON</p>
          </div>
      )}

      {notification && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300 ${notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-slate-900 text-white'}`}>
          {notification.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <span className="font-medium text-sm">{notification.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
           <div>
             <h1 className="text-3xl font-serif font-black text-slate-900 tracking-tight">Mes Fiches</h1>
             <p className="text-slate-400 mt-1 font-medium text-sm">Gérez et éditez vos fiches de révision</p>
           </div>
           <button onClick={() => setIsHelpOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-semibold text-sm hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm group">
             <HelpCircle size={16} className="text-blue-400 group-hover:text-blue-600" />
             <span className="hidden sm:inline">Guide</span>
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12 animate-in fade-in duration-500">
          <button onClick={onCreate} className="flex flex-col items-center justify-center min-h-[180px] border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-gradient-to-br hover:from-blue-50/80 hover:to-indigo-50/40 transition-all duration-500 group">
            <div className="w-14 h-14 mb-3 rounded-2xl flex items-center justify-center bg-slate-100/80 group-hover:bg-white group-hover:shadow-lg group-hover:shadow-blue-200/50 transition-all duration-500 transform group-hover:scale-110 group-hover:-rotate-3"><Plus size={26} /></div>
            <span className="font-bold text-sm">Nouvelle fiche vierge</span>
          </button>

          <div onClick={() => document.getElementById('file-input')?.click()} className="flex flex-col cursor-pointer items-center justify-center min-h-[180px] border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-violet-400 hover:text-violet-600 hover:bg-gradient-to-br hover:from-violet-50/80 hover:to-purple-50/40 transition-all duration-500 group">
            <input type="file" id="file-input" className="hidden" accept=".json,application/json" onChange={(e) => e.target.files?.[0] && handleFileDrop(e.target.files[0])} />
            <div className="w-14 h-14 mb-3 rounded-2xl flex items-center justify-center bg-slate-100/80 group-hover:bg-white group-hover:shadow-lg group-hover:shadow-violet-200/50 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3"><Upload size={26} /></div>
            <span className="font-bold text-sm">Importer depuis un fichier</span>
            <p className="text-xs mt-1.5 text-slate-300">Glissez-déposez un fichier .json</p>
          </div>

          {sheets.map(sheet => (
            <SheetCard 
              key={sheet.id}
              sheet={sheet}
              onOpen={() => onOpen(sheet.id)}
              onDelete={() => handleDelete(sheet.id)}
              onOpenJsonEditor={() => handleOpenJsonEditor(sheet.id)}
              onUpdateTitle={(newTitle) => {
                  const s = loadSheet(sheet.id);
                  if(s) {
                      s.title = newTitle;
                      saveSheet(s, sheet.id);
                      loadIndex();
                  }
              }}
              onUpdateSubtitle={(newSubtitle) => {
                  const s = loadSheet(sheet.id);
                  if(s) {
                      s.subtitle = newSubtitle;
                      saveSheet(s, sheet.id);
                      loadIndex();
                  }
              }}
            />
          ))}
        </div>
      </div>

      <JsonEditorModal isOpen={jsonModal.isOpen} onClose={() => setJsonModal({ ...jsonModal, isOpen: false })} initialValue={jsonModal.content} onSave={handleJsonSave} title="Modifier le code source" allowFileImport={false} />
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
};
