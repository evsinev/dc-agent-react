import { useCollection } from '@cloudscape-design/collection-hooks';
import Table from '@cloudscape-design/components/table';
import { GitLogItem } from '../api/git-log';

type GitCommitsTableProps = {
  commits: GitLogItem[];
  isLoading: boolean;
};

export default function GitCommitsTable(props: GitCommitsTableProps) {
  const { items, collectionProps } = useCollection(props.commits, {
    sorting: {},
  });

  return (
    <Table
      {...collectionProps}
      columnDefinitions={[
        {
          id: 'dateFormatted',
          header: 'Date',
          cell: (item) => item.dateFormatted,
          sortingField: 'dateFormatted',
          isRowHeader: true,
        },
        {
          id: 'author',
          header: 'Author',
          cell: (item) => item.author,
          sortingField: 'author',
        },
        {
          id: 'shortMessage',
          header: 'Message',
          cell: (item) => item.shortMessage,
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
