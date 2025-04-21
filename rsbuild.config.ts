import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

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
    proxy: {
      '/dc-operator/api': 'http://localhost:8052',
    },
  },
});
