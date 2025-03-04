import { create } from 'zustand';

interface State {
  logToken?: string;
  setLogToken: (token: string) => void;

  logs: string[];
  setLogs: (logs: string[]) => void;
}

const useLogs = create<State>((set, getState) => ({
  logToken: undefined,
  setLogToken: (logToken: string) => set({ logToken }),

  logs: [],
  setLogs: (logs: string[]) => set({ logs: [...getState().logs, ...logs] }),
}));

export default useLogs;
