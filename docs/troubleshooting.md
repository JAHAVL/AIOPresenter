# Troubleshooting Common Electron Build and Loading Issues

## Issue: `net::ERR_FILE_NOT_FOUND` for `bundle.js` (or other assets)

**Symptoms:**

*   The Electron application window loads, but the renderer content (your React app) is blank or shows an error.
*   Opening Electron's DevTools (usually Ctrl+Shift+I or Cmd+Option+I) shows a console error similar to: `Failed to load resource: net::ERR_FILE_NOT_FOUND` for `bundle.js` or other assets like CSS files or images.
*   This error typically occurs when Electron attempts to load the `index.html` file directly from the filesystem (e.g., using `mainWindow.loadFile()`), which happens in production builds or if the webpack dev server is not running/accessible during development.

**Cause:**

The primary cause is an incorrect `publicPath` configuration in your `webpack.renderer.config.js` file.

1.  **Webpack's `output.publicPath`:** This setting dictates the base path for all assets (JavaScript bundles, CSS files, images, fonts) that Webpack processes and includes in your `index.html`.
2.  **Absolute vs. Relative Paths:**
    *   If `publicPath` is set to an absolute path like `'/'` (e.g., `output: { publicPath: '/' }`), Webpack will generate asset links in `index.html` like `<script src="/bundle.js">`.
    *   When `index.html` is loaded via a web server (e.g., `http://localhost:8080` from `webpack-dev-server`), the browser correctly interprets `/bundle.js` as `http://localhost:8080/bundle.js`.
    *   However, when `index.html` is loaded via the `file:///` protocol (e.g., `file:///path/to/your/project/dist/renderer/index.html`), the browser interprets `/bundle.js` as `file:///bundle.js` (i.e., at the absolute root of your computer's filesystem). This is incorrect, as `bundle.js` is located relative to `index.html`.

**Solution:**

Change `output.publicPath` in `webpack.renderer.config.js` to be relative:

```javascript
// AIOPRESENTER/webpack.renderer.config.js

module.exports = {
  // ... other configurations
  output: {
    path: path.resolve(__dirname, 'dist/renderer'),
    filename: 'bundle.js',
    publicPath: './', // <--- CHANGE THIS
    clean: true,
  },
  // ... other configurations
};
```

By setting `publicPath: './'`, Webpack will generate relative paths in `index.html`, such as `<script src="./bundle.js">`. This relative path works correctly for both:
*   Loading via a web server (`http://localhost:8080/./bundle.js`).
*   Loading via the `file:///` protocol (`file:///path/to/your/project/dist/renderer/./bundle.js`).

**Verification Steps After Applying the Fix:**

1.  **Stop any running Electron app instances.**
2.  **Clean your build directory:**
    ```bash
    rm -rf dist  # Or your configured output directory
    ```
3.  **Rebuild your application:**
    ```bash
    npm run build
    ```
4.  **Start your application:**
    ```bash
    npm start
    ```
5.  Check the Electron DevTools console to ensure the `net::ERR_FILE_NOT_FOUND` error is gone and your application loads correctly.

This configuration ensures that your Electron application can reliably load its renderer assets whether it's running from a development server or as a packaged application.
