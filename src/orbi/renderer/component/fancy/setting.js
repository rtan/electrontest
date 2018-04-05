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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
var React = __importStar(require("react"));
var configService_1 = __importDefault(require("../../services/config/configService"));
var inversify_config_1 = require("../../../inversify.config");
var Setting = /** @class */ (function (_super) {
    __extends(Setting, _super);
    function Setting(props) {
        var _this = _super.call(this, props) || this;
        _this.config = _this.configService.config.dataConfigs[0];
        return _this;
    }
    Setting.prototype.show = function () {
        var dlg = document.getElementById("settingsDialog_" + this.props.id);
        dlg.show();
    };
    Setting.prototype.getSettings = function () {
        var _this = this;
        var settings = {};
        this.config.columns.forEach(function (column) {
            settings["settings" + column.id + "Disp"] = $(_this.refs[column.id]).prop("checked");
        });
        return settings;
    };
    Setting.prototype.render = function () {
        var state = this.props.glContainer.getState();
        return (React.createElement("dialog", { id: "settingsDialog_" + this.props.id },
            React.createElement("form", { method: "dialog" },
                React.createElement("div", { style: { padding: "10px", fontWeight: "bold" } }, "\u8A2D\u5B9A"),
                React.createElement("table", { style: { textAlign: "center" } },
                    React.createElement("thead", null,
                        React.createElement("tr", null,
                            React.createElement("th", { style: { width: "100px" } }, "\u9805\u76EE"),
                            React.createElement("th", { style: { width: "50px" } }, "\u8868\u793A"))),
                    React.createElement("tbody", null, this.config.columns.map(function (column, i) {
                        var checked = true;
                        if (state && "settings" in state) {
                            if ("settings" + column.id + "Disp" in state.settings && !state.settings["settings" + column.id + "Disp"]) {
                                checked = state.settings["settings" + column.id + "Disp"];
                            }
                        }
                        return React.createElement("tr", { key: i },
                            React.createElement("td", null, column.name),
                            React.createElement("td", null,
                                React.createElement("input", { ref: column.id, type: "checkbox", defaultChecked: checked })));
                    }))),
                React.createElement("div", { style: { paddingTop: "10px", textAlign: "center" } },
                    React.createElement("button", { id: "settingsOk", type: "submit", value: "ok", style: { width: "100px" }, onClick: this.props.onOk }, "Ok"),
                    React.createElement("button", { type: "submit", value: "cancel", style: { width: "100px" } }, "Cancel")))));
    };
    __decorate([
        inversify_config_1.lazyInject(configService_1.default)
    ], Setting.prototype, "configService", void 0);
    return Setting;
}(React.Component));
exports.Setting = Setting;
//# sourceMappingURL=setting.js.map