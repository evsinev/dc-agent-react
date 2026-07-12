import Label from '@/components/label';
import { CommandInfo } from '@/pages/command-list/api/command-list';
import { ColumnLayout, Container, Header, SpaceBetween, StatusIndicator } from '@cloudscape-design/components';
import routing from '@routing';
import { Link } from 'react-router';

type Props = {
  command: CommandInfo;
};

export default function CommandDetailsPanel({ command }: Props) {
  return (
    <SpaceBetween size="l">
      <ColumnLayout
        columns={2}
        variant="text-grid"
      >
        <Container header={<Header headingTagOverride="h3">Command</Header>}>
          <SpaceBetween size="l">
            <Label label="Host">
              <Link to={routing.agent.replace(':name', command.host)}>{command.host}</Link>
            </Label>
            <Label label="Command">{command.name ?? '—'}</Label>
            <Label label="Type">{command.type ?? '—'}</Label>
          </SpaceBetween>
        </Container>

        <Container header={<Header headingTagOverride="h3">Status</Header>}>
          <SpaceBetween size="l">
            <Label label="State">
              {command.error ? (
                <StatusIndicator type="error">{command.error}</StatusIndicator>
              ) : (
                <StatusIndicator type="success">Configured</StatusIndicator>
              )}
            </Label>
          </SpaceBetween>
        </Container>
      </ColumnLayout>
    </SpaceBetween>
  );
}
