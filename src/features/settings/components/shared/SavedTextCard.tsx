import React from 'react';
import { Check, Trash2 } from 'lucide-react';
import { SavedText } from '../../../../types';

interface SavedTextCardProps {
  key?: string | number;
  item: SavedText | null;
  isActive: boolean;
  onSelect: () => void;
  onRemove?: (id: string) => void;
  confirmDeleteId?: string | null;
  setConfirmDeleteId?: (id: string | null) => void;
  activeColor: 'blue' | 'purple';
  label?: string;
}

export default function SavedTextCard({ 
  item, 
  isActive, 
  onSelect, 
  onRemove, 
  confirmDeleteId, 
  setConfirmDeleteId,
  activeColor,
  label
}: SavedTextCardProps) {
  const isNone = !item;
  const colorClass = activeColor === 'blue' ? 'blue' : 'purple';
  
  const activeStyles = activeColor === 'blue' 
    ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' 
    : 'bg-purple-50 border-purple-200 ring-1 ring-purple-200';
    
  const hoverStyles = activeColor === 'blue'
    ? 'hover:border-blue-200'
    : 'hover:border-purple-200';

  const checkColor = activeColor === 'blue' ? 'text-blue-600' : 'text-purple-600';
  const textContentColor = activeColor === 'blue' ? 'text-blue-600' : 'text-purple-600';

  return (
    <div 
      className={`p-3 rounded-xl border transition-all cursor-pointer group relative ${
        isActive ? activeStyles : `bg-white border-slate-200 ${hoverStyles}`
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-bold ${isActive ? textContentColor : 'text-slate-600'} truncate pr-6`}>
          {isNone ? (label || 'None') : item.content}
        </span>
        {isActive && <Check className={`w-3 h-3 ${checkColor}`} />}
      </div>
      
      {!isNone && onRemove && (
        <>
          {confirmDeleteId === item.id ? (
            <div className="absolute top-1 right-1 flex items-center gap-1 bg-white p-0.5 rounded-lg shadow-sm border border-slate-200">
              <button 
                onClick={(e) => { e.stopPropagation(); setConfirmDeleteId?.(null); }}
                className="text-[9px] font-bold text-slate-500 hover:bg-slate-100 px-1.5 py-0.5 rounded transition-colors"
              >
                No
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
                className="text-[9px] font-bold text-white bg-red-500 hover:bg-red-600 px-1.5 py-0.5 rounded transition-colors"
              >
                Yes
              </button>
            </div>
          ) : (
            <button 
              onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
              className="absolute top-1 right-1 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              title="Delete item"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </>
      )}
    </div>
  );
}
