import { useSplitPanel } from '@/hooks/use-split-panel';
import { SplitPanel } from '@cloudscape-design/components';
import { useEffect } from 'react';
import { useLocation } from 'react-router';

export default function SplitPanelWrapper() {
  const panel = useSplitPanel((state) => state.panel);
  const hide = useSplitPanel((state) => state.hide);
  const location = useLocation();

  useEffect(() => {
    hide();
  }, [location.pathname]);

  if (!panel?.content) {
    return null;
  }

  return (
    <SplitPanel
      header={panel.title}
      closeBehavior="collapse"
    >
      {panel.content}
    </SplitPanel>
  );
}
