import React from 'react';
import { TelegramSettings, SavedText } from '../../../../types';
import SavedTextCard from '../shared/SavedTextCard';
import AddSuffixInput from './AddSuffixInput';

interface SuffixSectionProps {
  settings: TelegramSettings;
  user: any;
  newSuffix: string;
  setNewSuffix: (val: string) => void;
  addSuffix: () => void;
  removeSuffix: (id: string) => void;
  selectSuffix: (item: SavedText | null | undefined) => void;
  confirmDeleteId: string | null;
  setConfirmDeleteId: (id: string | null) => void;
  activeSuffixId?: string;
  isGlobalMode: boolean;
  canEditSuffix?: boolean;
  globalDefaultSuffix?: string;
}

export default function SuffixSection({
  settings,
  user,
  newSuffix,
  setNewSuffix,
  addSuffix,
  removeSuffix,
  selectSuffix,
  confirmDeleteId,
  setConfirmDeleteId,
  activeSuffixId,
  isGlobalMode,
  canEditSuffix = true,
  globalDefaultSuffix
}: SuffixSectionProps) {
  return (
    <div className={!user ? "opacity-50 pointer-events-none" : ""}>
      <div className="mb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200">
            <label className="text-base font-bold text-slate-800 whitespace-nowrap">Explanation Suffix Library</label>
          </div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium whitespace-nowrap">Max 200 chars</span>
        </div>
        {!canEditSuffix && (
          <div className="flex mt-2">
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full border border-indigo-100 flex items-center gap-1 whitespace-nowrap">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
              MANAGED BY ADMIN
            </span>
          </div>
        )}
      </div>

      {!canEditSuffix ? (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Default Suffix Active</p>
            <p className="text-xs text-slate-500 mt-1 max-w-[250px]">Your administrator has set a default suffix for your account. You cannot modify formatting at this time.</p>
            
            {globalDefaultSuffix && (
              <div className="mt-4 p-3 bg-white border border-slate-200 rounded-xl text-left">
                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-wider">Current Suffix:</p>
                <p className="text-xs text-slate-700 italic break-words">{globalDefaultSuffix}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Saved Suffixes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {!isGlobalMode && (
              <SavedTextCard 
                item={null}
                isActive={activeSuffixId === undefined}
                onSelect={() => selectSuffix(undefined)}
                activeColor="purple"
                label="Use Global Default"
              />
            )}

            <SavedTextCard 
              item={null}
              isActive={activeSuffixId === 'none' || (isGlobalMode && !activeSuffixId)}
              onSelect={() => selectSuffix(null)}
              activeColor="purple"
              label="None (No Suffix)"
            />

            {(settings.suffixes || []).map(item => (
              <SavedTextCard 
                key={item.id}
                item={item}
                isActive={activeSuffixId === item.id}
                onSelect={() => selectSuffix(item)}
                onRemove={removeSuffix}
                confirmDeleteId={confirmDeleteId}
                setConfirmDeleteId={setConfirmDeleteId}
                activeColor="purple"
              />
            ))}
          </div>

          {/* Add New Suffix */}
          <AddSuffixInput 
            value={newSuffix}
            onChange={setNewSuffix}
            onAdd={addSuffix}
          />
        </>
      )}

      <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
        <p className="text-[11px] text-amber-700 leading-relaxed">
          <strong>বিঃদ্রঃ:</strong> টেলিগ্রামের নিয়ম অনুযায়ী ব্যাখ্যা সর্বোচ্চ ২০০ ক্যারেক্টার হতে পারে।
        </p>
      </div>
    </div>
  );
}
