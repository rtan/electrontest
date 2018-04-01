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
var treegrid_1 = require("orbi/renderer/component/fancy/treegrid");
var Fancy = /** @class */ (function (_super) {
    __extends(Fancy, _super);
    function Fancy(props) {
        var _this = _super.call(this, props) || this;
        _this.state = { isReload: false };
        return _this;
    }
    Fancy.prototype.reload = function () {
        this.setState({ isReload: true });
    };
    Fancy.prototype.componentDidUpdate = function () {
        var _this = this;
        if (this.state.isReload) {
            setTimeout(function () {
                _this.setState({
                    isReload: false
                });
                _this.forceUpdate();
            }, 100);
        }
    };
    Fancy.prototype.render = function () {
        var _this = this;
        if (this.state.isReload) {
            return (React.createElement("div", null, "loading..."));
        }
        return (React.createElement(treegrid_1.TreeGrid, { id: this.props.id, glContainer: this.props.glContainer, onReload: function () { return _this.reload(); }, saveLayout: this.props.saveLayout }));
    };
    return Fancy;
}(React.Component));
exports.Fancy = Fancy;
//# sourceMappingURL=fancy.js.map