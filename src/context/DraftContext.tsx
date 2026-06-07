import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useDraftsSource } from '../features/draft/hooks/useDraftsSource';

type DraftState = ReturnType<typeof useDraftsSource>;

const DraftContext = createContext<DraftState | undefined>(undefined);

export function DraftProvider({ children }: { children: ReactNode }) {
  const state = useDraftsSource();
  const value = useMemo(() => state, [state]);

  return (
    <DraftContext.Provider value={value}>
      {children}
    </DraftContext.Provider>
  );
}

export function useDrafts() {
  const context = useContext(DraftContext);
  if (context === undefined) {
    throw new Error('useDrafts must be used within a DraftProvider');
  }
  return context;
}
