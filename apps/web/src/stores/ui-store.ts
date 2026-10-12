import { create } from 'zustand';

interface UiState {
  filterDrawerOpen: boolean;
  setFilterDrawerOpen: (open: boolean) => void;

  lastSearch: { q?: string; categoryId?: string; city?: string };
  setLastSearch: (search: UiState['lastSearch']) => void;
}

/** Genuine client-only UI state — everything server-derived lives in
 * TanStack Query instead (see hooks/use-*.ts). */
export const useUiStore = create<UiState>((set) => ({
  filterDrawerOpen: false,
  setFilterDrawerOpen: (open) => set({ filterDrawerOpen: open }),

  lastSearch: {},
  setLastSearch: (search) => set({ lastSearch: search }),
}));
