import { UndoMap } from "../../common/UndoMap";
import { deepCopyByJsonSerializer } from "../../common/Util";
import nanoid from 'nanoid';
import * as _ from 'underscore';
import * as toastr from "toastr";
// export class FastTreeGridChangeEvent {
//     public op: Operation;
//     public nodeIds: string[];
// }
export var NodeDataCategory;
(function (NodeDataCategory) {
    NodeDataCategory[NodeDataCategory["DB"] = 0] = "DB";
    NodeDataCategory[NodeDataCategory["Program"] = 1] = "Program";
    NodeDataCategory[NodeDataCategory["Enum"] = 2] = "Enum";
    NodeDataCategory[NodeDataCategory["Const"] = 3] = "Const";
    NodeDataCategory[NodeDataCategory["Logical"] = 4] = "Logical";
})(NodeDataCategory || (NodeDataCategory = {}));
export var NodeType;
(function (NodeType) {
    NodeType[NodeType["NodeGroupFixed"] = 0] = "NodeGroupFixed";
    NodeType[NodeType["NodeGroup"] = 1] = "NodeGroup";
    NodeType[NodeType["NodeEntity"] = 2] = "NodeEntity";
    NodeType[NodeType["NodeUniRefEntity"] = 3] = "NodeUniRefEntity";
    NodeType[NodeType["NodeProperty"] = 4] = "NodeProperty";
    NodeType[NodeType["NodeEnumValue"] = 5] = "NodeEnumValue";
    NodeType[NodeType["NodeEnum"] = 6] = "NodeEnum";
})(NodeType || (NodeType = {}));
export var NodeValueType;
(function (NodeValueType) {
    NodeValueType[NodeValueType["Number"] = 0] = "Number";
    NodeValueType[NodeValueType["String"] = 1] = "String";
    NodeValueType[NodeValueType["Bool"] = 2] = "Bool";
    NodeValueType[NodeValueType["None"] = 3] = "None";
    NodeValueType[NodeValueType["Enum"] = 4] = "Enum";
    NodeValueType[NodeValueType["Class"] = 5] = "Class";
    NodeValueType[NodeValueType["DateTime"] = 6] = "DateTime";
})(NodeValueType || (NodeValueType = {}));
export class FastTreeGridData {
    constructor() {
        //private observers: ChangeEventHandler[] = [];
        this.observers = [];
        //public subscribe = (handler: ChangeEventHandler) => this.observers.push(handler);
        this.subscribe = (handler) => this.observers.push(handler);
        // set, redo, undo は直接呼ばないこと！同一データの複数ツリー表示時に同期がとれなくなるため。
        this.nodes = new UndoMap();
        this.rootNodeId = "root";
        this.dataFilePath = "data.json";
        this.rootNode = this.nodes.get(this.rootNodeId);
        const rootNode = FastTreeGridNodeData.newGroup();
        rootNode.data.nodeType = NodeType.NodeGroupFixed;
        rootNode.id = this.rootNodeId;
        rootNode.data.name = "root";
        this.nodes.set(rootNode.id, rootNode);
    }
    static newTree() {
        const r = new FastTreeGridData();
        const f = (name, cate) => {
            const n = FastTreeGridNodeData.newGroup(name);
            n.data.nodeType = NodeType.NodeGroupFixed;
            r.addNode("", n, r.rootNodeId);
            n.data.nodeDataCategory = cate; // addNode()内でrootのを適用されるので、ここで適用し直す
        };
        f("定数", NodeDataCategory.Const);
        f("列挙型", NodeDataCategory.Enum);
        f("データベース", NodeDataCategory.DB);
        f("プログラム", NodeDataCategory.Program);
        f("論理", NodeDataCategory.Logical);
        return r;
    }
    save() {
        const fs = require('fs');
        if (fs) {
            fs.writeFileSync(this.dataFilePath, JSON.stringify([...this.nodes.values()].map(n => n.serialize())));
        }
        else {
            localStorage.setItem(this.dataFilePath, JSON.stringify([...this.nodes.values()].map(n => n.serialize())));
        }
        localStorage.setItem(this.dataFilePath, JSON.stringify([...this.nodes.values()].map(n => n.serialize())));
        toastr.success("セーブが完了しました。");
    }
    static load(dataFilePath) {
        const r = FastTreeGridData.newTree();
        r.dataFilePath = dataFilePath;
        const fs = require('fs');
        let json = "";
        if (fs) {
            if (fs.existsSync(dataFilePath)) {
                json = fs.readFileSync(dataFilePath);
            }
        }
        else {
            json = localStorage.getItem(dataFilePath);
        }
        if (!json)
            return r;
        console.log(json);
        const obj = JSON.parse(json);
        obj.map(o => FastTreeGridNodeData.deserialize(o)).forEach(d => r.nodes.set(d.id, d));
        console.log(r);
        return r;
    }
    isAddable(node, parentNode, isCopy = true) {
        const nodeType = node.data.nodeType;
        if (!isCopy && parentNode.childIds.indexOf(node.id) !== -1) {
            return true; // 同じ場所ならOK（移動用）
        }
        if (parentNode.id == this.rootNodeId) {
            toastr.error("ルートノードには追加できません。");
            return false; // ルートノードには追加できない
        }
        if (FastTreeGridData.addableNodes.get(parentNode.data.nodeType).indexOf(nodeType) === -1) {
            toastr.error("追加できないノードタイプです。");
            return false; //親のノードタイプより、 子になれるか
        }
        // 同名時のリネームを実装済み。テストしてないのでコメントアウト状態
        // if(_.any(parentNode.childIds, id => this.nodes.get(id)!.data.name == node.data.name)){
        //     // todo 同名コピー、移動可能にする(別名にする)
        //     toastr.error("同名のノードが存在します。");
        //     return false; // 同名はだめ
        // }
        return true;
    }
    hasSameNameAmongSiblings(name, parentNode) {
        return _.any(parentNode.childIds, id => this.nodes.get(id).data.name == name);
    }
    addNode(treeId, node, parentId, prevViewNode = null) {
        node.parentIds.push(parentId);
        node.data.nodeDataCategory = this.nodes.get(parentId).data.nodeDataCategory;
        this.nodes.set(node.id, node);
        if (prevViewNode)
            this.editNode(treeId, this.nodes.get(parentId), true, n => n.childIds.splice(this.nodes.get(parentId).childIds.indexOf(prevViewNode.node.id) + 1, 0, node.id));
        else
            this.editNode(treeId, this.nodes.get(parentId), true, n => n.childIds.splice(0, 0, node.id));
        ;
    }
    // checkpoint非対応
    removeNode(treeId, viewNode, notify = true) {
        let n = this.nodes.get(viewNode.node.id);
        const parentNode = this.nodes.get(viewNode.parentId);
        this.editNode(treeId, n, false, n => n.parentIds = n.parentIds.filter(id => viewNode.parentId != id));
        this.editNode(treeId, parentNode, false, n => n.childIds = n.childIds.filter(id => id != viewNode.node.id));
        // editNode()で別インスタンスでセットされるため取り直す
        n = this.nodes.get(viewNode.node.id);
        if (n.parentIds.length <= 0)
            this.nodes.delete(viewNode.node.id);
        if (notify)
            this.notify(treeId);
    }
    removeNodes(treeId, viewNodes) {
        viewNodes.forEach(vn => this.removeNode(treeId, vn));
        this.nodes.setCheckpoint();
        this.notify(treeId);
    }
    moveNodeById(treeId, nodeId, beforeParentId, afterParentId, prevSiblingViewNode = null) {
        return this.moveNode(treeId, new FastTreeGridViewNodeData(this.nodes.get(nodeId), beforeParentId, 0), afterParentId, prevSiblingViewNode);
    }
    copyNode(treeId, node, parentId, prevSiblingViewNode = null) {
        const [newNode, childIds] = (() => {
            const parentNode = this.nodes.get(parentId);
            if (parentNode.data.nodeDataCategory != node.data.nodeDataCategory) {
                if (node.data.valueType == NodeValueType.Class) {
                    // 異種間コピーの場合、クラス参照はそのままコピーしない。（異種のノードを参照するのはダメ。ただしEnumは除く）
                    // 参照先のクラスを、ユニーク参照クラスとして再帰コピーする。
                    const refNode = this.nodes.get(node.data.valueTypeNodeId);
                    let newNode = refNode.newCopiedNode();
                    newNode.data.nodeType = NodeType.NodeUniRefEntity;
                    newNode.data.name = node.data.name;
                    newNode.data.nodeDataCategory = parentNode.data.nodeDataCategory;
                    newNode.detail = FastTreeGridNodeData.createNewDetail(parentNode.data.nodeDataCategory, NodeType.NodeUniRefEntity);
                    newNode.data.detail = FastTreeGridNodeData.createNewDetail(parentNode.data.nodeDataCategory, NodeType.NodeUniRefEntity);
                    return [newNode, refNode.childIds];
                }
                else {
                    const newNode = node.newCopiedNode();
                    newNode.data.nodeDataCategory = parentNode.data.nodeDataCategory;
                    newNode.detail = FastTreeGridNodeData.createNewDetail(parentNode.data.nodeDataCategory, newNode.data.nodeType);
                    newNode.data.detail = FastTreeGridNodeData.createNewDetail(parentNode.data.nodeDataCategory, newNode.data.nodeType);
                    return [newNode, node.childIds];
                }
            }
            return [node.newCopiedNode(), node.childIds];
        })();
        this.addNode(treeId, newNode, parentId, prevSiblingViewNode);
        [...childIds].reverse().map(id => this.nodes.get(id)).forEach(n => this.copyNode(treeId, n, newNode.id));
        this.nodes.setCheckpoint();
        this.notify(treeId);
        return newNode;
    }
    addParentIdForProperty(treeId, viewNode, parentId, prevSiblingViewNode = null) {
        const targetNode = () => this.nodes.get(viewNode.node.id);
        const newParentNode = () => this.nodes.get(parentId);
        this.editNode(treeId, targetNode(), false, n => n.parentIds.push(newParentNode().id));
        const idx = prevSiblingViewNode ? newParentNode().childIds.indexOf(prevSiblingViewNode.node.id) + 1 : 0;
        this.editNode(treeId, newParentNode(), false, n => n.childIds.splice(idx, 0, targetNode().id));
        this.nodes.setCheckpoint();
        this.notify(treeId);
        return viewNode.node;
    }
    moveNode(treeId, viewNode, parentId, prevSiblingViewNode = null) {
        const targetNode = () => this.nodes.get(viewNode.node.id);
        const oldParentNode = () => this.nodes.get(viewNode.parentId);
        const newParentNode = () => this.nodes.get(parentId);
        // 移動先が自身の子である場合は移動不可
        if (this.isParentRecursively(newParentNode(), targetNode().id)) {
            toastr.error("ノードを自身の子に移動できません。");
        }
        this.editNode(treeId, targetNode(), false, n => n.parentIds = n.parentIds.filter(id => oldParentNode().id != id));
        this.editNode(treeId, oldParentNode(), false, n => n.childIds = n.childIds.filter(id => id != viewNode.node.id));
        this.editNode(treeId, targetNode(), false, n => n.parentIds.push(newParentNode().id));
        const idx = prevSiblingViewNode ? newParentNode().childIds.indexOf(prevSiblingViewNode.node.id) + 1 : 0;
        this.editNode(treeId, newParentNode(), false, n => n.childIds.splice(idx, 0, targetNode().id));
        this.nodes.setCheckpoint();
        this.notify(treeId);
    }
    // ノードを編集する際はUndo履歴を残すため、このメソッドを経由すること。
    editNode(treeId, node, checkPoint, fn, notify = true) {
        const copied = this.nodes.isUndoEnabled ? node.deepCopy() : node;
        fn(copied);
        this.nodes.set(copied.id, copied);
        if (checkPoint)
            this.nodes.setCheckpoint();
        if (notify)
            this.notify(treeId);
        return copied;
    }
    undo(treeId) {
        const rtn = this.nodes.undo();
        this.notify(treeId);
        return rtn;
    }
    redo(treeId) {
        const rtn = this.nodes.redo();
        this.notify(treeId);
        return rtn;
    }
    notify(treeId) {
        this.observers.forEach(o => o(treeId));
    }
    isParentRecursively(node, parentId) {
        return node.id == parentId || node.parentIds.map(id => this.isParentRecursively(this.nodes.get(id), parentId)).indexOf(true) >= 0;
    }
    // 親が複数いる場合はエラー(ツリー上でユニークなノードのみ取得できます)
    getNodeFullName(node, name = "") {
        if (!node)
            return name;
        if (node.data.nodeType == NodeType.NodeGroupFixed)
            return name;
        if (node.parentIds.length > 1)
            return "error(親が複数います)";
        return this.getNodeFullName(this.nodes.get(node.parentIds[0]), node.data.name + (name ? "." + name : name));
    }
    getRefNodeCnt(nodeId) {
        let cnt = 0;
        this.nodes.forEach(n => {
            if (n.data.valueTypeNodeId == nodeId)
                cnt++;
        });
        return cnt;
    }
    // todo 動作未確認 ツリー上の同一ノードIDの数を算出
    getSameNodeCnt(nodeId) {
        if (this.nodes.get(nodeId).parentIds.length == 0) {
            return 1;
        }
        let cnt = 0;
        this.nodes.get(nodeId).parentIds.forEach(id => cnt += this.getSameNodeCnt(id));
        return cnt;
    }
}
FastTreeGridData.addableNodes = new Map([
    [NodeType.NodeEnum, [NodeType.NodeEnumValue]],
    [NodeType.NodeEnumValue, []],
    [NodeType.NodeProperty, []],
    [NodeType.NodeEntity, [NodeType.NodeProperty]],
    [NodeType.NodeUniRefEntity, [NodeType.NodeProperty, NodeType.NodeUniRefEntity]],
    [NodeType.NodeGroup, [NodeType.NodeGroup, NodeType.NodeUniRefEntity, NodeType.NodeEntity, NodeType.NodeEnum]],
    [NodeType.NodeGroupFixed, [NodeType.NodeGroup]],
]);
export class FastTreeGridNodeData {
    ///** @deprecated */
    //public data: Map<string, any> = new Map<string, any>();
    constructor() {
        this.parentIds = [];
        this.childIds = [];
        this.detail = new EmptyNodeDetailData();
        this.data = new NodeCommonData();
    }
    serialize() {
        return JSON.stringify(this);
    }
    static createNewDetail(nodeCategory, nodeType) {
        // todo めんどい。Null条件識別子なのが欲しい
        try {
            return FastTreeGridNodeData.detailTypes.get(nodeCategory).get(nodeType)();
        }
        catch (_a) {
            return new EmptyNodeDetailData();
        }
    }
    static deserializeDetail(nodeCategory, nodeType, data) {
        // todo めんどい。Null条件識別子なのが欲しい
        try {
            return FastTreeGridNodeData.detailTypes.get(nodeCategory).get(nodeType)().load(data);
        }
        catch (_a) {
            return new EmptyNodeDetailData();
        }
    }
    static deserialize(data) {
        const r = new FastTreeGridNodeData();
        data = JSON.parse(data);
        console.log(data);
        r.id = data.id;
        r.parentIds = data.parentIds;
        r.childIds = data.childIds;
        r.data = Object.assign(new NodeCommonData(), data.data);
        //r.detail = this.createNewDetail(r.data.nodeDataCategory, r.data.nodeType);
        r.detail = this.deserializeDetail(r.data.nodeDataCategory, r.data.nodeType, data.data.detail);
        // todo data.detailに移動中。終わったら消す
        r.data.detail = r.detail;
        console.log(r);
        return r;
    }
    static newGroup(name = "") {
        let a = new FastTreeGridNodeData();
        a.id = nanoid();
        a.data.nodeType = NodeType.NodeGroup;
        a.data.name = name;
        return a;
    }
    static newProperty(data = new NodeCommonData()) {
        let a = new FastTreeGridNodeData();
        a.id = nanoid();
        a.data = data;
        a.data.nodeType = NodeType.NodeProperty;
        return a;
    }
    static newEnumValue() {
        let a = new FastTreeGridNodeData();
        a.id = nanoid();
        a.data.nodeType = NodeType.NodeEnumValue;
        return a;
    }
    static newEntity() {
        let a = new FastTreeGridNodeData();
        a.id = nanoid();
        a.data.nodeType = NodeType.NodeEntity;
        return a;
    }
    static newUniRefEntity() {
        let a = new FastTreeGridNodeData();
        a.id = nanoid();
        a.data.nodeType = NodeType.NodeUniRefEntity;
        return a;
    }
    static newEnum() {
        let a = new FastTreeGridNodeData();
        a.id = nanoid();
        a.data.nodeType = NodeType.NodeEnum;
        return a;
    }
    deepCopy() {
        const a = new FastTreeGridNodeData();
        //a.data.nodeType = this.data.nodeType;
        a.childIds = deepCopyByJsonSerializer(this.childIds);
        a.data = this.data.deepCopy();
        a.id = this.id;
        a.parentIds = deepCopyByJsonSerializer(this.parentIds);
        a.detail = this.detail.deepCopy();
        return a;
    }
    // 既存のノードから新規ノードを作成（nodeId, parentIds, childIdsが新規状態）
    newCopiedNode() {
        const a = this.deepCopy();
        a.id = nanoid();
        a.parentIds = [];
        a.childIds = [];
        return a;
    }
    hasChild() {
        return this.childIds.length > 0;
    }
    isHoldableChilds() {
        return this.data.nodeType == NodeType.NodeGroup ||
            this.data.nodeType == NodeType.NodeEntity ||
            this.data.nodeType == NodeType.NodeGroupFixed ||
            this.data.nodeType == NodeType.NodeUniRefEntity ||
            this.data.nodeType == NodeType.NodeEnum;
    }
    isEditable() {
        return this.data.nodeType != NodeType.NodeGroupFixed;
    }
}
// ロード用 NodeDataCategoryとNodeTypeからdetailDataの型を決める
FastTreeGridNodeData.detailTypes = new Map([
    [NodeDataCategory.DB, new Map([
            [NodeType.NodeEntity, () => new DBTableNodeDetailData()],
            [NodeType.NodeUniRefEntity, () => new DBTableNodeDetailData()],
            [NodeType.NodeProperty, () => new DBColumnNodeDetailData()],
        ])],
    [NodeDataCategory.Program, new Map([
            [NodeType.NodeEntity, () => new ProgramNodeDetailData()],
            [NodeType.NodeUniRefEntity, () => new ProgramNodeDetailData()],
            [NodeType.NodeProperty, () => new ProgramNodeDetailData()],
        ])],
]);
export class FastTreeGridViewNodeData {
    constructor(node, parentId, layerCount) {
        this.node = node;
        this.parentId = parentId;
        this.layerCount = layerCount;
        this.viewId = FastTreeGridViewNodeData.makeViewId(node.id, parentId);
    }
    static makeViewId(id, parentId) {
        return id + " " + parentId;
    }
    static createByViewId(tree, viewId, layerCount = 0) {
        const [nodeId, parentId] = viewId.split(" ");
        return new FastTreeGridViewNodeData(tree.nodes.get(nodeId), parentId, 0);
    }
}
export class FastTreeGridViewData {
    constructor(tree) {
        this.tree = tree;
        this.isFiltered = () => !!this.filter.fn;
        // フィルタ系処理クラス
        this.filter = new class {
            constructor(parent) {
                this.parent = parent;
            }
            exec() {
                if (this.fn != null) {
                    this.resultNodes = new Map();
                    this.parent.tree.nodes.forEach(n => {
                        if (this.fn(n)) {
                            this.set(n);
                            // todo とりあえず一段下までは表示
                            if (this.isDispChilds)
                                n.childIds.forEach(id => this.resultNodes.set(id, this.parent.tree.nodes.get(id)));
                        }
                    });
                }
                else
                    this.resultNodes = null;
            }
            set(n) {
                this.resultNodes.set(n.id, n);
                n.parentIds.forEach(id => this.set(this.parent.tree.nodes.get(id)));
            }
        }(this);
        // ノードグループ開閉系処理クラス
        this.folding = new class {
            constructor(parent) {
                this.parent = parent;
                this.openedNodes = new Map(); // ノードグループの開閉状態リスト
                // openedNodesに存在しないノードグループのデフォルト開閉状態(true=closed, false=opened)
                this.defaultFolding = true;
            }
            isOpened(viewId) {
                let opened = this.openedNodes.get(viewId);
                if (opened == null)
                    opened = this.defaultFolding;
                return opened;
            }
        }(this);
        // 表示ノード系処理クラス
        // todo new class{...} で匿名クラスで書いていたが、匿名クラス内のメンバの参照箇所をWebStormが探せないことが分かりやめた。完全にバグ。
        this.visible = new FastTreeGridViewDataVisible(this);
        // ノード選択系処理クラス
        // todo new class{...} で匿名クラスで書いていたが、匿名クラス内のメンバの参照箇所をWebStormが探せないことが分かりやめた。完全にバグ。
        this.selected = new FastTreeGridViewDataSelected(this);
    }
}
class FastTreeGridViewDataVisible {
    constructor(parent) {
        this.parent = parent;
    }
    updateVisibleNodeList() {
        const ns = this.parent.filter.resultNodes || this.parent.tree.nodes;
        this.resultViewNodes = [];
        this._updateVisibleNodeList(this.parent.tree.rootNodeId, null, ns, 0);
    }
    _updateVisibleNodeList(id, parentId, ns, layerCount) {
        const viewId = FastTreeGridViewNodeData.makeViewId(id, parentId);
        const n = ns.get(id);
        // 検索結果に存在しない
        if (!n) {
            return;
        }
        this.resultViewNodes.push(new FastTreeGridViewNodeData(n, parentId, layerCount));
        // 閉じられた状態の場合は子は含めない
        if (n.isHoldableChilds() && !this.parent.folding.isOpened(viewId))
            return;
        n.childIds.forEach(c => this._updateVisibleNodeList(c, n.id, ns, layerCount + 1));
    }
    findByViewId(viewId) {
        return this.resultViewNodes.find(vn => vn.viewId == viewId);
    }
    find(id, parentId) {
        const viewId = FastTreeGridViewNodeData.makeViewId(id, parentId);
        return this.resultViewNodes.find(vn => vn.viewId == viewId);
    }
}
class FastTreeGridViewDataSelected {
    constructor(parent) {
        this.parent = parent;
        // 選択状態のノードリスト
        this.selectedNodeViews = new Map();
    }
    select(nodeView) {
        if (!nodeView)
            return this;
        this.selectedNodeViews.set(nodeView.viewId, true);
        this.lastSelectedNodeViewId = nodeView.viewId;
        return this;
    }
    areaSelect(n1, n2) {
        this.clear();
        let idx1 = this.parent.visible.resultViewNodes.indexOf(n1);
        let idx2 = this.parent.visible.resultViewNodes.indexOf(n2);
        if (idx1 == -1 || idx2 == -1)
            return;
        if (idx1 > idx2)
            [idx1, idx2] = [idx2, idx1];
        _.range(idx1, idx2 + 1).forEach(i => this.selectedNodeViews.set(this.parent.visible.resultViewNodes[i].viewId, true));
        return this;
    }
    clear() {
        this.selectedNodeViews.clear();
        return this;
    }
    isSelected(nodeView) {
        return !!this.selectedNodeViews.get(nodeView.viewId);
    }
}
export class Column {
    constructor(name, columnName, render) {
        this.name = name;
        this.columnName = columnName;
        this.render = render;
    }
}
class DBIndexMap extends Map {
    toJSON() {
        return [...this.keys()].map(key => [key, this.get(key)]);
    }
}
/**
 * テーブル定義
 * PrimaryKey, Indexはカラムデータではなくこちらで定義（カラムが持つべき情報ではないため）
 */
export class DBTableNodeDetailData {
    constructor(primaryKeyNodeIds = [], indexNodeIds = new DBIndexMap(), // Map<インデックス名, ノードID[]>
    engineName = "InnoDB", defaultCharset = "utf8") {
        this.primaryKeyNodeIds = primaryKeyNodeIds;
        this.indexNodeIds = indexNodeIds;
        this.engineName = engineName;
        this.defaultCharset = defaultCharset;
    }
    toSummaryString() {
        return "PK: " + this.primaryKeyNodeIds.join(",") + " / " + "IDX:" + Array.from(this.indexNodeIds.keys()).join(",");
    }
    deepCopy() {
        const indexNodeIds = new DBIndexMap();
        for (const k in this.indexNodeIds.keys()) {
            indexNodeIds.set(k, this.indexNodeIds.get(k).slice());
        }
        return new DBTableNodeDetailData(this.primaryKeyNodeIds, indexNodeIds, this.engineName, this.defaultCharset);
    }
    load(data) {
        this.primaryKeyNodeIds = data.primaryKeyNodeIds;
        this.engineName = data.engineName;
        this.defaultCharset = data.defaultCharset;
        this.indexNodeIds = new DBIndexMap(data.indexNodeIds || []);
        return this;
    }
}
export class DBColumnNodeDetailData {
    constructor(valueType = "", valueLength = 0, isUnsigned = false, // todo 多分つかわない
    isNotNull = null, options = "") {
        this.valueType = valueType;
        this.valueLength = valueLength;
        this.isUnsigned = isUnsigned;
        this.isNotNull = isNotNull;
        this.options = options;
    }
    toSummaryString() {
        return this.valueType + "(" + this.valueLength + ") " + (this.isNotNull ? "Nullable" : "NotNull") + " " + this.options;
    }
    deepCopy() {
        return new DBColumnNodeDetailData(this.valueType, this.valueLength, this.isUnsigned, this.isNotNull, this.options);
    }
    load(data) {
        this.valueType = data.valueType;
        this.valueLength = data.valueLength;
        this.isUnsigned = data.isUnsigned;
        this.isNotNull = data.isNotNull;
        this.options = data.options;
        return this;
    }
}
export class ProgramNodeDetailData {
    toSummaryString() {
        return "";
    }
    deepCopy() {
        return new ProgramNodeDetailData();
    }
    load(data) {
        return this;
    }
}
export class EmptyNodeDetailData {
    toSummaryString() {
        return "";
    }
    deepCopy() {
        return new EmptyNodeDetailData();
    }
    load(data) {
        return this;
    }
}
export class NodeCommonData {
    constructor(name = "", defaultValue = "", nodeType = NodeType.NodeEntity, valueType = NodeValueType.None, valueTypeNodeId = "", // 列挙型, 参照型の場合に型をノードIDで指定
    nodeDataCategory = NodeDataCategory.Logical, desc = "", detail = new EmptyNodeDetailData()) {
        this.name = name;
        this.defaultValue = defaultValue;
        this.nodeType = nodeType;
        this.valueType = valueType;
        this.valueTypeNodeId = valueTypeNodeId;
        this.nodeDataCategory = nodeDataCategory;
        this.desc = desc;
        this.detail = detail;
    }
    deepCopy() {
        return new NodeCommonData(this.name, this.defaultValue, this.nodeType, this.valueType, this.valueTypeNodeId, this.nodeDataCategory, this.desc, this.detail.deepCopy());
    }
    dbColumnDetailData() {
        return this.detail;
    }
    dbTableDetailData() {
        return this.detail;
    }
}
//# sourceMappingURL=FastTreeGridViewData2.js.map