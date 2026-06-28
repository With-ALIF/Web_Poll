import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizQuestion, TelegramSettings } from '../../../types';
import { sendQuizToTelegram } from '../services/telegramPollService';
import { useAuth } from '../../auth/hooks/useAuth';
import { getEffectiveSettings } from '../../settings/utils/settingsUtils';
import { incrementUserStats } from '../services/quizService';

interface UseTelegramProps {
  settings: TelegramSettings;
  questions: QuizQuestion[];
  setQuestions: React.Dispatch<React.SetStateAction<QuizQuestion[]>>;
  setStats: React.Dispatch<React.SetStateAction<{ generated: number; sent: number }>>;
  botToken: string;
}

export function useTelegram({ settings, questions, setQuestions, setStats, botToken }: UseTelegramProps) {
  const navigate = useNavigate();
  const { user, isAdmin, appConfig } = useAuth();
  const [sendError, setSendError] = useState<string | null>(null);
  const [isBulkSending, setIsBulkSending] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [bulkSendStatus, setBulkSendStatus] = useState<string | null>(null);
  const stopRequestedRef = useRef(false);

  const handleStopSend = useCallback(() => {
    stopRequestedRef.current = true;
    setIsStopping(true);
    setBulkSendStatus(null);
  }, []);

  const canEditSuffix = isAdmin || user?.permissions?.includes('suffix-edit');
  const globalDefaultSuffix = appConfig?.default_suffix;

  const handleSendToTelegram = useCallback(async (id: string, customQuestion?: QuizQuestion) => {
    const target = (user && settings.selectedChannelIds?.length) ? settings.selectedChannelIds : [settings.activeChannelId || ''];
    if (target.length === 1 && !target[0]) {
      setSendError('Please configure your Telegram Chat ID in settings.');
      navigate('/settings');
      return;
    }
    const exists = questions.some(q => q.id === id);
    if (exists) {
      setQuestions(p => p.map(q => q.id === id ? { ...q, status: 'sending' } : q));
    }
    const qToSend = customQuestion || questions.find(q => q.id === id);
    if (!qToSend) return;

    if (!qToSend.topic) {
      setSendError('পোল পাঠানোর আগে অবশ্যই একটি বিষয় (Topic) নির্বাচন করতে হবে।');
      return;
    }

    try {
      for (const chatId of target) {
        if (!chatId) continue;
        const effectiveSettings = getEffectiveSettings(settings, chatId, botToken, user, canEditSuffix, globalDefaultSuffix);
        await sendQuizToTelegram(qToSend, effectiveSettings, chatId);
        if (target.length > 1) await new Promise(r => setTimeout(r, 500));
      }
      if (exists) {
        setQuestions(p => p.map(q => q.id === id ? { ...q, status: 'sent' } : q));
      }
      setStats(p => {
        const s = { ...p, sent: p.sent + 1 };
        if (user) {
          localStorage.setItem(`stats_${user.id}`, JSON.stringify(s));
          incrementUserStats(user.id, { generated: 0, sent: 1 });
        } else {
          localStorage.setItem('quizStats', JSON.stringify(s));
        }
        return s;
      });
    } catch (err: any) {
      setSendError(`Failed to send: ${err.message}`);
      if (exists) {
        setQuestions(p => p.map(q => q.id === id ? { ...q, status: 'error' } : q));
      }
      throw err;
    }
  }, [user?.id, settings, questions, botToken, navigate, setQuestions, setStats, canEditSuffix, globalDefaultSuffix]);

  const handleSendAll = useCallback(async (qs: QuizQuestion[]) => {
    const sortedQs = [...qs];
    const sendableQs = sortedQs.filter(q => q.status !== 'sending');
    if (sendableQs.length === 0) return;

    const missingTopic = sendableQs.find(q => !q.topic);
    if (missingTopic) {
      setSendError('পোল পাঠানোর আগে সবগুলো পোল নির্বাচন করে বিষয় (Topic) সেট করুন।');
      return;
    }

    setIsBulkSending(true);
    setIsStopping(false);
    setBulkSendStatus(null);
    stopRequestedRef.current = false;

    try {
      for (let i = 0; i < sendableQs.length; i++) {
        if (stopRequestedRef.current) break;
        const q = sendableQs[i];
        
        await handleSendToTelegram(q.id);
        
        if (stopRequestedRef.current) break;
        if (i < sendableQs.length - 1) {
          const sentCount = i + 1;
          if (sentCount % 20 === 0) {
            for (let secondsLeft = 40; secondsLeft > 0; secondsLeft--) {
              if (stopRequestedRef.current) break;
              setBulkSendStatus(`২০ টি পোল পাঠানো হয়েছে। ৪০ সেকেন্ডের বিরতি নেওয়া হচ্ছে (${secondsLeft} সেকেন্ড বাকি)...`);
              await new Promise(r => setTimeout(r, 1000));
            }
            setBulkSendStatus(null);
          } else {
            await new Promise(r => setTimeout(r, 1000));
          }
        }
      }
    } finally {
      setIsBulkSending(false);
      setIsStopping(false);
      setBulkSendStatus(null);
      stopRequestedRef.current = false;
    }
  }, [handleSendToTelegram]);

  const handleSendSelected = useCallback(async (ids: string[]) => {
    const selectedQs = questions
      .filter(q => ids.includes(q.id) && q.status !== 'sending');
    if (selectedQs.length === 0) return;

    const missingTopic = selectedQs.find(q => !q.topic);
    if (missingTopic) {
      setSendError('পোল পাঠানোর আগে সবগুলো পোল নির্বাচন করে বিষয় (Topic) সেট করুন।');
      return;
    }

    setIsBulkSending(true);
    setIsStopping(false);
    setBulkSendStatus(null);
    stopRequestedRef.current = false;

    try {
      for (let i = 0; i < selectedQs.length; i++) {
        if (stopRequestedRef.current) break;
        const q = selectedQs[i];

        await handleSendToTelegram(q.id);

        if (stopRequestedRef.current) break;
        if (i < selectedQs.length - 1) {
          const sentCount = i + 1;
          if (sentCount % 20 === 0) {
            for (let secondsLeft = 40; secondsLeft > 0; secondsLeft--) {
              if (stopRequestedRef.current) break;
              setBulkSendStatus(`২০ টি পোল পাঠানো হয়েছে। ৪০ সেকেন্ডের বিরতি নেওয়া হচ্ছে (${secondsLeft} সেকেন্ড বাকি)...`);
              await new Promise(r => setTimeout(r, 1000));
            }
            setBulkSendStatus(null);
          } else {
            await new Promise(r => setTimeout(r, 1000));
          }
        }
      }
    } finally {
      setIsBulkSending(false);
      setIsStopping(false);
      setBulkSendStatus(null);
      stopRequestedRef.current = false;
    }
  }, [questions, handleSendToTelegram]);

  return useMemo(() => ({ 
    handleSendToTelegram, 
    handleSendAll, 
    handleSendSelected, 
    sendError, 
    setSendError,
    isBulkSending,
    isStopping,
    handleStopSend,
    bulkSendStatus
  }), [handleSendToTelegram, handleSendAll, handleSendSelected, sendError, isBulkSending, isStopping, handleStopSend, bulkSendStatus]);
}
