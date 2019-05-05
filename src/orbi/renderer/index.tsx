import electron from "electron";
import GoldenLayout from "golden-layout";
import IdGenerator from "orbi/renderer/services/idGenerator/idGenerator";
import React, {createRef} from "react";
import ReactDOM from "react-dom";
import storage from "electron-json-storage";
import jQuery from "jquery";
import "reflect-metadata";
import {container} from "../inversify.config";
import "golden-layout/src/css/goldenlayout-base.css";
import "golden-layout/src/css/goldenlayout-light-theme.css";
import FastTreeGrid from "./component/tree/FastTreeGrid";
import {testData} from "./component/tree/FastTreeGridTest";
import FastTreeGridDetail from "./component/tree/FastTreeGridDetail";

window.React = React;
window.ReactDOM = ReactDOM;
window.jQuery = jQuery;
window.$ = jQuery;

// todo use di
const idGenerator = container.get<IdGenerator>(IdGenerator);

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
            content: [
                { type: 'row', content: [
                        {type: 'column', content: []},
                        {type: 'column', content: []}
                    ]},
                // {
                // type: 'react-component',
                // component: 'tree',
                // props: {rowHeight: 21, tree: testData(), searchResultTreeGrid: null},
                // }
            ]
        };
    }

    myLayout = new GoldenLayout(config);

    myLayout.registerComponent("tree", FastTreeGrid);

    let data = testData();
    let tree: FastTreeGrid;
    let searchResulttree: FastTreeGrid;
    myLayout.registerComponent( "test1", function( container, state ){
        const r = createRef<FastTreeGrid>();
        const o = <FastTreeGrid ref={r} rowHeight={21} tree={data} searchResultTreeGrid={null}/>
        ReactDOM.render(o, container.getElement().get(0));
        searchResulttree = r.current!;
    });
    myLayout.registerComponent( "test2", function( container, state ){
        const r = createRef<FastTreeGrid>();
        const o = <FastTreeGrid ref={r} rowHeight={21} tree={testData()} searchResultTreeGrid={searchResulttree}/>
        ReactDOM.render(o, container.getElement().get(0));
        tree = r.current!;
    });
    myLayout.registerComponent( "test3", function( container, state ){
        tree.createDetailComponentByElement(container.getElement().get(0));
    });

    myLayout.init();
    myLayout.root.contentItems[0].contentItems[1].addChild({type:"component", componentName:"test1"});
    myLayout.root.contentItems[0].contentItems[0].addChild({type:"component", componentName:"test2"});
    myLayout.root.contentItems[0].contentItems[1].addChild({type:"component", componentName:"test3"});

    window.addEventListener("unload", (e) => {
        onSaveLayout();
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
                                props: {
                                    id: idGenerator.makeUniqueId(),
                                    saveLayout: onSaveLayout
                                }
                            });
                        }
                    }
                ]
            },
            {
                label: 'ウィンドウ',
                submenu: [
                    {
                        label: '現在のレイアウトを保存',
                        click() {
                            onSaveLayout();
                        }
                    },
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