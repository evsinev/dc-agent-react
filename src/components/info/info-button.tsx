import { useHelpPanel } from '@/hooks/use-help-panel';
import { Button } from '@cloudscape-design/components';
import InfoContent from './info-content';

interface Props {
  infoKey: string;
  infoTitle: string;
}

export default function InfoButton(props: Props) {
  const { show, hide, panel } = useHelpPanel();

  const showPanel = () =>
    show({
      content: <InfoContent infoKey={props.infoKey} />,
      title: props.infoTitle,
    });

  return (
    <Button
      variant="link"
      onClick={panel ? hide : showPanel}
    >
      Info
    </Button>
  );
}
