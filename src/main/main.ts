import {app, Menu, BrowserWindow} from 'electron';

class MyApp {
    mainWindow: Electron.BrowserWindow | null = null;

    constructor(public app: Electron.App) {
        this.app.on('window-all-closed', () => {
            if (process.platform != 'darwin') {
                setTimeout(() => {
                    this.app.quit();
                }, 50);
            }
        });

        this.app.on('ready', () => {
            this.mainWindow = new BrowserWindow({width: 1500, height: 2000,});
            this.mainWindow.on('closed', (event: Electron.Event) => {
                this.mainWindow = null;
            });
            this.mainWindow.loadURL(`file://${app.getAppPath()}/dist/index.html`);
            this.mainWindow.webContents.openDevTools();
        });
    }
}

export const myapp = new MyApp(app);