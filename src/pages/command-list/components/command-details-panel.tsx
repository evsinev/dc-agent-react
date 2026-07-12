import { CommandInfo } from '@/pages/command-list/api/command-list';
import {
  Box,
  ColumnLayout,
  Container,
  Header,
  KeyValuePairs,
  SpaceBetween,
  StatusIndicator,
} from '@cloudscape-design/components';
import routing from '@routing';
import { Link } from 'react-router';

type Props = {
  command: CommandInfo;
};

export default function CommandDetailsPanel({ command }: Props) {
  const parameterItems = Object.entries(command.parameters ?? {}).map(([key, value]) => ({ label: key, value }));

  return (
    <SpaceBetween size="l">
      <ColumnLayout
        columns={2}
        variant="text-grid"
      >
        <Container header={<Header headingTagOverride="h3">Command</Header>}>
          <KeyValuePairs
            columns={1}
            items={[
              {
                label: 'Host',
                value: <Link to={routing.agent.replace(':name', command.host)}>{command.host}</Link>,
              },
              { label: 'Command', value: command.name ?? '—' },
              { label: 'Type', value: command.type ?? '—' },
            ]}
          />
        </Container>

        <Container header={<Header headingTagOverride="h3">Status</Header>}>
          <KeyValuePairs
            columns={1}
            items={[
              {
                label: 'State',
                value: command.error ? (
                  <StatusIndicator type="error">{command.error}</StatusIndicator>
                ) : (
                  <StatusIndicator type="success">Configured</StatusIndicator>
                ),
              },
            ]}
          />
        </Container>
      </ColumnLayout>

      <Container header={<Header headingTagOverride="h3">Parameters</Header>}>
        {parameterItems.length > 0 ? (
          <KeyValuePairs
            columns={2}
            items={parameterItems}
          />
        ) : (
          <Box variant="p">No parameters</Box>
        )}
      </Container>
    </SpaceBetween>
  );
}
