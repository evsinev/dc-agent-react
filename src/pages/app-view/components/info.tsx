import { Spinner } from '@cloudscape-design/components';
import { useAppInfo } from '../api/app-view';

export default function Info({ appName }: { appName: string }) {
  const { data, isLoading } = useAppInfo({ appName });

  if (isLoading) return <Spinner />;

  if (!data) return null;

  // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
  return <div dangerouslySetInnerHTML={{ __html: data }} />;
}
