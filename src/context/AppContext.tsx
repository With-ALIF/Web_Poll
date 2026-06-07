import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useAppInit } from '../app/useAppInit';

type AppState = ReturnType<typeof useAppInit>;

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const state = useAppInit();
  const value = useMemo(() => state, [state]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
