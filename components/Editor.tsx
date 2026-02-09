
import React, { useMemo, useCallback, useState } from 'react';
import { SheetState } from '../types';
import { Block } from './Block';
import { PrintLayout } from './PrintLayout';
import { MathContent } from './MathContent';
import { BlockInserter } from './BlockInserter';
import { LayoutTemplate, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSheetEditor } from '../hooks/useSheetEditor';
import { ImportModal } from './ImportModal';
import { EditorToolbar } from './EditorToolbar';
import { QuickMenu } from './QuickMenu';
import { PrintPreviewModal } from './PrintPreviewModal';

interface EditorProps {
  initialState: SheetState;
  onBack: () => void;
  autoSaveInterval?: number;
}

export const Editor: React.FC<EditorProps> = ({ initialState, onBack, autoSaveInterval }) => {
  const {
    sheet,
    setSheet,
    saveStatus,
    notification,
    modalState,
    undo,
    addBlock,
    insertBlock,
    updateBlock,
    duplicateBlock,
    deleteBlock,
    moveBlock,
    handleEditorImport,
    openModal,
    closeModal,
  } = useSheetEditor({ initialState, onBack, autoSaveInterval });

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const blockRenderData = useMemo(() => {
    let sectionCounter = 0; 
    let typeCounters: Record<string, number> = {};
    return sheet.blocks.map(block => {
      let label = '';
      if (block.type === 'section') {
        sectionCounter++;
        typeCounters = {}; // Reset counters for each section
        label = String.fromCharCode(64 + sectionCounter);
      } else {
        typeCounters[block.type] = (typeCounters[block.type] || 0) + 1;
        label = typeCounters[block.type].toString();
      }
      return { ...block, label };
    });
  }, [sheet.blocks]);
  
  const addZoneToBlock = (blockId: string) => {
    const block = sheet.blocks.find(b => b.id === blockId);
    if(block) {
      const newZone = { id: Date.now().toString(), height: 40, style: 'lines' as const };
      updateBlock(blockId, { zones: [...block.zones, newZone] });
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] text-slate-900">
      <div className="print-only hidden">
         <PrintLayout sheet={sheet} blocks={blockRenderData} />
      </div>

      <div className="screen-only pb-32">
        <EditorToolbar 
          onBack={onBack}
          sheetTitle={sheet.title}
          saveStatus={saveStatus}
          onUndo={undo}
          onPrint={() => setIsPrintModalOpen(true)}
        />
        
        {notification && (
          <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl animate-in slide-in-from-top-5 fade-in duration-300 ${notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
            {notification.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            <span className="font-medium text-sm">{notification.message}</span>
          </div>
        )}

        <div className="pt-24 px-4 sm:px-8 flex justify-center">
          <div className="w-full max-w-[297mm] min-h-[210mm] bg-[#eef2f6] shadow-none rounded-xl p-[5mm] relative mb-20">
            <header className="mb-12 pb-6 text-center border-b border-slate-200/50">
              <MathContent html={sheet.title} tagName="h1" className="text-5xl font-serif font-black text-slate-900 mb-3 uppercase tracking-tighter" onChange={(html) => setSheet(s => ({...s, title: html}))} placeholder="TITRE DE LA FICHE" />
              <MathContent html={sheet.subtitle} tagName="div" className="text-xl text-slate-500 font-medium font-mono tracking-tight" onChange={(html) => setSheet(s => ({...s, subtitle: html}))} placeholder="Sous-titre / Classe" />
            </header>

            <div className="flex flex-col gap-0">
              {blockRenderData.length === 0 ? (
                <div onClick={() => addBlock('section')} className="cursor-pointer text-center py-24 text-slate-300 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50 hover:bg-white/80 transition-all hover:border-blue-300 hover:text-blue-400">
                  <LayoutTemplate size={64} className="mx-auto mb-4 opacity-40" />
                  <p className="font-serif italic text-lg">Votre fiche est vide.</p>
                  <p className="text-sm font-bold mt-2">Cliquez pour ajouter une section</p>
                </div>
              ) : (
                 <BlockInserter onInsert={(type) => insertBlock(type, 0)} />
              )}

              {blockRenderData.map((block, index) => (
                <div key={block.id}>
                  <Block
                    data={block}
                    index={index}
                    label={block.label} 
                    onUpdate={updateBlock}
                    onDelete={deleteBlock}
                    onMove={moveBlock}
                    onDuplicate={duplicateBlock}
                    onAddZone={addZoneToBlock}
                  />
                  <BlockInserter onInsert={(type) => insertBlock(type, index + 1)} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <QuickMenu onAddBlock={addBlock} />
      </div>
      
      <ImportModal isOpen={!!modalState.import} onClose={() => closeModal('import')} onImport={handleEditorImport} />
      <PrintPreviewModal 
        isOpen={isPrintModalOpen} 
        onClose={() => setIsPrintModalOpen(false)}
        sheet={sheet}
        blocks={blockRenderData}
      />
    </div>
  );
};
