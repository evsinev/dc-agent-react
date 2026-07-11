import { useDocumentTitle } from '@/hooks/use-document-title';
import Header from '@cloudscape-design/components/header';
import LogsArea from './components/logs-area';

export default function Logs() {
  useDocumentTitle('Logs');
  return (
    <div>
      <Header variant="h1">Logs</Header>
      <LogsArea />
    </div>
  );
}
