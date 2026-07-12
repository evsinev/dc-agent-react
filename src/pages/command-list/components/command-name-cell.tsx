import { CommandInfo } from '@/pages/command-list/api/command-list';
import { StatusIndicator } from '@cloudscape-design/components';
import routing from '@routing';
import { ReactNode } from 'react';
import { Link } from 'react-router';

// Renders a command's name as a link to its detail page. Error rows (no name) show the error.
export function commandNameCell(command: CommandInfo): ReactNode {
  if (command.error) {
    return <StatusIndicator type="error">{command.error}</StatusIndicator>;
  }
  if (!command.name) {
    return '—';
  }
  return <Link to={routing.command.replace(':host/:name', `${command.host}/${command.name}`)}>{command.name}</Link>;
}
