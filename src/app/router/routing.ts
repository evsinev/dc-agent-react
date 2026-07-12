const routing = {
  apps: '/',
  app: '/apps/:appName',
  services: '/services',
  service: '/services/:host/:serviceName',
  git: '/git',
  logs: '/logs',
  test: '/test',
  agents: '/dc-agents',
  agent: '/dc-agents/:name',
};

export default routing;
