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
var idGenerator_1 = __importDefault(require("orbi/renderer/services/idGenerator/idGenerator"));
var setting_1 = require("orbi/renderer/component/fancy/setting");
require("jquery.fancytree/dist/skin-lion/ui.fancytree.less");
var inversify_config_1 = require("orbi/inversify.config");
var configService_1 = __importDefault(require("orbi/renderer/services/config/configService"));
var fancytreeCustom_1 = require("./fancytreeCustom");
var storage = require("electron-json-storage");
var TreeGrid = /** @class */ (function (_super) {
    __extends(TreeGrid, _super);
    function TreeGrid(props) {
        var _this = _super.call(this, props) || this;
        _this.TREE_DATA_NAME = "tree";
        _this.saveData = function () {
            var d = _this.refs.tree.toDict();
            var json = JSON.stringify(d);
            storage.set(_this.TREE_DATA_NAME, json, function (error) {
                if (error) {
                    alert("保存に失敗しました。");
                    throw error;
                }
            });
        };
        _this.loadData = function () {
            storage.get(_this.TREE_DATA_NAME, function (error, data) {
                if (error) {
                    alert("読み込みに失敗しました。");
                    throw error;
                }
                _this.refs.tree.setTreeData((JSON).parse(data));
            });
        };
        _this.openSettingWindow = function () {
            _this.refs.setting.show();
        };
        _this.reload = function () {
            _this.props.onReload();
        };
        _this.config = _this.configService.config.dataConfigs[0];
        _this.props.glContainer.parent.container.on("resize", function () { return _this.refs.tree.resize(); });
        return _this;
    }
    TreeGrid.prototype.render = function () {
        var _this = this;
        return (React.createElement("div", { id: "fancyTest" },
            React.createElement(setting_1.Setting, { ref: "setting", id: this.props.id, glContainer: this.props.glContainer, onOk: function () { return _this.settingsOk(); } }),
            React.createElement("div", { className: "fancytest" },
                React.createElement("div", null,
                    "\u691C\u7D22 : ",
                    React.createElement("input", { onKeyUp: function (e) { return _this.refs.tree.searchTree(e.currentTarget); }, placeholder: "Filter..." }),
                    React.createElement("button", { onClick: function () { return _this.refs.tree.toggleExpand(); } }, "Expand/Collapse"),
                    React.createElement("button", { onClick: this.saveData }, "Save"),
                    React.createElement("button", { onClick: this.loadData }, "Load"),
                    React.createElement("button", { onClick: this.openSettingWindow }, "Settings"),
                    React.createElement("button", { onClick: this.reload }, "Reload")),
                React.createElement(fancytreeCustom_1.FancyTreeCustom, { ref: "tree", columns: this.config.columns, glContainer: this.props.glContainer }))));
    };
    TreeGrid.prototype.settingsOk = function () {
        var settings = this.refs.setting.getSettings();
        this.props.glContainer.extendState({ "settings": settings });
        this.reload();
    };
    __decorate([
        inversify_config_1.lazyInject(idGenerator_1.default)
    ], TreeGrid.prototype, "idGenerator", void 0);
    __decorate([
        inversify_config_1.lazyInject(configService_1.default)
    ], TreeGrid.prototype, "configService", void 0);
    return TreeGrid;
}(React.Component));
exports.TreeGrid = TreeGrid;
//# sourceMappingURL=treegrid.js.map