const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { merge } = require('webpack-merge');
const baseConfig = require('../webpack.config');

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Set the dev server settings differently for development mode
const devServer = isDevelopment ? {
  static: path.join(__dirname, 'dist/renderer'),
  compress: true,
  port: 8080,
  hot: true,
  headers: {
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    // This is crucial - explicitly remove CSP headers in dev server
    'Content-Security-Policy': '',
  },
  historyApiFallback: true,
  devMiddleware: {
    publicPath: '/', // Explicitly set for devServer
    // Writing files to disk helps with HMR in Electron
    writeToDisk: true,
  },
} : {};

module.exports = merge(baseConfig, {
  cache: false, // Disable webpack's internal cache for the renderer
  entry: './src/renderer/index.tsx',
  target: 'web', // Using 'web' ensures proper browser environment
  mode: isDevelopment ? 'development' : 'production',
  output: {
    path: path.resolve(__dirname, 'dist/renderer'),
    filename: 'bundle.js',
    clean: true,
    publicPath: isDevelopment ? '/' : './',
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, 'src/'),
      '@renderer': path.resolve(__dirname, 'src/renderer/'),
      '@components': path.resolve(__dirname, 'src/renderer/components/'),
      '@icons': path.resolve(__dirname, 'src/renderer/widgets/PresentationWidget/assets/icons/'),
      '@theme': path.resolve(__dirname, 'src/renderer/widgets/PresentationWidget/theme/'),
      '@projectTypes': path.resolve(__dirname, 'src/renderer/widgets/PresentationWidget/types/'),
      '@PresentationWidgetMocks': path.resolve(__dirname, 'src/renderer/widgets/PresentationWidget/data/mockData/'),
      // Aliases from baseConfig like @utils and @shared will still apply unless overridden
    },
    fallback: {
      'fs': false,
      'path': require.resolve('path-browserify'),
      'os': require.resolve('os-browserify/browser'),
      'crypto': require.resolve('crypto-browserify'),
      'stream': require.resolve('stream-browserify'),
      'buffer': require.resolve('buffer/'),
      'process': require.resolve('process/browser'),
    },
    // extensions will be merged from baseConfig
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(isDevelopment ? 'development' : 'production')
    }),
    new HtmlWebpackPlugin({
      template: './src/renderer/index.html',
      // Pass development flag to template for dynamic CSP handling
      templateParameters: {
        isDevelopment: isDevelopment
      }
    }),
    isDevelopment && new ReactRefreshWebpackPlugin(),
  ].filter(Boolean),
  // Use the devServer configuration we defined above
  devServer,
});
