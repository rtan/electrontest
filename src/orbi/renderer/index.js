import electron from "electron";
import GoldenLayout from "golden-layout";
import IdGenerator from "orbi/renderer/services/idGenerator/idGenerator";
import React, { createRef } from "react";
import ReactDOM from "react-dom";
import storage from "electron-json-storage";
import jQuery from "jquery";
import "reflect-metadata";
import { container } from "../inversify.config";
import "golden-layout/src/css/goldenlayout-base.css";
import "golden-layout/src/css/goldenlayout-light-theme.css";
import FastTreeGrid from "./component/tree/FastTreeGrid";
import { testData } from "./component/tree/FastTreeGridTest";
window.React = React;
window.ReactDOM = ReactDOM;
window.jQuery = jQuery;
window.$ = jQuery;
// todo use di
const idGenerator = container.get(IdGenerator);
// -------------------------------
// golden-layout
storage.get("glCurrentLayout", (e, d) => {
    let myLayout = null;
    // todo propsもセーブされるが関数が保存されず次回エラー
    const onSaveLayout = () => {
        storage.set("glCurrentLayout", JSON.stringify(myLayout.toConfig()), (e) => {
            if (e) {
                throw e;
            }
        });
    };
    d = {}; // todo テスト中はレイアウト保存しない
    let config = {};
    if (Object.keys(d).length > 0) {
        config = JSON.parse(d);
    }
    else {
        config = {
            settings: {
                hasHeaders: false,
            },
            content: [
                { type: 'row', content: [
                        { type: 'column', content: [] },
                        { type: 'column', content: [] }
                    ] },
            ]
        };
    }
    myLayout = new GoldenLayout(config);
    let data = testData();
    let tree;
    let searchResulttree;
    myLayout.registerComponent("subtree", function (container, state) {
        const r = createRef();
        const o = React.createElement(FastTreeGrid, { ref: r, rowHeight: 21, tree: data, searchResultTreeGrid: null });
        ReactDOM.render(o, container.getElement().get(0));
        searchResulttree = r.current;
    });
    myLayout.registerComponent("tree", function (container, state) {
        const r = createRef();
        const o = React.createElement(FastTreeGrid, { ref: r, rowHeight: 21, tree: data, searchResultTreeGrid: searchResulttree });
        ReactDOM.render(o, container.getElement().get(0));
        tree = r.current;
    });
    myLayout.registerComponent("detail", function (container, state) {
        tree.createDetailComponentByElement(container.getElement().get(0));
    });
    myLayout.init();
    myLayout.root.contentItems[0].contentItems[1].addChild({ type: "component", componentName: "subtree", title: "サブツリー", isClosable: false });
    myLayout.root.contentItems[0].contentItems[0].addChild({ type: "component", componentName: "tree", title: "ツリー", isClosable: false });
    myLayout.root.contentItems[0].contentItems[1].addChild({ type: "component", componentName: "detail", title: "詳細", isClosable: false });
    window.addEventListener("unload", (e) => {
        onSaveLayout();
    });
    // メニュー
    electron.remote.Menu.setApplicationMenu(electron.remote.Menu.buildFromTemplate([
        {
            label: 'ファイル',
            submenu: [
                {
                    label: '終了',
                    click() {
                    }
                },
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