import { useHelpPanel } from '@/hooks/use-help-panel';
import { Link } from '@cloudscape-design/components';
import { ReactNode } from 'react';

type Props = {
  title: string;
  content: ReactNode;
};

// The standard Cloudscape "info" link for a Header: opens the given help content in the right-hand
// Tools panel (AppLayout wires toolsOpen to the useHelpPanel store). Closed via the panel's X
// (see app.tsx onToolsChange) or on route change.
export default function InfoHelpLink({ title, content }: Props) {
  const show = useHelpPanel((state) => state.show);
  return (
    <Link
      variant="info"
      onFollow={() => show({ title, content })}
    >
      Info
    </Link>
  );
}
