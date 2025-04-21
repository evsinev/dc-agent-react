import { Button, Container, ContentLayout, KeyValuePairs, SpaceBetween } from '@cloudscape-design/components';
import { useGitLog } from './api/git-log';
import { useGitPull } from './api/git-pull';
import GitCommitsTable from './components/git-commits-table';
import Header from './components/header';

export default function Git() {
  const { data, isLoading, mutate, error } = useGitLog();
  const { isMutating, trigger } = useGitPull();

  async function makeGitPull() {
    await trigger();
    await mutate();
  }

  const loading = isLoading || isLoading;

  return (
    <ContentLayout
      header={
        <Header
          isLoading={loading}
          isError={!!error}
          description="Git Repository Status"
          actions={<Button onClick={makeGitPull}>Pull from Git Repo</Button>}
        >
          Git Repo
        </Header>
      }
    >
      <SpaceBetween size="xl">
        <Container>
          <KeyValuePairs
            columns={3}
            items={[
              {
                label: 'Current Branch',
                value: data?.currentBranch,
              },

              {
                label: 'Updated',
                value: data?.lastCommit.ageFormatted,
              },
            ]}
          />
        </Container>

        <GitCommitsTable
          commits={data?.commits ?? []}
          isLoading={isMutating}
        />
      </SpaceBetween>
    </ContentLayout>
  );
}
