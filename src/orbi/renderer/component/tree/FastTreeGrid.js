import * as React from 'react';
import { createRef } from 'react';
import * as _ from 'underscore';
//import {Column, FastTreeGridData as Tree, FastTreeGridNodeData as NodeProperty} from "./FastTreeGridData";
import { DragState, FastTreeGridRow as Row } from "./FastTreeGridRow";
import { bigger, removeUnit, smaller } from "../../common/Util";
import { ClipboardData, ElementResizeChecker, StopWatch } from "../../common/Unclassified";
import { Key } from 'ts-keycode-enum';
import { FastTreeGridDefine, FastTreeGridDefine as Define } from "./FastTreeGridDefine";
import { FastTreeGridNodeData, FastTreeGridNodeData as Node, FastTreeGridViewData, FastTreeGridViewNodeData, NodeDataCategory, NodeType, NodeValueType } from "./FastTreeGridViewData2";
import nanoid from "nanoid";
import * as toastr from "toastr";
import FastTreeGridHeader from "./FastTreeGridHeader";
import FastTreeGridDetail from "./FastTreeGridDetail";
import * as ReactDOM from "react-dom";
import 'semantic-ui-css/semantic.css';
class FastTreeGrid extends React.Component {
    constructor(props) {
        super(props);
        this.treeId = nanoid(); // 複数ツリー表示時の判別用
        this.parentResizeCheck = new ElementResizeChecker();
        // テーブルのキーアップ時イベント処理
        this.onKeyUp = new Map([
            [Key.Z, e => this.undo()],
            [Key.Y, e => this.redo()],
            [Key.Q, e => this.addGroup()],
            [Key.A, e => this.addProperty()],
            [Key.W, e => this.addEntity2()],
            [Key.E, e => this.addEntity()],
            [Key.D, e => this.removeSelectedNodes()],
            [Key.LeftArrow, e => this.focusPrevColumn()],
            [Key.RightArrow, e => this.focusNextColumn()],
            [Key.UpArrow, e => this.moveUp()],
            [Key.DownArrow, e => this.moveDown()],
            [Key.PageUp, e => this.moveUp(10)],
            [Key.PageDown, e => this.moveDown(10)],
            [Key.Tab, e => {
                    if (this.findFocusedRow() != this.findSelectedRow()) {
                        this.findFocusedRow().select();
                        this.update();
                    }
                    else {
                        this.findSelectedRow().focusNext();
                    }
                }],
        ]);
        this.onKeyUpWithCtrl = new Map([
            [Key.S, e => this.tree.save()],
            [Key.C, e => this.copyHandler()],
            [Key.V, e => this.pasteHandler()],
        ]);
        this.addGroup = () => this.addNode(NodeType.NodeGroup);
        this.addProperty = () => this.addNode(NodeType.NodeProperty);
        this.addEntity = () => this.addNode(NodeType.NodeEntity);
        this.addEntity2 = () => this.addNode(NodeType.NodeUniRefEntity);
        this.columnWidths = [220, 180, 190, 180];
        this.dragging = false;
        this.render = () => React.createElement("div", { ref: e => this.ref.root = e, className: "main", onMouseMove: () => this.resize() },
            React.createElement(FastTreeGridHeader, { onSearch: cond => this.handleSearch(cond) }),
            React.createElement("table", { ref: e => this.ref.headerTable = e, className: "headerTable" },
                React.createElement("tbody", null,
                    React.createElement("tr", null,
                        React.createElement("td", { ref: e => this.ref.headerCol[0] = e }, "\u540D\u79F0"),
                        React.createElement("td", { ref: e => this.ref.headerCol[1] = e }, "\u8AAC\u660E"),
                        React.createElement("td", { ref: e => this.ref.headerCol[2] = e }, "\u578B"),
                        React.createElement("td", { ref: e => this.ref.headerCol[3] = e }, "\u8A73\u7D30"),
                        React.createElement("td", { style: { width: "20px", minWidth: "20px", visibility: "hidden" } })))),
            React.createElement("div", { ref: e => this.ref.scroll = e, className: "scrollDiv", style: { height: this.parentResizeCheck.height + "px" }, onScroll: e => this.update(), onKeyUp: e => this.onkeyup(e), onKeyDown: e => this.onkeydown(e) },
                React.createElement("div", { ref: e => this.ref.scrollContents = e, style: { overflow: "hidden" } },
                    React.createElement("div", { ref: e => this.ref.tableDiv = e, style: { position: "relative" } },
                        React.createElement("table", { ref: e => this.ref.table = e, className: "bodyTable" },
                            React.createElement("thead", null,
                                React.createElement("tr", null,
                                    React.createElement("th", { ref: e => this.ref.bodyCol[0] = e }),
                                    React.createElement("th", { ref: e => this.ref.bodyCol[1] = e }),
                                    React.createElement("th", { ref: e => this.ref.bodyCol[2] = e }),
                                    React.createElement("th", { ref: e => this.ref.bodyCol[3] = e }))),
                            React.createElement("tbody", null, _.range(Define.table.rowNum - 1).map(i => React.createElement(React.Fragment, { key: i },
                                React.createElement(Row, { key: "row" + i, ref: e => this.ref.rows[i] = e, height: this.props.rowHeight, onUpdate: () => this.rowUpdate(), tree: this.tree, view: this.view, onSelected: () => this.update(), onEditEnd: () => this.update(), onDrag: (st, r, b, e) => this.handleDrag(st, r, b, e), treeId: this.treeId, onDropValueType: (r, e) => this.handlerNodeValueTypeDrop(r, e), onSearch: cond => this.props.searchResultTreeGrid ? this.props.searchResultTreeGrid.handleSearch(cond) : this.handleSearch(cond), isDetail: false }),
                                React.createElement("tr", { key: "borderTr" + i, style: { height: "2px" }, onClick: () => this.handleClickBorder(i) },
                                    React.createElement("td", { key: "borderTd" + i, ref: e => this.ref.tdBorders[i] = e, style: { height: "2px" }, draggable: true, onDragOver: (e) => this.handleDragOverBorder(e, i), onDrop: (e) => this.handleDropBorder(e, i), onDragLeave: e => this.handleDragLeaveBorder(e, i), onDragEnter: e => this.handleDragEnter(e, i) }),
                                    React.createElement("td", { key: "borderTd2" + i, colSpan: Define.table.colNum - 1, style: { height: "2px" } }))))))))),
            FastTreeGridDefine.dataListValueType(),
            FastTreeGridDefine.dataListBool(),
            FastTreeGridDefine.dataListDBType());
        this.maxDisplayRowIndex = () => Math.ceil(removeUnit(this.ref.scroll.style.height) / this.props.rowHeight);
        this.availableRows = () => this.ref.rows.filter(r => r != null && r.hasNodeView());
        this.lastSelectedViewId = () => this.view.selected.lastSelectedNodeViewId;
        this.findSelectedRowIndex = () => this.availableRows().findIndex(r => r.nodeView.viewId == this.lastSelectedViewId()) || 0;
        this.findSelectedRow = () => this.availableRows().find(r => r.nodeView.viewId == this.lastSelectedViewId()) || this.availableRows()[0];
        this.findFocusedRow = () => this.availableRows()[this.availableRows().findIndex(r => r.isFocused())] || this.availableRows()[0];
        this.indexOfSelectedNode = () => _.findIndex(this.view.visible.resultViewNodes, n => this.lastSelectedViewId() == n.viewId);
        this.select = (idx, clear) => {
            if (this.view.visible.resultViewNodes[idx]) {
                if (clear)
                    this.view.selected.clear();
                this.view.selected.select(this.view.visible.resultViewNodes[idx]);
            }
        };
        this.maxScrollSize = () => this.view.visible.resultViewNodes.length * this.props.rowHeight + 10;
        this.tree.nodes.isUndoEnabled = true; // Undo有効化。データロード中は重くなるのでロード後にON（追加毎にディープコピーが発生するため）
        this.ref = new Ref(this);
        this.view = new FastTreeGridViewData(this.tree);
        this.tree.subscribe(treeId => {
            if (treeId == this.treeId) {
                console.log("*** notified - same tree ***");
                return;
            }
            console.log("*** notified - different tree ***");
            this.view.filter.exec();
            this.view.visible.updateVisibleNodeList();
            this.update();
        });
    }
    // テーブルのキーダウン時イベント処理
    // private onKeyDown: Map<Key, (e:React.KeyboardEvent) => void> = new Map<Key, (e:React.KeyboardEvent) => void>([
    //     [Key.LeftArrow, e => 0],
    //     [Key.UpArrow,   e => this.ref.scroll!.scrollTop -= this.props.rowHeight],
    //     [Key.RightArrow,e => 0],
    //     [Key.DownArrow, e => this.ref.scroll!.scrollTop += this.props.rowHeight],
    // ]);
    get tree() { return this.props.tree; }
    componentDidMount() {
        this.updateVisibleNodesCache();
        this.resetColWidths();
        this.parentResizeCheck.set(this.ref.root.parentElement, _ => this.resize());
    }
    undo() {
        const i = this.indexOfSelectedNode();
        if (!this.tree.undo(this.treeId))
            return;
        this.updateVisibleNodesCache();
        //this.select(i - 1, true);
        //this.findSelectedRow().focus();
        this.view.selected.clear();
        this.update();
    }
    redo() {
        const i = this.indexOfSelectedNode();
        if (!this.tree.redo(this.treeId))
            return;
        this.updateVisibleNodesCache();
        // this.select(i - 1, true);
        // this.findSelectedRow().focus();
        this.view.selected.clear();
        this.update();
    }
    focusNextColumn() {
        if (this.findFocusedRow().nodeView.node.hasChild()) {
            this.findFocusedRow().switch();
            this.findFocusedRow().select(); // todo 選択状態ではなくなる。。なぜ？
            this.update();
        }
        else {
            this.findSelectedRow().focusNext();
        }
    }
    focusPrevColumn() {
        if (this.findFocusedRow().nodeView.node.hasChild()) {
            this.findFocusedRow().switch();
            this.findFocusedRow().select(); // todo 選択状態ではなくなる。。なぜ？
            this.update();
        }
        else {
            this.findSelectedRow().focusPrev();
        }
    }
    moveUp(moveAmountIdx = 1) {
        if (this.findSelectedRowIndex() - moveAmountIdx <= 2)
            this.ref.scroll.scrollTop -= this.props.rowHeight * moveAmountIdx;
        this.select(bigger(0, this.indexOfSelectedNode() - moveAmountIdx), true);
        this.update(() => this.findSelectedRow().focus(this.findFocusedRow().focusColIndex()));
    }
    moveDown(moveAmountIdx = 1) {
        if (this.findSelectedRowIndex() + moveAmountIdx >= this.maxDisplayRowIndex() - 3)
            this.ref.scroll.scrollTop += this.props.rowHeight * moveAmountIdx;
        this.select(smaller(this.view.visible.resultViewNodes.length, this.indexOfSelectedNode() + moveAmountIdx), true);
        this.update(() => this.findSelectedRow().focus(this.findFocusedRow().focusColIndex()));
    }
    removeSelectedNodes() {
        const isMultiple = this.view.selected.selectedNodeViews.size > 1;
        const i = this.indexOfSelectedNode();
        if (_.any([...this.view.selected.selectedNodeViews.keys()], viewId => !this.view.visible.findByViewId(viewId).node.isEditable()))
            return;
        this.tree.removeNodes(this.treeId, [...this.view.selected.selectedNodeViews.keys()].map(viewId => this.view.visible.findByViewId(viewId)));
        this.updateVisibleNodesCache();
        this.update(() => {
            this.view.selected.clear();
            if (!isMultiple) {
                const idx = bigger(0, smaller(this.view.visible.resultViewNodes.length - 1, i));
                this.view.selected.select(this.view.visible.resultViewNodes[idx]);
                this.findSelectedRow().focus();
                this.update();
            }
        });
    }
    addNode(nodeType) {
        if (this.view.isFiltered()) {
            toastr.error("絞り込み検索中は移動、コピーできません。");
            return;
        }
        if (!this.view.selected.lastSelectedNodeViewId)
            return;
        let selectedViewNode = this.view.visible.findByViewId(this.view.selected.lastSelectedNodeViewId);
        if (!selectedViewNode)
            return;
        const isInner = selectedViewNode.node.isHoldableChilds() && this.view.folding.isOpened(selectedViewNode.viewId);
        const parentId = isInner ? selectedViewNode.node.id : selectedViewNode.parentId;
        if (!parentId)
            return;
        const parentNode = this.tree.nodes.get(parentId);
        // todo 処理ここじゃない気がする
        if (parentNode.data.nodeDataCategory == NodeDataCategory.Enum) {
            if (nodeType == NodeType.NodeEntity)
                nodeType = NodeType.NodeEnum;
            else if (nodeType == NodeType.NodeUniRefEntity)
                nodeType = NodeType.NodeEnum;
            else if (nodeType == NodeType.NodeProperty)
                nodeType = NodeType.NodeEnumValue;
        }
        const newNode = ((t) => {
            switch (t) {
                case NodeType.NodeEntity: return Node.newEntity();
                case NodeType.NodeUniRefEntity: return Node.newUniRefEntity();
                case NodeType.NodeGroup: return Node.newGroup();
                case NodeType.NodeProperty: return Node.newProperty();
                case NodeType.NodeEnum: return Node.newEnum();
                case NodeType.NodeEnumValue: return Node.newEnumValue();
                default: return Node.newProperty();
            }
        })(nodeType);
        if (!this.tree.isAddable(newNode, parentNode))
            return;
        // todo ここじゃない気が。。categoryとtype指定してnodeインスタンス作るメソッド作った方がいいかも
        newNode.detail = Node.createNewDetail(parentNode.data.nodeDataCategory, nodeType);
        newNode.data.detail = Node.createNewDetail(parentNode.data.nodeDataCategory, nodeType);
        this.tree.addNode(this.treeId, newNode, parentId, isInner ? null : selectedViewNode);
        if (isInner)
            this.findSelectedRow().open();
        this.view.filter.exec();
        this.view.visible.updateVisibleNodeList();
        console.log("asdf");
        this.update(() => {
            console.log("asdf2");
            this.view.selected.clear();
            this.view.selected.select(this.view.visible.find(newNode.id, parentId));
            this.findSelectedRow().focus();
            this.findSelectedRow().startEdit();
        });
    }
    resetColWidths() {
        // const tableWidth = this.ref.root!.getBoundingClientRect().width - Define.table.scrollBarWidth;
        // const colWidth = Math.round(tableWidth / (FastTreeGridDefine.table.colNum + 1));
        // this.ref.headerCol.forEach(h => h.style.width = colWidth+"px");
        this.ref.headerCol.forEach((h, i) => h.style.width = this.columnWidths[i] + "px");
        this.update();
    }
    search(fn) {
        this.view.filter.fn = fn;
        this.view.filter.exec();
        this.updateVisibleNodesCache();
    }
    updateVisibleNodesCache() {
        this.view.visible.updateVisibleNodeList();
        this.update();
    }
    // めっちゃ重い。Rowのrender()が重い。(1行1msくらい)。更に複数ツリー表示していると同期をとるため、ツリー分掛けた時間になる。
    update(cb = () => { }) {
        StopWatch.start();
        if (_.any(this.ref.rows, r => r != null && r.isEditing))
            return;
        let scrollPos = this.ref.scroll.scrollTop;
        let rowNo = Math.floor(this.ref.scroll.scrollTop / this.props.rowHeight);
        // 表示領域のみ更新
        // todo maxDisplayRowIndex()がすぐに値が入らないので、入るまで全描画。
        let rowNum = this.maxDisplayRowIndex() ? (this.maxDisplayRowIndex() + 1) : Define.table.rowNum - 1;
        let cnt = rowNum;
        //console.log(this.view.visible.resultViewNodes);
        // rootは表示しないため、インデックスを+1している
        _.times(rowNum, i => this.ref.rows[i].update(this.view.visible.resultViewNodes[rowNo + i + 1], () => {
            if (--cnt == 0) {
                console.log("update " + StopWatch.stop());
                cb();
            }
        }));
        this.ref.tableDiv.style.top = bigger(0, smaller(scrollPos - (scrollPos % this.props.rowHeight), this.maxScrollSize() - this.parentResizeCheck.height)) + "px";
        this.ref.scrollContents.style.height = this.maxScrollSize().toFixed() + "px";
        // todo 重そう とりあえずドラッグ中はupdateしない
        if (this.detail && !this.dragging) {
            const row = this.findSelectedRow();
            if (row) {
                const nv = this.findSelectedRow().nodeView;
                if (nv) {
                    const n = this.findSelectedRow().nodeView.node;
                    if (n.data.nodeType == NodeType.NodeEntity || n.data.nodeType == NodeType.NodeUniRefEntity) {
                        this.detail.update(n);
                    }
                    else if (n.data.nodeType == NodeType.NodeProperty || n.data.nodeType == NodeType.NodeEnumValue) {
                        this.detail.update(this.tree.nodes.get(nv.parentId));
                    }
                }
            }
        }
        this.resize();
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
    rowUpdate() {
        this.updateVisibleNodesCache();
    }
    resize() {
        StopWatch.start();
        if (_.any(this.ref.rows, r => r != null && r.isEditing))
            return;
        this.ref.scroll.style.height = this.parentResizeCheck.height - 60 + "px";
        const widths = this.ref.headerCol.map(c => parseInt(c.style.width)).map(w => bigger(w, Define.table.minColWidth));
        this.ref.bodyCol.forEach((r, i) => r.style.width = r.style.maxWidth = widths[i] + "px");
        this.ref.headerCol.forEach((r, i) => r.style.width = r.style.maxWidth = widths[i] + "px");
        this.ref.rows.filter(r => r != null).forEach(r => r.resize(widths.map(w => w - 2 + "px"))); // todo なんでここでcurrentがnull?? 他のrefは入ってるのになんで？
        this.ref.scroll.style.maxWidth = this.ref.scroll.style.width = this.ref.headerTable.getBoundingClientRect().width + "px";
        console.log("resize " + StopWatch.stop());
    }
    handlerNodeValueTypeDrop(row, e) {
        console.log("drop");
        //const nodeView = this.view.visible.findByViewId(e.dataTransfer.getData("nodeViewId"));
        const nodeView = FastTreeGridViewNodeData.createByViewId(this.tree, e.dataTransfer.getData("nodeViewId"));
        if (!nodeView)
            return;
        if (nodeView.node.data.nodeType != NodeType.NodeEnum && nodeView.node.data.nodeType != NodeType.NodeEntity)
            return;
        this.tree.editNode(this.treeId, row.nodeView.node, true, n => {
            if (nodeView.node.data.nodeType == NodeType.NodeEnum)
                n.data.valueType = NodeValueType.Enum;
            else if (nodeView.node.data.nodeType == NodeType.NodeEntity)
                n.data.valueType = NodeValueType.Class;
            n.data.valueTypeNodeId = nodeView.node.id;
        });
        this.rowUpdate();
        this.update();
    }
    copyNode(nodeView, parentId, prevSiblingViewNode = null) {
        if (this.view.isFiltered()) {
            toastr.error("絞り込み検索中は移動、コピーできません。");
            return;
        }
        if (!this.tree.isAddable(nodeView.node, this.tree.nodes.get(parentId))) {
            toastr.error("ノードの移動またはコピーに失敗しました。");
            return;
        }
        // todo 同名時のリネーム　もっとスマートにかく
        let renameCnt = 0;
        let newNodeName = nodeView.node.data.name;
        while (this.tree.hasSameNameAmongSiblings(newNodeName, this.tree.nodes.get(parentId))) {
            newNodeName = nodeView.node.data.name + "_" + (++renameCnt);
            console.log("同名あり");
        }
        const newNode = this.tree.copyNode(this.treeId, nodeView.node, parentId, prevSiblingViewNode);
        newNode.data.name = newNodeName;
        this.view.filter.exec();
        this.view.visible.updateVisibleNodeList();
        const n = this.view.visible.find(newNode.id, nodeView.parentId);
        this.view.selected.clear();
        this.view.selected.select(n);
        this.update(() => this.findSelectedRow().focus());
        toastr.success("ノードを複製しました。");
    }
    moveNode(nodeView, parentId, prevSiblingViewNode = null) {
        if (this.view.isFiltered()) {
            toastr.error("絞り込み検索中は移動、コピーできません。");
            return;
        }
        if (!this.tree.isAddable(nodeView.node, this.tree.nodes.get(parentId), false)) {
            toastr.error("ノードの移動またはコピーに失敗しました。");
            return;
        }
        this.tree.moveNode(this.treeId, nodeView, parentId, prevSiblingViewNode);
        this.view.filter.exec();
        this.view.visible.updateVisibleNodeList();
        const n = this.view.visible.find(nodeView.node.id, nodeView.parentId);
        this.view.selected.select(n);
        this.update(() => this.findSelectedRow().focus());
    }
    addParentIdForProperty(nodeView, parentId, prevSiblingViewNode = null) {
        if (this.view.isFiltered()) {
            toastr.error("絞り込み検索中は移動、コピーできません。");
            return;
        }
        if (!this.tree.isAddable(nodeView.node, this.tree.nodes.get(parentId))) {
            toastr.error("ノードの移動またはコピーに失敗しました。");
            return;
        }
        if (nodeView.node.data.nodeType != NodeType.NodeProperty) {
            toastr.error("プロパティ以外は参照コピーできません。");
            return;
        }
        if (nodeView.node.data.nodeDataCategory != this.tree.nodes.get(parentId).data.nodeDataCategory) {
            toastr.error("異なるカテゴリに参照コピーできません。");
            return;
        }
        if (this.tree.nodes.get(parentId).childIds.indexOf(nodeView.node.id) !== -1) {
            toastr.error("既にプロパティが存在しています。");
            return;
        }
        const node = this.tree.addParentIdForProperty(this.treeId, nodeView, parentId, prevSiblingViewNode);
        this.view.filter.exec();
        this.view.visible.updateVisibleNodeList();
        const n = this.view.visible.find(node.id, nodeView.parentId);
        this.view.selected.clear();
        this.view.selected.select(n);
        this.update(() => this.findSelectedRow().focus());
        toastr.success("ノードの参照コピーを作成しました。");
    }
    handleDrag(state, row, isBorder, e) {
        if (!row.nodeView)
            return;
        console.log(DragState[state] + " " + isBorder + " " + row.nodeView.node.data.name);
        console.log(row);
        if (state == DragState.Start) {
            this.dragging = true;
            e.dataTransfer.setData("nodeViewId", row.nodeView.viewId);
            // 他ツリーデータ間コピー用（他ツリーにnodeIdを渡しても見つからないので実データをそのまま渡す）
            e.dataTransfer.setData("nodeData", row.nodeView.node.serialize());
            e.dataTransfer.setData("parentId", row.nodeView.parentId);
        }
        const isCopy = (n) => {
            return e.ctrlKey || n.data.nodeDataCategory != row.nodeView.node.data.nodeDataCategory;
        };
        const isRefCopy = () => !!e.altKey;
        // todo 異種間移動でオブジェクト参照の場合ValueTypeNodeIdをクリアしないとまずい
        const drop = (isBorder) => {
            this.dragging = false;
            console.log(e.dataTransfer.getData("nodeViewId"));
            //const nodeView = FastTreeGridViewNodeData.createByViewId(this.tree, e.dataTransfer.getData("nodeViewId")!);
            const node = Node.deserialize(e.dataTransfer.getData("nodeData"));
            const nodeView = new FastTreeGridViewNodeData(node, e.dataTransfer.getData("parentId"), 0);
            if (!nodeView || nodeView.viewId == row.nodeView.viewId)
                return;
            const parentId = (!isBorder && this.tree.nodes.get(row.nodeView.node.id).isHoldableChilds()) ? row.nodeView.node.id : row.nodeView.parentId;
            if (isRefCopy()) {
                this.addParentIdForProperty(nodeView, parentId, row.nodeView);
            }
            else if (isCopy(nodeView.node)) {
                this.copyNode(nodeView, parentId, row.nodeView);
            }
            else {
                this.moveNode(nodeView, parentId, row.nodeView);
            }
        };
        // todo 複数選択DnD
        if (isBorder) {
            if (state == DragState.Drop) {
                this.hilightBorder(false, this.ref.rows.indexOf(row));
                drop(true);
            }
            else if (state == DragState.Leave) {
                this.hilightBorder(false, this.ref.rows.indexOf(row));
            }
            else {
                this.hilightBorder(true, this.ref.rows.indexOf(row));
            }
        }
        else {
            if (state == DragState.Drop) {
                if (!row.nodeView.node.isHoldableChilds())
                    return;
                drop(false);
            }
            if (state == DragState.Leave) {
            }
            else {
                row.select();
            }
            this.update();
        }
    }
    copyHandler(e = null) {
        // todo 複数選択行コピー対応
        if (e) {
            e.clipboardData.setData("text", this.findSelectedRow().nodeView.node.serialize());
            e.preventDefault();
        }
        else
            ClipboardData.set("text", this.findSelectedRow().nodeView.node.serialize());
        toastr.success("コピーしました。(CTRL+Vでペースト)");
    }
    // todo カット対応
    pasteHandler(e = null) {
        const node = FastTreeGridNodeData.deserialize(e ? e.clipboardData.getData("text") : ClipboardData.get("text"));
        if (e)
            e.preventDefault();
        // todo 選択してない時どうなる
        const parentId = this.findSelectedRow().nodeView.node.isHoldableChilds() ? this.findSelectedRow().nodeView.node.id : this.findSelectedRow().nodeView.parentId;
        const nodeView = new FastTreeGridViewNodeData(node, parentId, 0);
        this.copyNode(nodeView, parentId, this.findSelectedRow().nodeView);
    }
    handleSearch(cond) {
        this.view.filter.fn = !cond.hasContidion() ? null : (node) => {
            if (cond.searchText.startsWith("entity:")) {
                // 対象のエンティティをフルネームで検索(例: Ws.Common.Card)
                const fullName = cond.searchText.replace("entity:", "");
                if (this.tree.getNodeFullName(node) != fullName) {
                    return false;
                }
            }
            else if (cond.searchText.startsWith("ref:")) {
                // 対象のエンティティを型にしているプロパティをすべて検索
                const nodeId = cond.searchText.replace("ref:", "");
                if (node.data.valueTypeNodeId != nodeId) {
                    return false;
                }
            }
            else if (cond.searchText.startsWith("same:")) {
                const nodeId = cond.searchText.replace("same:", "");
                if (node.id != nodeId) {
                    return false;
                }
            }
            else if (node.data.name.toLowerCase().indexOf(cond.searchText.toLowerCase()) === -1) {
                return false;
            }
            if (cond.nodeDataCategories.length > 0 && cond.nodeDataCategories.indexOf(node.data.nodeDataCategory) === -1) {
                return false;
            }
            if (cond.nodeTypes.length > 0 && cond.nodeTypes.indexOf(node.data.nodeType) === -1) {
                return false;
            }
            return true;
        };
        // ノード種別絞り込みの場合は子は表示しない（エンティティ絞り込みのときにプロパティが出てしまうため）
        this.view.filter.isDispChilds = cond.nodeTypes.length == 0;
        this.view.filter.exec();
        this.updateVisibleNodesCache();
    }
    handleClickBorder(idx) {
        this.view.selected.clear();
        this.view.selected.select(this.ref.rows[idx].nodeView);
        this.update();
    }
    hilightBorder(enabled, idx) {
        if (enabled) {
            this.ref.tdBorders[idx].style.height = "5px";
            this.ref.tdBorders[idx].style.backgroundColor = "#ffa500";
        }
        else {
            this.ref.tdBorders[idx].style.height = "2px";
            this.ref.tdBorders[idx].style.backgroundColor = "transparent";
        }
    }
    handleDragOverBorder(e, idx) {
        e.preventDefault();
    }
    handleDropBorder(e, idx) {
        this.handleDrag(DragState.Drop, this.ref.rows[idx], true, e);
    }
    handleDragLeaveBorder(e, idx) {
        e.preventDefault();
        this.handleDrag(DragState.Leave, this.ref.rows[idx], true, e);
    }
    handleDragEnter(e, idx) {
        e.preventDefault();
        this.handleDrag(DragState.Enter, this.ref.rows[idx], true, e);
    }
    createDetailComponent(elementId) {
        return this.createDetailComponentByElement(document.getElementById(elementId));
    }
    createDetailComponentByElement(element) {
        let r = createRef();
        const o = React.createElement(FastTreeGridDetail, { ref: r, tree: this.tree, view: this.view, rowHeight: this.props.rowHeight });
        ReactDOM.render(o, element);
        this.detail = r.current;
        return r.current;
    }
    get nodeCount() { return this.tree.nodes.size; }
    get filteredNodeCount() { return this.view.visible.resultViewNodes.length; }
}
class Ref {
    constructor(parent, root = null, scroll = null, scrollContents = null, headerTable = null, tableDiv = null, table = null, headerCol = new Array(Define.table.colNum + 1), bodyCol = new Array(Define.table.colNum + 1), rows = new Array(Define.table.rowNum), tdBorders = new Array(Define.table.colNum + 1)) {
        this.root = root;
        this.scroll = scroll;
        this.scrollContents = scrollContents;
        this.headerTable = headerTable;
        this.tableDiv = tableDiv;
        this.table = table;
        this.headerCol = headerCol;
        this.bodyCol = bodyCol;
        this.rows = rows;
        this.tdBorders = tdBorders;
    }
}
export default FastTreeGrid;
//# sourceMappingURL=FastTreeGrid.js.map