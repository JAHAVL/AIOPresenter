const path = require('path');
const webpack = require('webpack'); // Import webpack
const { merge } = require('webpack-merge');
const baseConfig = require('../webpack.config');

module.exports = merge(baseConfig, {
  cache: false, // Disable webpack's internal cache
  entry: './src/main/main.ts',
  target: 'electron-main',
  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  output: {
    path: path.resolve(__dirname, 'dist/main'),
    filename: 'main.js',
    clean: true,
  },
  resolve: {
    alias: {
      // Additional aliases specific to main process
      '@utils': path.resolve(__dirname, 'src/utils'),
      // Ensure other aliases from baseConfig are merged if needed, or redefine them here if they are different for main process
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'WEBPACK_DEV_SERVER_URL': JSON.stringify(process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : '')
    })
  ],
});
