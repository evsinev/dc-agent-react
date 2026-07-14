import { CommandInfo } from '@/pages/command-list/api/command-list';
import { TableProps } from '@cloudscape-design/components/table';

// Every command config parameter that can appear in the /command/list `parameters` map.
// `visible` is the default column visibility; users can toggle the rest in Preferences.
// Cells are blank when a command lacks the param; sorting compares the string value.
type ParamColumn = { key: string; label: string; visible: boolean };

export const PARAM_COLUMNS: ParamColumn[] = [
  { key: 'jarFilename', label: 'Jar file', visible: true },
  { key: 'warFilename', label: 'War file', visible: false },
  { key: 'serviceName', label: 'Service', visible: true },
  { key: 'waitUrl', label: 'Wait URL', visible: true },
  { key: 'dir', label: 'Dir', visible: true },
  { key: 'extension', label: 'Extension', visible: true },
  { key: 'apiKeys', label: 'API keys', visible: true },
  { key: 'serviceDir', label: 'Service dir', visible: true },
  { key: 'serviceLogFile', label: 'Log file', visible: false },
  { key: 'serviceStartTimeout', label: 'Start timeout', visible: false },
  { key: 'serviceStopTimeout', label: 'Stop timeout', visible: false },
  { key: 'waitDuration', label: 'Wait duration', visible: false },
  { key: 'waitConnectTimeout', label: 'Wait connect timeout', visible: false },
  { key: 'waitReadTimeout', label: 'Wait read timeout', visible: false },
  { key: 'svcCommand', label: 'svc command', visible: false },
  { key: 'svstatCommand', label: 'svstat command', visible: false },
  { key: 'replaceDirChars', label: 'Replace dir chars', visible: false },
  { key: 'delete', label: 'Delete (mirror)', visible: false },
];

// Rendered with a custom cell in the table (status lookup), so it's not a generic param column.
export const SERVICE_STATE_COLUMN = { id: 'serviceState', label: 'Service state', visible: true };

// Generic column for a plain string parameter: display the value (blank when absent), sort by it.
// serviceName is NOT built through this — the table renders it as a link to the service.
export function genericParamColumn(col: ParamColumn): TableProps.ColumnDefinition<CommandInfo> {
  return {
    id: col.key,
    header: col.label,
    cell: (c) => c.parameters?.[col.key] ?? '',
    sortingComparator: (a, b) => (a.parameters?.[col.key] ?? '').localeCompare(b.parameters?.[col.key] ?? ''),
  };
}
