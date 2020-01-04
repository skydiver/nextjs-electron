const { join } = require('path');

const { BrowserWindow, app } = require('electron');
const prepareNext = require('electron-next');
const windowStateKeeper = require('electron-window-state');
const isDev = require('electron-is-dev');

let _APP_URL_ = 'http://localhost:8000/';

if (!isDev) {
  const serve = require('electron-serve');
  serve({ directory: 'build/next' });
  _APP_URL_ = 'app://-';
}

let mainWindow;

// Prepare the renderer once the app is ready
const createWindow = async () => {
  if (mainWindow === undefined) {
    await prepareNext('./renderer');
  }

  await app.whenReady();

  // Set default window dimensions
  const mainWindowState = windowStateKeeper({
    defaultWidth: 800,
    defaultHeight: 800,
  });

  // Create main window
  mainWindow = new BrowserWindow({
    width: mainWindowState.width,
    height: mainWindowState.height,
    x: mainWindowState.x,
    y: mainWindowState.y,
    webPreferences: {
      nodeIntegration: false,
      preload: join(__dirname, 'preload.js'),
    },
  });

  await mainWindow.loadURL(_APP_URL_);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Remember window state
  mainWindowState.manage(mainWindow);

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function() {
  if (mainWindow === null) {
    createWindow();
  }
});
