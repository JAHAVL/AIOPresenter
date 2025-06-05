import { ipcMain, dialog, BrowserWindow } from 'electron';

// Handler for requesting user input via a dialog box
export function setupInputHandlers(): void {
  console.log('[inputHandlers.ts] Setting up input IPC handlers...');
  // Check if handler is already registered
  if (ipcMain.eventNames().includes('request-user-input')) {
    console.log('[inputHandlers.ts] Handler for request-user-input already registered, skipping.');
    return;
  }
  ipcMain.handle('request-user-input', async (event: unknown, options: { title?: string, message?: string, defaultValue?: string }) => {
    console.log('[inputHandlers.ts] Handler for request-user-input called with options:', options);
    try {
      const { title = 'Input Required', message = 'Enter value:', defaultValue = '' } = options;
      // Find the focused window or main window to attach the dialog to
      const focusedWindow = BrowserWindow.getFocusedWindow();
      if (!focusedWindow) {
        console.error('[inputHandlers.ts] No focused window found for dialog.');
        return { success: false, error: 'No focused window available for dialog' };
      }
      
      // Send a message to the renderer process to show a custom input modal
      focusedWindow.webContents.send('show-input-modal', { title, message, defaultValue });
      
      // Wait for the renderer to respond with the user's input
      return new Promise((resolve) => {
        ipcMain.once('input-modal-response', (event: unknown, response: { success: boolean, value?: string, error?: string }) => {
          resolve(response);
        });
      });
    } catch (err: unknown) {
      console.error('Error in request-user-input handler:', err);
      return { success: false, error: String(err) };
    }
  });
  console.log('[inputHandlers.ts] Input IPC handlers setup complete.');
}
