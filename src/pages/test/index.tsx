import { useWindowCallbacks } from '@/hooks/use-window-callbacks';
import Header from '@cloudscape-design/components/header';

export default function TestPage() {
  const data = useWindowCallbacks();

  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  console.log('data', data);

  return (
    <div>
      <Header variant="h1">Test Page</Header>
    </div>
  );
}
