import React, { useMemo, useRef } from 'react';
import { SheetState } from '../types';
import { useSheetEditor } from '../hooks/useSheetEditor';

import { PrintLayout } from './PrintLayout';
import { EditorToolbar } from './editor/EditorToolbar';
import { EditorCanvas } from './editor/EditorCanvas';
import { FloatingActionMenu } from './editor/FloatingActionMenu';
import { EditorModals } from './editor/EditorModals';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface EditorProps {
  initialState: SheetState;
  onBack: () => void;
  autoSaveInterval?: number;
}

export const Editor: React.FC<EditorProps> = ({ initialState, onBack, autoSaveInterval }) => {
  const printContainerRef = useRef<HTMLDivElement>(null);
  
  const {
    sheet,
    setSheet,
    history,
    saveStatus,
    isPrinting,
    notification,
    modalState,
    
    undo,
    addBlock,
    insertBlock,
    updateBlock,
    duplicateBlock,
    deleteBlock,
    moveBlock,
    handlePrint,
    exportJSON,
    handleImportJson,
    handleLoadTemplate,
    closeModal,
    openModal
  } = useSheetEditor({ 
    initialState, 
    onBack, 
    autoSaveInterval,
    printContainerRef
  });

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

      {notification && (
        <div className={`fixed bottom-24 sm:bottom-8 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300 ${notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-slate-900 text-white'}`}>
          {notification.type === 'error' ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
          <span className="font-medium text-sm">{notification.message}</span>
        </div>
      )}

      <div className="screen-only pb-32">
        <EditorToolbar
          sheetTitle={sheet.title}
          saveStatus={saveStatus}
          isPrinting={isPrinting}
          canUndo={history.length > 1}
          onBack={onBack}
          onUndo={undo}
          onOpenHelp={() => openModal('help')}
          onOpenTemplates={() => openModal('template')}
          onOpenImport={() => openModal('json')}
          onExport={exportJSON}
          onPrint={handlePrint}
        />

        <EditorCanvas
          sheet={sheet}
          setSheet={setSheet}
          blockRenderData={blockRenderData}
          onOpenTemplateModal={() => openModal('template')}
          insertBlock={insertBlock}
          updateBlock={updateBlock}
          deleteBlock={deleteBlock}
          moveBlock={moveBlock}
          duplicateBlock={duplicateBlock}
        />

        <FloatingActionMenu onAddBlock={addBlock} />
        
        <EditorModals
          modalState={modalState}
          onClose={closeModal}
          onImportJson={handleImportJson}
          onLoadTemplate={handleLoadTemplate}
        />
      </div>
    </div>
  );
};