import React, { useEffect } from 'react';
import { QuizQuestion } from '../../../types';
import { batchSaveQuizzes, subscribeToQuizzes, updateUserStats, subscribeToUserStats } from '../services/quizService';

export function useQuizSync(
  user: any,
  setQuestions: React.Dispatch<React.SetStateAction<QuizQuestion[]>>,
  setStats: React.Dispatch<React.SetStateAction<{ generated: number; sent: number }>>
) {
  useEffect(() => {
    let unsubscribeQuizzes: (() => void) | undefined;
    let unsubscribeStats: (() => void) | undefined;

    const initSync = async () => {
      if (user) {
        console.log("Initializing real-time sync for UID:", user.uid);
        
        // Initial migration if needed
        const savedQuizzes = localStorage.getItem('savedQuizzes');
        if (savedQuizzes) {
          try {
            const localQuestions: QuizQuestion[] = JSON.parse(savedQuizzes);
            if (localQuestions.length > 0) {
              console.log("Migrating local quizzes to Firestore...");
              await batchSaveQuizzes(user.uid, localQuestions);
              localStorage.removeItem('savedQuizzes');
            }
          } catch (e) {
            console.error("Failed to migrate local quizzes", e);
          }
        }

        const savedStats = localStorage.getItem('quizStats');
        if (savedStats) {
          try {
            const localStats = JSON.parse(savedStats);
            if (localStats.generated > 0 || localStats.sent > 0) {
              console.log("Migrating local stats to Firestore...");
              await updateUserStats(user.uid, localStats);
              localStorage.removeItem('quizStats');
            }
          } catch (e) {
            console.error("Failed to migrate local stats", e);
          }
        }

        // Subscribe to real-time updates for quizzes
        unsubscribeQuizzes = subscribeToQuizzes(user.uid, (loadedQuestions) => {
          console.log(`Real-time update: ${loadedQuestions.length} quizzes received`);
          const sorted = [...loadedQuestions].sort((a, b) => {
            const timeA = (a as any).createdAt?.seconds || 0;
            const timeB = (b as any).createdAt?.seconds || 0;
            return timeB - timeA;
          });
          setQuestions(sorted);
        });

        // Subscribe to real-time updates for stats
        unsubscribeStats = subscribeToUserStats(user.uid, (loadedStats) => {
          console.log("Real-time stats update received:", loadedStats);
          setStats(loadedStats);
        });
      } else {
        console.log("User not logged in, loading from localStorage");
        const savedQuizzes = localStorage.getItem('savedQuizzes');
        if (savedQuizzes) {
          try {
            setQuestions(JSON.parse(savedQuizzes));
          } catch (e) {
            console.error("Failed to parse saved quizzes", e);
          }
        }

        const savedStats = localStorage.getItem('quizStats');
        if (savedStats) {
          try {
            setStats(JSON.parse(savedStats));
          } catch (e) {
            console.error("Failed to parse saved stats", e);
          }
        }
      }
    };

    initSync();

    return () => {
      if (unsubscribeQuizzes) unsubscribeQuizzes();
      if (unsubscribeStats) unsubscribeStats();
    };
  }, [user?.uid, setQuestions, setStats]);
}
