import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { BlockData, SheetState, BlockType, BLOCK_CONFIG } from '../types';
import { Block } from './Block';
import { PrintLayout } from './PrintLayout';
import { MathContent } from './MathContent';
import { BlockInserter } from './BlockInserter';
import { Printer, Download, Plus, Undo2, LayoutTemplate, ArrowLeft, HelpCircle, Upload, BookOpen, CheckCircle2, AlertTriangle, X, LoaderCircle } from 'lucide-react';
import { saveSheet, importSheetFromJSON } from '../utils/storage';
import { HelpModal } from './HelpModal';
import { JsonEditorModal } from './JsonEditorModal';

interface EditorProps {
  initialState: SheetState;
  onBack: () => void;
  autoSaveInterval?: number;
}

export const Editor: React.FC<EditorProps> = ({ initialState, onBack, autoSaveInterval = 1000 }) => {
  const [sheet, setSheet] = useState<SheetState>(initialState);
  const [history, setHistory] = useState<SheetState[]>([initialState]);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  
  const printContainerRef = useRef<HTMLDivElement>(null);
  const lastSavedJson = useRef<string>(JSON.stringify(initialState));

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    if (!sheet.id) {
      const newSheet = { ...sheet, id: Date.now().toString() };
      setSheet(newSheet);
      saveSheet(newSheet, newSheet.id);
      lastSavedJson.current = JSON.stringify(newSheet);
    }
  }, []);

  useEffect(() => {
    if (!sheet.id) return;

    const currentJson = JSON.stringify(sheet);
    if (currentJson !== lastSavedJson.current) {
        setSaveStatus('unsaved');
    }

    const timer = setTimeout(() => {
      if (currentJson !== lastSavedJson.current) {
         setSaveStatus('saving');
         saveSheet(sheet, sheet.id);
         lastSavedJson.current = currentJson;
         
         setTimeout(() => setSaveStatus('saved'), 500);
      }
    }, autoSaveInterval);

    return () => clearTimeout(timer);
  }, [sheet, autoSaveInterval]);

  const updateSheet = (newState: SheetState) => {
    setHistory(prev => [...prev.slice(-10), newState]);
    setSheet(newState);
  };
  
  const handleImportJson = (jsonContent: string) => {
    try {
      const newId = sheet.id || Date.now().toString();
      const parsed = JSON.parse(jsonContent);
      const newSheetState = {
        ...parsed,
        id: newId, 
        updatedAt: Date.now()
      };
      setSheet(newSheetState);
      setHistory([newSheetState]);
      showNotification("Fiche importée avec succès !");
      setIsJsonModalOpen(false);
    } catch(e) {
      console.error(e);
      showNotification("JSON invalide ou corrompu", "error");
    }
  };

  const handleLoadTemplate = async (url: string) => {
    try {
      const res = await fetch(url);
      const data = await res.json();
      const newSheetState = {
        ...data,
        id: sheet.id || Date.now().toString(),
        updatedAt: Date.now()
      };
      setSheet(newSheetState);
      setHistory([newSheetState]);
      showNotification("Modèle chargé !");
      setIsTemplateModalOpen(false);
    } catch(e) {
      showNotification("Erreur lors du chargement du modèle", "error");
    }
  };

  const undo = () => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      setSheet(newHistory[newHistory.length - 1]);
    }
  };

  const addBlock = useCallback((type: BlockType) => {
    setSheet(current => {
      const newBlock: BlockData = {
        id: Date.now().toString(),
        type,
        title: '',
        content: '',
        zones: [],
        images: []
      };
      const newState = { ...current, blocks: [...current.blocks, newBlock] };
      setHistory(prev => [...prev.slice(-10), newState]);
      return newState;
    });
  }, []);

  const insertBlock = useCallback((type: BlockType, index: number) => {
    setSheet(current => {
      const newBlock: BlockData = {
        id: Date.now().toString(),
        type,
        title: '',
        content: '',
        zones: [],
        images: []
      };
      const newBlocks = [...current.blocks];
      newBlocks.splice(index, 0, newBlock);
      
      const newState = { ...current, blocks: newBlocks };
      setHistory(prev => [...prev.slice(-10), newState]);
      return newState;
    });
  }, []);

  const updateBlock = useCallback((id: string, updates: Partial<BlockData>) => {
    setSheet(current => {
      const newBlocks = current.blocks.map(b => b.id === id ? { ...b, ...updates } : b);
      const newState = { ...current, blocks: newBlocks };
      return newState;
    });
  }, []);

  const duplicateBlock = useCallback((sourceBlock: BlockData) => {
    setSheet(current => {
        const newBlock: BlockData = {
            ...sourceBlock,
            id: Date.now().toString(),
            zones: sourceBlock.zones.map(z => ({...z, id: Math.random().toString(36).substr(2, 9)})),
            images: sourceBlock.images.map(i => ({...i, id: Math.random().toString(36).substr(2, 9)}))
        };
        
        const index = current.blocks.findIndex(b => b.id === sourceBlock.id);
        const newBlocks = [...current.blocks];
        newBlocks.splice(index + 1, 0, newBlock);
        
        const newState = { ...current, blocks: newBlocks };
        setHistory(prev => [...prev.slice(-10), newState]);
        return newState;
    });
  }, []);

  const deleteBlock = useCallback((id: string) => {
    if (confirm('Supprimer ce bloc ?')) {
      setSheet(current => {
        const newState = { ...current, blocks: current.blocks.filter(b => b.id !== id) };
        setHistory(prev => [...prev.slice(-10), newState]);
        return newState;
      });
    }
  }, []);

  const moveBlock = useCallback((id: string, direction: 'up' | 'down') => {
    setSheet(current => {
      const index = current.blocks.findIndex(b => b.id === id);
      if ((direction === 'up' && index === 0) || (direction === 'down' && index === current.blocks.length - 1)) return current;
      
      const newBlocks = [...current.blocks];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
      const newState = { ...current, blocks: newBlocks };
      setHistory(prev => [...prev.slice(-10), newState]);
      return newState;
    });
  }, []);

  const handlePrint = async () => {
      if (isPrinting) return;
      setIsPrinting(true);

      if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
      }

      // 1. Ensure MathJax is rendered in the current editor view
      const w = window as any;
      if (w.MathJax) {
          await w.MathJax.typesetPromise();
      }
      
      // 2. Fetch the print CSS content
      const printCss = await fetch('/print.css').then(res => res.text());

      // 3. Get the fully rendered HTML from our hidden PrintLayout component
      const printHtml = printContainerRef.current?.innerHTML;
      if (!printHtml) {
          showNotification("Erreur lors de la génération de l'aperçu.", "error");
          setIsPrinting(false);
          return;
      }

      // 4. Open a new window and build a clean HTML document
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
          showNotification("Veuillez autoriser les pop-ups pour imprimer.", "error");
          setIsPrinting(false);
          return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="fr">
          <head>
            <meta charset="UTF-8" />
            <title>${sheet.title || 'Fiche de révision'}</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono&family=Merriweather:wght@300;400;700;900&display=swap" rel="stylesheet">
            <script>
              window.MathJax = {
                tex: { inlineMath: [['$', '$']], displayMath: [['$$', '$$']], processEscapes: true },
                options: { processHtmlClass: 'math-content' },
                startup: { typeset: false }
              };
            </script>
            <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script>
            <style>${printCss}</style>
          </head>
          <body>
            ${printHtml}
          </body>
        </html>
      `);
      printWindow.document.close();

      // 5. In the new window, wait for MathJax, then print and close
      setTimeout(() => {
          const pwin = printWindow as any;
          if (pwin.MathJax && pwin.MathJax.typesetPromise) {
              pwin.MathJax.typesetPromise().then(() => {
                  pwin.print();
                  pwin.close();
                  setIsPrinting(false);
              }).catch((err: any) => {
                  console.error("MathJax failed in print window:", err);
                  pwin.print(); // Attempt to print anyway
                  pwin.close();
                  setIsPrinting(false);
              });
          } else {
              // Fallback if MathJax fails to load
              printWindow.print();
              printWindow.close();
              setIsPrinting(false);
          }
      }, 1000); // Delay to allow resources to load
  };


  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sheet, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", (sheet.title || "fiche").replace(/[^a-z0-9]/gi, '_').toLowerCase() + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const blockRenderData = useMemo(() => {
    let sectionCounter = 0; 
    const typeCounters: Record<string, number> = {};
    return sheet.blocks.map(block => {
      let label = '';
      if (block.type === 'section') {
        sectionCounter++;
        label = String.fromCharCode(64 + sectionCounter);
      } else {
        typeCounters[block.type] = (typeCounters[block.type] || 0) + 1;
        label = typeCounters[block.type].toString();
      }
      return { ...block, label };
    });
  }, [sheet.blocks]);

  return (
    <div className="min-h-screen bg-[#f0f4f8] text-slate-900">
      <div ref={printContainerRef} className="print-only hidden">
         <PrintLayout sheet={sheet} blocks={blockRenderData} />
      </div>
      
      {/* Fluid Notification Toast */}
      {notification && (
        <div className={`fixed bottom-24 sm:bottom-8 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300 ${notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-slate-900 text-white'}`}>
          {notification.type === 'error' ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
          <span className="font-medium text-sm">{notification.message}</span>
        </div>
      )}

      <div className="screen-only pb-32">
        {/* Toolbar */}
        <div className="fixed top-4 left-1/2 -translate-x-1/2 h-14 bg-white/80 backdrop-blur-xl border border-white/40 z-50 flex items-center justify-between px-2 sm:px-4 shadow-float rounded-full w-[95%] max-w-5xl transition-all">
          <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={onBack} className="p-2 hover:bg-slate-200/50 rounded-full text-slate-600 transition-colors">
                <ArrowLeft size={20} />
            </button>
            <span className="font-semibold text-slate-800 hidden sm:inline tracking-tight line-clamp-1 max-w-[150px]">{sheet.title || "Nouvelle Fiche"}</span>
            <div className="h-5 w-px bg-slate-200/80 mx-1 sm:mx-2"></div>
            <button onClick={undo} disabled={history.length <= 1} className="p-2 hover:bg-slate-200/50 rounded-full text-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed" title="Annuler"><Undo2 size={18} /></button>
            <div className={`text-xs font-mono ml-2 hidden lg:flex items-center gap-1.5 transition-colors duration-300 ${saveStatus === 'unsaved' ? 'text-amber-500 font-bold' : 'text-slate-400'}`}>
                 <div className={`w-2 h-2 rounded-full ${saveStatus === 'saved' ? 'bg-green-400' : saveStatus === 'saving' ? 'bg-blue-400 animate-pulse' : 'bg-amber-400'}`}></div>
                 {saveStatus === 'saving' && 'Sauvegarde...'}
                 {saveStatus === 'saved' && 'Enregistré'}
                 {saveStatus === 'unsaved' && 'Modifications...'}
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={() => setIsHelpOpen(true)} className="p-2 sm:px-3 sm:py-2 flex items-center gap-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors" title="Guide de formatage">
                <HelpCircle size={18} />
                <span className="hidden xl:inline font-bold text-xs uppercase tracking-wider">Guide</span>
            </button>

            <div className="h-5 w-px bg-slate-200/80 mx-1"></div>

            <button onClick={() => setIsTemplateModalOpen(true)} className="p-2 sm:px-3 sm:py-2 flex items-center gap-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors" title="Charger un modèle">
                <BookOpen size={16} />
                <span className="hidden xl:inline font-bold text-xs uppercase tracking-wider">Modèles</span>
            </button>
            <button onClick={() => setIsJsonModalOpen(true)} className="p-2 sm:px-3 sm:py-2 flex items-center gap-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors" title="Importer depuis JSON">
                <Upload size={16} />
                 <span className="hidden xl:inline font-bold text-xs uppercase tracking-wider">Importer</span>
            </button>
            <button onClick={exportJSON} className="p-2 sm:px-3 sm:py-2 flex items-center gap-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors" title="Exporter en JSON">
                <Download size={16} />
                <span className="hidden xl:inline font-bold text-xs uppercase tracking-wider">Exporter</span>
            </button>

            <button onClick={handlePrint} disabled={isPrinting} className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-slate-900 hover:bg-black text-white shadow-lg shadow-slate-900/20 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ml-2 disabled:bg-slate-500 disabled:cursor-wait">
                {isPrinting ? <LoaderCircle size={14} className="animate-spin" /> : <Printer size={14} />}
                <span className="hidden sm:inline">{isPrinting ? 'Préparation...' : 'Imprimer'}</span>
            </button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="pt-24 px-4 sm:px-8 flex justify-center">
          <div className="w-full max-w-[297mm] min-h-[210mm] bg-[#eef2f6] shadow-none rounded-xl p-[5mm] relative mb-20">
            
            <header className="mb-12 pb-6 text-center border-b border-slate-200/50">
              <MathContent 
                html={sheet.title} 
                tagName="h1" 
                className="text-5xl font-serif font-black text-slate-900 mb-3 uppercase tracking-tighter"
                onChange={(html) => setSheet(s => ({...s, title: html}))}
                placeholder="TITRE DE LA FICHE"
              />
              <MathContent 
                html={sheet.subtitle} 
                tagName="div" 
                className="text-xl text-slate-500 font-medium font-mono tracking-tight"
                onChange={(html) => setSheet(s => ({...s, subtitle: html}))}
                placeholder="Sous-titre / Classe"
              />
            </header>

            <div className="flex flex-col gap-0">
              {blockRenderData.length === 0 && (
                <div 
                   onClick={() => setIsTemplateModalOpen(true)}
                   className="cursor-pointer text-center py-24 text-slate-300 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50 hover:bg-white/80 transition-all hover:border-blue-300 hover:text-blue-400"
                >
                  <LayoutTemplate size={64} className="mx-auto mb-4 opacity-40" />
                  <p className="font-serif italic text-lg">Votre fiche est vide.</p>
                  <p className="text-sm font-bold mt-2">Cliquez pour charger un modèle ou ajouter un bloc</p>
                </div>
              )}
              
              {blockRenderData.length > 0 && (
                 <BlockInserter onInsert={(type) => insertBlock(type, 0)} />
              )}

              {blockRenderData.map((block, index) => (
                <React.Fragment key={block.id}>
                  <Block
                    data={block}
                    index={index}
                    label={block.label} 
                    onUpdate={updateBlock}
                    onDelete={deleteBlock}
                    onMove={moveBlock}
                    onDuplicate={duplicateBlock}
                  />
                  <BlockInserter onInsert={(type) => insertBlock(type, index + 1)} />
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Menu */}
        <div className="fixed bottom-8 right-8 flex flex-col items-end gap-3 z-40 group">
          <div className="flex flex-col-reverse items-end gap-3 group-hover:translate-y-0 translate-y-full opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out pointer-events-none group-hover:pointer-events-auto pb-2">
              {(Object.keys(BLOCK_CONFIG) as BlockType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => addBlock(type)}
                  className={`flex items-center gap-3 pr-4 pl-1.5 py-1.5 rounded-full shadow-lg hover:scale-105 transition-transform bg-white border border-slate-50`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-inner ${BLOCK_CONFIG[type].badgeBg} ${BLOCK_CONFIG[type].badgeText}`}>
                    {BLOCK_CONFIG[type].label[0]}
                  </div>
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{BLOCK_CONFIG[type].label}</span>
                </button>
              ))}
          </div>

          <button className="w-14 h-14 bg-slate-900 rounded-full text-white shadow-xl shadow-slate-900/30 flex items-center justify-center hover:bg-black transition-all group-hover:rotate-90 duration-300 z-50">
              <Plus size={28} />
          </button>
        </div>

        <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
        <JsonEditorModal 
            isOpen={isJsonModalOpen} 
            onClose={() => setIsJsonModalOpen(false)}
            initialValue=""
            onSave={handleImportJson}
            title="Importer une Fiche JSON"
        />
        {isTemplateModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setIsTemplateModalOpen(false)}>
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-serif text-lg font-bold text-slate-800">Charger un modèle</h3>
                        <button onClick={() => setIsTemplateModalOpen(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full"><X size={20}/></button>
                    </div>
                    <p className="text-sm text-slate-500 mb-6">Ceci remplacera le contenu actuel de votre fiche. Choisissez un modèle pour commencer.</p>
                    <div className="space-y-3">
                        <button onClick={() => handleLoadTemplate('/exponentials.json')} className="w-full text-left p-4 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-all">
                            <h4 className="font-bold text-slate-800">Fonctions exponentielles</h4>
                            <p className="text-xs text-slate-500">Cours, propriétés et exercices sur les exponentielles.</p>
                        </button>
                        <button onClick={() => handleLoadTemplate('/derivability.json')} className="w-full text-left p-4 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-all">
                            <h4 className="font-bold text-slate-800">Dérivation</h4>
                            <p className="text-xs text-slate-500">Dérivabilité, fonctions dérivées et applications.</p>
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};