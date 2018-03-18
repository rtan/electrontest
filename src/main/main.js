"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var MyApp = /** @class */ (function () {
    function MyApp(app) {
        var _this = this;
        this.app = app;
        this.mainWindow = null;
        this.app.on('window-all-closed', function () {
            if (process.platform != 'darwin') {
                setTimeout(function () {
                    _this.app.quit();
                }, 50);
            }
        });
        this.app.on('ready', function () {
            _this.mainWindow = new electron_1.BrowserWindow({ width: 1500, height: 2000, });
            _this.mainWindow.on('closed', function (event) {
                _this.mainWindow = null;
            });
            _this.mainWindow.loadURL("file://" + app.getAppPath() + "/dist/index.html");
            _this.mainWindow.webContents.openDevTools();
        });
    }
    return MyApp;
}());
exports.myapp = new MyApp(electron_1.app);
//# sourceMappingURL=main.js.map