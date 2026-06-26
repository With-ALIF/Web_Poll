import React from 'react';
import { Routes } from 'react-router-dom';
import { useAppInit } from './useAppInit';
import { useDrafts } from '../features/draft/hooks/useDrafts';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useAdminRoutes } from './routes/AdminRoutes';
import { useFeatureRoutes } from './routes/FeatureRoutes';
import { useUserRoutes } from './routes/UserRoutes';

interface AppRoutesProps {
  appState: ReturnType<typeof useAppInit>;
}

export default function AppRoutes({ appState }: AppRoutesProps) {
  const { quiz, pendingQuestions } = appState;
  const { moveManyToDraft } = useDrafts();
  const { isAdmin } = useAuth();

  const handleDraftSelected = async (ids: string[]) => {
    const selectedQuestions = pendingQuestions.filter(q => ids.includes(q.id));
    
    // Check if all selected questions have a topic
    const missingTopic = selectedQuestions.find(q => !q.topic);
    if (missingTopic) {
      appState.telegram.setSendError('ড্রাফটে সেভ করার আগে অবশ্যই একটি বিষয় (Topic) নির্বাচন করতে হবে।');
      return;
    }

    await moveManyToDraft(selectedQuestions);
    quiz.removeQuestions(ids);
  };

  const adminRoutes = useAdminRoutes({ isAdmin });
  const featureRoutes = useFeatureRoutes({ appState, handleDraftSelected });
  const userRoutes = useUserRoutes({ appState });

  return (
    <Routes>
      {adminRoutes}
      {featureRoutes}
      {userRoutes}
    </Routes>
  );
}
