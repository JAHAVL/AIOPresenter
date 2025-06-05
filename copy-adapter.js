// Simple script to copy the store-adapter.js file to the dist directory
const fs = require('fs');
const path = require('path');

// Ensure the target directory exists
const targetDir = path.join(__dirname, 'dist/main/utils');
if (!fs.existsSync(targetDir)) {
  console.log(`Creating directory: ${targetDir}`);
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copy the file
const sourceFile = path.join(__dirname, 'src/main/utils/store-adapter.js');
const targetFile = path.join(targetDir, 'store-adapter.js');

console.log(`Copying: ${sourceFile} -> ${targetFile}`);
fs.copyFileSync(sourceFile, targetFile);
console.log('store-adapter.js copied successfully');

// Copy StorageService.js
const sourceFileStorageService = path.join(__dirname, 'src/main/StorageService.js');
const targetDirStorageService = path.join(__dirname, 'dist/main'); // Target directory is dist/main
const targetFileStorageService = path.join(targetDirStorageService, 'StorageService.js');

// Ensure the target directory for StorageService.js exists (it should if store-adapter was copied)
if (!fs.existsSync(targetDirStorageService)) {
  console.log(`Creating directory: ${targetDirStorageService}`);
  fs.mkdirSync(targetDirStorageService, { recursive: true });
}

console.log(`Copying: ${sourceFileStorageService} -> ${targetFileStorageService}`);
// Check if source file exists before copying
if (fs.existsSync(sourceFileStorageService)) {
  fs.copyFileSync(sourceFileStorageService, targetFileStorageService);
  console.log('StorageService.js copied successfully');
} else {
  console.log('StorageService.js not found in source directory, skipping copy (assuming Vite handled it)');
}
