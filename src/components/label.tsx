import { Box } from '@cloudscape-design/components';
import { ReactNode } from 'react';

type Props = {
  label: string;
  children: ReactNode;
};

export default function Label(props: Props) {
  return (
    <div>
      <Box variant="awsui-key-label">{props.label}</Box>
      <div>{props.children}</div>
    </div>
  );
}
