import * as React from "react";

export interface SettingProps {
    onOk: () => void;
}

export interface SettingState {

}

export class Setting extends React.Component<SettingProps, SettingState> {
    constructor(props: SettingProps) {
        super(props);
    }

    public show() {
        let dlg: any = document.getElementById("settingsDialog");
        dlg.show();
    }

    render() {
        return (
            <dialog id="settingsDialog">
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
                        <tr>
                            <td>名称</td>
                            <td><input id="settingsNameDisp" type="checkbox"/></td>
                        </tr>
                        <tr>
                            <td>C#</td>
                            <td><input id="settingsCsDisp" type="checkbox"/></td>
                        </tr>
                        <tr>
                            <td>PHP</td>
                            <td><input id="settingsPhpDisp" type="checkbox"/></td>
                        </tr>
                        <tr>
                            <td>型</td>
                            <td><input id="settingsTypeDisp" type="checkbox"/></td>
                        </tr>
                        <tr>
                            <td>最小値</td>
                            <td><input id="settingsMinDisp" type="checkbox"/></td>
                        </tr>
                        <tr>
                            <td>最大値</td>
                            <td><input id="settingsMaxDisp" type="checkbox"/></td>
                        </tr>
                        <tr>
                            <td>ﾃﾞﾌｫﾙﾄ値</td>
                            <td><input id="settingsDefaultDisp" type="checkbox"/></td>
                        </tr>
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
