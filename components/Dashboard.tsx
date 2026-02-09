
import React, { useState, useEffect, useCallback } from 'react';
import { SheetMeta, getSheetIndex, deleteSheet, saveSheet, importSheetFromJSON, loadSheet } from '../utils/storage';
import { Plus, Trash2, FileText, Calendar, Edit3, Code2, Download, HelpCircle, Upload, FileJson, CheckCircle2, AlertCircle } from 'lucide-react';
import { JsonEditorModal } from './JsonEditorModal';
import { HelpModal } from './HelpModal';

interface DashboardProps {
  onOpen: (id: string) => void;
  onCreate: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpen, onCreate }) => {
  const [sheets, setSheets] = useState<SheetMeta[]>([]);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // JSON Modal State
  const [jsonModal, setJsonModal] = useState<{ isOpen: boolean; mode: 'import' | 'edit'; sheetId?: string; content: string }>({
    isOpen: false,
    mode: 'import',
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
    const enriched = sorted.map(meta => {
        const full = loadSheet(meta.id);
        return {
            ...meta,
            blockCount: full ? full.blocks.filter(b => b.type !== 'section').length : 0
        };
    });
    setSheets(enriched as any);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Supprimer définitivement cette fiche ?")) {
      deleteSheet(id);
      loadIndex();
      showNotification("Fiche supprimée");
    }
  };

  const handleOpenJsonEditor = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const sheet = loadSheet(id);
    if (!sheet) return;
    setJsonModal({
        isOpen: true,
        mode: 'edit',
        sheetId: id,
        content: JSON.stringify(sheet, null, 2)
    });
  };

  const handleImportClick = () => {
      setJsonModal({
          isOpen: true,
          mode: 'import',
          content: ''
      });
  };

  const handleJsonSave = (content: string) => {
      if (jsonModal.mode === 'import') {
          importSheetFromJSON(content);
          showNotification("Fiche importée avec succès !");
      } else if (jsonModal.mode === 'edit' && jsonModal.sheetId) {
          try {
             const parsed = JSON.parse(content);
             saveSheet({ ...parsed, id: jsonModal.sheetId }, jsonModal.sheetId);
             showNotification("Modifications enregistrées");
          } catch(e) {
             console.error("Save failed", e);
             showNotification("Erreur lors de la sauvegarde", "error");
          }
      }
      loadIndex();
  };

  const handleEditTitle = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setEditingTitleId(id);
  };

  const updateTitle = (id: string, newTitle: string) => {
    const sheet = loadSheet(id);
    if (sheet) {
      sheet.title = newTitle;
      saveSheet(sheet, id);
      loadIndex();
    }
    setEditingTitleId(null);
  };

  const formatDate = (timestamp: number) => {
      if (!timestamp) return 'Récemment';
      return new Date(timestamp).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  };

  // --- Drag & Drop Logic ---
  const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDraggingFile) setIsDraggingFile(true);
  }, [isDraggingFile]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Only set false if leaving the window/main container
      if (e.currentTarget.contains(e.relatedTarget as Node)) return;
      setIsDraggingFile(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingFile(false);
      
      const file = e.dataTransfer.files?.[0];
      if (file && (file.type === 'application/json' || file.name.endsWith('.json'))) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              try {
                  const content = ev.target?.result as string;
                  importSheetFromJSON(content);
                  loadIndex();
                  showNotification("Fiche importée avec succès !");
              } catch (err) {
                  showNotification("Fichier invalide ou corrompu.", "error");
              }
          };
          reader.readAsText(file);
      }
  }, []);

  return (
    <div 
        className="min-h-screen bg-[#f8fafc] p-8 font-sans text-slate-600 relative"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
    >
      {/* Global Drag Overlay */}
      {isDraggingFile && (
          <div className="fixed inset-0 z-[100] bg-blue-600/90 backdrop-blur-sm flex flex-col items-center justify-center text-white animate-in fade-in duration-200 pointer-events-none">
              <div className="bg-white/20 p-8 rounded-full mb-6 animate-bounce">
                 <FileJson size={64} />
              </div>
              <h2 className="text-4xl font-serif font-black tracking-tight mb-2">Lâchez pour importer</h2>
              <p className="text-blue-100 font-medium">Import instantané de votre fiche JSON</p>
          </div>
      )}

      {/* Fluid Notification Toast */}
      {notification && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300 ${notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-slate-900 text-white'}`}>
          {notification.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <span className="font-medium text-sm">{notification.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
           <div>
             <h1 className="text-3xl font-serif font-black text-slate-900 tracking-tight">Mes Fiches</h1>
             <p className="text-slate-400 mt-1 font-medium text-sm">Gérez et éditez vos fiches de révision</p>
           </div>
           
           <div className="flex gap-3">
             <button 
               onClick={() => setIsHelpOpen(true)}
               className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-semibold text-sm hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm group"
             >
               <HelpCircle size={16} className="text-blue-400 group-hover:text-blue-600" />
               <span className="hidden sm:inline">Guide</span>
             </button>
           </div>
        </div>

        {/* Grille */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 animate-in fade-in duration-500">
          
          {/* Create New Sheet */}
          <button 
            onClick={onCreate}
            className="flex flex-col items-center justify-center min-h-[160px] border-2 border-dashed border-slate-300 rounded-xl text-slate-400 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-300 group shadow-sm hover:shadow-md"
          >
            <div className="w-12 h-12 mb-3 rounded-full flex items-center justify-center bg-slate-100 group-hover:bg-white group-hover:shadow-lg transition-all transform group-hover:scale-110">
                <Plus size={24} className="opacity-60 group-hover:opacity-100" />
            </div>
            <span className="font-bold text-sm">Nouvelle fiche vierge</span>
          </button>

          {/* Import Sheet Button */}
          <button 
            onClick={handleImportClick}
            className="flex flex-col items-center justify-center min-h-[160px] border-2 border-dashed border-slate-300 rounded-xl text-slate-400 hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50/50 transition-all duration-300 group shadow-sm hover:shadow-md relative overflow-hidden"
          >
             <div className="absolute top-2 right-2 px-2 py-0.5 bg-purple-100 text-purple-600 text-[10px] font-bold uppercase rounded-full">
                 ou Glissez-Déposez
             </div>
            <div className="w-12 h-12 mb-3 rounded-full flex items-center justify-center bg-slate-100 group-hover:bg-white group-hover:shadow-lg transition-all transform group-hover:scale-110">
                <Upload size={24} className="opacity-60 group-hover:opacity-100" />
            </div>
            <span className="font-bold text-sm">Importer une fiche (JSON)</span>
          </button>

          {/* All Sheets */}
          {sheets.map((sheet: any) => (
            <div 
              key={sheet.id}
              onClick={() => onOpen(sheet.id)}
              className="group bg-white border border-slate-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-relief transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[160px] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-bl from-white via-white to-transparent z-10">
                  <div className="flex items-center gap-1 bg-white/90 backdrop-blur rounded-lg p-1 shadow-sm border border-slate-100">
                    <button onClick={(e) => handleEditTitle(e, sheet.id)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Renommer"><Edit3 size={14} /></button>
                    <button onClick={(e) => handleOpenJsonEditor(e, sheet.id)} className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded" title="Modifier le code JSON"><Code2 size={14} /></button>
                    <button onClick={(e) => handleDelete(e, sheet.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="Supprimer"><Trash2 size={14} /></button>
                  </div>
              </div>

              <div>
                {editingTitleId === sheet.id ? (
                    <input 
                      type="text" 
                      defaultValue={sheet.title}
                      autoFocus
                      className="w-full text-lg font-serif font-bold text-slate-900 border-b-2 border-blue-500 focus:outline-none bg-transparent"
                      onClick={(e) => e.stopPropagation()}
                      onBlur={(e) => updateTitle(sheet.id, e.target.value)}
                      onKeyDown={(e) => { if(e.key === 'Enter') updateTitle(sheet.id, e.currentTarget.value) }}
                    />
                ) : (
                    <h3 className="font-serif font-bold text-slate-900 text-lg leading-tight line-clamp-2 mb-1" title={sheet.title}>
                       {sheet.title}
                    </h3>
                )}
                <p className="text-xs text-slate-400 font-medium line-clamp-2">{sheet.subtitle || "Sans sous-titre"}</p>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50 text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  <div className="flex items-center gap-1">
                      <FileText size={12} />
                      <span>{sheet.blockCount || 0} BLOCS</span>
                  </div>
                  <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{formatDate(sheet.updatedAt)}</span>
                  </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* JSON Modal */}
      <JsonEditorModal 
        isOpen={jsonModal.isOpen} 
        onClose={() => setJsonModal({ ...jsonModal, isOpen: false })} 
        initialValue={jsonModal.content}
        onSave={handleJsonSave}
        title={jsonModal.mode === 'import' ? "Importer une fiche (JSON)" : "Modifier le code source"}
        allowFileImport={jsonModal.mode === 'import'} 
      />

      {/* Help Modal */}
      <HelpModal 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
      />
    </div>
  );
};
