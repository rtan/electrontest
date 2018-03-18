import {remote} from "electron";

require("golden-layout/src/css/goldenlayout-dark-theme.css");
require("golden-layout/src/css/goldenlayout-base.css");

const Menu = remote.Menu;
const $ = require('jquery')
const GoldenLayout = require('golden-layout');

window.$ = $;

const myLayout = new GoldenLayout({
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
        container.getElement().html('<div>Loading...</div>');
    });
});

myLayout.init()

Menu.setApplicationMenu(Menu.buildFromTemplate([
    {
        label: "View",
        submenu: [
            {
                label: "Tree Window",
                click() {
                    myLayout.root.contentItems[0].addChild({
                        type: "component",
                        componentName: "test-component",
                    })
                }
            },
            {
                label: "Tree Window2",
                click() {
                    myLayout.root.contentItems[0].addChild({
                        type: "component",
                        componentName: "test-component"
                    })
                }
            }
        ]
    }
]))