"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
require("golden-layout/src/css/goldenlayout-dark-theme.css");
require("golden-layout/src/css/goldenlayout-base.css");
var fancytreehtml = require("./fancytree/fancytree.html");
var Menu = electron_1.remote.Menu;
var $ = require('jquery');
var GoldenLayout = require('golden-layout');
window.$ = $;
var myLayout = new GoldenLayout({
    content: [{
            type: 'row',
            content: [{
                    type: 'component',
                    componentName: 'test-component'
                }, {
                    type: 'component',
                    componentName: 'test-component'
                }, {
                    type: 'component',
                    componentName: 'test-component'
                }, {
                    type: 'component',
                    componentName: 'test-component'
                }]
        }]
});
myLayout.registerComponent('test-component', function (container) {
    container.on('open', function () {
        //container.getElement().load('./fancytree.html');
        container.getElement().html(fancytreehtml);
    });
});
myLayout.init();
Menu.setApplicationMenu(Menu.buildFromTemplate([
    {
        label: "View",
        submenu: [
            {
                label: "Tree Window",
                click: function () {
                    myLayout.root.contentItems[0].addChild({
                        type: "component",
                        componentName: "test-component",
                    });
                }
            },
            {
                label: "Tree Window2",
                click: function () {
                    myLayout.root.contentItems[0].addChild({
                        type: "component",
                        componentName: "test-component"
                    });
                }
            }
        ]
    }
]));
//# sourceMappingURL=index.js.map