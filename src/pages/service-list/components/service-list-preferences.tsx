import { CollectionPreferences, CollectionPreferencesProps } from '@cloudscape-design/components';

export const SERVICE_PREFERENCES_STORAGE_KEY = 'service-list-preferences';

export const DEFAULT_SERVICE_PREFERENCES: CollectionPreferencesProps.Preferences = {
  pageSize: 30,
  wrapLines: false,
  stripedRows: false,
  contentDensity: 'comfortable',
  stickyColumns: { first: 0, last: 0 },
  contentDisplay: [
    { id: 'serviceName', visible: true },
    { id: 'host', visible: true },
    { id: 'statusName', visible: true },
    { id: 'ageFormatted', visible: true },
  ],
};

type Props = {
  preferences: CollectionPreferencesProps.Preferences;
  onConfirm: (preferences: CollectionPreferencesProps.Preferences) => void;
};

export default function ServiceTablePreferences(props: Props) {
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
          { value: 10, label: '10 services' },
          { value: 30, label: '30 services' },
          { value: 50, label: '50 services' },
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
          { id: 'serviceName', label: 'Service' },
          { id: 'host', label: 'Host' },
          { id: 'statusName', label: 'State' },
          { id: 'ageFormatted', label: 'Age' },
        ],
      }}
    />
  );
}
