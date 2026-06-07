import React from 'react';
import { TelegramSettings, QuizQuestion } from '../../../../types';
import { useAuth } from '../../../auth/hooks/useAuth';
import DisplayConfig from './DisplayConfig';
import SendButton from './SendButton';

interface QuizListToolbarProps {
  questions: QuizQuestion[];
  settings: TelegramSettings;
  onChannelChange: (channelId: string) => void;
  handleSendAll: () => void;
  selectedTopic: string;
  onTopicChange: (topic: string) => void;
}

export default function QuizListToolbar({
  questions,
  settings,
  onChannelChange,
  handleSendAll,
  selectedTopic,
  onTopicChange
}: QuizListToolbarProps) {
  const { user } = useAuth();
  
  const sendableCount = questions.filter(q => q.status !== 'sending').length;
  const isSending = questions.some(q => q.status === 'sending');
  const allSent = questions.length > 0 && questions.every(q => q.status === 'sent');

  const visibleChannels = (user && settings.selectedChannelIds && settings.selectedChannelIds.length > 0
    ? settings.channels.filter(c => settings.selectedChannelIds?.includes(c.id))
    : settings.channels
  );

  React.useEffect(() => {
    if (visibleChannels.length > 0 && !visibleChannels.some(c => c.id === settings.activeChannelId)) {
      onChannelChange(visibleChannels[0].id);
    }
  }, [visibleChannels, settings.activeChannelId, onChannelChange]);

  let displayPrefix = settings.questionPrefix;
  let displaySuffix = settings.explanationSuffix;

  if (settings.activeChannelId) {
    const activeChannel = settings.channels?.find(c => c.id === settings.activeChannelId);
    if (activeChannel) {
      if (activeChannel.activePrefixId === 'none') {
        displayPrefix = '';
      } else if (activeChannel.activePrefixId) {
        const prefixObj = settings.prefixes?.find(p => p.id === activeChannel.activePrefixId);
        if (prefixObj) displayPrefix = prefixObj.content;
      }

      if (activeChannel.activeSuffixId === 'none') {
        displaySuffix = '';
      } else if (activeChannel.activeSuffixId) {
        const suffixObj = settings.suffixes?.find(s => s.id === activeChannel.activeSuffixId);
        if (suffixObj) displaySuffix = suffixObj.content;
      }
    }
  }

  if (questions.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {settings.channels && settings.channels.length > 0 && (
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-[10px] lg:text-[11px] uppercase font-bold text-slate-400 px-1 flex items-center justify-between tracking-wider">
            Target Channel
            {user && settings.selectedChannelIds && settings.selectedChannelIds.length > 1 && (
              <span className="text-[8px] lg:text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-bold">
                {settings.selectedChannelIds.length} SELECTED
              </span>
            )}
          </label>
          <select
            value={settings.activeChannelId || ''}
            onChange={(e) => onChannelChange(e.target.value)}
            className="p-2 lg:p-3 bg-white border border-slate-200 rounded-xl text-xs lg:text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm cursor-pointer w-full transition-all hover:border-slate-300"
          >
            {visibleChannels.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="w-full">
          <DisplayConfig displayPrefix={displayPrefix || ''} displaySuffix={displaySuffix || ''} />
        </div>
        <div className="w-full">
          <SendButton 
            isSending={isSending} 
            sendableCount={sendableCount} 
            allSent={allSent} 
            handleSendAll={handleSendAll} 
          />
        </div>
      </div>
    </div>
  );
}
