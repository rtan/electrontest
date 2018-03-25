"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = __importDefault(require("electron"));
var golden_layout_1 = __importDefault(require("golden-layout"));
var fancy_1 = __importDefault(require("./fancy"));
var fancy_2 = require("orbi/renderer/component/fancy/fancy");
var react_1 = __importDefault(require("react"));
var react_dom_1 = __importDefault(require("react-dom"));
window.React = react_1.default;
window.ReactDOM = react_dom_1.default;
var menu = electron_1.default.remote.Menu;
menu.setApplicationMenu(menu.buildFromTemplate([
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
                label: 'Fancy',
                click: function () {
                    myLayout.root.contentItems[0].addChild({ type: "component", componentName: "fancytree" });
                }
            },
            {
                label: 'React',
                click: function () {
                    myLayout.root.contentItems[0].addChild({
                        type: "react-component",
                        component: "reacttest",
                        props: { id: "1" }
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
require("golden-layout/src/css/goldenlayout-base.css");
require("golden-layout/src/css/goldenlayout-light-theme.css");
var config = {
    content: [{
            type: 'row',
            // content: [{
            //     type: 'component',
            //     componentName: 'fancytree',
            // }],
            content: [{
                    type: 'react-component',
                    component: 'reacttest',
                    props: { id: 1 },
                }]
        }]
};
var myLayout = new golden_layout_1.default(config);
var count = 1;
myLayout.registerComponent("fancytree", function (container, componentState) {
    var fancyTest = new fancy_1.default("tree" + count);
    fancyTest.load(container.getElement());
    container.on("resize", function () {
        fancyTest.resize(container);
    });
    count++;
});
myLayout.registerComponent("reacttest", fancy_2.Fancy);
myLayout.init();
//# sourceMappingURL=index.js.map