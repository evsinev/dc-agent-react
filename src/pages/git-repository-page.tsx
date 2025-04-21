import { LoadingHeader } from '@/components/common/loading-header';
import GitCommitsTable from '@/components/git/git-commits-table';
import { remoteGitLog } from '@/remote/remote-git-log';
import { GitPullResponse, remoteGitPull } from '@/remote/remote-git-pull';
import { Button, Container, ContentLayout, KeyValuePairs, SpaceBetween } from '@cloudscape-design/components';
import { useMutation, useQuery } from '@tanstack/react-query';

export default function GitRepositoryPage() {
  const { isPending, data, isSuccess, isFetching, isError, refetch } = useQuery({
    queryKey: ['/git/status'],
    queryFn: () => remoteGitLog(),
  });

  const mutation = useMutation<GitPullResponse>({
    mutationFn: () => remoteGitPull(),
  });

  async function makeGitPull() {
    await mutation.mutateAsync();
    await refetch();
  }

  return (
    <ContentLayout
      header={
        <LoadingHeader
          isPending={isPending || mutation.isPending}
          isFetching={isFetching}
          isError={isError}
          description="Git Repository Status"
          actions={<Button onClick={() => makeGitPull()}>Pull from Git Repo</Button>}
        >
          Git Repo
        </LoadingHeader>
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
          commits={isSuccess ? data.commits : []}
          isLoading={isPending}
        />
      </SpaceBetween>
    </ContentLayout>
  );
}
