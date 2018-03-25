"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
var React = __importStar(require("react"));
var Setting = /** @class */ (function (_super) {
    __extends(Setting, _super);
    function Setting(props) {
        return _super.call(this, props) || this;
    }
    Setting.prototype.show = function () {
        var dlg = document.getElementById("settingsDialog");
        dlg.show();
    };
    Setting.prototype.render = function () {
        return (React.createElement("dialog", { id: "settingsDialog" },
            React.createElement("form", { method: "dialog" },
                React.createElement("div", { style: { padding: "10px", fontWeight: "bold" } }, "\u8A2D\u5B9A"),
                React.createElement("table", { style: { textAlign: "center" } },
                    React.createElement("thead", null,
                        React.createElement("tr", null,
                            React.createElement("th", { style: { width: "100px" } }, "\u9805\u76EE"),
                            React.createElement("th", { style: { width: "50px" } }, "\u8868\u793A"))),
                    React.createElement("tbody", null,
                        React.createElement("tr", null,
                            React.createElement("td", null, "\u540D\u79F0"),
                            React.createElement("td", null,
                                React.createElement("input", { id: "settingsNameDisp", type: "checkbox" }))),
                        React.createElement("tr", null,
                            React.createElement("td", null, "C#"),
                            React.createElement("td", null,
                                React.createElement("input", { id: "settingsCsDisp", type: "checkbox" }))),
                        React.createElement("tr", null,
                            React.createElement("td", null, "PHP"),
                            React.createElement("td", null,
                                React.createElement("input", { id: "settingsPhpDisp", type: "checkbox" }))),
                        React.createElement("tr", null,
                            React.createElement("td", null, "\u578B"),
                            React.createElement("td", null,
                                React.createElement("input", { id: "settingsTypeDisp", type: "checkbox" }))),
                        React.createElement("tr", null,
                            React.createElement("td", null, "\u6700\u5C0F\u5024"),
                            React.createElement("td", null,
                                React.createElement("input", { id: "settingsMinDisp", type: "checkbox" }))),
                        React.createElement("tr", null,
                            React.createElement("td", null, "\u6700\u5927\u5024"),
                            React.createElement("td", null,
                                React.createElement("input", { id: "settingsMaxDisp", type: "checkbox" }))),
                        React.createElement("tr", null,
                            React.createElement("td", null, "\uFF83\uFF9E\uFF8C\uFF6B\uFF99\uFF84\u5024"),
                            React.createElement("td", null,
                                React.createElement("input", { id: "settingsDefaultDisp", type: "checkbox" }))))),
                React.createElement("div", { style: { paddingTop: "10px", textAlign: "center" } },
                    React.createElement("button", { id: "settingsOk", type: "submit", value: "ok", style: { width: "100px" }, onClick: this.props.onOk }, "Ok"),
                    React.createElement("button", { type: "submit", value: "cancel", style: { width: "100px" } }, "Cancel")))));
    };
    return Setting;
}(React.Component));
exports.Setting = Setting;
//# sourceMappingURL=setting.js.map