## main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);


##preload.js
// Optional: preload for secure APIs
window.addEventListener('DOMContentLoaded', () => {
  console.log('Electron preload loaded');
});


## package.json
"main": "electron/main.js",
"scripts": {
  "dev": "concurrently -k \"vite\" \"cross-env VITE_DEV_SERVER_URL=http://localhost:5173 electron .\"",
  "build": "vite build",
  "start": "electron ."
}


vite config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
});


## command for electron
npm install --save-dev electron concurrently cross-env


## vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
});


## in package.json 
remove type=module
