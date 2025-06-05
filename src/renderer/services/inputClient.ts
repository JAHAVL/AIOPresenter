// src/renderer/services/inputClient.ts

// Local ElectronWindow interface and declaration removed.
// Global type from preload.d.ts will be used for window.electronAPI.

/**
 * Requests user input through the main process using IPC.
 * @param title The title of the input dialog.
 * @param message The message or prompt text for the input.
 * @param defaultValue The default value in the input field (optional).
 * @returns A promise with the user's input value or an error.
 */
export async function requestUserInput(
  title: string,
  message: string,
  defaultValue: string = ''
): Promise<{ success: boolean; value?: string; error?: string }> {
  console.log('[IPC CLIENT] Requesting user input...');
  try {
    const response = await window.electronAPI.invoke('request-user-input', {
      title,
      message,
      defaultValue
    });
    console.log('[IPC CLIENT] Received user input response:', response);
    return response;
  } catch (error) {
    console.error('[IPC CLIENT] Error requesting user input:', error);
    return { success: false, error: String(error) };
  }
}
