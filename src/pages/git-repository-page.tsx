import { Button, Container, ContentLayout, KeyValuePairs, SpaceBetween } from '@cloudscape-design/components';
import { useQuery, useMutation } from '@tanstack/react-query';
import { LoadingHeader } from '@/components/common/loading-header';
import { remoteGitLog } from '@/remote/remote-git-log';
import GitCommitsTable from '@/components/git/git-commits-table';
import { GitPullRequest, GitPullResponse, remoteGitPull } from '@/remote/remote-git-pull';

export default function GitRepositoryPage() {
  const {
    isPending,
    data,
    isSuccess,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['/git/status'],
    queryFn: () => remoteGitLog(),
  });

  const mutation = useMutation<GitPullResponse>({
    mutationFn: (request : GitPullRequest) => remoteGitPull(request),
  });

  async function makeGitPull() {
    const request : GitPullRequest = {};
    const response : GitPullResponse = await mutation.mutateAsync(request);
    await refetch();
  }

  return (
    <ContentLayout
      header={(
        <LoadingHeader
          isPending={isPending || mutation.isPending}
          isFetching={isFetching}
          isError={isError}
          description="Git Repository Status"
          actions={<Button onClick={() => makeGitPull()}>Pull from Git Repo</Button>}
        >
          Git Repo
        </LoadingHeader>
      )}
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

        <GitCommitsTable commits={isSuccess ? data.commits : []} isLoading={isPending} />

      </SpaceBetween>

    </ContentLayout>
  );
}
