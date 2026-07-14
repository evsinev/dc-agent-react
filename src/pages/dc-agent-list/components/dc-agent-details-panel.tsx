import DefinitionList from '@/components/definition-list';
import { AgentInfo } from '@/pages/dc-agent-list/api/agent-list';
import { Box, ColumnLayout, Container, Header, SpaceBetween, StatusIndicator } from '@cloudscape-design/components';

type Props = {
  agent: AgentInfo;
};

export default function DcAgentDetailsPanel({ agent }: Props) {
  const m = agent.metrics;
  return (
    <SpaceBetween size="l">
      <ColumnLayout
        columns={2}
        variant="text-grid"
      >
        <Container header={<Header headingTagOverride="h3">Agent</Header>}>
          <DefinitionList
            columns={1}
            ariaLabel="Agent details"
            termWidth="140px"
            items={[
              { label: 'Name', value: agent.name },
              { label: 'URL', value: agent.url },
              {
                label: 'Status',
                value: (
                  <StatusIndicator type={agent.reachable ? 'success' : 'error'}>
                    {agent.reachable ? 'Online' : 'Offline'}
                  </StatusIndicator>
                ),
              },
              ...(agent.error ? [{ label: 'Error', value: agent.error }] : []),
            ]}
          />
        </Container>

        <Container header={<Header headingTagOverride="h3">App status</Header>}>
          <DefinitionList
            columns={2}
            ariaLabel="App status"
            termWidth="110px"
            items={[
              { label: 'Instance', value: agent.appInstanceName ?? '—' },
              { label: 'Version', value: agent.appVersion ?? '—' },
              { label: 'Reported host', value: agent.hostname ?? '—' },
              { label: 'Port', value: agent.port ? String(agent.port) : '—' },
              { label: 'Uptime', value: agent.uptimeFormatted ?? '—' },
              { label: 'Response id', value: agent.responseId ?? '—' },
            ]}
          />
        </Container>
      </ColumnLayout>

      <Container header={<Header headingTagOverride="h3">System / JVM</Header>}>
        {m ? (
          <DefinitionList
            columns={2}
            ariaLabel="System / JVM metrics"
            termWidth="150px"
            items={[
              { label: 'System CPU', value: m.systemCpuLoadText },
              { label: 'Process CPU', value: m.processCpuLoadText },
              { label: 'Load average', value: m.loadAverageText },
              { label: 'Processors', value: String(m.availableProcessors) },
              { label: 'Heap used', value: `${m.heapUsedText} (${m.heapUsedPercentText})` },
              { label: 'Heap committed', value: m.heapCommittedText },
              { label: 'Heap max', value: m.heapMaxText },
              { label: 'Non-heap used', value: m.nonHeapUsedText },
              { label: 'Memory used', value: `${m.physicalUsedText} (${m.physicalUsedPercentText})` },
              { label: 'Memory total', value: m.physicalTotalText },
              { label: 'Swap', value: `${m.swapFreeText} free / ${m.swapTotalText}` },
              { label: 'Threads', value: String(m.threadCount) },
              { label: 'GC', value: `${m.gcCount} (${m.gcTimeText})` },
              { label: 'Process CPU time', value: m.processCpuTimeText },
            ]}
          />
        ) : (
          <Box color="text-status-inactive">{agent.metricsError ?? 'No metrics available'}</Box>
        )}
      </Container>
    </SpaceBetween>
  );
}
