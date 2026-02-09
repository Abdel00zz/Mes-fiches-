
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { BlockData, SheetState, BlockType, BLOCK_CONFIG } from '../types';
import { Block } from './Block';
import { PrintLayout } from './PrintLayout';
import { MathContent } from './MathContent';
import { BlockInserter } from './BlockInserter';
import { Printer, Download, Plus, Undo2, LayoutTemplate, ArrowLeft } from 'lucide-react';
import { saveSheet } from '../utils/storage';

interface EditorProps {
  initialState: SheetState;
  onBack: () => void;
  autoSaveInterval?: number;
}

export const Editor: React.FC<EditorProps> = ({ initialState, onBack, autoSaveInterval = 1000 }) => {
  const [sheet, setSheet] = useState<SheetState>(initialState);
  const [history, setHistory] = useState<SheetState[]>([initialState]);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  
  // Ref to track the last saved stringified version to avoid useless writes
  const lastSavedJson = useRef<string>(JSON.stringify(initialState));

  // Smart Auto-Save Effect
  useEffect(() => {
    if (!sheet.id) return;

    // Set unsaved status immediately on change if differs from last save
    const currentJson = JSON.stringify(sheet);
    if (currentJson !== lastSavedJson.current) {
        setSaveStatus('unsaved');
    }

    const timer = setTimeout(() => {
      if (currentJson !== lastSavedJson.current) {
         setSaveStatus('saving');
         saveSheet(sheet, sheet.id);
         lastSavedJson.current = currentJson;
         
         // Small delay to show "Saving..." before switching back to "Saved"
         setTimeout(() => setSaveStatus('saved'), 500);
      }
    }, autoSaveInterval);

    return () => clearTimeout(timer);
  }, [sheet, autoSaveInterval]);

  const updateSheet = (newState: SheetState) => {
    setHistory(prev => [...prev.slice(-10), newState]);
    setSheet(newState);
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
      newBlocks.splice(index, 0, newBlock); // Insert at index
      
      const newState = { ...current, blocks: newBlocks };
      setHistory(prev => [...prev.slice(-10), newState]);
      return newState;
    });
  }, []);

  const updateBlock = useCallback((id: string, updates: Partial<BlockData>) => {
    setSheet(current => {
      const newBlocks = current.blocks.map(b => b.id === id ? { ...b, ...updates } : b);
      const newState = { ...current, blocks: newBlocks };
      // Note: We don't push to history on every character type for performance in this simple implementation
      // But for major updates we could. For now, relying on block granularity.
      return newState;
    });
  }, []);

  const duplicateBlock = useCallback((sourceBlock: BlockData) => {
    setSheet(current => {
        // Create deep copy with new ID
        const newBlock: BlockData = {
            ...sourceBlock,
            id: Date.now().toString(),
            // Ensure deep copy of images and zones
            zones: sourceBlock.zones.map(z => ({...z, id: Math.random().toString(36).substr(2, 9)})),
            images: sourceBlock.images.map(i => ({...i, id: Math.random().toString(36).substr(2, 9)}))
        };
        
        // Insert after the original
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
    const typeCounters: Record<string, number> = {
      activite: 0, definition: 0, theoreme: 0, propriete: 0,
      application: 0, exemple: 0, remarque: 0
    };

    return sheet.blocks.map(block => {
      let label = '';
      if (block.type === 'section') {
        sectionCounter++;
        label = String.fromCharCode(64 + sectionCounter); // A, B, C...
      } else {
        if (typeCounters[block.type] !== undefined) {
          typeCounters[block.type]++;
          label = typeCounters[block.type].toString(); // 1, 2, 3...
        }
      }
      return { ...block, label };
    });
  }, [sheet.blocks]);

  const handlePrint = useCallback(async () => {
    // Ensure pending contentEditable updates are committed before print snapshot.
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const w = window as any;
    const mathNodes = Array.from(document.querySelectorAll('.math-content'));

    if (w.MathJax?.typesetPromise) {
      try {
        await w.MathJax.typesetPromise(mathNodes);
      } catch (err) {
        console.debug('MathJax pre-print typeset failed', err);
      }
    }

    // Wait for fonts and images to be decoded for better print fidelity.
    if (document.fonts?.ready) {
      try {
        await document.fonts.ready;
      } catch (err) {
        console.debug('Font readiness check failed', err);
      }
    }

    const images = Array.from(document.querySelectorAll('img'));
    await Promise.all(
      images.map(async (img) => {
        if ('decode' in img) {
          try {
            await img.decode();
          } catch {
            // Ignore decode issues for external/partially loaded assets.
          }
        }
      })
    );

    await new Promise((resolve) => requestAnimationFrame(() => resolve(true)));
    await new Promise((resolve) => setTimeout(resolve, 30));
    window.print();
  }, []);

  return (
    <div className="min-h-screen bg-[#f0f4f8] text-slate-900">
      <div className="print-only hidden">
         <PrintLayout sheet={sheet} blocks={blockRenderData} />
      </div>

      <div className="screen-only pb-32">
        {/* Toolbar */}
        <div className="fixed top-4 left-1/2 -translate-x-1/2 h-14 bg-white/80 backdrop-blur-xl border border-white/40 z-50 flex items-center justify-between px-4 sm:px-6 shadow-float rounded-full w-[95%] max-w-5xl transition-all">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-slate-200/50 rounded-full text-slate-600 transition-colors mr-1">
                <ArrowLeft size={20} />
            </button>
            <span className="font-semibold text-slate-800 hidden sm:inline tracking-tight line-clamp-1 max-w-[150px]">{sheet.title || "Nouvelle Fiche"}</span>
            <div className="h-5 w-px bg-slate-300 mx-2 opacity-50"></div>
            <button onClick={undo} className="p-2 hover:bg-slate-200/50 rounded-full text-slate-600 transition-colors" title="Annuler"><Undo2 size={18} /></button>
            <div className={`text-xs font-mono ml-2 flex items-center gap-1 transition-colors duration-300 ${saveStatus === 'unsaved' ? 'text-amber-500 font-bold' : 'text-slate-400'}`}>
                 {saveStatus === 'saving' && 'Sauvegarde...'}
                 {saveStatus === 'saved' && 'Sauvegardé'}
                 {saveStatus === 'unsaved' && 'Non enregistré...'}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={exportJSON} className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full hover:bg-slate-100 text-xs font-bold uppercase tracking-wider text-slate-600 transition-colors">
                <Download size={14} />
                <span className="hidden sm:inline">Exporter JSON</span>
            </button>
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-slate-900 hover:bg-black text-white shadow-lg shadow-slate-900/20 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ml-2">
                <Printer size={14} />
                <span className="hidden sm:inline">Imprimer</span>
            </button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="pt-24 px-4 sm:px-8 flex justify-center">
          {/* Landscape Orientation Simulation */}
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
                   onClick={() => addBlock('section')}
                   className="cursor-pointer text-center py-24 text-slate-300 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50 hover:bg-white/80 transition-all hover:border-blue-300 hover:text-blue-400"
                >
                  <LayoutTemplate size={64} className="mx-auto mb-4 opacity-40" />
                  <p className="font-serif italic text-lg">Votre fiche est vide.</p>
                  <p className="text-sm font-bold mt-2">Cliquez pour ajouter une section</p>
                </div>
              )}
              
              {/* Insert at top */}
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
                  {/* Insert after this block */}
                  <BlockInserter onInsert={(type) => insertBlock(type, index + 1)} />
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Menu */}
        <div className="fixed bottom-8 right-8 flex flex-col items-end gap-3 z-40 group">
          <div className="flex flex-col-reverse items-end gap-3 group-hover:translate-y-0 translate-y-8 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out pointer-events-none group-hover:pointer-events-auto pb-2">
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

          <button className="w-14 h-14 bg-slate-900 rounded-full text-white shadow-xl shadow-slate-900/30 flex items-center justify-center hover:bg-black transition-all hover:rotate-90 duration-300 z-50">
              <Plus size={28} />
          </button>
        </div>
      </div>
    </div>
  );
};
