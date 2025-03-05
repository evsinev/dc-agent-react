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
  setLogs: (logs: string[]) => {
    const newLogs = [...getState().logs, ...logs];
    if (newLogs.length > 10000) {
      newLogs.splice(10);
    }

    set({ logs: newLogs });
  },
}));

export default useLogs;
