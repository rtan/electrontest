import * as React from "react";
import IdGenerator from "orbi/renderer/services/idGenerator/idGenerator";
import {Setting} from "orbi/renderer/component/fancy/setting";
import 'jquery.fancytree/dist/skin-lion/ui.fancytree.less'
import {lazyInject} from 'orbi/inversify.config'
import ConfigService from "orbi/renderer/services/config/configService";
import {DataConfig} from "../../services/config/config";
import {FancyTreeCustom} from "./fancytreeCustom";

const storage = require("electron-json-storage");

export interface TreeGridProps {
    // todo golden-layout type definition
    glContainer: any;

    id: string;
    onReload: () => void;
    saveLayout: () => void;
}

export interface TreeGridState {
}

export class TreeGrid extends React.Component<TreeGridProps, TreeGridState> {

    private readonly TREE_DATA_NAME = "tree";

    @lazyInject(IdGenerator) private idGenerator: IdGenerator;
    @lazyInject(ConfigService) private configService: ConfigService;

    private config: DataConfig;

    refs: {
        setting: any,
        tree: FancyTreeCustom
    };

    constructor(props: TreeGridProps) {
        super(props);
        this.config = this.configService.config.dataConfigs[0];
        this.props.glContainer.parent.container.on("resize", () => this.refs.tree.resize());
    }

    render() {
        return (
            <div id="fancyTest">
                <Setting ref={"setting"} id={this.props.id} glContainer={this.props.glContainer}
                         onOk={() => this.settingsOk()}/>
                <div className="fancytest">
                    <div>
                        検索 : <input onKeyUp={e => this.refs.tree.searchTree(e.currentTarget)} placeholder="Filter..."/>
                        <button onClick={() => this.refs.tree.toggleExpand()}>Expand/Collapse</button>
                        <button onClick={this.saveData}>Save</button>
                        <button onClick={this.loadData}>Load</button>
                        <button onClick={this.openSettingWindow}>Settings</button>
                        <button onClick={this.reload}>Reload</button>
                    </div>
                    <FancyTreeCustom ref={"tree"} columns={this.config.columns} glContainer={this.props.glContainer}/>
                </div>
            </div>
        );
    }

    public settingsOk() {
        const settings = this.refs.setting.getSettings();
        this.props.glContainer.extendState({"settings": settings});
        this.reload();
    }

    private saveData = () => {
        let d = this.refs.tree.toDict();
        const json = JSON.stringify(d);
        storage.set(this.TREE_DATA_NAME, json, error => {
            if (error) {
                alert("保存に失敗しました。");
                throw error;
            }
        });
    }

    private loadData = () => {
        storage.get(this.TREE_DATA_NAME, (error, data) => {
            if (error) {
                alert("読み込みに失敗しました。");
                throw error;
            }
            this.refs.tree.setTreeData((JSON).parse(data));
        });
    }

    private openSettingWindow = () => {
        this.refs.setting.show();
    }

    private reload = () => {
        this.props.onReload();
    }
}