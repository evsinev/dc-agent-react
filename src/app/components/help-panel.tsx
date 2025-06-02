import { useHelpPanel } from '@/hooks/use-help-panel';
import { HelpPanel } from '@cloudscape-design/components';
import { useEffect } from 'react';
import { useLocation } from 'react-router';

export default function SplitPanelWrapper() {
  const panel = useHelpPanel((state) => state.panel);
  const hide = useHelpPanel((state) => state.hide);
  const location = useLocation();

  useEffect(() => {
    hide();
  }, [location.pathname]);

  if (!panel?.content) {
    return null;
  }

  return <HelpPanel header={panel.title}>{panel.content}</HelpPanel>;
}
