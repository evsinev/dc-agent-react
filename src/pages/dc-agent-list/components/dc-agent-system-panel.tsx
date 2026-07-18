import DefinitionList from '@/components/definition-list';
import { AgentInfo } from '@/pages/dc-agent-list/api/agent-list';
import { Box } from '@cloudscape-design/components';

type Props = {
  agent: AgentInfo;
};

/** System / JVM metrics, rendered as the content of the "System / JVM" tab (no outer Container). */
export default function DcAgentSystemPanel({ agent }: Props) {
  const m = agent.metrics;
  if (!m) {
    return <Box color="text-status-inactive">{agent.metricsError ?? 'No metrics available'}</Box>;
  }
  return (
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
  );
}
