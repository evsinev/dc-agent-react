import { useBuildInfo, useOperatorInfo } from '@/app/api/operator-info';
import { Box } from '@cloudscape-design/components';

type ViewProps = {
  frontend: string;
  backend: string;
};

// Presentational (testable): two muted rows pinned to the bottom of the nav panel.
export function VersionFooterView({ frontend, backend }: ViewProps) {
  return (
    <div
      style={{
        marginTop: 'auto',
        padding: '12px 20px',
        borderTop: '1px solid var(--color-border-divider-default, rgba(128, 128, 128, 0.3))',
      }}
    >
      <VersionRow
        label="frontend"
        value={frontend}
      />
      <VersionRow
        label="backend"
        value={backend}
      />
    </div>
  );
}

function VersionRow({ label, value }: { label: string; value: string }) {
  return (
    <Box
      fontSize="body-s"
      color="text-body-secondary"
    >
      <span style={{ display: 'inline-block', width: 68 }}>{label}</span>
      <span>{value}</span>
    </Box>
  );
}

export default function VersionFooter() {
  const { data: buildInfo } = useBuildInfo();
  const { data: operatorInfo } = useOperatorInfo();

  const frontendVersion = buildInfo?.version ?? process.env.PUBLIC_APP_VERSION ?? 'dev';
  const commit = buildInfo?.commit ? ` (${buildInfo.commit.slice(0, 7)})` : '';
  const backendVersion = operatorInfo?.version ?? '—';

  return (
    <VersionFooterView
      frontend={`${frontendVersion}${commit}`}
      backend={backendVersion}
    />
  );
}
