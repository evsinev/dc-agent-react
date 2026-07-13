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
  commands: '/commands',
  commandCreate: '/commands/create',
  command: '/commands/:host/:name',
  commandEdit: '/commands/:host/:name/edit',
};

export default routing;
