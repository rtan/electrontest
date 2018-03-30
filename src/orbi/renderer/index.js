"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = __importDefault(require("electron"));
var golden_layout_1 = __importDefault(require("golden-layout"));
var fancy_1 = require("orbi/renderer/component/fancy/fancy");
var IdGenerator_1 = __importDefault(require("orbi/renderer/common/IdGenerator"));
var react_1 = __importDefault(require("react"));
var react_dom_1 = __importDefault(require("react-dom"));
var electron_json_storage_1 = __importDefault(require("electron-json-storage"));
var jquery_1 = __importDefault(require("jquery"));
require("reflect-metadata");
var inversify_config_1 = require("../inversify.config");
require("golden-layout/src/css/goldenlayout-base.css");
require("golden-layout/src/css/goldenlayout-light-theme.css");
window.React = react_1.default;
window.ReactDOM = react_dom_1.default;
window.jQuery = jquery_1.default;
window.$ = jquery_1.default;
// todo use di
var idGenerator = inversify_config_1.container.get(IdGenerator_1.default);
// -------------------------------
// golden-layout
electron_json_storage_1.default.get("glCurrentLayout", function (e, d) {
    var config = {};
    if (Object.keys(d).length > 0) {
        config = JSON.parse(d);
    }
    else {
        config = {
            content: [{
                    type: 'react-component',
                    component: 'reacttest',
                    props: { id: idGenerator.makeUniqueId() },
                }]
        };
    }
    var myLayout = new golden_layout_1.default(config);
    myLayout.registerComponent("reacttest", fancy_1.Fancy);
    myLayout.init();
    window.addEventListener("unload", function (e) {
        electron_json_storage_1.default.set("glCurrentLayout", JSON.stringify(myLayout.toConfig()), function (e) {
            if (e) {
                throw e;
            }
        });
    });
    // メニュー
    electron_1.default.remote.Menu.setApplicationMenu(electron_1.default.remote.Menu.buildFromTemplate([
        {
            label: 'ファイル',
            submenu: [
                {
                    label: '終了',
                    click: function () {
                    }
                },
            ]
        },
        {
            label: 'ビュー',
            submenu: [
                {
                    label: 'React',
                    click: function () {
                        myLayout.root.contentItems[0].addChild({
                            type: "react-component",
                            component: "reacttest",
                            props: { id: idGenerator.makeUniqueId() }
                        });
                    }
                }
            ]
        },
        {
            label: 'デバッグ',
            submenu: [
                { role: 'reload' },
                { role: 'forcereload' },
                { role: 'toggledevtools' },
                { type: 'separator' },
                { role: 'resetzoom' },
                { role: 'zoomin' },
                { role: 'zoomout' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        }
    ]));
});
//# sourceMappingURL=index.js.map