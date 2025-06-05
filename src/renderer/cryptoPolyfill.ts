// Polyfill for crypto.getRandomValues in Electron renderer
if (typeof window !== 'undefined' && window.crypto && !window.crypto.getRandomValues) {
  window.crypto.getRandomValues = function<T extends ArrayBufferView | null>(arr: T): T {
    if (arr === null) {
      return null as T;
    }
    const buffer = new Uint8Array(arr.byteLength);
    for (let i = 0; i < buffer.length; i++) {
      buffer[i] = Math.floor(Math.random() * 256);
    }
    new Uint8Array(arr.buffer).set(buffer);
    return arr;
  };
}

console.log('Crypto polyfill applied.');
