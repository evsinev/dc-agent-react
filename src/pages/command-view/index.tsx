import { useDocumentTitle } from '@/hooks/use-document-title';
import { useCommandList } from '@/pages/command-list/api/command-list';
import CommandDetailsPanel from '@/pages/command-list/components/command-details-panel';
import { Box, StatusIndicator } from '@cloudscape-design/components';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import { useParams } from 'react-router';

export default function CommandView() {
  const { host, name } = useParams();
  useDocumentTitle(name ? `Command: ${name}` : 'Command');

  const { data, isLoading } = useCommandList();
  const command = data?.commands.find((item) => item.host === host && item.name === name);

  return (
    <SpaceBetween size="m">
      <Header variant="h1">
        {name}
        {isLoading && <StatusIndicator type="loading">Fetching</StatusIndicator>}
      </Header>

      {command && <CommandDetailsPanel command={command} />}
      {!command && !isLoading && <Box variant="p">Command not found</Box>}
    </SpaceBetween>
  );
}
