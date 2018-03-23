import electron from "electron";
import GoldenLayout from "golden-layout";
import FancyTest from "./fancy";

const menu = electron.remote.Menu;
menu.setApplicationMenu(menu.buildFromTemplate(
    [
        {
            label: 'ファイル',
            submenu: [
                {
                    label: '終了',
                    click () { }
                },
            ]
        },
        {
            label: 'ビュー',
            submenu: [
                {
                    label: 'Fancy',
                    click () {
                        myLayout.root.contentItems[0].addChild({type:"component", componentName:"fancytree"});
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
    ]
));

require("golden-layout/src/css/goldenlayout-base.css")
require("golden-layout/src/css/goldenlayout-light-theme.css")

var config = {
    content: [{
        type: 'row',
        content: [{
            type: 'component',
            componentName: 'fancytree',
        }]
    }]
};

const myLayout = new GoldenLayout(config);

let count = 1;
myLayout.registerComponent("fancytree", function (container, componentState) {
    const fancyTest = new FancyTest("tree"+count);
    fancyTest.load(container.getElement());
    container.on("resize", ()=>{
        fancyTest.resize(container);
    });
    count++;
});

myLayout.init();
