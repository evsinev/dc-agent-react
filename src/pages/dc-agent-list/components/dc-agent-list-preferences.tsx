import { CollectionPreferences, CollectionPreferencesProps } from '@cloudscape-design/components';

export const AGENT_PREFERENCES_STORAGE_KEY = 'dc-agent-list-preferences';

export const DEFAULT_AGENT_PREFERENCES: CollectionPreferencesProps.Preferences = {
  pageSize: 30,
  wrapLines: false,
  stripedRows: false,
  contentDensity: 'comfortable',
  stickyColumns: { first: 0, last: 0 },
  contentDisplay: [
    { id: 'name', visible: true },
    { id: 'reachable', visible: true },
    { id: 'appInstanceName', visible: true },
    { id: 'appVersion', visible: true },
    { id: 'hostname', visible: true },
    { id: 'port', visible: false },
    { id: 'services', visible: true },
    { id: 'uptime', visible: true },
    { id: 'systemCpu', visible: true },
    { id: 'processCpu', visible: false },
    { id: 'loadAvg', visible: false },
    { id: 'heapUsed', visible: true },
    { id: 'heapPct', visible: false },
    { id: 'memUsed', visible: true },
    { id: 'memPct', visible: false },
    { id: 'threads', visible: true },
    { id: 'gcTime', visible: false },
    { id: 'gcHealth', visible: true },
    { id: 'gcMaxPause', visible: false },
    { id: 'gcLastPause', visible: false },
    { id: 'liveSet', visible: false },
    { id: 'url', visible: false },
  ],
};

type Props = {
  preferences: CollectionPreferencesProps.Preferences;
  onConfirm: (preferences: CollectionPreferencesProps.Preferences) => void;
};

export default function DcAgentTablePreferences(props: Props) {
  return (
    <CollectionPreferences
      title="Preferences"
      confirmLabel="Confirm"
      cancelLabel="Cancel"
      preferences={props.preferences}
      onConfirm={({ detail }) => props.onConfirm(detail)}
      pageSizePreference={{
        title: 'Page size',
        options: [
          { value: 10, label: '10 agents' },
          { value: 30, label: '30 agents' },
          { value: 50, label: '50 agents' },
        ],
      }}
      wrapLinesPreference={{
        label: 'Wrap lines',
        description: 'Select to see all the text and wrap the lines',
      }}
      stripedRowsPreference={{
        label: 'Striped rows',
        description: 'Select to add alternating shaded rows',
      }}
      contentDensityPreference={{
        label: 'Compact mode',
        description: 'Select to display content in a denser, more compact mode',
      }}
      stickyColumnsPreference={{
        firstColumns: {
          title: 'Stick first column(s)',
          description: 'Keep the first column(s) visible while horizontally scrolling the table content.',
          options: [
            { label: 'None', value: 0 },
            { label: 'First column', value: 1 },
            { label: 'First two columns', value: 2 },
          ],
        },
        lastColumns: {
          title: 'Stick last column',
          description: 'Keep the last column visible while horizontally scrolling the table content.',
          options: [
            { label: 'None', value: 0 },
            { label: 'Last column', value: 1 },
          ],
        },
      }}
      contentDisplayPreference={{
        title: 'Column preferences',
        description: 'Customize the visibility and order of the columns.',
        options: [
          { id: 'name', label: 'Agent' },
          { id: 'reachable', label: 'Status' },
          { id: 'appInstanceName', label: 'Instance' },
          { id: 'appVersion', label: 'Version' },
          { id: 'hostname', label: 'Reported host' },
          { id: 'port', label: 'Port' },
          { id: 'services', label: 'Services' },
          { id: 'uptime', label: 'Uptime' },
          { id: 'systemCpu', label: 'System CPU' },
          { id: 'processCpu', label: 'Process CPU' },
          { id: 'loadAvg', label: 'Load average' },
          { id: 'heapUsed', label: 'Heap used' },
          { id: 'heapPct', label: 'Heap %' },
          { id: 'memUsed', label: 'Memory used' },
          { id: 'memPct', label: 'Memory %' },
          { id: 'threads', label: 'Threads' },
          { id: 'gcTime', label: 'GC time' },
          { id: 'gcHealth', label: 'GC health' },
          { id: 'gcMaxPause', label: 'GC max pause' },
          { id: 'gcLastPause', label: 'GC last pause' },
          { id: 'liveSet', label: 'Live set' },
          { id: 'url', label: 'URL' },
        ],
      }}
    />
  );
}
