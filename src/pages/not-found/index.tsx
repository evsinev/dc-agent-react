import { useDocumentTitle } from '@/hooks/use-document-title';
import { Box } from '@cloudscape-design/components';
import Header from '@cloudscape-design/components/header';

export default function NotFound() {
  useDocumentTitle('Not found');
  return (
    <>
      <Header variant="h1">Not found</Header>
      <Box>Page not found</Box>
    </>
  );
}
