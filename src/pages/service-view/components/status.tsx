import { ServiceView } from '@/pages/service-view/api/service-view';
import { ColumnLayout, Container, Header, SpaceBetween, StatusIndicator } from '@cloudscape-design/components';
import Label from './label';

export default function Status(props: ServiceView) {
  return (
    <ColumnLayout
      columns={3}
      minColumnWidth={300}
    >
      <Container header={<Header headingTagOverride="h3">Service</Header>}>
        <SpaceBetween size="l">
          <Label label="Service">{props.service.serviceName}</Label>
          <Label label="Host">{props.service.host}</Label>
          <Label label="Status">
            <StatusIndicator type={props.service.statusIndicator}>{props.service.statusName}</StatusIndicator>
          </Label>
          <Label label="Age">{props.service.ageFormatted}</Label>
        </SpaceBetween>
      </Container>
      <Container header={<Header headingTagOverride="h3">Supervise status</Header>}>
        <SpaceBetween size="l">
          <Label label="PID">{props.service.serviceStatus.pid}</Label>
          <Label label="Supervise">{props.service.serviceStatus.superviseState}</Label>
          <Label label="State">{props.service.serviceStatus.state}</Label>
          <Label label="When">{props.service.whenFormatted}</Label>
        </SpaceBetween>
      </Container>
    </ColumnLayout>
  );
}
