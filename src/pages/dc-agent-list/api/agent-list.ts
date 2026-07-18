import { clientPost } from '@/libs/client-post';
import useSWR from 'swr';

export type AgentStatusIndicator =
  | 'error'
  | 'warning'
  | 'success'
  | 'info'
  | 'stopped'
  | 'pending'
  | 'in-progress'
  | 'loading';

export type AgentServiceBrief = {
  serviceName: string;
  statusName: string;
  statusIndicator: AgentStatusIndicator;
};

// Per-agent JVM/OS metrics. Each metric has a raw value (used for table sorting) plus a
// human-readable *Text rendering (used for display). Fractions are 0..1 (-1 = n/a).
export type AgentMetrics = {
  systemCpuLoad: number;
  systemCpuLoadText: string;
  processCpuLoad: number;
  processCpuLoadText: string;
  loadAverage: number;
  loadAverageText: string;
  availableProcessors: number;
  processCpuTimeNanos: number;
  processCpuTimeText: string;

  heapUsedBytes: number;
  heapUsedText: string;
  heapCommittedBytes: number;
  heapCommittedText: string;
  heapMaxBytes: number;
  heapMaxText: string;
  heapUsedFraction: number;
  heapUsedPercentText: string;
  nonHeapUsedBytes: number;
  nonHeapUsedText: string;

  physicalUsedBytes: number;
  physicalUsedText: string;
  physicalTotalBytes: number;
  physicalTotalText: string;
  physicalFreeBytes: number;
  physicalFreeText: string;
  physicalUsedFraction: number;
  physicalUsedPercentText: string;
  swapTotalBytes: number;
  swapTotalText: string;
  swapFreeBytes: number;
  swapFreeText: string;

  threadCount: number;
  gcCount: number;
  gcTimeMs: number;
  gcTimeText: string;

  // Rich per-pause GC statistics. Raw values (numbers) sort the table; *Text renders them.
  gcAvgPauseMs: number;
  gcAvgPauseText: string;
  gcMaxPauseMs: number;
  gcMaxPauseText: string;
  gcLastPauseMs: number;
  gcLastPauseText: string;
  gcLongPauseCount: number;
  gcLiveSetBytes: number;
  gcLiveSetText: string;
  gcLastCause: string;

  // Deterministic (LLM-free) GC verdict + the ready-to-paste "copy for LLM" block.
  gcHealthLevel: string; // OK / WARN / CRITICAL
  gcHealthSummary: string;
  gcHealthDetail: string;
  gcLlmPayload: string;
};

// Map the backend GC health level to a Cloudscape StatusIndicator type. Shared by the list table
// and the details panel so the two views can never drift.
export function gcHealthIndicatorType(level?: string): 'error' | 'warning' | 'success' {
  if (level === 'CRITICAL') {
    return 'error';
  }
  if (level === 'WARN') {
    return 'warning';
  }
  return 'success';
}

export type AgentInfo = {
  name: string;
  url: string;

  // /app-status
  reachable: boolean;
  error?: string;
  appInstanceName?: string;
  appVersion?: string;
  hostname?: string;
  port: number;
  uptimeMs: number;
  uptimeFormatted?: string;
  responseEpoch: number;
  responseId?: string;

  // control-plane services
  servicesTotal: number;
  servicesUp: number;
  servicesError?: string;
  services?: AgentServiceBrief[];

  // control-plane system/JVM metrics
  metrics?: AgentMetrics;
  metricsError?: string;
};

export type AgentListResponse = {
  agents: AgentInfo[];
};

export function useAgentList() {
  return useSWR('/agent/list', (url) => clientPost<AgentListResponse>({ url }));
}
