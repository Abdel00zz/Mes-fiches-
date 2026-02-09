import { useState, useEffect, useCallback, useRef, RefObject } from 'react';
import { SheetState, BlockData, BlockType } from '../types';
import { saveSheet } from '../utils/storage';

type ModalType = 'help' | 'json' | 'template';

interface UseSheetEditorProps {
  initialState: SheetState;
  onBack: () => void;
  autoSaveInterval?: number;
  printContainerRef: RefObject<HTMLDivElement>;
}

export const useSheetEditor = ({
  initialState,
  onBack,
  autoSaveInterval = 1000,
  printContainerRef
}: UseSheetEditorProps) => {
  const [sheet, setSheet] = useState<SheetState>(initialState);
  const [history, setHistory] = useState<SheetState[]>([initialState]);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [isPrinting, setIsPrinting] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [modalState, setModalState] = useState<{ [key in ModalType]?: boolean }>({});
  
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

  const handleImportJson = (jsonContent: string) => {
    try {
      const newId = sheet.id || Date.now().toString();
      const parsed = JSON.parse(jsonContent);
      const newSheetState = { ...parsed, id: newId, updatedAt: Date.now() };
      setSheet(newSheetState);
      setHistory([newSheetState]);
      showNotification("Fiche importée avec succès !");
      closeModal('json');
    } catch(e) {
      console.error(e);
      showNotification("JSON invalide ou corrompu", "error");
    }
  };

  const handleLoadTemplate = async (url: string) => {
    try {
      const res = await fetch(url);
      const data = await res.json();
      const newSheetState = { ...data, id: sheet.id || Date.now().toString(), updatedAt: Date.now() };
      setSheet(newSheetState);
      setHistory([newSheetState]);
      showNotification("Modèle chargé !");
      closeModal('template');
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
  
  const modifyBlocks = (blockModifier: (blocks: BlockData[]) => BlockData[]) => {
      setSheet(current => {
          const newState = { ...current, blocks: blockModifier(current.blocks) };
          setHistory(prev => [...prev.slice(-10), newState]);
          return newState;
      });
  };

  const addBlock = useCallback((type: BlockType) => {
    modifyBlocks(blocks => {
      const newBlock: BlockData = { id: Date.now().toString(), type, title: '', content: '', zones: [], images: [] };
      return [...blocks, newBlock];
    });
  }, []);

  const insertBlock = useCallback((type: BlockType, index: number) => {
    modifyBlocks(blocks => {
      const newBlock: BlockData = { id: Date.now().toString(), type, title: '', content: '', zones: [], images: [] };
      const newBlocks = [...blocks];
      newBlocks.splice(index, 0, newBlock);
      return newBlocks;
    });
  }, []);
  
  // No history for block updates to avoid sluggishness on typing
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
  }, []);

  const deleteBlock = useCallback((id: string) => {
    if (confirm('Supprimer ce bloc ?')) {
      modifyBlocks(blocks => blocks.filter(b => b.id !== id));
    }
  }, []);

  const moveBlock = useCallback((id: string, direction: 'up' | 'down') => {
    modifyBlocks(blocks => {
      const index = blocks.findIndex(b => b.id === id);
      if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return blocks;
      const newBlocks = [...blocks];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
      return newBlocks;
    });
  }, []);

  const handlePrint = async () => {
      if (isPrinting) return;
      setIsPrinting(true);
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();

      const w = window as any;
      if (w.MathJax) await w.MathJax.typesetPromise();
      
      const printCss = await fetch('/print.css').then(res => res.text());
      const printHtml = printContainerRef.current?.innerHTML;

      if (!printHtml) {
          showNotification("Erreur lors de la génération de l'aperçu.", "error");
          setIsPrinting(false);
          return;
      }
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
          showNotification("Veuillez autoriser les pop-ups pour imprimer.", "error");
          setIsPrinting(false);
          return;
      }
      
      printWindow.document.write(`<!DOCTYPE html>...`); // Full HTML structure as before
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
          <body>${printHtml}</body>
        </html>
      `);
      printWindow.document.close();

      setTimeout(() => {
          const pwin = printWindow as any;
          (pwin.MathJax?.typesetPromise() ?? Promise.resolve())
            .catch((err: any) => console.error("MathJax failed in print window:", err))
            .finally(() => {
                pwin.print();
                pwin.close();
                setIsPrinting(false);
            });
      }, 1000);
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sheet, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = (sheet.title || "fiche").replace(/[^a-z0-9]/gi, '_').toLowerCase() + ".json";
    a.click();
  };

  return {
    sheet,
    setSheet, // Exposed for direct updates like title/subtitle
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
    openModal,
  };
};
