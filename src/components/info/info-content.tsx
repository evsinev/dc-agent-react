import { Spinner } from '@cloudscape-design/components';
import { useAppInfo } from './api/info';

interface Props {
  infoKey: string;
}

export default function InfoContent({ infoKey }: Props) {
  const { data, isLoading } = useAppInfo({ infoKey });

  if (isLoading) return <Spinner />;

  if (!data) return null;

  // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
  return <div dangerouslySetInnerHTML={{ __html: data }} />;
}
