'use client';

import { createContext, useContext } from 'react';

interface PanelContextValue {
  pendingCount: number;
  refreshPending: () => void;
}

export const PanelContext = createContext<PanelContextValue>({
  pendingCount: 0,
  refreshPending: () => {},
});

export function usePanelContext() {
  return useContext(PanelContext);
}
