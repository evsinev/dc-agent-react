import { CollectionPreferences, CollectionPreferencesProps } from '@cloudscape-design/components';

export const APP_PREFERENCES_STORAGE_KEY = 'app-list-preferences';

export const DEFAULT_APP_PREFERENCES: CollectionPreferencesProps.Preferences = {
  pageSize: 30,
  wrapLines: false,
  stripedRows: false,
  contentDensity: 'comfortable',
  stickyColumns: { first: 0, last: 0 },
  contentDisplay: [
    { id: 'appName', visible: true },
    { id: 'appStatus', visible: true },
    { id: 'taskHost', visible: true },
    { id: 'taskName', visible: true },
    { id: 'taskType', visible: true },
  ],
};

type Props = {
  preferences: CollectionPreferencesProps.Preferences;
  onConfirm: (preferences: CollectionPreferencesProps.Preferences) => void;
};

export default function AppTablePreferences(props: Props) {
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
          { value: 10, label: '10 applications' },
          { value: 30, label: '30 applications' },
          { value: 50, label: '50 applications' },
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
          { id: 'appName', label: 'App' },
          { id: 'appStatus', label: 'Status' },
          { id: 'taskHost', label: 'Host' },
          { id: 'taskName', label: 'Task Name' },
          { id: 'taskType', label: 'Task Type' },
        ],
      }}
    />
  );
}
