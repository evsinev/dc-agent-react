import { SplitPanel } from '@cloudscape-design/components';
import { useSplitPanel } from '@/hooks/use-split-panel';

export default function SplitPanelWrapper() {
  const { panel } = useSplitPanel();

  if (!panel?.content) {
    return null;
  }

  return (
    <SplitPanel
      header={panel.title}
      closeBehavior="collapse"
      hidePreferencesButton
    >
      {panel.content}
    </SplitPanel>
  );
}
