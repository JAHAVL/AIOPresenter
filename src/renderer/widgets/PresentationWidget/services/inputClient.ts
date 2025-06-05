// src/renderer/widgets/PresentationWidget/services/inputClient.ts

// Local ElectronWindow interface and declaration removed.
// Global type from preload.d.ts will be used for window.electronAPI.

interface IpcResponse<T> {
  success: boolean;
  value?: T;
  error?: string;
}

/**
 * Requests user input through the main process using IPC.
 * @param title The title of the input dialog.
 * @param message The message or prompt text for the input.
 * @param defaultValue The default value in the input field.
 * @returns A promise with the user's input value or an error.
 */
export async function requestUserInput(
  title: string,
  message: string,
  defaultValue: string
): Promise<IpcResponse<string>> {
  try {
    console.log('[IPC CLIENT] Requesting user input...');
    // Use the electronAPI object from the preload script
    const response: IpcResponse<string> = await window.electronAPI.invoke('request-user-input', { title, message, defaultValue });
    console.log('[IPC CLIENT] Received user input response:', response);
    if (!response.success && response.error?.includes('Direct input dialog not supported')) {
      // Since Electron dialog doesn't support input and prompt() is not available in Electron renderer,
      // we can't use browser prompt as a fallback. For now, return the default value as a placeholder.
      console.log('[IPC CLIENT] Electron dialog input not supported and prompt() not available. Returning default value as placeholder.');
      return { success: true, value: defaultValue };
    }
    return response;
  } catch (error) {
    console.error('[IPC CLIENT] Error requesting user input:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
