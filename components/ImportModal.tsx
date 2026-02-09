
import React, { useState, useCallback } from 'react';
import { Upload, X, FileJson, CheckCircle2, Copy, Replace } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (jsonContent: string, mode: 'replace' | 'append') => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const resetState = () => {
    setFileContent(null);
    setFileName(null);
    setError(null);
    setIsDragActive(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const processFile = (file: File) => {
    setError(null);
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        setError("Veuillez déposer un fichier .json valide.");
        return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const content = ev.target?.result as string;
        JSON.parse(content); // Validate JSON
        setFileContent(content);
        setFileName(file.name);
      } catch (err) {
        setError("Fichier corrompu ou JSON invalide.");
      }
    };
    reader.readAsText(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className={`bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col transition-all duration-300 ${isDragActive ? 'scale-[1.02] ring-4 ring-blue-400' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {isDragActive && (
            <div className="absolute inset-0 bg-blue-50/90 z-50 flex flex-col items-center justify-center text-blue-600 animate-in fade-in">
                <FileJson size={64} className="mb-4 animate-bounce" />
                <span className="text-xl font-bold">Relâchez pour importer</span>
            </div>
        )}

        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 font-serif text-lg">
            <span className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Upload size={20} /></span>
            Importer des blocs depuis un fichier
          </h3>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-8 text-center">
          {!fileContent ? (
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-full border-2 border-dashed border-slate-300 rounded-xl p-10 hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
                 <input type="file" accept=".json" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                 <FileJson size={48} className="mx-auto text-slate-300 mb-3" />
                 <p className="font-semibold text-slate-700">Glissez-déposez un fichier JSON ici</p>
                 <p className="text-sm text-slate-500">ou cliquez pour le sélectionner</p>
              </div>
              {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}
            </div>
          ) : (
            <div className="animate-in fade-in">
              <div className="p-4 mb-6 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-left">
                  <CheckCircle2 className="text-green-500 shrink-0" size={24} />
                  <div>
                      <p className="font-bold text-green-800">Fichier chargé !</p>
                      <p className="text-sm text-green-700 truncate">{fileName}</p>
                  </div>
              </div>

              <h4 className="text-lg font-bold text-slate-800 mb-4">Comment voulez-vous importer les blocs ?</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={() => onImport(fileContent, 'append')}
                    className="group flex flex-col items-center gap-2 p-6 bg-white border-2 border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 hover:shadow-lg transition-all"
                  >
                    <Copy size={32} className="text-blue-500" />
                    <span className="font-bold text-slate-800">Ajouter à la suite</span>
                    <p className="text-xs text-slate-500">Conserve les blocs actuels et ajoute les nouveaux à la fin.</p>
                  </button>
                  <button
                     onClick={() => onImport(fileContent, 'replace')}
                     className="group flex flex-col items-center gap-2 p-6 bg-white border-2 border-slate-200 rounded-lg hover:border-red-500 hover:bg-red-50 hover:shadow-lg transition-all"
                  >
                    <Replace size={32} className="text-red-500" />
                    <span className="font-bold text-slate-800">Remplacer</span>
                    <p className="text-xs text-slate-500">Supprime tous les blocs actuels et les remplace par ceux du fichier.</p>
                  </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button onClick={handleClose} className="px-5 py-2 text-slate-600 font-semibold hover:bg-slate-200/70 text-sm rounded-lg transition-colors">
                Annuler
            </button>
        </div>
      </div>
    </div>
  );
};
