import { app, BrowserWindow } from 'electron';
class MyApp {
    constructor(app) {
        this.app = app;
        this.mainWindow = null;
        this.app.on('window-all-closed', () => {
            if (process.platform != 'darwin') {
                setTimeout(() => {
                    this.app.quit();
                }, 50);
            }
        });
        this.app.on('ready', () => {
            this.mainWindow = new BrowserWindow({ width: 1500, height: 2000, });
            this.mainWindow.on('closed', (event) => {
                this.mainWindow = null;
            });
            this.mainWindow.loadURL(`file://${app.getAppPath()}/dist/index.html`);
            this.mainWindow.webContents.openDevTools();
        });
    }
}
export const myapp = new MyApp(app);
//# sourceMappingURL=main.js.map