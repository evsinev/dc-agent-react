import { useDocumentTitle } from '@/hooks/use-document-title';
import { useAgentList } from '@/pages/dc-agent-list/api/agent-list';
import DcAgentDetailBody from '@/pages/dc-agent-list/components/dc-agent-detail-body';
import { Box, StatusIndicator } from '@cloudscape-design/components';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import { useParams } from 'react-router';

export default function DcAgentView() {
  const { name } = useParams();
  useDocumentTitle(name ? `dc-agent: ${name}` : 'dc-agent');

  const { data, isLoading } = useAgentList();
  const agent = data?.agents.find((item) => item.name === name);

  return (
    <SpaceBetween size="m">
      <Header variant="h1">
        {name}
        {isLoading && <StatusIndicator type="loading">Fetching</StatusIndicator>}
      </Header>

      {agent && <DcAgentDetailBody agent={agent} />}
      {!agent && !isLoading && <Box variant="p">Agent not found</Box>}
    </SpaceBetween>
  );
}
