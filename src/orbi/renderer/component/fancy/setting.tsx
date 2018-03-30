import * as React from "react";

export interface SettingProps {
    onOk: () => void;

    id: string;
}

export interface SettingState {

}

export class Setting extends React.Component<SettingProps, SettingState> {
    constructor(props: SettingProps) {
        super(props);
    }

    public show() {
        let dlg: any = document.getElementById("settingsDialog_"+this.props.id);
        dlg.show();
    }

    render() {
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
                        <tr>
                            <td>名称</td>
                            <td><input id={`settingsNameDisp_${this.props.id}`} type="checkbox"/></td>
                        </tr>
                        <tr>
                            <td>C#</td>
                            <td><input id={`settingsCsDisp_${this.props.id}`} type="checkbox"/></td>
                        </tr>
                        <tr>
                            <td>PHP</td>
                            <td><input id={`settingsPhpDisp_${this.props.id}`} type="checkbox"/></td>
                        </tr>
                        <tr>
                            <td>型</td>
                            <td><input id={`settingsTypeDisp_${this.props.id}`} type="checkbox"/></td>
                        </tr>
                        <tr>
                            <td>最小値</td>
                            <td><input id={`settingsMinDisp_${this.props.id}`} type="checkbox"/></td>
                        </tr>
                        <tr>
                            <td>最大値</td>
                            <td><input id={`settingsMaxDisp_${this.props.id}`} type="checkbox"/></td>
                        </tr>
                        <tr>
                            <td>ﾃﾞﾌｫﾙﾄ値</td>
                            <td><input id={`settingsDefaultDisp_${this.props.id}`} type="checkbox"/></td>
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
