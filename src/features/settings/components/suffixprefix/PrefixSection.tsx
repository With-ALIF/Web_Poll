import React from 'react';
import { TelegramSettings, SavedText } from '../../../../types';
import SavedTextCard from '../shared/SavedTextCard';
import AddPrefixInput from './AddPrefixInput';

interface PrefixSectionProps {
  settings: TelegramSettings;
  user: any;
  newPrefix: string;
  setNewPrefix: (val: string) => void;
  addPrefix: () => void;
  removePrefix: (id: string) => void;
  selectPrefix: (item: SavedText | null | undefined) => void;
  confirmDeleteId: string | null;
  setConfirmDeleteId: (id: string | null) => void;
  activePrefixId?: string;
  isGlobalMode: boolean;
}

export default function PrefixSection({
  settings,
  user,
  newPrefix,
  setNewPrefix,
  addPrefix,
  removePrefix,
  selectPrefix,
  confirmDeleteId,
  setConfirmDeleteId,
  activePrefixId,
  isGlobalMode
}: PrefixSectionProps) {
  return (
    <div className={!user ? "opacity-50 pointer-events-none" : ""}>
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200">
          <label className="text-base font-bold text-slate-800 whitespace-nowrap">Question Prefix Library</label>
        </div>
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium whitespace-nowrap">Max 300 chars</span>
      </div>

      {/* Saved Prefixes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {!isGlobalMode && (
          <SavedTextCard 
            item={null}
            isActive={activePrefixId === undefined}
            onSelect={() => selectPrefix(undefined)}
            activeColor="blue"
            label="Use Global Default"
          />
        )}
        
        <SavedTextCard 
          item={null}
          isActive={activePrefixId === 'none' || (isGlobalMode && !activePrefixId)}
          onSelect={() => selectPrefix(null)}
          activeColor="blue"
          label="None (No Prefix)"
        />

        {(settings.prefixes || []).map(item => (
          <SavedTextCard 
            key={item.id}
            item={item}
            isActive={activePrefixId === item.id}
            onSelect={() => selectPrefix(item)}
            onRemove={removePrefix}
            confirmDeleteId={confirmDeleteId}
            setConfirmDeleteId={setConfirmDeleteId}
            activeColor="blue"
          />
        ))}
      </div>

      {/* Add New Prefix */}
      <AddPrefixInput 
        value={newPrefix}
        onChange={setNewPrefix}
        onAdd={addPrefix}
      />

      <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
        <p className="text-[11px] text-amber-700 leading-relaxed">
          <strong>বিঃদ্রঃ:</strong> টেলিগ্রামের নিয়ম অনুযায়ী পোলের প্রশ্নে সর্বোচ্চ ৩০০ ক্যারেক্টার অনুমোদিত।
        </p>
      </div>
    </div>
  );
}
