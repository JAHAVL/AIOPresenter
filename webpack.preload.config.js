const path = require('path');
const { merge } = require('webpack-merge');
const baseConfig = require('../webpack.config');

module.exports = merge(baseConfig, {
  entry: './src/preload/preload.ts',
  target: 'electron-preload',
  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  output: {
    path: path.resolve(__dirname, 'dist/preload'),
    filename: 'preload.js',
    clean: true,
  },
  resolve: {
    alias: {
      // Additional aliases specific to preload process
    },
  },
});

