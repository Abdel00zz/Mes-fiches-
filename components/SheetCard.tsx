
import React, { useState } from 'react';
import { SheetMeta } from '../utils/storage';
import { Trash2, FileText, Calendar, Edit3, Code2 } from 'lucide-react';

interface SheetCardProps {
    sheet: SheetMeta & { blockCount: number };
    onOpen: () => void;
    onDelete: () => void;
    onOpenJsonEditor: () => void;
    onUpdateTitle: (newTitle: string) => void;
}

export const SheetCard: React.FC<SheetCardProps> = ({ sheet, onOpen, onDelete, onOpenJsonEditor, onUpdateTitle }) => {
    const [isEditingTitle, setIsEditingTitle] = useState(false);

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditingTitle(true);
    };

    const handleTitleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsEditingTitle(false);
        onUpdateTitle(e.target.value);
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setIsEditingTitle(false);
            onUpdateTitle(e.currentTarget.value);
        }
    };

    const formatDate = (timestamp: number) => {
        if (!timestamp) return 'Récemment';
        return new Date(timestamp).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
    };

    return (
        <div 
            onClick={onOpen}
            className="group bg-white border border-slate-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-relief transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[160px] relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-bl from-white via-white to-transparent z-10">
                <div className="flex items-center gap-1 bg-white/90 backdrop-blur rounded-lg p-1 shadow-sm border border-slate-100">
                    <button onClick={handleEditClick} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Renommer"><Edit3 size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); onOpenJsonEditor(); }} className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded" title="Modifier le JSON"><Code2 size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="Supprimer"><Trash2 size={14} /></button>
                </div>
            </div>

            <div>
                {isEditingTitle ? (
                    <input 
                      type="text" 
                      defaultValue={sheet.title}
                      autoFocus
                      className="w-full text-lg font-serif font-bold text-slate-900 border-b-2 border-blue-500 focus:outline-none bg-transparent"
                      onClick={(e) => e.stopPropagation()}
                      onBlur={handleTitleBlur}
                      onKeyDown={handleTitleKeyDown}
                    />
                ) : (
                    <h3 className="font-serif font-bold text-slate-900 text-lg leading-tight line-clamp-2 mb-1" title={sheet.title}>
                       {sheet.title}
                    </h3>
                )}
                <p className="text-xs text-slate-400 font-medium line-clamp-2">{sheet.subtitle || "Sans sous-titre"}</p>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50 text-[10px] uppercase tracking-wider font-bold text-slate-400">
                <div className="flex items-center gap-1"><FileText size={12} /><span>{sheet.blockCount} BLOCS</span></div>
                <div className="flex items-center gap-1"><Calendar size={12} /><span>{formatDate(sheet.updatedAt)}</span></div>
            </div>
        </div>
    );
};
