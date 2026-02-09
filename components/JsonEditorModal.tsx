import React, { useState, useEffect, useCallback } from 'react';
import { Upload, X, Check, FileText, AlertTriangle, FileJson } from 'lucide-react';

interface JsonEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialValue: string;
  onSave: (jsonContent: string) => void;
  title?: string;
  allowFileImport?: boolean; 
}

export const JsonEditorModal: React.FC<JsonEditorModalProps> = ({ 
  isOpen, 
  onClose, 
  initialValue, 
  onSave,
  title = "Éditeur JSON",
  allowFileImport = true
}) => {
  const [text, setText] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setText(initialValue);
      setError(null);
    }
  }, [isOpen, initialValue]);

  const handleSubmit = () => {
    setError(null);
    if (!text.trim()) return;
    try {
      JSON.parse(text);
      onSave(text);
      onClose();
    } catch (e) {
      setError("Erreur de syntaxe JSON. Vérifiez vos accolades et guillemets.");
    }
  };

  const processFile = (file: File) => {
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        setError("Veuillez déposer un fichier .json valide.");
        return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const content = ev.target?.result as string;
        JSON.parse(content);
        setText(content);
        setError(null);
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
        className={`bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-300 ${isDragActive ? 'scale-[1.02] ring-4 ring-blue-400' : ''}`}
        onDragOver={allowFileImport ? onDragOver : undefined}
        onDragLeave={allowFileImport ? onDragLeave : undefined}
        onDrop={allowFileImport ? onDrop : undefined}
      >
        {/* Drag Overlay */}
        {isDragActive && (
            <div className="absolute inset-0 bg-blue-50/90 z-50 flex flex-col items-center justify-center text-blue-600 animate-in fade-in">
                <FileJson size={64} className="mb-4 animate-bounce" />
                <span className="text-xl font-bold">Relâchez pour importer le fichier JSON</span>
            </div>
        )}

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 font-serif text-lg">
            <span className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FileText size={20} /></span>
            {title}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        {/* Editor Area */}
        <div className="flex-grow relative bg-slate-900 flex flex-col">
            <div className="flex-grow relative">
                <textarea 
                    className="w-full h-full min-h-[300px] p-6 bg-slate-900 text-blue-100 font-mono text-xs sm:text-sm focus:outline-none resize-none leading-relaxed"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    spellCheck={false}
                    placeholder={allowFileImport ? "Collez votre JSON ici ou glissez-déposez un fichier..." : "Code JSON..."}
                />
            </div>
        </div>

        {/* Footer & Actions */}
        <div className="p-5 bg-white border-t border-slate-100 space-y-4">
            {error && (
                <div className="text-sm font-semibold text-red-600 bg-red-50 p-3 rounded-lg flex items-center gap-2 border border-red-100 animate-in slide-in-from-bottom-2">
                    <AlertTriangle size={16} /> {error}
                </div>
            )}
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
                {allowFileImport && (
                    <div className="relative w-full sm:w-auto">
                        <input type="file" accept=".json" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 transition-all border border-slate-200 group">
                            <Upload size={16} className="group-hover:-translate-y-0.5 transition-transform" /> 
                            <span>Importer un fichier</span>
                        </button>
                    </div>
                )}
                
                <div className="hidden sm:flex-grow sm:block text-xs text-slate-400 text-center px-4">
                   {allowFileImport && "Astuce : Glissez-déposez un fichier JSON directement dans la fenêtre"}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button onClick={onClose} className="px-5 py-2.5 text-slate-500 font-semibold hover:text-slate-700 text-sm hover:bg-slate-50 rounded-lg transition-colors">
                        Annuler
                    </button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={!text.trim()} 
                        className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-blue-600 shadow-lg shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Check size={16} /> 
                        <span>Valider</span>
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};