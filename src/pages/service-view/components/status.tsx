import { ServiceView } from '@/pages/service-view/api/service-view';
import { ColumnLayout, Container, Header, KeyValuePairs, StatusIndicator } from '@cloudscape-design/components';

export default function Status(props: ServiceView) {
  return (
    <ColumnLayout
      columns={3}
      minColumnWidth={300}
    >
      <Container header={<Header headingTagOverride="h3">Service</Header>}>
        <KeyValuePairs
          columns={1}
          items={[
            { label: 'Service', value: props.service.serviceName },
            { label: 'Host', value: props.service.host },
            {
              label: 'Status',
              value: <StatusIndicator type={props.service.statusIndicator}>{props.service.statusName}</StatusIndicator>,
            },
            { label: 'Age', value: props.service.ageFormatted },
          ]}
        />
      </Container>
      <Container header={<Header headingTagOverride="h3">Supervise status</Header>}>
        <KeyValuePairs
          columns={1}
          items={[
            { label: 'PID', value: props.service.serviceStatus.pid },
            { label: 'Supervise', value: props.service.serviceStatus.superviseState },
            { label: 'State', value: props.service.serviceStatus.state },
            { label: 'When', value: props.service.whenFormatted },
          ]}
        />
      </Container>
    </ColumnLayout>
  );
}
