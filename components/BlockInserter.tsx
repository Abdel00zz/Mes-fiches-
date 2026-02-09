
import React, { useState } from 'react';
import { BlockType, BLOCK_CONFIG } from '../types';
import { Plus, X } from 'lucide-react';

interface Props {
  onInsert: (type: BlockType) => void;
}

export const BlockInserter: React.FC<Props> = ({ onInsert }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (isOpen) {
    return (
      <div className="my-4 p-4 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50/50 animate-in fade-in slide-in-from-top-2">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Insérer un bloc ici</span>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-blue-200 rounded-full text-blue-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {(Object.keys(BLOCK_CONFIG) as BlockType[]).map((type) => (
            <button
              key={type}
              onClick={() => { onInsert(type); setIsOpen(false); }}
              className={`
                group flex items-center gap-2 px-3 py-2 rounded-md shadow-sm border border-slate-200 bg-white 
                hover:border-blue-400 hover:shadow-md transition-all active:scale-95
              `}
            >
              <div className={`
                w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white shadow-sm
                ${BLOCK_CONFIG[type].badgeBg.replace('bg-', 'bg-').replace('text-', '')} 
                ${type === 'section' ? 'bg-slate-900' : ''}
                ${type === 'activite' ? 'bg-amber-400' : ''}
                ${type === 'definition' ? 'bg-emerald-400' : ''}
                ${type === 'theoreme' ? 'bg-rose-400' : ''}
                ${type === 'propriete' ? 'bg-indigo-400' : ''}
                ${type === 'application' ? 'bg-sky-400' : ''}
                ${type === 'exemple' ? 'bg-slate-400' : ''}
                ${type === 'remarque' ? 'bg-gray-400' : ''}
              `}>
                {BLOCK_CONFIG[type].label[0]}
              </div>
              <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700">
                {BLOCK_CONFIG[type].label}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="group/inserter relative h-6 -my-3 z-10 flex items-center justify-center cursor-pointer hover:z-20">
      {/* Invisible hit area */}
      <div 
        className="absolute inset-x-0 h-full flex items-center justify-center"
        onClick={() => setIsOpen(true)}
      >
        {/* The visible line on hover */}
        <div className="w-full h-0.5 bg-blue-400 opacity-0 group-hover/inserter:opacity-100 transition-all duration-200 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
      </div>
      
      {/* The visible button on hover */}
      <button 
        onClick={() => setIsOpen(true)}
        className="
          absolute opacity-0 group-hover/inserter:opacity-100 transition-all duration-200 transform scale-0 group-hover/inserter:scale-100
          bg-blue-600 text-white rounded-full p-1.5 shadow-lg border-2 border-white hover:bg-blue-700
        "
        title="Insérer un bloc ici"
      >
        <Plus size={16} strokeWidth={3} />
      </button>
    </div>
  );
};
