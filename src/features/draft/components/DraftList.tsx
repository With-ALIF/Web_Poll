import React from 'react';
import { QuizQuestion } from '../../../types';
import DraftCard from './DraftCard';

interface DraftListProps {
  drafts: QuizQuestion[];
  onSend: (draft: QuizQuestion) => void;
  onDelete: (id: string) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onOpenDetails: (draft: QuizQuestion) => void;
}

export default function DraftList({ drafts, onSend, onDelete, selectedIds, onToggleSelect, onOpenDetails }: DraftListProps) {
  if (drafts.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
        <p className="text-slate-500 font-medium">No drafts found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {drafts.map((draft) => (
        <DraftCard 
          key={draft.id} 
          draft={draft} 
          onSend={onSend} 
          onDelete={onDelete} 
          isSelected={selectedIds.has(draft.id)}
          onToggleSelect={onToggleSelect}
          onOpenDetails={onOpenDetails}
        />
      ))}
    </div>
  );
}
