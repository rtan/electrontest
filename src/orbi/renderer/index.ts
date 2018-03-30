import electron from "electron";
import GoldenLayout from "golden-layout";
import {Fancy} from "orbi/renderer/component/fancy/fancy";
import IdGenerator from "orbi/renderer/common/IdGenerator";
import React from "react";
import ReactDOM from "react-dom";
import storage from "electron-json-storage";
import jQuery from "jquery";
import fs from "fs";
import Config from "orbi/renderer/services/config/config";
import "reflect-metadata";
import {container} from "../inversify.config";
import "golden-layout/src/css/goldenlayout-base.css";
import "golden-layout/src/css/goldenlayout-light-theme.css";

window.React = React;
window.ReactDOM = ReactDOM;
window.jQuery = jQuery;
window.$ = jQuery;

// todo use di
const idGenerator = container.get<IdGenerator>(IdGenerator);

// -------------------------------
// golden-layout
storage.get("glCurrentLayout", (e, d) => {
    let config = {};
    if (Object.keys(d).length > 0) {
        config = JSON.parse(d);
    }
    else {
        config = {
            content: [{
                type: 'react-component',
                component: 'reacttest',
                props: {id: idGenerator.makeUniqueId()},
            }]
        };
    }

    const myLayout = new GoldenLayout(config);

    myLayout.registerComponent("reacttest", Fancy);
    myLayout.init();

    window.addEventListener("unload", (e) => {
        storage.set("glCurrentLayout", JSON.stringify(myLayout.toConfig()), (e) => {
            if (e) {
                throw e;
            }
        });
    });

    // メニュー
    electron.remote.Menu.setApplicationMenu(electron.remote.Menu.buildFromTemplate(
        [
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
                label: 'ビュー',
                submenu: [
                    {
                        label: 'React',
                        click() {
                            myLayout.root.contentItems[0].addChild({
                                type: "react-component",
                                component: "reacttest",
                                props: {id: idGenerator.makeUniqueId()}
                            });
                        }
                    }
                ]
            },
            {
                label: 'デバッグ',
                submenu: [
                    {role: 'reload'},
                    {role: 'forcereload'},
                    {role: 'toggledevtools'},
                    {type: 'separator'},
                    {role: 'resetzoom'},
                    {role: 'zoomin'},
                    {role: 'zoomout'},
                    {type: 'separator'},
                    {role: 'togglefullscreen'}
                ]
            }
        ]
    ));

});