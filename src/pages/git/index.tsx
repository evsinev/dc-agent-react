import DefinitionList from '@/components/definition-list';
import LoadError, { errorMessage } from '@/components/error/components/load-error';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { useNotifications } from '@/hooks/use-notifications';
import { Button, Container, ContentLayout, SpaceBetween } from '@cloudscape-design/components';
import { useGitLog } from './api/git-log';
import { useGitPull } from './api/git-pull';
import GitCommitsTable from './components/git-commits-table';
import Header from './components/header';

export default function Git() {
  useDocumentTitle('Git repo');
  const { data, isLoading, mutate, error } = useGitLog();
  const { isMutating, trigger } = useGitPull();
  const notify = useNotifications((state) => state.add);

  async function makeGitPull() {
    try {
      await trigger();
      await mutate();
    } catch (pullError) {
      notify({
        id: 'git-pull',
        type: 'error',
        header: 'Pull failed',
        content: errorMessage(pullError),
        statusIconAriaLabel: 'error',
        buttonText: 'Retry',
        onButtonClick: makeGitPull,
      });
    }
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
      {error ? (
        <LoadError
          error={error}
          onRetry={() => mutate()}
          resource="the git repository"
        />
      ) : (
        <SpaceBetween size="xl">
          <Container>
            <DefinitionList
              columns={3}
              ariaLabel="Git repository"
              termWidth="140px"
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
      )}
    </ContentLayout>
  );
}
