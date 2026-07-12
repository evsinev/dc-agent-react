import { Box, Button, SpaceBetween } from '@cloudscape-design/components';

type Props = {
  branch: string;
  updatedLabel: string;
  isPulling: boolean;
  onPull: () => void;
  onRefresh: () => void;
};

/**
 * Actions cluster for the Applications table header: a muted git-status hint, a
 * plain refresh button, and the "Pull from Git" shortcut (see the design in
 * handoffs/design_handoff_git_quick_pull).
 */
export default function AppListActions(props: Props) {
  return (
    <SpaceBetween
      direction="horizontal"
      size="xs"
      alignItems="center"
    >
      {props.branch && (
        <Box
          color="text-status-inactive"
          fontSize="body-s"
        >
          {props.branch} · updated {props.updatedLabel}
        </Box>
      )}
      <Button
        variant="icon"
        iconName="refresh"
        ariaLabel="Refresh list"
        onClick={props.onRefresh}
      />
      <Button
        iconName="download"
        loading={props.isPulling}
        loadingText="Pulling"
        onClick={props.onPull}
      >
        Pull from Git
      </Button>
    </SpaceBetween>
  );
}
