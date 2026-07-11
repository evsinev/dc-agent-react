import type { IncomingMessage, ServerResponse } from 'node:http';
import { APPS, GIT_LOG, SERVICES, appStatusFor, appViewFor, serviceViewFor } from './mock-data';

// Requests are issued as `${PUBLIC_API_BASE_URL}${path}`; PUBLIC_API_BASE_URL is `/dc-operator/api`.
const API_PREFIX = '/dc-operator/api';

function json(res: ServerResponse, body: unknown, status = 200): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

/**
 * Dev-only mock for the dc-agent backend so the UI runs offline (see `yarn dev:mock`).
 * Matches the `clientPost` endpoints; everything else falls through to the normal pipeline.
 */
export function devMockMiddleware(req: IncomingMessage, res: ServerResponse, next: () => void): void {
  const path = (req.url ?? '').split('?')[0];

  if (!path.startsWith(API_PREFIX)) {
    next();
    return;
  }

  const endpoint = path.slice(API_PREFIX.length);

  // Static endpoints.
  if (endpoint === '/app/list') {
    json(res, { apps: APPS });
    return;
  }
  if (endpoint === '/service/list') {
    json(res, { services: SERVICES });
    return;
  }
  if (endpoint === '/git/log') {
    json(res, GIT_LOG);
    return;
  }
  if (endpoint === '/git/pull') {
    json(res, { success: true });
    return;
  }
  if (endpoint === '/app/push') {
    json(res, appViewFor('hello-world'));
    return;
  }

  // Dynamic endpoints — the trailing segment(s) carry the id (fqsn may contain a slash).
  if (endpoint.startsWith('/app/status/')) {
    json(res, appStatusFor(decodeURIComponent(endpoint.slice('/app/status/'.length))));
    return;
  }
  if (endpoint.startsWith('/app/view/')) {
    json(res, appViewFor(decodeURIComponent(endpoint.slice('/app/view/'.length))));
    return;
  }
  if (endpoint.startsWith('/service/send-action/')) {
    json(res, true);
    return;
  }
  if (endpoint.startsWith('/service/view/')) {
    json(res, serviceViewFor(decodeURIComponent(endpoint.slice('/service/view/'.length))));
    return;
  }

  // Known-prefix but unmapped — surface it instead of silently proxying to a dead backend.
  json(res, { title: 'Mock endpoint not found', type: 'MockError', detail: { path: endpoint } }, 404);
}
