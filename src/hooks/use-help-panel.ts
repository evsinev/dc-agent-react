import { ReactNode } from 'react';
import { create } from 'zustand';

type Panel = {
  title: string;
  content: ReactNode;
};

type State = {
  panel?: {
    content: ReactNode;
    title: string;
  };
};

type Actions = {
  show: (panel: Panel) => void;
  hide: () => void;
};

export const useHelpPanel = create<State & Actions>((set) => ({
  panel: undefined,
  show: (panel: Panel) => {
    set({ panel });
  },
  hide: () => {
    set({ panel: undefined });
  },
}));
