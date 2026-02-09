
import { useState, useEffect, useCallback, useRef } from 'react';
import { SheetState, BlockData, BlockType } from '../types';
import { saveSheet, sanitizeSheet } from '../utils/storage';

type ModalType = 'help' | 'json' | 'template' | 'import';

interface UseSheetEditorProps {
  initialState: SheetState;
  onBack: () => void;
  autoSaveInterval?: number;
}

export const useSheetEditor = ({
  initialState,
  onBack,
  autoSaveInterval = 1000,
}: UseSheetEditorProps) => {
  const [sheet, setSheet] = useState<SheetState>(initialState);
  const [history, setHistory] = useState<SheetState[]>([initialState]);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [modalState, setModalState] = useState<{ [key in ModalType]?: boolean }>({});
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  
  const lastSavedJson = useRef<string>(JSON.stringify(initialState));

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };
  
  const openModal = (type: ModalType) => setModalState(prev => ({ ...prev, [type]: true }));
  const closeModal = (type: ModalType) => setModalState(prev => ({ ...prev, [type]: false }));

  // Initialize sheet with an ID if it's missing
  useEffect(() => {
    if (!sheet.id) {
      const newSheet = { ...sheet, id: Date.now().toString() };
      setSheet(newSheet);
      saveSheet(newSheet, newSheet.id);
      lastSavedJson.current = JSON.stringify(newSheet);
    }
  }, []); // Run only once

  // Auto-save logic
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

  const updateSheetWithHistory = (newState: SheetState) => {
    setHistory(prev => [...prev.slice(-10), newState]);
    setSheet(newState);
  };

  const handleEditorImport = (jsonContent: string, mode: 'replace' | 'append') => {
    try {
      const parsed = JSON.parse(jsonContent);
      const sanitized = sanitizeSheet(parsed);
      
      if (mode === 'replace') {
        const newSheetState = { ...sheet, blocks: sanitized.blocks, updatedAt: Date.now() };
        updateSheetWithHistory(newSheetState);
        showNotification("Fiche remplacée avec succès !");
      } else { // append
        const newBlocks = sanitized.blocks.map(b => ({
          ...b,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          zones: b.zones.map(z => ({ ...z, id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}` })),
          images: b.images.map(i => ({ ...i, id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}` }))
        }));
        const newSheetState = { ...sheet, blocks: [...sheet.blocks, ...newBlocks], updatedAt: Date.now() };
        updateSheetWithHistory(newSheetState);
        showNotification(`${newBlocks.length} blocs ajoutés !`);
      }
      closeModal('import');
    } catch(e) {
      console.error(e);
      showNotification("JSON invalide ou corrompu", "error");
    }
  };

  const undo = () => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      setSheet(newHistory[newHistory.length - 1]);
    }
  };
  
  const modifyBlocks = (blockModifier: (blocks: BlockData[]) => BlockData[]) => {
      const newState = { ...sheet, blocks: blockModifier(sheet.blocks) };
      updateSheetWithHistory(newState);
  };

  const addBlock = useCallback((type: BlockType) => {
    modifyBlocks(blocks => {
      const newBlock: BlockData = { id: Date.now().toString(), type, title: '', content: '', zones: [], images: [] };
      return [...blocks, newBlock];
    });
  }, [sheet]);

  const insertBlock = useCallback((type: BlockType, index: number) => {
    modifyBlocks(blocks => {
      const newBlock: BlockData = { id: Date.now().toString(), type, title: '', content: '', zones: [], images: [] };
      const newBlocks = [...blocks];
      newBlocks.splice(index, 0, newBlock);
      return newBlocks;
    });
  }, [sheet]);
  
  const updateBlock = useCallback((id: string, updates: Partial<BlockData>) => {
    setSheet(current => ({
      ...current,
      blocks: current.blocks.map(b => b.id === id ? { ...b, ...updates } : b)
    }));
  }, []);

  const duplicateBlock = useCallback((sourceBlock: BlockData) => {
    modifyBlocks(blocks => {
        const newBlock: BlockData = {
            ...sourceBlock,
            id: Date.now().toString(),
            zones: sourceBlock.zones.map(z => ({...z, id: Math.random().toString(36).substr(2, 9)})),
            images: sourceBlock.images.map(i => ({...i, id: Math.random().toString(36).substr(2, 9)}))
        };
        const index = blocks.findIndex(b => b.id === sourceBlock.id);
        const newBlocks = [...blocks];
        newBlocks.splice(index + 1, 0, newBlock);
        return newBlocks;
    });
  }, [sheet]);

  const deleteBlock = useCallback((id: string) => {
    if (confirm('Supprimer ce bloc ?')) {
      modifyBlocks(blocks => blocks.filter(b => b.id !== id));
    }
  }, [sheet]);

  // For up/down buttons
  const moveBlock = useCallback((id: string, direction: 'up' | 'down') => {
    modifyBlocks(blocks => {
      const index = blocks.findIndex(b => b.id === id);
      if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return blocks;
      const newBlocks = [...blocks];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
      return newBlocks;
    });
  }, [sheet]);

  const handleDragStart = useCallback((id: string) => {
      setDraggedBlockId(id);
  }, []);

  const handleDragEnd = useCallback(() => {
      setDraggedBlockId(null);
  }, []);

  const handleDropOnBlock = useCallback((dropTargetId: string) => {
      if (!draggedBlockId || draggedBlockId === dropTargetId) {
          setDraggedBlockId(null);
          return;
      }
      modifyBlocks(blocks => {
          const dragIndex = blocks.findIndex(b => b.id === draggedBlockId);
          const dropIndex = blocks.findIndex(b => b.id === dropTargetId);
          if (dragIndex === -1 || dropIndex === -1) return blocks;
          
          const newBlocks = [...blocks];
          const [draggedItem] = newBlocks.splice(dragIndex, 1);
          newBlocks.splice(dropIndex, 0, draggedItem);
          return newBlocks;
      });
      setDraggedBlockId(null);
  }, [draggedBlockId, sheet]);

  const handlePrint = async () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    const w = window as any;
    if (w.MathJax?.typesetPromise) {
      await w.MathJax.typesetPromise();
    }
    await new Promise((resolve) => requestAnimationFrame(resolve));
    window.print();
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sheet, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = (sheet.title || "fiche").replace(/[^a-z0-9]/gi, '_').toLowerCase() + ".json";
    a.click();
    a.remove();
  };

  return {
    sheet,
    setSheet,
    history,
    saveStatus,
    notification,
    modalState,
    draggedBlockId,

    undo,
    addBlock,
    insertBlock,
    updateBlock,
    duplicateBlock,
    deleteBlock,
    moveBlock,
    handlePrint,
    exportJSON,
    handleEditorImport,
    closeModal,
    openModal,
    handleDragStart,
    handleDragEnd,
    handleDropOnBlock,
  };
};
