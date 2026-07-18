import DefinitionList from '@/components/definition-list';
import { errorMessage } from '@/components/error/components/load-error';
import { useNotifications } from '@/hooks/use-notifications';
import { AgentInfo, gcHealthIndicatorType } from '@/pages/dc-agent-list/api/agent-list';
import {
  Box,
  Button,
  ColumnLayout,
  Container,
  Header,
  SpaceBetween,
  StatusIndicator,
} from '@cloudscape-design/components';

type Props = {
  agent: AgentInfo;
};

export default function DcAgentDetailsPanel({ agent }: Props) {
  const m = agent.metrics;
  const notify = useNotifications((state) => state.add);

  // Direct clipboard write — no browser storage. The payload is a self-contained block built by the
  // backend (raw GC numbers + host/JVM context + an instruction) ready to paste into an LLM.
  const copyForLlm = async () => {
    if (!m?.gcLlmPayload) {
      return;
    }
    try {
      await navigator.clipboard.writeText(m.gcLlmPayload);
      notify({
        id: `gc-copy-${agent.name}`,
        type: 'success',
        header: `Copied GC report for ${agent.name}`,
        autoDismissMs: 3000,
      });
    } catch (error) {
      notify({
        id: `gc-copy-${agent.name}`,
        type: 'error',
        header: `Could not copy GC report for ${agent.name}`,
        content: errorMessage(error),
        statusIconAriaLabel: 'error',
      });
    }
  };

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

      <Container
        header={
          <Header
            headingTagOverride="h3"
            actions={
              <Button
                iconName="copy"
                disabled={!m?.gcLlmPayload}
                onClick={copyForLlm}
              >
                Copy for LLM
              </Button>
            }
          >
            Garbage collection
          </Header>
        }
      >
        {m ? (
          <SpaceBetween size="s">
            <Box>
              <StatusIndicator type={gcHealthIndicatorType(m.gcHealthLevel)}>{m.gcHealthLevel}</StatusIndicator>{' '}
              {m.gcHealthSummary}
            </Box>
            {m.gcHealthDetail && m.gcHealthDetail !== m.gcHealthSummary && (
              <div style={{ whiteSpace: 'pre-line' }}>{m.gcHealthDetail}</div>
            )}
            <DefinitionList
              columns={2}
              ariaLabel="Garbage collection metrics"
              termWidth="150px"
              items={[
                { label: 'Avg pause', value: m.gcAvgPauseText },
                { label: 'Max pause', value: m.gcMaxPauseText },
                { label: 'Last pause', value: m.gcLastPauseText },
                { label: 'Long pauses', value: String(m.gcLongPauseCount) },
                { label: 'Live set', value: m.gcLiveSetText },
                { label: 'Last cause', value: m.gcLastCause },
              ]}
            />
          </SpaceBetween>
        ) : (
          <Box color="text-status-inactive">{agent.metricsError ?? 'No metrics available'}</Box>
        )}
      </Container>
    </SpaceBetween>
  );
}
