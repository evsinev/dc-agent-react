import { useNotifications } from '@/hooks/use-notifications';
import { Flashbar } from '@cloudscape-design/components';

/**
 * Single app-wide notifications flashbar for the AppLayout `notifications` slot. Groups
 * multiple items via `stackItems`; renders nothing when empty (no stray empty banner).
 */
export default function Notifications() {
  const items = useNotifications((state) => state.items);

  if (items.length === 0) {
    return null;
  }

  return (
    <Flashbar
      stackItems
      items={items}
    />
  );
}
