import React from 'react';
import { SheetState, BlockData, BlockType } from '../../types';
import { MathContent } from '../MathContent';
import { Block } from '../Block';
import { BlockInserter } from '../BlockInserter';
import { LayoutTemplate } from 'lucide-react';

interface EditorCanvasProps {
  sheet: SheetState;
  setSheet: React.Dispatch<React.SetStateAction<SheetState>>;
  blockRenderData: (BlockData & { label: string })[];
  onOpenTemplateModal: () => void;
  insertBlock: (type: BlockType, index: number) => void;
  updateBlock: (id: string, updates: Partial<BlockData>) => void;
  deleteBlock: (id: string) => void;
  moveBlock: (id: string, direction: 'up' | 'down') => void;
  duplicateBlock: (sourceBlock: BlockData) => void;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = ({
  sheet,
  setSheet,
  blockRenderData,
  onOpenTemplateModal,
  insertBlock,
  updateBlock,
  deleteBlock,
  moveBlock,
  duplicateBlock
}) => {
  return (
    <div className="pt-24 px-4 sm:px-8 flex justify-center">
      <div className="w-full max-w-[297mm] min-h-[210mm] bg-[#eef2f6] shadow-none rounded-xl p-[5mm] relative mb-20">
        <header className="mb-12 pb-6 text-center border-b border-slate-200/50">
          <MathContent
            html={sheet.title}
            tagName="h1"
            className="text-5xl font-serif font-black text-slate-900 mb-3 uppercase tracking-tighter"
            onChange={(html) => setSheet(s => ({ ...s, title: html }))}
            placeholder="TITRE DE LA FICHE"
          />
          <MathContent
            html={sheet.subtitle}
            tagName="div"
            className="text-xl text-slate-500 font-medium font-mono tracking-tight"
            onChange={(html) => setSheet(s => ({ ...s, subtitle: html }))}
            placeholder="Sous-titre / Classe"
          />
        </header>

        <div className="flex flex-col gap-0">
          {blockRenderData.length === 0 && (
            <div
              onClick={onOpenTemplateModal}
              className="cursor-pointer text-center py-24 text-slate-300 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50 hover:bg-white/80 transition-all hover:border-blue-300 hover:text-blue-400"
            >
              <LayoutTemplate size={64} className="mx-auto mb-4 opacity-40" />
              <p className="font-serif italic text-lg">Votre fiche est vide.</p>
              <p className="text-sm font-bold mt-2">Cliquez pour charger un modèle ou ajouter un bloc</p>
            </div>
          )}

          {blockRenderData.length > 0 && (
            <BlockInserter onInsert={(type) => insertBlock(type, 0)} />
          )}

          {blockRenderData.map((block, index) => (
            <React.Fragment key={block.id}>
              <Block
                data={block}
                index={index}
                label={block.label}
                onUpdate={updateBlock}
                onDelete={deleteBlock}
                onMove={moveBlock}
                onDuplicate={duplicateBlock}
              />
              <BlockInserter onInsert={(type) => insertBlock(type, index + 1)} />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};