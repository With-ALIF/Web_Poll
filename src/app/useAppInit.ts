import { useSettings } from '../features/settings/hooks/useSettings';
import { useQuiz } from '../features/quiz/hooks/useQuiz';
import { useTelegram } from '../features/quiz/hooks/useTelegram';
import { useMemo } from 'react';
import { FIXED_BOT_TOKEN } from '../features/quiz/constants';

export function useAppInit() {
  const settings = useSettings();
  const quiz = useQuiz();

  const activeBotToken = FIXED_BOT_TOKEN;

  const telegram = useTelegram({
    settings: settings.settings,
    questions: quiz.questions,
    setQuestions: quiz.setQuestions,
    setStats: quiz.setStats,
    botToken: activeBotToken
  });

  const pendingQuestions = useMemo(() => quiz.questions.filter(q => q.status !== 'sent'), [quiz.questions]);
  const sentQuestions = useMemo(() => quiz.questions.filter(q => q.status === 'sent'), [quiz.questions]);

  return useMemo(() => ({
    settings,
    quiz,
    telegram,
    pendingQuestions,
    sentQuestions,
    botToken: activeBotToken
  }), [settings, quiz, telegram, pendingQuestions, sentQuestions, activeBotToken]);
}
