import DefinitionList from '@/components/definition-list';
import { errorMessage } from '@/components/error/components/load-error';
import { useNotifications } from '@/hooks/use-notifications';
import { AgentInfo, gcHealthIndicatorType } from '@/pages/dc-agent-list/api/agent-list';
import { Box, Button, SpaceBetween, StatusIndicator } from '@cloudscape-design/components';

type Props = {
  agent: AgentInfo;
};

/** Garbage-collection verdict + figures + "Copy for LLM", rendered as the content of the "Garbage
 *  collection" tab (no outer Container). */
export default function DcAgentGcPanel({ agent }: Props) {
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

  if (!m) {
    return <Box color="text-status-inactive">{agent.metricsError ?? 'No metrics available'}</Box>;
  }

  return (
    <SpaceBetween size="s">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <Box>
          <StatusIndicator type={gcHealthIndicatorType(m.gcHealthLevel)}>{m.gcHealthLevel}</StatusIndicator>{' '}
          {m.gcHealthSummary}
        </Box>
        <Button
          iconName="copy"
          disabled={!m.gcLlmPayload}
          onClick={copyForLlm}
        >
          Copy for LLM
        </Button>
      </div>
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
  );
}
