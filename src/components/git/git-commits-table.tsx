import * as React from 'react';
import Table from '@cloudscape-design/components/table';
import { useCollection } from '@cloudscape-design/collection-hooks';
import { GitLogItem } from '@/remote/remote-git-status';

type GitCommitsTableProps = {
  commits: GitLogItem[],
  isLoading: boolean
};

function GitCommitsTable(props: GitCommitsTableProps) {
  const { items, collectionProps } = useCollection(
    props.commits,
    {
      sorting: {},
    },
  );
  return (
    <Table
      {...collectionProps}
      columnDefinitions={[
        {
          id: 'dateFormatted',
          header: 'Date',
          // eslint-disable-next-line
          cell: (item) => item.dateFormatted,
          sortingField: 'dateFormatted',
          isRowHeader: true,
        },
        {
          id: 'author',
          header: 'Author',
          // eslint-disable-next-line
          cell: item => item.author,
          sortingField: 'author',
        },
        {
          id: 'shortMessage',
          header: 'Message',
          // eslint-disable-next-line
          cell: item => item.shortMessage,
          sortingField: 'shortMessage',
        },
      ]}
      items={items}
      loadingText="Loading commits"
      trackBy="dateFormatted"
      loading={props.isLoading}
    />
  );
}

export default GitCommitsTable;
