import React from 'react';
import { HelpModal } from '../HelpModal';
import { JsonEditorModal } from '../JsonEditorModal';
import { X } from 'lucide-react';

type ModalType = 'help' | 'json' | 'template';

interface EditorModalsProps {
  modalState: { [key in ModalType]?: boolean };
  onClose: (type: ModalType) => void;
  onImportJson: (jsonContent: string) => void;
  onLoadTemplate: (url: string) => void;
}

export const EditorModals: React.FC<EditorModalsProps> = ({
  modalState,
  onClose,
  onImportJson,
  onLoadTemplate
}) => {
  return (
    <>
      <HelpModal isOpen={!!modalState.help} onClose={() => onClose('help')} />
      
      <JsonEditorModal
        isOpen={!!modalState.json}
        onClose={() => onClose('json')}
        initialValue=""
        onSave={onImportJson}
        title="Importer une Fiche JSON"
      />

      {modalState.template && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => onClose('template')}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-lg font-bold text-slate-800">Charger un modèle</h3>
              <button onClick={() => onClose('template')} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full"><X size={20}/></button>
            </div>
            <p className="text-sm text-slate-500 mb-6">Ceci remplacera le contenu actuel de votre fiche. Choisissez un modèle pour commencer.</p>
            <div className="space-y-3">
              <button onClick={() => onLoadTemplate('/exponentials.json')} className="w-full text-left p-4 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-all">
                <h4 className="font-bold text-slate-800">Fonctions exponentielles</h4>
                <p className="text-xs text-slate-500">Cours, propriétés et exercices sur les exponentielles.</p>
              </button>
              <button onClick={() => onLoadTemplate('/derivability.json')} className="w-full text-left p-4 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-all">
                <h4 className="font-bold text-slate-800">Dérivation</h4>
                <p className="text-xs text-slate-500">Dérivabilité, fonctions dérivées et applications.</p>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};