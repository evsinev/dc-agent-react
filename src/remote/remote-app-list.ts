import { remoteSend } from '@/remote/remote-send';

export type AppListItem = {
  appName: string;
  taskName: string;
  taskHost: string;
  taskType: string;
};

type AppListResponse = {
  apps: AppListItem[];
};

export async function remoteAppList() : Promise<AppListResponse> {
  return remoteSend({ path: '/app/list' });
}
