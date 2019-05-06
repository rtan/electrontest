import * as React from 'react';
import * as _ from 'underscore';
import { NodeCommonData, NodeDataCategory, NodeType, NodeValueType } from "./FastTreeGridViewData2";
import './fast-tree-grid.css';
import { ClickHandler } from "../../common/Unclassified";
import { isNotNull } from "../../common/Util";
import { FastTreeGridDefine } from "./FastTreeGridDefine";
import * as toastr from "toastr";
import { SearchCondition } from "./FastTreeGridHeader";
export var DragState;
(function (DragState) {
    DragState[DragState["Start"] = 0] = "Start";
    DragState[DragState["End"] = 1] = "End";
    DragState[DragState["Enter"] = 2] = "Enter";
    DragState[DragState["Leave"] = 3] = "Leave";
    DragState[DragState["Drop"] = 4] = "Drop";
})(DragState || (DragState = {}));
export class FastTreeGridRow extends React.Component {
    constructor(props) {
        super(props);
        this.clickHandler = new ClickHandler();
        this.editInput = new EditInput();
        this.render = () => {
            console.log("row rendering");
            let tds = () => {
                const desc = React.createElement("td", { ref: e => this.ref.td[1] = e },
                    React.createElement("span", { style: { width: "100%" } },
                        React.createElement("input", { ref: e => this.ref.input[1] = e, type: "text", readOnly: true, value: this.state.data.desc || "", className: "cellInputText", onClick: e => this.click(e), onBlur: e => this.blur(e), onChange: e => this.change("desc", e), onKeyDown: e => this.keyDown(e) })));
                switch (this.nodeView ? this.nodeView.node.data.nodeType : NodeType.NodeGroupFixed) {
                    case NodeType.NodeProperty:
                        const type = (() => {
                            switch (this.nodeView.node.data.valueType) {
                                case NodeValueType.Bool:
                                case NodeValueType.String:
                                case NodeValueType.Number:
                                case NodeValueType.DateTime:
                                case NodeValueType.None:
                                    const sameCnt = this.tree.getSameNodeCnt(this.nodeView.node.id);
                                    return React.createElement(React.Fragment, null,
                                        React.createElement("i", { className: "fas fa-search-location", onClick: () => this.handleSearch("same:" + this.nodeView.node.id), style: { paddingRight: "5px", background: "#f0f8ff", borderRadius: "5px", borderStyle: "solid", borderColor: "#87cefa", borderWidth: "1px", marginRight: "5px" } },
                                            " ",
                                            sameCnt,
                                            " "),
                                        React.createElement("input", { list: "valueType", style: { width: "55px" }, ref: e => this.ref.input[2] = e, type: "text", readOnly: true, value: this.dispValueType(this.state.data) || "", className: "cellInputText", onClick: e => this.click(e), onBlur: e => this.blur(e), onChange: e => this.change("valueType", e), onKeyDown: e => this.keyDown(e) }));
                                case NodeValueType.Class:
                                case NodeValueType.Enum:
                                    return React.createElement(React.Fragment, null,
                                        React.createElement("i", { className: "fas fa-search-location", onClick: () => this.handleSearch("entity:" + this.dispValueType(this.state.data)), style: { paddingRight: "5px", background: "#f0f8ff", borderRadius: "5px", borderStyle: "solid", borderColor: "#87cefa", borderWidth: "1px", marginRight: "5px" } }, " 1 "),
                                        React.createElement("input", { list: "valueType", ref: e => this.ref.input[2] = e, type: "text", readOnly: true, value: this.dispValueType(this.state.data) || "", className: "cellInputText", onClick: e => this.click(e), onBlur: e => this.blur(e), onChange: e => this.change("valueType", e), onKeyDown: e => this.keyDown(e) }));
                            }
                        })();
                        const defaultValue = (() => {
                            switch (this.nodeView.node.data.valueType) {
                                case NodeValueType.Bool: return React.createElement("input", { style: { width: "50px" }, ref: e => this.ref.input[3] = e, type: "text", list: "bool", readOnly: true, value: this.state.data.defaultValue || "", className: "cellInputText", onClick: e => this.click(e), onBlur: e => this.blur(e), onChange: e => this.change("defaultValue", e), onKeyDown: e => this.keyDown(e) });
                                case NodeValueType.String: return React.createElement("input", { style: { width: "100px" }, ref: e => this.ref.input[3] = e, type: "text", readOnly: true, value: this.state.data.defaultValue || "", className: "cellInputText", onClick: e => this.click(e), onBlur: e => this.blur(e), onChange: e => this.change("defaultValue", e), onKeyDown: e => this.keyDown(e) });
                                case NodeValueType.Number: return React.createElement("input", { style: { width: "50px" }, ref: e => this.ref.input[3] = e, type: "number", readOnly: true, value: this.state.data.defaultValue || "", className: "cellInputText", onClick: e => this.click(e), onBlur: e => this.blur(e), onChange: e => this.change("defaultValue", e), onKeyDown: e => this.keyDown(e) });
                                case NodeValueType.DateTime: return React.createElement("input", { style: { width: "150px" }, ref: e => this.ref.input[3] = e, type: "datetime-local", readOnly: true, value: this.state.data.defaultValue || "", className: "cellInputText", onClick: e => this.click(e), onBlur: e => this.blur(e), onChange: e => this.change("defaultValue", e), onKeyDown: e => this.keyDown(e) });
                                case NodeValueType.Class: return "-";
                                case NodeValueType.Enum: return "-";
                                case NodeValueType.None: return "-";
                            }
                        })();
                        return React.createElement(React.Fragment, null,
                            desc,
                            React.createElement("td", { ref: e => this.ref.td[2] = e, onDragStart: e => e, onDragLeave: e => e, onDragEnter: e => e, onDragOver: e => e.preventDefault(), onDrag: e => e, onDrop: e => this.props.onDropValueType(this, e), draggable: true },
                                type,
                                "( ",
                                defaultValue,
                                " )"));
                    case NodeType.NodeEnumValue:
                        return React.createElement(React.Fragment, null,
                            desc,
                            React.createElement("td", { ref: e => this.ref.td[2] = e },
                                React.createElement("span", { style: { width: "100%", color: "#AAAAAA" } }, "Enum\u5024")));
                    case NodeType.NodeEntity:
                        // todo 重い?
                        const refCnt = this.tree.getRefNodeCnt(this.nodeView.node.id);
                        return React.createElement(React.Fragment, null,
                            desc,
                            React.createElement("td", { ref: e => this.ref.td[2] = e },
                                React.createElement("i", { className: "fas fa-search-location", onClick: () => this.handleSearch("ref:" + this.nodeView.node.id), style: { paddingRight: "5px", background: "#f0f8ff", borderRadius: "5px", borderStyle: "solid", borderColor: "#87cefa", borderWidth: "1px", marginRight: "5px" } },
                                    " ",
                                    refCnt,
                                    " "),
                                React.createElement("span", { style: { width: "100%", color: "#AAAAAA" } }, "\u30A8\u30F3\u30C6\u30A3\u30C6\u30A3")));
                    case NodeType.NodeUniRefEntity:
                        return React.createElement(React.Fragment, null,
                            desc,
                            React.createElement("td", { ref: e => this.ref.td[2] = e },
                                React.createElement("span", { style: { width: "100%", color: "#AAAAAA" } }, "\u56FA\u5B9A\u30A8\u30F3\u30C6\u30A3\u30C6\u30A3")));
                    case NodeType.NodeGroup:
                        return React.createElement(React.Fragment, null,
                            desc,
                            React.createElement("td", { ref: e => this.ref.td[2] = e },
                                React.createElement("span", { style: { width: "100%", color: "#AAAAAA" } }, "\u30B0\u30EB\u30FC\u30D7")));
                    case NodeType.NodeGroupFixed:
                        return React.createElement(React.Fragment, null,
                            React.createElement("td", { ref: e => this.ref.td[1] = e },
                                React.createElement("span", { style: { width: "100%" } }, "-")),
                            React.createElement("td", { ref: e => this.ref.td[2] = e },
                                React.createElement("span", { style: { width: "100%", color: "#AAAAAA" } }, "\u56FA\u5B9A\u30B0\u30EB\u30FC\u30D7")));
                    case NodeType.NodeEnum:
                        return React.createElement(React.Fragment, null,
                            desc,
                            React.createElement("td", { ref: e => this.ref.td[2] = e },
                                React.createElement("span", { style: { width: "100%", color: "#AAAAAA" } }, "\u5217\u6319\u578B")));
                    default:
                        return React.createElement(React.Fragment, null,
                            React.createElement("td", { ref: e => this.ref.td[1] = e },
                                React.createElement("span", { style: { width: "100%" } })),
                            React.createElement("td", { ref: e => this.ref.td[2] = e },
                                React.createElement("span", { style: { width: "100%" } })));
                }
            };
            const detailTds = () => {
                if (this.props.isDetail) {
                    switch (this.state.data.nodeDataCategory) {
                        case NodeDataCategory.DB:
                            const isNotNull = (this.state.data.dbColumnDetailData().isNotNull == null) ? "" : (this.state.data.dbColumnDetailData().isNotNull ? "true" : "false");
                            return React.createElement(React.Fragment, null,
                                React.createElement("td", { ref: e => this.ref.td[3] = e },
                                    React.createElement("span", { style: { width: "100%" } },
                                        React.createElement("input", { list: "dbType", ref: e => this.ref.input[4] = e, type: "text", readOnly: true, value: this.state.data.dbColumnDetailData().valueType || "", className: "cellInputText", onClick: e => this.click(e), onBlur: e => this.blur(e), onChange: e => this.change("dbType", e), onKeyDown: e => this.keyDown(e) }))),
                                React.createElement("td", { ref: e => this.ref.td[4] = e },
                                    React.createElement("span", { style: { width: "100%" } },
                                        React.createElement("input", { ref: e => this.ref.input[5] = e, type: "number", readOnly: true, value: this.state.data.dbColumnDetailData().valueLength || 0, className: "cellInputText", onClick: e => this.click(e), onBlur: e => this.blur(e), onChange: e => this.change("dbValueLength", e), onKeyDown: e => this.keyDown(e) }))),
                                React.createElement("td", { ref: e => this.ref.td[5] = e },
                                    React.createElement("span", { style: { width: "100%" } },
                                        React.createElement("input", { ref: e => this.ref.input[6] = e, type: "text", list: "bool", readOnly: true, value: isNotNull, className: "cellInputText", onClick: e => this.click(e), onBlur: e => this.blur(e), onChange: e => this.change("dbIsNotNull", e), onKeyDown: e => this.keyDown(e) }))));
                    }
                }
                return React.createElement("td", { ref: e => this.ref.td[3] = e, title: this.nodeView.node.data.detail.toSummaryString() || "-" },
                    React.createElement("span", { style: { width: "100%" } }, this.nodeView.node.data.detail.toSummaryString() || "-"));
            };
            return React.createElement(React.Fragment, null,
                React.createElement("tr", { ref: e => this.ref.tr = e, style: { height: this.props.height, backgroundColor: this.nodeView != null && this.state.isSelected ? "#C4E6FF" : "transparent" } }, this.nodeView == null ?
                    React.createElement("td", null) :
                    React.createElement(React.Fragment, null,
                        React.createElement("td", { ref: e => this.ref.td[0] = e, style: { textAlign: "left" }, draggable: true, onDragStart: e => this.handleDragStart(e), onDragOver: (e) => this.handleDragOver(e), onDrop: (e) => this.handleDrop(e), onDragLeave: e => this.handleDragLeave(e), onDragEnter: e => this.handleDragEnter(e) },
                            React.createElement("span", { ref: e => this.ref.spanLayer = e, style: { paddingLeft: (this.nodeView.layerCount - 1) * 10, paddingRight: "5px" }, onClick: _ => this.switch() },
                                (this.nodeView.node.isHoldableChilds()) ?
                                    this.state.isOpen ?
                                        "▼"
                                        : "▶"
                                    : "　",
                                React.createElement("i", { className: FastTreeGridDefine.nodeIcons.get(this.nodeView.node.data.nodeType) })),
                            React.createElement("input", { ref: e => this.ref.input[0] = e, type: "text", readOnly: true, value: this.state.data.name || "", className: "cellInputText", onClick: e => this.click(e), onBlur: e => this.blur(e), onChange: e => this.change("name", e), onKeyDown: e => this.keyDown(e) })),
                        tds(),
                        detailTds())));
        };
        this.resize = (widths) => {
            this.ref.td.filter(isNotNull).forEach((td, i) => td.style.maxWidth = td.style.width = widths[i]);
            if (this.ref.td[0]) {
                const w = this.ref.td[0].getBoundingClientRect().width - this.ref.spanLayer.getBoundingClientRect().width;
                this.ref.input[0].style.width = w + "px";
            }
        };
        this.isLastSelected = () => this.nodeView.viewId == this.props.view.selected.lastSelectedNodeViewId;
        this.isFocused = () => _.any(this.ref.input, i => i == document.activeElement);
        this.focusColIndex = () => this.ref.input.findIndex(i => i == document.activeElement);
        this.focus = (idx = 0) => this.ref.input[idx] ? this.ref.input[idx].select() : this.ref.input[0].select();
        this.focusNext = () => this.focus(this.focusColIndex() + 1);
        this.focusPrev = () => this.focus(this.focusColIndex() - 1);
        this.select = () => {
            this.props.view.selected.clear();
            this.props.view.selected.select(this.nodeView);
        };
        this.close = () => this.setOpened(false);
        this.open = () => this.setOpened(true);
        this.switch = () => this.setOpened(!this.isOpened());
        this.state = { isOpen: false, data: new NodeCommonData(), isSelected: false };
        this.ref = new Ref(this);
    }
    isOpened() {
        return this.nodeView ? this.props.view.folding.isOpened(this.nodeView.viewId) : false;
    }
    isSelected() {
        return this.nodeView ? this.props.view.selected.isSelected(this.nodeView) : false;
    }
    update(nodeView, cb) {
        if (this.state.isOpen == this.isOpened() && this.currentNodeView == nodeView && this.state.isSelected == this.isSelected()) {
            cb();
            return;
        }
        this.currentNodeView = nodeView;
        this.setState(nodeView ? { isOpen: this.isOpened(), data: nodeView.node.data.deepCopy(), isSelected: this.isSelected() } : { isOpen: false, data: new NodeCommonData(), isSelected: false }, cb);
    }
    setOpened(opened) {
        this.props.view.folding.openedNodes.set(this.nodeView.viewId, opened);
        this.props.onUpdate();
        this.setState({ isOpen: this.isOpened() });
    }
    hasNodeView() {
        return !!this.currentNodeView;
    }
    keyDown(e) {
        const el = e.currentTarget;
        if (e.keyCode == 13) { //Enter key
            if (el.readOnly) {
                console.log("enter start");
                if (this.nodeView.node.isEditable())
                    this.editInput.set(el).startEdit();
            }
            else {
                console.log("enter end");
                this.endEdit();
            }
        }
        else if (e.keyCode == 27) { //Escape
            console.log("escape");
            this.setState({ data: this.nodeView.node.data });
            this.editInput.abandonEdit();
        }
    }
    change(name, e) {
        console.log("change");
        const value = e.target.value;
        // todo ひどい
        if (name == "name")
            this.state.data.name = value;
        else if (name == "desc")
            this.state.data.desc = value;
        else if (name == "defaultValue")
            if (this.state.data.valueType == NodeValueType.Bool)
                this.state.data.defaultValue = (value == "true" || value == "false") ? value : "";
            else
                this.state.data.defaultValue = value;
        else if (name == "valueType") {
            this.state.data.valueType = NodeValueType[value] != undefined ? NodeValueType[value] : NodeValueType.None;
            this.state.data.defaultValue = (() => {
                switch (this.state.data.valueType) {
                    case NodeValueType.Bool: return "false";
                    case NodeValueType.Number: return "0";
                    case NodeValueType.DateTime: return "1900-01-01T00:00";
                    default: return "";
                }
            })();
        }
        else if (name == "dbType")
            this.state.data.dbColumnDetailData().valueType = value;
        else if (name == "dbValueLength")
            this.state.data.dbColumnDetailData().valueLength = Number.parseInt(value);
        else if (name == "dbIsNotNull")
            this.state.data.dbColumnDetailData().isNotNull = value == "true" ? true : (value == "false" ? false : null);
        this.setState({ data: this.state.data });
    }
    blur(e) {
        console.log("blur");
        if (this.editInput.isEditing()) {
            this.endEdit();
        }
    }
    click(e) {
        const el = e.currentTarget;
        this.clickHandler.click(() => {
            console.log("click");
            if (e.shiftKey && this.props.view.selected.lastSelectedNodeViewId)
                this.props.view.selected.areaSelect(this.nodeView, this.props.view.visible.findByViewId(this.props.view.selected.lastSelectedNodeViewId));
            else if (e.ctrlKey)
                this.props.view.selected.select(this.nodeView);
            else {
                this.props.view.selected.clear();
                this.props.view.selected.select(this.nodeView);
            }
            this.props.onSelected();
        }, () => {
            console.log("doubleclick");
            if (this.nodeView.node.isEditable())
                this.editInput.set(el).startEdit();
        });
    }
    endEdit() {
        const allSiblingNodes = _.flatten(this.nodeView.node.parentIds.map(id => this.tree.nodes.get(id).childIds)).map(id => this.tree.nodes.get(id));
        // todo 同名の場合できれば末尾に数値をつけたい
        if (_.any(allSiblingNodes, n => n.id != this.nodeView.node.id && n.data.name == this.state.data.name)) {
            this.state.data.name = this.nodeView.node.data.name;
            toastr.error("同名のノードが存在します。");
        }
        // ディープコピーされた更新後のノードnodeViewにも反映する
        this.nodeView.node = this.tree.editNode(this.props.treeId, this.nodeView.node, true, n => n.data = this.state.data.deepCopy());
        this.props.onEditEnd();
        this.editInput.endEdit();
        this.tree.nodes.setCheckpoint();
        this.select();
        this.props.onUpdate();
    }
    startEdit() {
        if (!this.ref.input[0])
            return;
        this.ref.input[0].click();
        this.ref.input[0].click();
    }
    handleDragStart(e, isBorder = false) {
        this.props.onDrag(DragState.Start, this, isBorder, e);
    }
    handleDragEnd(e, isBorder = false) {
        this.props.onDrag(DragState.End, this, isBorder, e);
    }
    handleDragOver(e, isBorder = false) {
        e.preventDefault();
    }
    handleDragLeave(e, isBorder = false) {
        e.preventDefault();
        this.props.onDrag(DragState.Leave, this, isBorder, e);
    }
    handleDragEnter(e, isBorder = false) {
        e.preventDefault();
        this.props.onDrag(DragState.Enter, this, isBorder, e);
    }
    handleDrop(e, isBorder = false) {
        this.props.onDrag(DragState.Drop, this, isBorder, e);
    }
    dispValueType(data) {
        // todo Enum, Objectのときのみクラス名を表示  ドロップダウンリストにしたいが..
        switch (data.valueType) {
            case NodeValueType.None: return "";
            case NodeValueType.Bool: return "フラグ";
            case NodeValueType.Class: return this.tree.getNodeFullName(this.tree.nodes.get(data.valueTypeNodeId));
            case NodeValueType.Enum: return this.tree.getNodeFullName(this.tree.nodes.get(data.valueTypeNodeId));
            case NodeValueType.Number: return "数値";
            case NodeValueType.String: return "文字列";
            case NodeValueType.DateTime: return "日付";
        }
    }
    handleSearch(v) {
        const cond = new SearchCondition();
        cond.searchText = v;
        this.props.onSearch(cond);
    }
    get tree() { return this.props.tree; }
    get isEditing() { return this.editInput.isEditing(); }
    get nodeView() { return this.currentNodeView; }
}
class Ref {
    constructor(parent, tr = null, td = new Array(FastTreeGridDefine.table.colNum + 10), // todo おおめ
    tdBorder = null, spanLayer = null, input = new Array(FastTreeGridDefine.table.colNum + 10)) {
        this.tr = tr;
        this.td = td;
        this.tdBorder = tdBorder;
        this.spanLayer = spanLayer;
        this.input = input;
    }
}
class EditInput {
    constructor() { }
    clear() {
        this.el = null;
        this.orgVal = null;
    }
    set(el) {
        this.el = el;
        this.orgVal = el.value;
        return this;
    }
    startEdit() {
        if (this.el == null)
            return;
        this.el.className = "cellInputTextEditing";
        this.el.readOnly = false;
        this.el.select();
    }
    endEdit() {
        if (this.el == null)
            return;
        this.el.className = "cellInputText";
        this.el.readOnly = true;
        this.clear();
    }
    abandonEdit() {
        if (this.el == null)
            return;
        this.el.value = this.orgVal;
        this.el.dispatchEvent(new Event('input', { bubbles: true }));
        this.endEdit();
    }
    isEditing() {
        return this.el != null;
    }
}
export default FastTreeGridRow;
//# sourceMappingURL=FastTreeGridRow.js.map