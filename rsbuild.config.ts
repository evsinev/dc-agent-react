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
    alias: {
      '@': './src',
    },
    // include: [
    //   /[\\/]node_modules[\\/]@cloudscape-design[\\/]/,
    // ],
  },
  performance: {
    chunkSplit: {
      strategy: 'all-in-one',
    },
  },
  html: {
    template: './static/index.html',
  },
  server: {
    proxy: {
      '/dc-operator/api': 'http://localhost:8052',
    },
  },
});
