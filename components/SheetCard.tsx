
import React, { useState, useMemo } from 'react';
import { SheetMeta } from '../utils/storage';
import { Trash2, FileText, Calendar, Edit3, Code2, ChevronRight } from 'lucide-react';

interface SheetCardProps {
    sheet: SheetMeta & { blockCount: number };
    onOpen: () => void;
    onDelete: () => void;
    onOpenJsonEditor: () => void;
    onUpdateTitle: (newTitle: string) => void;
    onUpdateSubtitle: (newSubtitle: string) => void;
}

const CARD_ACCENTS = [
    { from: 'from-blue-500', to: 'to-indigo-500', light: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-200' },
    { from: 'from-emerald-500', to: 'to-teal-500', light: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-200' },
    { from: 'from-amber-500', to: 'to-orange-500', light: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-200' },
    { from: 'from-rose-500', to: 'to-pink-500', light: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-200' },
    { from: 'from-violet-500', to: 'to-purple-500', light: 'bg-violet-50', text: 'text-violet-600', ring: 'ring-violet-200' },
    { from: 'from-cyan-500', to: 'to-sky-500', light: 'bg-cyan-50', text: 'text-cyan-600', ring: 'ring-cyan-200' },
];

export const SheetCard: React.FC<SheetCardProps> = ({ sheet, onOpen, onDelete, onOpenJsonEditor, onUpdateTitle, onUpdateSubtitle }) => {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingSubtitle, setIsEditingSubtitle] = useState(false);

    const accent = useMemo(() => {
        let hash = 0;
        for (let i = 0; i < (sheet.id || '').length; i++) {
            hash = ((hash << 5) - hash) + (sheet.id || '').charCodeAt(i);
            hash |= 0;
        }
        return CARD_ACCENTS[Math.abs(hash) % CARD_ACCENTS.length];
    }, [sheet.id]);

    const handleTitleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsEditingTitle(false);
        onUpdateTitle(e.target.value);
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === 'Escape') {
            setIsEditingTitle(false);
            onUpdateTitle(e.currentTarget.value);
        }
    };
    
    const handleSubtitleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsEditingSubtitle(false);
        onUpdateSubtitle(e.target.value);
    };

    const handleSubtitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === 'Escape') {
            setIsEditingSubtitle(false);
            onUpdateSubtitle(e.currentTarget.value);
        }
    };

    const formatDate = (timestamp: number) => {
        if (!timestamp) return 'Récemment';
        return new Date(timestamp).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
    };

    return (
        <div
            onClick={!isEditingTitle && !isEditingSubtitle ? onOpen : undefined}
            className="group relative bg-white rounded-2xl cursor-pointer flex flex-col justify-between min-h-[180px] overflow-hidden shadow-sm hover:shadow-float transition-all duration-500 hover:-translate-y-1"
        >
            {/* Action buttons */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0 z-10">
                <div className="flex items-center gap-0.5 bg-white/95 backdrop-blur-sm rounded-lg p-0.5 shadow-md border border-slate-100/80">
                    <button onClick={(e) => { e.stopPropagation(); onOpenJsonEditor(); }} className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-md transition-colors" title="Modifier le JSON"><Code2 size={13} /></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Supprimer"><Trash2 size={13} /></button>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 pt-5 flex-grow">
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
                    <h3 onClick={(e) => { e.stopPropagation(); setIsEditingTitle(true); }} className="group/title relative font-serif font-bold text-slate-800 text-lg leading-tight line-clamp-2 mb-2 group-hover:text-slate-950 transition-colors" title={sheet.title}>
                       {sheet.title}
                       <Edit3 size={12} className="absolute top-1 -right-4 text-slate-300 opacity-0 group-hover/title:opacity-100 transition-opacity" />
                    </h3>
                )}
                {isEditingSubtitle ? (
                     <input
                        type="text"
                        defaultValue={sheet.subtitle}
                        autoFocus
                        className="w-full text-xs text-slate-600 border-b-2 border-green-500 focus:outline-none bg-transparent mt-1"
                        onClick={(e) => e.stopPropagation()}
                        onBlur={handleSubtitleBlur}
                        onKeyDown={handleSubtitleKeyDown}
                    />
                ) : (
                <p onClick={(e) => { e.stopPropagation(); setIsEditingSubtitle(true); }} className="group/subtitle relative text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">
                    {sheet.subtitle || "Sans sous-titre"}
                    <Edit3 size={10} className="absolute top-0.5 -right-4 text-slate-300 opacity-0 group-hover/subtitle:opacity-100 transition-opacity" />
                </p>
                )}
            </div>

            {/* Footer */}
            <div className="px-5 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider font-bold text-slate-400">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${accent.light} ${accent.text} text-[10px]`}>
                        <FileText size={11} />
                        <span>{sheet.blockCount} blocs</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar size={11} />
                        <span>{formatDate(sheet.updatedAt)}</span>
                    </div>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all duration-300" />
            </div>
        </div>
    );
};
