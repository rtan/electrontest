import * as React from 'react';
import * as _ from 'underscore';
//import {Column, FastTreeGridData as Tree, FastTreeGridNodeData as NodeProperty} from "./FastTreeGridData";
import { FastTreeGridRow as Row } from "./FastTreeGridRow";
import { bigger, smaller } from "../../common/Util";
import { ElementResizeChecker } from "../../common/Unclassified";
import { Key } from 'ts-keycode-enum';
import { FastTreeGridDefine, FastTreeGridDefine as Define } from "./FastTreeGridDefine";
import { FastTreeGridViewNodeData, NodeDataCategory, NodeType } from "./FastTreeGridViewData2";
import nanoid from "nanoid";
import { Dropdown } from "semantic-ui-react";
class FastTreeGridDetail extends React.Component {
    constructor(props) {
        super(props);
        this.parentResizeCheck = new ElementResizeChecker();
        this.nodeTypeOptions = [
            { key: '列挙型', text: '列挙型', value: NodeType.NodeEnum },
            { key: 'エンティティ', text: 'エンティティ', value: NodeType.NodeEntity },
            { key: '匿名エンティティ', text: '匿名エンティティ', value: NodeType.NodeUniRefEntity },
            { key: 'プロパティ', text: 'プロパティ', value: NodeType.NodeProperty },
        ];
        // テーブルのキーアップ時イベント処理
        this.onKeyUp = new Map([
            [Key.Z, e => this.undo()],
            [Key.Y, e => this.redo()],
            [Key.LeftArrow, e => this.focusPrevColumn()],
            [Key.RightArrow, e => this.focusNextColumn()],
            [Key.UpArrow, e => this.moveUp()],
            [Key.DownArrow, e => this.moveDown()],
            [Key.PageUp, e => this.moveUp(10)],
            [Key.PageDown, e => this.moveDown(10)],
            [Key.Tab, e => {
                    if (this.findFocusedRow() != this.findSelectedRow()) {
                        this.findFocusedRow().select();
                        //this.update();
                    }
                    else {
                        this.findSelectedRow().focusNext();
                    }
                }],
        ]);
        this.onKeyUpWithCtrl = new Map([
            [Key.S, e => this.props.tree.save()],
        ]);
        this.columnWidths = [150, 160, 190, 100, 100, 100];
        this.propNodes = [];
        this.columns = new Map([
            [NodeDataCategory.Const, ["詳細"]],
            [NodeDataCategory.Logical, ["詳細"]],
            [NodeDataCategory.Enum, ["詳細"]],
            [NodeDataCategory.Program, ["詳細"]],
            [NodeDataCategory.DB, ["DB型", "長さ", "NULL許可"]],
        ]);
        this.nodeDataCategory = NodeDataCategory.Logical;
        this.lastSelectedViewId = () => this.props.view.selected.lastSelectedNodeViewId;
        this.availableRows = () => this.ref.rows.filter(r => r != null && r.hasNodeView());
        this.findSelectedRowIndex = () => this.availableRows().findIndex(r => r.nodeView.viewId == this.lastSelectedViewId()) || 0;
        this.findSelectedRow = () => this.availableRows().find(r => r.nodeView.viewId == this.lastSelectedViewId()) || this.availableRows()[0];
        this.findFocusedRow = () => this.availableRows()[this.availableRows().findIndex(r => r.isFocused())] || this.availableRows()[0];
        this.indexOfSelectedNode = () => _.findIndex(this.props.view.visible.resultViewNodes, n => this.lastSelectedViewId() == n.viewId);
        this.select = (idx, clear) => {
            if (this.props.view.visible.resultViewNodes[idx]) {
                if (clear)
                    this.props.view.selected.clear();
                this.props.view.selected.select(this.props.view.visible.resultViewNodes[idx]);
            }
        };
        this.ref = new Ref(this);
        this.state = {};
        this.treeId = nanoid();
    }
    getDDItemColumn() {
        return this.node.childIds.map(id => this.props.tree.nodes.get(id)).map(n => { return { key: n.data.name, text: n.data.name, value: n.data.name }; });
    }
    onkeydown(e) {
        if (_.any(this.ref.rows, r => r != null && r.isEditing))
            return;
        // 処理はkeyup時に行う。keydown時のデフォルト処理を無効にしておく。
        if (e.ctrlKey && this.onKeyUpWithCtrl.get(e.keyCode)) {
            e.preventDefault();
        }
        else if (this.onKeyUp.get(e.keyCode)) {
            e.preventDefault();
        }
    }
    onkeyup(e) {
        if (_.any(this.ref.rows, r => r != null && r.isEditing))
            return;
        if (e.ctrlKey && this.onKeyUpWithCtrl.get(e.keyCode)) {
            e.preventDefault();
            this.onKeyUpWithCtrl.get(e.keyCode)(e);
        }
        else if (this.onKeyUp.get(e.keyCode)) {
            e.preventDefault();
            this.onKeyUp.get(e.keyCode)(e);
        }
    }
    undo() {
        this.props.tree.undo("");
    }
    redo() {
        this.props.tree.redo("");
    }
    focusNextColumn() {
        if (this.findFocusedRow().nodeView.node.hasChild()) {
            this.findFocusedRow().switch();
            this.findFocusedRow().select(); // todo 選択状態ではなくなる。。なぜ？
            //this.update();
        }
        else {
            this.findSelectedRow().focusNext();
        }
    }
    focusPrevColumn() {
        if (this.findFocusedRow().nodeView.node.hasChild()) {
            this.findFocusedRow().switch();
            this.findFocusedRow().select(); // todo 選択状態ではなくなる。。なぜ？
            //this.update();
        }
        else {
            this.findSelectedRow().focusPrev();
        }
    }
    moveUp(moveAmountIdx = 1) {
        this.select(bigger(0, this.indexOfSelectedNode() - moveAmountIdx), true);
        this.update(this.node, () => this.findSelectedRow().focus(this.findFocusedRow().focusColIndex()));
    }
    moveDown(moveAmountIdx = 1) {
        this.select(smaller(this.props.view.visible.resultViewNodes.length, this.indexOfSelectedNode() + moveAmountIdx), true);
        this.update(this.node, () => this.findSelectedRow().focus(this.findFocusedRow().focusColIndex()));
    }
    componentDidMount() {
        this.resetColWidths();
        this.parentResizeCheck.set(this.ref.root.parentElement, _ => this.resize());
    }
    resetColWidths() {
        // const tableWidth = this.ref.root!.getBoundingClientRect().width - Define.table.scrollBarWidth;
        // const colWidth = Math.round(tableWidth / (FastTreeGridDefine.table.colNum + 1));
        // this.ref.headerCol.forEach(h => h.style.width = colWidth+"px");
        this.ref.headerCol.filter(c => c != null).forEach((h, i) => h.style.width = this.columnWidths[i] + "px");
    }
    update(node, cb = () => { }) {
        this.node = node;
        this.propNodes = node.childIds.map(id => this.props.tree.nodes.get(id));
        this.nodeDataCategory = node.data.nodeDataCategory;
        this.forceUpdate(() => {
            this.resetColWidths();
            this.propNodes.forEach((n, i) => {
                if (this.ref.rows[i])
                    this.ref.rows[i].update(new FastTreeGridViewNodeData(n, node.id, 0), () => { });
            });
            this.resize();
            cb();
        });
    }
    resize() {
        //if(_(this.ref.rows).any(r => r != null && r.isEditing)) return;
        const widths = this.ref.headerCol.filter(c => c != null).map(c => parseInt(c.style.width)).map(w => bigger(w, Define.table.minColWidth));
        this.ref.bodyCol.filter(c => c != null).forEach((r, i) => r.style.width = r.style.maxWidth = widths[i] + "px");
        this.ref.headerCol.filter(c => c != null).forEach((r, i) => r.style.width = r.style.maxWidth = widths[i] + "px");
        this.ref.rows.filter(r => r != null).forEach(r => r.resize(widths.map(w => w - 2 + "px"))); // todo なんでここでcurrentがnull?? 他のrefは入ってるのになんで？
    }
    getColumns(cate) {
        return ["名称", "説明", "型"].concat(this.columns.get(cate));
    }
    handleChangePrimaryKey(data) {
        this.node.data.dbTableDetailData().primaryKeyNodeIds = data.value;
        this.forceUpdate();
    }
    handleChangeIndexName(e, idx) {
        const indexName = [...this.node.data.dbTableDetailData().indexNodeIds.keys()][idx];
        const items = this.node.data.dbTableDetailData().indexNodeIds.get(indexName) || [];
        const name = e.currentTarget.value;
        this.node.data.dbTableDetailData().indexNodeIds.delete(indexName);
        this.node.data.dbTableDetailData().indexNodeIds.set(name, items);
        this.forceUpdate();
    }
    handleChangeIndexItems(data, idx) {
        const indexName = [...this.node.data.dbTableDetailData().indexNodeIds.keys()][idx];
        const items = data.value;
        this.node.data.dbTableDetailData().indexNodeIds.set(indexName, items);
        this.forceUpdate();
    }
    render() {
        return React.createElement("div", { ref: e => this.ref.root = e, className: "main", onMouseMove: () => this.resize(), onKeyUp: e => this.onkeyup(e), onKeyDown: e => this.onkeydown(e) },
            this.node ?
                React.createElement("div", null,
                    React.createElement("div", { style: { padding: "10px" } },
                        React.createElement("i", { className: FastTreeGridDefine.nodeIcons.get(this.node.data.nodeType) }),
                        " ",
                        React.createElement("b", null, this.node.data.name)),
                    (() => {
                        switch (this.node.data.nodeDataCategory) {
                            case NodeDataCategory.DB:
                                return React.createElement("div", { style: { width: "100%" } },
                                    React.createElement("div", { className: "ui labeled input", style: { width: "100%" } },
                                        React.createElement("div", { className: "ui label" }, "\u4E3B\u30AD\u30FC"),
                                        React.createElement(Dropdown, { ref: e => this.ref.primaryKeyDropDown = e, placeholder: '\u4E3B\u30AD\u30FC', fluid: true, multiple: true, search: true, selection: true, style: { width: "80%" }, options: this.getDDItemColumn(), onChange: (e, data) => this.handleChangePrimaryKey(data), value: this.node.data.dbTableDetailData().primaryKeyNodeIds })),
                                    [...this.node.data.dbTableDetailData().indexNodeIds.keys(), ""].map((indexName, i) => {
                                        return React.createElement("div", { key: i, className: "ui labeled input", style: { width: "100%" } },
                                            React.createElement("div", { className: "ui label" }, "\u30A4\u30F3\u30C7\u30C3\u30AF\u30B9"),
                                            React.createElement("div", { style: { width: "20%", minWidth: "150px", whiteSpace: "nowrap", maxWidth: "150px", float: "left" } },
                                                React.createElement("input", { className: "ui input", type: "text", placeholder: "インデックス名", style: { width: "100%", padding: "6px" }, value: indexName, onChange: (e) => this.handleChangeIndexName(e, i) })),
                                            React.createElement(Dropdown, { ref: e => this.ref.primaryKeyDropDown = e, placeholder: '\u30A4\u30F3\u30C7\u30C3\u30AF\u30B9', fluid: true, multiple: true, search: true, selection: true, style: { width: "60%" }, options: this.getDDItemColumn(), onChange: (e, data) => this.handleChangeIndexItems(data, i), value: this.node.data.dbTableDetailData().indexNodeIds.get(indexName) || [] }));
                                    }));
                            case NodeDataCategory.Program:
                                return React.createElement("div", null, "PROGRAM");
                            default:
                                return React.createElement("div", null);
                        }
                    })())
                : React.createElement("div", null),
            React.createElement("div", null,
                React.createElement("table", { ref: e => this.ref.headerTable = e, className: "headerTable" },
                    React.createElement("tbody", null,
                        React.createElement("tr", null,
                            this.getColumns(this.nodeDataCategory).map((c, i) => React.createElement("td", { key: i, ref: e => this.ref.headerCol[i] = e }, c)),
                            React.createElement("td", { style: { width: "20px", minWidth: "20px", visibility: "hidden" } })))),
                React.createElement("table", { ref: e => this.ref.table = e, className: "bodyTable" },
                    React.createElement("thead", null,
                        React.createElement("tr", null, this.getColumns(this.nodeDataCategory).map((c, i) => React.createElement("th", { key: i, ref: e => this.ref.bodyCol[i] = e })))),
                    React.createElement("tbody", null, this.propNodes.map((n, i) => React.createElement(React.Fragment, { key: i },
                        React.createElement(Row, { key: "row" + i, ref: e => this.ref.rows[i] = e, height: this.props.rowHeight, onUpdate: () => { }, tree: this.props.tree, view: this.props.view, onSelected: () => this.update(this.node), onEditEnd: () => { }, onDrag: (st, r, b, e) => { }, treeId: this.treeId, onDropValueType: (r, e) => { }, onSearch: cond => { }, isDetail: true })))))));
    }
}
class Ref {
    constructor(parent, headerTable = null, headerCol = new Array(Define.table.colNum + 10), // todo おおめ
    rows = [], primaryKeyDropDown = null, root = null, tableDiv = null, table = null, bodyCol = new Array(Define.table.colNum + 10), tdBorders = new Array(Define.table.colNum + 10)) {
        this.headerTable = headerTable;
        this.headerCol = headerCol;
        this.rows = rows;
        this.primaryKeyDropDown = primaryKeyDropDown;
        this.root = root;
        this.tableDiv = tableDiv;
        this.table = table;
        this.bodyCol = bodyCol;
        this.tdBorders = tdBorders;
    }
}
export default FastTreeGridDetail;
//# sourceMappingURL=FastTreeGridDetail.js.map