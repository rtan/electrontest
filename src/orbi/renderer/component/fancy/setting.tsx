import * as React from "react";
import ConfigService from "../../services/config/configService";
import {lazyInject} from "../../../inversify.config";
import {DataConfig} from "../../services/config/config";

export interface SettingProps {
    // todo golden-layout type definition
    glContainer: any;

    onOk: () => void;

    id: string;
}

export interface SettingState {

}

export class Setting extends React.Component<SettingProps, SettingState> {

    @lazyInject(ConfigService) private configService: ConfigService;
    private config: DataConfig;

    constructor(props: SettingProps) {
        super(props);
        this.config = this.configService.config.dataConfigs[0];
    }

    public show() {
        let dlg: any = document.getElementById("settingsDialog_" + this.props.id);
        dlg.show();
    }

    render() {
        const state = this.props.glContainer.getState();
        return (
            <dialog id={`settingsDialog_${this.props.id}`}>
                <form method="dialog">
                    <div style={{padding: "10px", fontWeight: "bold"}}>設定</div>
                    <table style={{textAlign: "center"}}>
                        <thead>
                        <tr>
                            <th style={{width: "100px"}}>項目</th>
                            <th style={{width: "50px"}}>表示</th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.config.columns.map((column, i) => {
                            let checked = true;
                            if (state && "settings" in state) {
                                if ("settings" + column.id + "Disp" in state.settings && !state.settings["settings" + column.id + "Disp"]) {
                                    checked = state.settings["settings" + column.id + "Disp"] as boolean;
                                }
                            }
                            return <tr key={i}>
                                <td>{column.name}</td>
                                <td><input id={`settings${column.id}Disp_${this.props.id}`} type="checkbox"
                                           defaultChecked={checked}/></td>
                            </tr>
                        })}
                        </tbody>
                    </table>
                    <div style={{paddingTop: "10px", textAlign: "center"}}>
                        <button id="settingsOk" type="submit" value="ok" style={{width: "100px"}}
                                onClick={this.props.onOk}>Ok
                        </button>
                        <button type="submit" value="cancel" style={{width: "100px"}}>Cancel</button>
                    </div>
                </form>
            </dialog>
        );
    }
}
