
import React from 'react';
import { BlockType, BLOCK_CONFIG } from '../types';
import { Plus } from 'lucide-react';

interface QuickMenuProps {
    onAddBlock: (type: BlockType) => void;
}

export const QuickMenu: React.FC<QuickMenuProps> = ({ onAddBlock }) => {
    return (
        <div className="fixed bottom-8 right-8 flex flex-col items-end gap-3 z-40 group">
            <div className="flex flex-col-reverse items-end gap-3 group-hover:translate-y-0 translate-y-8 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out pointer-events-none group-hover:pointer-events-auto pb-2">
                {(Object.keys(BLOCK_CONFIG) as BlockType[]).map((type) => (
                    <button
                        key={type}
                        onClick={() => onAddBlock(type)}
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
    );
};
