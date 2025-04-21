import { remoteSend } from '@/remote/remote-send';

type AppViewRequest = {
  appName: string;
};

type AppViewResponse = {
  appName: string;
  taskName: string;
  taskType: string;
  taskHost: string;
  taskCheckText: string;
  taskCheckColor: string;
  jobCreatedDateFormatted: string;
  consumerKey: string;
  agentUrl: string;
};

export async function remoteAppView(request: AppViewRequest): Promise<AppViewResponse> {
  return remoteSend({ path: '/app/view', request });
}

export async function remoteAppPush(request: AppViewRequest): Promise<AppViewResponse> {
  return remoteSend({ path: '/app/push', request });
}
