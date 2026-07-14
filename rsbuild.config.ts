import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { devMockMiddleware } from './mock/dev-mock-middleware';

// `yarn dev:mock` sets MOCK=true to serve fixture data and run the UI without a backend.
const useMock = process.env.MOCK === 'true' || process.env.MOCK === '1';

// Baked-in fallback frontend version for the nav footer (official releases override this at runtime via
// dist/build-info.json). Prefer an explicit override, then the git tag (`v1.2.0`, or `v1.2.0-3-gabc1234`
// when HEAD is past the tag, `-dirty` if the tree is modified), then package.json, then 'dev'.
function resolveAppVersion(): string {
  if (process.env.PUBLIC_APP_VERSION) {
    return process.env.PUBLIC_APP_VERSION;
  }
  try {
    return execSync('git describe --tags --always --dirty', {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    /* no git / no tags — fall through to package.json */
  }
  try {
    return JSON.parse(readFileSync('./package.json', 'utf-8')).version as string;
  } catch {
    return 'dev';
  }
}

const appVersion = resolveAppVersion();

export default defineConfig({
  plugins: [pluginReact()],
  output: {
    distPath: {
      js: '',
      css: '',
      html: '',
    },
    filename: {
      js: '[name].js',
      css: '[name].css',
    },
    legalComments: 'none',
  },
  source: {
    entry: {
      index: './src/app/index.tsx',
    },
    define: {
      'process.env.PUBLIC_APP_VERSION': JSON.stringify(appVersion),
    },
  },
  resolve: {
    alias: {
      '@': './src',
      '@routing': './src/app/router/config.ts',
    },
  },
  performance: {
    chunkSplit: {
      strategy: 'all-in-one',
    },
  },
  html: {
    template: './src/app/static/index.html',
  },
  server: {
    // Serve the dev/preview server under the router basename so http://localhost:3000/dc-operator works.
    base: '/dc-operator',
    proxy: {
      '/dc-operator/api': 'http://localhost:8052',
    },
  },
  dev: useMock
    ? {
        setupMiddlewares: [
          (middlewares) => {
            middlewares.unshift(devMockMiddleware);
          },
        ],
      }
    : undefined,
});
