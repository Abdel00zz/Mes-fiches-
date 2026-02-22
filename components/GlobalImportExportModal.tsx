import React, { useState, useRef } from 'react';
import { Download, Upload, Trash2, AlertTriangle, Check, FileJson, X, Database } from 'lucide-react';
import { getAllSheets, clearAllData, saveSheet } from '../utils/storage';
import { SheetState } from '../types';

interface GlobalImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export const GlobalImportExportModal: React.FC<GlobalImportExportModalProps> = ({ isOpen, onClose, onImportComplete }) => {
  const [importMode, setImportMode] = useState<'merge' | 'overwrite'>('merge');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    const data = getAllSheets();
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fiches_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (!Array.isArray(parsed)) {
          throw new Error("Format invalide : Le fichier doit contenir une liste de fiches.");
        }

        if (importMode === 'overwrite') {
          if (confirm("ATTENTION : Cette action supprimera TOUTES vos fiches actuelles. Continuer ?")) {
             clearAllData();
          } else {
             // Reset file input so user can try again if they cancelled
             if (fileInputRef.current) fileInputRef.current.value = '';
             return;
          }
        }

        let count = 0;
        parsed.forEach((sheet: any) => {
            // Basic validation
            if (sheet.title && Array.isArray(sheet.blocks)) {
                if (importMode === 'merge') {
                    // Generate new ID to avoid conflicts
                    const newId = Date.now().toString(36) + Math.random().toString(36).substr(2);
                    saveSheet({ ...sheet, id: newId }, newId);
                } else {
                    // Keep ID for restoration
                    saveSheet(sheet, sheet.id);
                }
                count++;
            }
        });

        setImportStatus('success');
        setStatusMessage(`${count} fiches importées avec succès.`);
        onImportComplete();
        setTimeout(() => {
            onClose();
            setImportStatus('idle');
            setStatusMessage('');
        }, 2000);

      } catch (err) {
        console.error(err);
        setImportStatus('error');
        setStatusMessage("Erreur lors de l'import : Fichier invalide.");
      }
      
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Database size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Gestion des Données</h2>
              <p className="text-sm text-slate-500">Sauvegardez ou restaurez l'ensemble de vos fiches</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 grid md:grid-cols-2 gap-8">
          {/* Export Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <Download size={20} />
              </div>
              <h3 className="font-bold text-slate-800">Exporter</h3>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Téléchargez une sauvegarde complète de toutes vos fiches au format JSON. Utile pour transférer vos données ou créer des copies de sécurité.
            </p>
            <button 
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-slate-200 hover:border-emerald-500 hover:text-emerald-600 text-slate-600 font-semibold rounded-xl transition-all group"
            >
              <FileJson size={18} className="group-hover:scale-110 transition-transform" />
              <span>Télécharger la sauvegarde</span>
            </button>
          </div>

          {/* Import Section */}
          <div className="space-y-4 relative">
             <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Upload size={20} />
              </div>
              <h3 className="font-bold text-slate-800">Importer</h3>
            </div>
            
            <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <input 
                        type="radio" 
                        name="importMode" 
                        checked={importMode === 'merge'} 
                        onChange={() => setImportMode('merge')}
                        className="w-4 h-4 text-blue-600"
                    />
                    <div>
                        <span className="block font-medium text-slate-700 text-sm">Fusionner (Recommandé)</span>
                        <span className="block text-xs text-slate-400">Ajoute les fiches sans supprimer les existantes</span>
                    </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-red-100 bg-red-50/30 rounded-lg cursor-pointer hover:bg-red-50 transition-colors">
                    <input 
                        type="radio" 
                        name="importMode" 
                        checked={importMode === 'overwrite'} 
                        onChange={() => setImportMode('overwrite')}
                        className="w-4 h-4 text-red-600"
                    />
                    <div>
                        <span className="block font-medium text-red-700 text-sm">Remplacer tout</span>
                        <span className="block text-xs text-red-400">Supprime tout avant d'importer</span>
                    </div>
                </label>
            </div>

            <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept=".json,application/json" 
                onChange={handleFileChange}
            />

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 transform active:scale-95"
            >
              <Upload size={18} />
              <span>Sélectionner un fichier</span>
            </button>

            {importStatus === 'success' && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4 rounded-xl animate-in fade-in z-10">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                        <Check size={24} />
                    </div>
                    <p className="font-bold text-green-700">{statusMessage}</p>
                </div>
            )}

            {importStatus === 'error' && (
                <div className="mt-2 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2">
                    <AlertTriangle size={16} />
                    {statusMessage}
                </div>
            )}
          </div>
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
                Le format JSON doit correspondre à une liste de fiches exportée depuis cette application.
            </p>
        </div>
      </div>
    </div>
  );
};
