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
          { value: 10, label: '10 dc-agents' },
          { value: 30, label: '30 dc-agents' },
          { value: 50, label: '50 dc-agents' },
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
          { id: 'url', label: 'URL' },
        ],
      }}
    />
  );
}
