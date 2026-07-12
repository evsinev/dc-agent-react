import type { FlashbarProps } from '@cloudscape-design/components';
import { create } from 'zustand';

/**
 * App-wide notifications, rendered as a single grouped `<Flashbar stackItems>` in the
 * AppLayout `notifications` slot (single source of truth, per Cloudscape). Reserved for
 * ACTION results (pull, service up/down, push) — data-load failures render in-content.
 */
export type NotificationInput = Omit<FlashbarProps.MessageDefinition, 'id' | 'dismissible' | 'onDismiss'> & {
  /** Dedup key — a repeat `add` with the same id replaces the existing notification. */
  id?: string;
  /** Auto-dismiss after N ms (used for success/info); errors omit it so they persist. */
  autoDismissMs?: number;
};

type State = {
  items: FlashbarProps.MessageDefinition[];
};

type Actions = {
  add: (input: NotificationInput) => void;
  dismiss: (id: string) => void;
  clear: () => void;
};

let seq = 0;
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function clearTimer(id: string): void {
  const t = timers.get(id);
  if (t) {
    clearTimeout(t);
    timers.delete(id);
  }
}

export const useNotifications = create<State & Actions>((set, get) => ({
  items: [],

  add: ({ id, autoDismissMs, ...rest }) => {
    const key = id ?? `n-${seq++}`;
    clearTimer(key);
    const item: FlashbarProps.MessageDefinition = {
      ...rest,
      id: key,
      dismissible: true,
      onDismiss: () => get().dismiss(key),
    };
    // Dedup/replace by id, then append.
    set((state) => ({ items: [...state.items.filter((it) => it.id !== key), item] }));
    if (autoDismissMs) {
      timers.set(
        key,
        setTimeout(() => get().dismiss(key), autoDismissMs),
      );
    }
  },

  dismiss: (id) => {
    clearTimer(id);
    set((state) => ({ items: state.items.filter((it) => it.id !== id) }));
  },

  clear: () => {
    for (const key of timers.keys()) {
      clearTimer(key);
    }
    set({ items: [] });
  },
}));
