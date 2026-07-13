import { readFileSync } from 'node:fs';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { devMockMiddleware } from './mock/dev-mock-middleware';

// `yarn dev:mock` sets MOCK=true to serve fixture data and run the UI without a backend.
const useMock = process.env.MOCK === 'true' || process.env.MOCK === '1';

// Baked-in fallback frontend version (the released version comes from dist/build-info.json at runtime).
const appVersion = JSON.parse(readFileSync('./package.json', 'utf-8')).version as string;

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
