import {IUndoMapValue, UndoMap} from "../../common/UndoMap";
import {deepCopyByJsonSerializer} from "../../common/Util";
import nanoid from 'nanoid';
import * as _ from 'underscore';
import {ChangeEvent} from "react";
import * as toastr from "toastr";
import {node} from "prop-types";

type Node = FastTreeGridNodeData;
type Tree = FastTreeGridData;
type View = FastTreeGridViewData;
//type ChangeEventHandler = (event: FastTreeGridChangeEvent) => void
type NodeMap = UndoMap<Id, Node>;
type NodeViewMap = Map<ViewId, NodeView>;
type NodeView = FastTreeGridViewNodeData;

// enum Operation {
//     AddNodes,    // ノード追加
//     MoveNodes,  // ノード移動
//     DelNodes,   // ノード削除
//     EditNodes   // ノードデータ編集
// }

type Id = string;
type ViewId = string;

// export class FastTreeGridChangeEvent {
//     public op: Operation;
//     public nodeIds: string[];
// }

export enum NodeDataCategory {
    DB,
    Program,
    Enum,
    Const,
    Logical,
}

export enum NodeType {
    NodeGroupFixed,   // 変更不可なグループ（ルートノード）
    NodeGroup,
    NodeEntity,       // 通常エンティティ
    NodeUniRefEntity, // 固定参照エンティティ（クラスとプロパティの定義が一度に行えるが、他所で参照不可）
    NodeProperty,     // プロパティ（エンティティ内の要素）
    NodeEnumValue,     // Enum値
    NodeEnum,         // Enumエンティティ
}

export enum NodeValueType {
    Number,
    String,
    Bool,
    None,
    Enum,   // ドロップダウン選択不可 DnDのみ
    Class,  // ドロップダウン選択不可 DnDのみ
    DateTime,
}

export class FastTreeGridData {
    //private observers: ChangeEventHandler[] = [];
    private observers: ((treeId: string)=>void)[] = [];
    //public subscribe = (handler: ChangeEventHandler) => this.observers.push(handler);
    public subscribe = (handler:(treeId: string)=>void) => this.observers.push(handler);

    // set, redo, undo は直接呼ばないこと！同一データの複数ツリー表示時に同期がとれなくなるため。
    public nodes: NodeMap = new UndoMap<Id, Node>();

    public rootNodeId: Id = "root";
    public dataFilePath: string = "d2";

    constructor(){
        const rootNode = FastTreeGridNodeData.newGroup();
        rootNode.data.nodeType = NodeType.NodeGroupFixed;
        rootNode.id = this.rootNodeId;
        rootNode.data.name = "root";
        this.nodes.set(rootNode.id, rootNode);
    }

    public static newTree(){
        const r = new FastTreeGridData();
        const f = (name: string, cate: NodeDataCategory) => {
            const n = FastTreeGridNodeData.newGroup(name);
            n.data.nodeType = NodeType.NodeGroupFixed;
            r.addNode("", n, r.rootNodeId);
            n.data.nodeDataCategory = cate; // addNode()内でrootのを適用されるので、ここで適用し直す
        }
        f("定数", NodeDataCategory.Const);
        f("列挙型", NodeDataCategory.Enum);
        f("データベース", NodeDataCategory.DB);
        f("プログラム", NodeDataCategory.Program);
        f("論理", NodeDataCategory.Logical);
        return r;
    }

    public rootNode = this.nodes.get(this.rootNodeId)!;

    public save(){
        localStorage.setItem(this.dataFilePath, JSON.stringify([...this.nodes.values()].map(n => n.serialize())));
        toastr.success("セーブが完了しました。");
    }
    public static load(dataFilePath: string){
        const r = FastTreeGridData.newTree();
        r.dataFilePath = dataFilePath;
        const json = localStorage.getItem(dataFilePath);
        if(!json) return r;
        console.log(json);
        const obj = JSON.parse(json);
        (obj as Array<any>).map(o => FastTreeGridNodeData.deserialize(o)).forEach(d => r.nodes.set(d.id, d));
        console.log(r);
        return r;
    }

    private static addableNodes = new Map<NodeType, NodeType[]>([
        [NodeType.NodeEnum, [NodeType.NodeEnumValue]],
        [NodeType.NodeEnumValue, []],
        [NodeType.NodeProperty, []],
        [NodeType.NodeEntity, [NodeType.NodeProperty]],
        [NodeType.NodeUniRefEntity, [NodeType.NodeProperty, NodeType.NodeUniRefEntity]],
        [NodeType.NodeGroup, [NodeType.NodeGroup, NodeType.NodeUniRefEntity, NodeType.NodeEntity, NodeType.NodeEnum]],
        [NodeType.NodeGroupFixed, [NodeType.NodeGroup]],
    ]);

    public isAddable(node: Node, parentNode: Node, isCopy: boolean = true){
        const nodeType = node.data.nodeType;
        if( !isCopy && parentNode.childIds.indexOf(node.id) !== -1){
            return true; // 同じ場所ならOK（移動用）
        }
        if(parentNode.id == this.rootNodeId){
            toastr.error("ルートノードには追加できません。");
            return false; // ルートノードには追加できない
        }
        if(FastTreeGridData.addableNodes.get(parentNode.data.nodeType)!.indexOf(nodeType) === -1) {
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

    public hasSameNameAmongSiblings(name: string, parentNode: Node){
        return _.any(parentNode.childIds, id => this.nodes.get(id)!.data.name == name);
    }

    public addNode(treeId: string, node: Node, parentId: Id, prevViewNode: NodeView | null = null){
        node.parentIds.push(parentId);
        node.data.nodeDataCategory = this.nodes.get(parentId)!.data.nodeDataCategory;
        this.nodes.set(node.id, node);
        if(prevViewNode)
            this.editNode(treeId, this.nodes.get(parentId)!, true, n=>n.childIds.splice(this.nodes.get(parentId)!.childIds.indexOf(prevViewNode.node.id) + 1, 0, node.id));
        else
            this.editNode(treeId, this.nodes.get(parentId)!, true, n=>n.childIds.splice(0, 0, node.id));;
    }
    // checkpoint非対応
    private removeNode(treeId: string, viewNode: FastTreeGridViewNodeData, notify: boolean = true){
        let n = this.nodes.get(viewNode.node.id)!;
        const parentNode = this.nodes.get(viewNode.parentId!)!;

        this.editNode(treeId, n, false, n => n.parentIds = n.parentIds.filter(id => viewNode.parentId != id));
        this.editNode(treeId, parentNode, false, n => n.childIds = n.childIds.filter(id => id != viewNode.node.id));

        // editNode()で別インスタンスでセットされるため取り直す
        n = this.nodes.get(viewNode.node.id)!;
        if(n.parentIds.length <= 0)  this.nodes.delete(viewNode.node.id);

        if(notify)
            this.notify(treeId);
    }
    public removeNodes(treeId: string, viewNodes: FastTreeGridViewNodeData[]){
        viewNodes.forEach(vn => this.removeNode(treeId, vn));
        this.nodes.setCheckpoint();
        this.notify(treeId);
    }

    public moveNodeById(treeId: string, nodeId: Id, beforeParentId: Id, afterParentId: Id, prevSiblingViewNode: FastTreeGridViewNodeData|null = null){
        return this.moveNode(treeId, new FastTreeGridViewNodeData(this.nodes.get(nodeId)!, beforeParentId, 0), afterParentId, prevSiblingViewNode);
    }

    public copyNode(treeId: string, node: Node, parentId: Id, prevSiblingViewNode: FastTreeGridViewNodeData|null = null){
        const [newNode, childIds] = (():[Node, string[]]=> {
            const parentNode = this.nodes.get(parentId)!;
            if (parentNode.data.nodeDataCategory != node.data.nodeDataCategory) {
                if (node.data.valueType == NodeValueType.Class) {
                    // 異種間コピーの場合、クラス参照はそのままコピーしない。（異種のノードを参照するのはダメ。ただしEnumは除く）
                    // 参照先のクラスを、ユニーク参照クラスとして再帰コピーする。
                    const refNode = this.nodes.get(node.data.valueTypeNodeId)!;
                    let newNode = refNode.newCopiedNode();
                    newNode.data.nodeType = NodeType.NodeUniRefEntity;
                    newNode.data.name = node.data.name;
                    newNode.data.nodeDataCategory = parentNode.data.nodeDataCategory;
                    newNode.detail = FastTreeGridNodeData.createNewDetail(parentNode.data.nodeDataCategory, NodeType.NodeUniRefEntity);
                    newNode.data.detail = FastTreeGridNodeData.createNewDetail(parentNode.data.nodeDataCategory, NodeType.NodeUniRefEntity);
                    return [newNode, refNode.childIds];
                } else {
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

        [...childIds].reverse().map(id  => this.nodes.get(id)!).forEach(n => this.copyNode(treeId, n, newNode.id));

        this.nodes.setCheckpoint();
        this.notify(treeId);
        return newNode;
    }

    public addParentIdForProperty(treeId: string, viewNode: NodeView, parentId: Id, prevSiblingViewNode: FastTreeGridViewNodeData|null = null){
        const targetNode = () => this.nodes.get(viewNode.node.id)!;
        const newParentNode = () => this.nodes.get(parentId)!;
        this.editNode(treeId, targetNode(), false, n=>n.parentIds.push(newParentNode().id));
        const idx = prevSiblingViewNode ? newParentNode().childIds.indexOf(prevSiblingViewNode.node.id) + 1 : 0;
        this.editNode(treeId, newParentNode(), false, n => n.childIds.splice(idx, 0, targetNode().id));

        this.nodes.setCheckpoint();
        this.notify(treeId);
        return viewNode.node;
    }

    public moveNode(treeId: string, viewNode: NodeView, parentId: Id, prevSiblingViewNode: FastTreeGridViewNodeData|null = null){
        const targetNode = () => this.nodes.get(viewNode.node.id)!;
        const oldParentNode = () => this.nodes.get(viewNode.parentId!)!;
        const newParentNode = () => this.nodes.get(parentId)!;

        // 移動先が自身の子である場合は移動不可
        if(this.isParentRecursively(newParentNode(), targetNode().id)) {
            toastr.error("ノードを自身の子に移動できません。");
        }

        this.editNode(treeId, targetNode(), false, n => n.parentIds = n.parentIds.filter(id => oldParentNode().id != id));
        this.editNode(treeId, oldParentNode(), false, n => n.childIds = n.childIds.filter(id => id != viewNode.node.id));

        this.editNode(treeId, targetNode(), false, n=>n.parentIds.push(newParentNode().id));
        const idx = prevSiblingViewNode ? newParentNode().childIds.indexOf(prevSiblingViewNode.node.id) + 1 : 0;
        this.editNode(treeId, newParentNode(), false, n => n.childIds.splice(idx, 0, targetNode().id));

        this.nodes.setCheckpoint();
        this.notify(treeId);
    }

    // ノードを編集する際はUndo履歴を残すため、このメソッドを経由すること。
    public editNode(treeId: string, node: Node, checkPoint: boolean, fn: (n: Node) => void, notify: boolean = true){
        const copied = this.nodes.isUndoEnabled ? node.deepCopy() : node;
        fn(copied);
        this.nodes.set(copied.id, copied);
        if(checkPoint) this.nodes.setCheckpoint();

        if(notify)
            this.notify(treeId);

        return copied;
    }

    public undo(treeId: string){
        const rtn = this.nodes.undo();
        this.notify(treeId)
        return rtn;
    }

    public redo(treeId: string){
        const rtn = this.nodes.redo();
        this.notify(treeId);
        return rtn;
    }

    public notify(treeId: string){
        this.observers.forEach(o => o(treeId));
    }

    private isParentRecursively(node: Node, parentId: Id): boolean{
        return node.id == parentId || node.parentIds.map(id => this.isParentRecursively(this.nodes.get(id)!, parentId)).indexOf(true) >= 0
    }

    // 親が複数いる場合はエラー(ツリー上でユニークなノードのみ取得できます)
    public getNodeFullName(node: Node, name: string = ""): string{
        if(!node) return name;
        if(node.data.nodeType == NodeType.NodeGroupFixed) return name;
        if(node.parentIds.length > 1) return "error(親が複数います)";
        return this.getNodeFullName(this.nodes.get(node.parentIds[0])!,node.data.name + (name ? "." + name : name));
    }

    public getRefNodeCnt(nodeId: Id){
        let cnt = 0;
        this.nodes.forEach(n => {
            if(n.data.valueTypeNodeId == nodeId) cnt++;
        });
        return cnt;
    }
    // todo 動作未確認 ツリー上の同一ノードIDの数を算出
    public getSameNodeCnt(nodeId: Id){
        if(this.nodes.get(nodeId)!.parentIds.length == 0) {
            return 1;
        }
        let cnt = 0;
        this.nodes.get(nodeId)!.parentIds.forEach(id => cnt += this.getSameNodeCnt(id));
        return cnt;
    }
}

export class FastTreeGridNodeData implements IUndoMapValue<FastTreeGridNodeData> {
    public id: Id;
    public parentIds: string[] = [];
    public childIds: string[] = [];

    public detail: INodeDetailData = new EmptyNodeDetailData();
    public data: NodeCommonData = new NodeCommonData();

    ///** @deprecated */
    //public data: Map<string, any> = new Map<string, any>();

    constructor() {
    }

    public serialize(){
        return JSON.stringify(this);
    }

    // ロード用 NodeDataCategoryとNodeTypeからdetailDataの型を決める
    private static detailTypes = new Map<NodeDataCategory, Map<NodeType, ()=>INodeDetailData>>([
        [NodeDataCategory.DB, new Map<NodeType, ()=>INodeDetailData>([
            [NodeType.NodeEntity, ()=>new DBTableNodeDetailData()],
            [NodeType.NodeUniRefEntity, ()=>new DBTableNodeDetailData()],
            [NodeType.NodeProperty, ()=>new DBColumnNodeDetailData()],
        ])],
        [NodeDataCategory.Program, new Map<NodeType, ()=>INodeDetailData>([
            [NodeType.NodeEntity, ()=>new ProgramNodeDetailData()],
            [NodeType.NodeUniRefEntity, ()=>new ProgramNodeDetailData()],
            [NodeType.NodeProperty, ()=>new ProgramNodeDetailData()],
        ])],
    ]);

    public static createNewDetail(nodeCategory: NodeDataCategory, nodeType: NodeType){
        // todo めんどい。Null条件識別子なのが欲しい
        try {
            return FastTreeGridNodeData.detailTypes.get(nodeCategory)!.get(nodeType)!();
        }catch{
            return new EmptyNodeDetailData();
        }
    }
    public static deserializeDetail(nodeCategory: NodeDataCategory, nodeType: NodeType, data: any): INodeDetailData{
        // todo めんどい。Null条件識別子なのが欲しい
        try {
            return FastTreeGridNodeData.detailTypes.get(nodeCategory)!.get(nodeType)!().load(data);
        }catch{
            return new EmptyNodeDetailData();
        }
    }

    public static deserialize(data: any){
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

    public static newGroup(name: string = "") {
        let a = new FastTreeGridNodeData();
        a.id = nanoid();
        a.data.nodeType = NodeType.NodeGroup;
        a.data.name = name;
        return a;
    }

    public static newProperty(data: NodeCommonData = new NodeCommonData()) {
        let a = new FastTreeGridNodeData();
        a.id = nanoid();
        a.data = data;
        a.data.nodeType = NodeType.NodeProperty;
        return a;
    }

    public static newEnumValue() {
        let a = new FastTreeGridNodeData();
        a.id = nanoid();
        a.data.nodeType = NodeType.NodeEnumValue;
        return a;
    }

    public static newEntity() {
        let a = new FastTreeGridNodeData();
        a.id = nanoid();
        a.data.nodeType = NodeType.NodeEntity;
        return a;
    }

    public static newUniRefEntity() {
        let a = new FastTreeGridNodeData();
        a.id = nanoid();
        a.data.nodeType = NodeType.NodeUniRefEntity;
        return a;
    }

    public static newEnum() {
        let a = new FastTreeGridNodeData();
        a.id = nanoid();
        a.data.nodeType = NodeType.NodeEnum;
        return a;
    }

    public deepCopy(): FastTreeGridNodeData {
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
    public newCopiedNode(): FastTreeGridNodeData {
        const a = this.deepCopy();
        a.id = nanoid();
        a.parentIds = [];
        a.childIds = [];
        return a;
    }

    public hasChild() {
        return this.childIds.length > 0;
    }

    public isHoldableChilds() {
        return this.data.nodeType == NodeType.NodeGroup ||
            this.data.nodeType == NodeType.NodeEntity ||
            this.data.nodeType == NodeType.NodeGroupFixed ||
            this.data.nodeType == NodeType.NodeUniRefEntity ||
            this.data.nodeType == NodeType.NodeEnum;
    }

    public isEditable(){
        return this.data.nodeType != NodeType.NodeGroupFixed;
    }
}

export class FastTreeGridViewNodeData {
    public viewId: string;
    constructor(public node: Node, public parentId: Id | null, public layerCount: number) {
        this.viewId = FastTreeGridViewNodeData.makeViewId(node.id, parentId);
    }
    public static makeViewId(id: Id, parentId: Id | null){
        return id + " " + parentId;
    }
    public static createByViewId(tree: FastTreeGridData, viewId: ViewId, layerCount: number = 0){
        const [nodeId, parentId] = viewId.split(" ");
        return new FastTreeGridViewNodeData(tree.nodes.get(nodeId)!, parentId, 0);
    }
}

export class FastTreeGridViewData {

    constructor(public tree: Tree){}

    public isFiltered = () => !!this.filter.fn;

    // フィルタ系処理クラス
    public filter = new class{
        constructor(private parent: View){}
        public fn: ((n: Node) => boolean) | null; // 検索処理登録
        public resultNodes: Map<Id, Node> | null; // 検索後のNode[]
        public exec(){
            if(this.fn != null) {
                this.resultNodes = new Map<Id, Node>();
                this.parent.tree.nodes.forEach(n => {
                    if(this.fn!(n)) {
                        this.set(n);
                        // todo とりあえず一段下までは表示
                        n.childIds.forEach(id => this.resultNodes!.set(id, this.parent.tree.nodes.get(id)!));
                    }
                });
            } else
                this.resultNodes = null;
        }
        private set(n: Node){
            this.resultNodes!.set(n.id, n);
            n.parentIds.forEach(id => this.set(this.parent.tree.nodes.get(id)!));
        }
    }(this);

    // ノードグループ開閉系処理クラス
    public folding = new class{
        constructor(private parent: View){}
        public openedNodes: Map<ViewId, boolean> = new Map<ViewId, boolean>(); // ノードグループの開閉状態リスト
        // openedNodesに存在しないノードグループのデフォルト開閉状態(true=closed, false=opened)
        public defaultFolding: boolean = true;
        public isOpened(viewId: ViewId){
            let opened = this.openedNodes.get(viewId);
            if(opened == null) opened = this.defaultFolding;
            return opened;
        }
    }(this);

    // 表示ノード系処理クラス
    // todo new class{...} で匿名クラスで書いていたが、匿名クラス内のメンバの参照箇所をWebStormが探せないことが分かりやめた。完全にバグ。
    public visible = new FastTreeGridViewDataVisible(this);

    // ノード選択系処理クラス
    // todo new class{...} で匿名クラスで書いていたが、匿名クラス内のメンバの参照箇所をWebStormが探せないことが分かりやめた。完全にバグ。
    public selected = new FastTreeGridViewDataSelected(this);
}

class FastTreeGridViewDataVisible {
    constructor(private parent: View){}
    // filteredNodes[]から閉じられたグループのノードを除外したもの。グリッドの表示順に入る。
    public resultViewNodes: NodeView[];
    public updateVisibleNodeList() {
        const ns = this.parent.filter.resultNodes || this.parent.tree.nodes;
        this.resultViewNodes = [];
        this._updateVisibleNodeList(this.parent.tree.rootNodeId, null, ns, 0);
    }
    private _updateVisibleNodeList(id: Id, parentId: Id | null, ns: Map<string, Node>, layerCount: number) {
        const viewId = FastTreeGridViewNodeData.makeViewId(id, parentId);
        const n = ns.get(id);

        // 検索結果に存在しない
        if (!n) {
            return;
        }

        this.resultViewNodes.push(new FastTreeGridViewNodeData(n, parentId, layerCount));

        // 閉じられた状態の場合は子は含めない
        if (n.isHoldableChilds() && !this.parent.folding.isOpened(viewId)) return;

        n.childIds.forEach(c => this._updateVisibleNodeList(c, n.id, ns, layerCount + 1));
    }
    public findByViewId(viewId: ViewId){
        return this.resultViewNodes.find(vn => vn.viewId == viewId);
    }
    public find(id: Id, parentId: Id){
        const viewId = FastTreeGridViewNodeData.makeViewId(id, parentId);
        return this.resultViewNodes.find(vn => vn.viewId == viewId);
    }
}
class FastTreeGridViewDataSelected{
    constructor(private parent: View){}
    // 選択状態のノードリスト
    public selectedNodeViews: Map<ViewId, boolean> = new Map<ViewId, boolean>();
    public lastSelectedNodeViewId: ViewId;
    public select(nodeView: NodeView){
        if( ! nodeView) return this;
        this.selectedNodeViews.set(nodeView.viewId, true);
        this.lastSelectedNodeViewId = nodeView.viewId;
        return this;
    }
    public areaSelect(n1: NodeView, n2: NodeView){
        this.clear();
        let idx1 = this.parent.visible.resultViewNodes.indexOf(n1);
        let idx2 = this.parent.visible.resultViewNodes.indexOf(n2);
        if(idx1 == -1 || idx2 == -1) return;
        if(idx1 > idx2) [idx1, idx2] = [idx2, idx1];
        _.range(idx1, idx2 + 1).forEach(i => this.selectedNodeViews.set(this.parent.visible.resultViewNodes[i].viewId, true));
        return this;
    }
    public clear(){
        this.selectedNodeViews.clear();
        return this;
    }
    public isSelected(nodeView: NodeView){
        return !!this.selectedNodeViews.get(nodeView.viewId);
    }
}

export class Column{
    constructor(
        public name: string,
        public columnName: string,
        public render: (d:any) => any,
    ){}
}


export interface INodeDetailData{
    toSummaryString(): string;
    deepCopy(): INodeDetailData;
    load(data: any): INodeDetailData;
}

class DBIndexMap extends Map<string, string[]>{
    public toJSON(){
        return [...this.keys()].map(key => [key, this.get(key)]);
    }
}

/**
 * テーブル定義
 * PrimaryKey, Indexはカラムデータではなくこちらで定義（カラムが持つべき情報ではないため）
 */
export class DBTableNodeDetailData implements INodeDetailData{
    public constructor(
        public primaryKeyNodeIds: string[] = [],
        public indexNodeIds: DBIndexMap = new DBIndexMap(),// Map<インデックス名, ノードID[]>
        public engineName: string = "InnoDB",
        public defaultCharset: string = "utf8",
    ){}
    public toSummaryString(){
        return "PK: " + this.primaryKeyNodeIds.join(",") + " / " + "IDX:" + Array.from(this.indexNodeIds.keys()).join(",");
    }
    public deepCopy(): INodeDetailData {
        const indexNodeIds = new DBIndexMap();
        for(const k in this.indexNodeIds.keys()){
            indexNodeIds.set(k, this.indexNodeIds.get(k)!.slice());
        }
        return new DBTableNodeDetailData(this.primaryKeyNodeIds, indexNodeIds, this.engineName, this.defaultCharset);
    }
    public load(data: any){
        this.primaryKeyNodeIds = data.primaryKeyNodeIds;
        this.engineName = data.engineName;
        this.defaultCharset = data.defaultCharset;
        this.indexNodeIds = new DBIndexMap(data.indexNodeIds || []);
        return this;
    }
}
export class DBColumnNodeDetailData implements INodeDetailData{

    constructor(
        public valueType: string = "",
        public valueLength: number = 0,
        public isUnsigned: boolean = false, // todo 多分つかわない
        public isNotNull: boolean|null = null,
        public options: string = "",
    ){}

    public toSummaryString(): string {
        return this.valueType + "(" + this.valueLength + ") " + (this.isNotNull ? "Nullable" : "NotNull") + " " + this.options;
    }
    public deepCopy(): INodeDetailData {
        return new DBColumnNodeDetailData(this.valueType, this.valueLength, this.isUnsigned, this.isNotNull, this.options);
    }
    public load(data: any){
        this.valueType = data.valueType;
        this.valueLength = data.valueLength;
        this.isUnsigned = data.isUnsigned;
        this.isNotNull = data.isNotNull;
        this.options = data.options;
        return this;
    }
}
export class ProgramNodeDetailData implements INodeDetailData{
    public toSummaryString(): string {
        return "";
    }
    public deepCopy(): INodeDetailData {
        return new ProgramNodeDetailData();
    }
    public load(data: any){
        return this;
    }
}

export class EmptyNodeDetailData implements  INodeDetailData{
    public toSummaryString(): string {
        return "";
    }
    public deepCopy(): INodeDetailData {
        return new EmptyNodeDetailData();
    }
    public load(data: any){
        return this;
    }
}

export class NodeCommonData{
    constructor(
        public name: string = "",
        public defaultValue: string = "",
        public nodeType: NodeType = NodeType.NodeEntity,
        public valueType: NodeValueType = NodeValueType.None,
        public valueTypeNodeId: Id = "", // 列挙型, 参照型の場合に型をノードIDで指定
        public nodeDataCategory: NodeDataCategory = NodeDataCategory.Logical,
        public desc: string = "",
        public detail: INodeDetailData = new EmptyNodeDetailData(),
    ){}
    public deepCopy(){
        return new NodeCommonData(this.name, this.defaultValue, this.nodeType, this.valueType, this.valueTypeNodeId, this.nodeDataCategory, this.desc, this.detail.deepCopy());
    }
    public dbColumnDetailData(){
        return this.detail as DBColumnNodeDetailData;
    }
    public dbTableDetailData(){
        return this.detail as DBTableNodeDetailData;
    }
}
