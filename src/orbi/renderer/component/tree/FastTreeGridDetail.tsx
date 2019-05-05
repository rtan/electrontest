import * as React from 'react';
import * as _ from 'underscore';
//import {Column, FastTreeGridData as Tree, FastTreeGridNodeData as NodeProperty} from "./FastTreeGridData";
import {FastTreeGridRow as Row} from "./FastTreeGridRow";
import {bigger, smaller} from "../../common/Util";
import {ElementResizeChecker} from "../../common/Unclassified";
import {Key} from 'ts-keycode-enum';
import {FastTreeGridDefine, FastTreeGridDefine as Define} from "./FastTreeGridDefine";
import {
    DBTableNodeDetailData,
    FastTreeGridData as Tree,
    FastTreeGridNodeData as Node,
    FastTreeGridViewData,
    FastTreeGridViewNodeData,
    NodeDataCategory, NodeType
} from "./FastTreeGridViewData2";
import nanoid from "nanoid";
import {Dropdown, DropdownItemProps, DropdownProps} from "semantic-ui-react";

interface IProps{
    tree: Tree;
    view: FastTreeGridViewData;
    rowHeight: number;
}
interface IState{
}

class FastTreeGridDetail extends React.Component<IProps, IState> {

    private ref: Ref;

    private parentResizeCheck: ElementResizeChecker = new ElementResizeChecker();
    private treeId: string;

    private nodeTypeOptions: DropdownItemProps[] = [
        {key: '列挙型', text: '列挙型', value: NodeType.NodeEnum},
        {key: 'エンティティ', text: 'エンティティ', value: NodeType.NodeEntity},
        {key: '匿名エンティティ', text: '匿名エンティティ', value: NodeType.NodeUniRefEntity},
        {key: 'プロパティ', text: 'プロパティ', value: NodeType.NodeProperty},
    ];

    private getDDItemColumn(): DropdownItemProps[] {
        return this.node.childIds.map(id=>this.props.tree.nodes.get(id)!).map(n=> {return {key: n.data.name, text: n.data.name, value: n.data.name}});
    }

    // テーブルのキーアップ時イベント処理
    private onKeyUp: Map<Key, (e:React.KeyboardEvent) => void> = new Map<Key, (e:React.KeyboardEvent) => void>([
        [Key.Z, e => this.undo() ],
        [Key.Y, e => this.redo() ],
        [Key.LeftArrow, e => this.focusPrevColumn()],
        [Key.RightArrow, e => this.focusNextColumn()],
        [Key.UpArrow, e => this.moveUp()],
        [Key.DownArrow, e => this.moveDown()],
        [Key.PageUp, e => this.moveUp(10)],
        [Key.PageDown, e => this.moveDown(10)],
        [Key.Tab, e => {
            if(this.findFocusedRow() != this.findSelectedRow()) {
                this.findFocusedRow().select();
                //this.update();
            }
            else{
                this.findSelectedRow().focusNext();
            }
        }],
    ]);
    private onKeyUpWithCtrl: Map<Key, (e:React.KeyboardEvent) => void> = new Map<Key, (e:React.KeyboardEvent) => void>([
        [Key.S, e => this.props.tree.save() ],
    ]);

    constructor(props: IProps) {
        super(props);
        this.ref = new Ref(this);
        this.state = {};
        this.treeId = nanoid();
    }

    private onkeydown(e: React.KeyboardEvent){
        if(_.any(this.ref.rows, r => r != null && r.isEditing)) return;

        // 処理はkeyup時に行う。keydown時のデフォルト処理を無効にしておく。
        if(e.ctrlKey && this.onKeyUpWithCtrl.get(e.keyCode)){
            e.preventDefault();
        }
        else if(this.onKeyUp.get(e.keyCode)) {
            e.preventDefault();
        }
    }

    private onkeyup(e: React.KeyboardEvent){
        if(_.any(this.ref.rows, r => r != null && r.isEditing)) return;

        if(e.ctrlKey && this.onKeyUpWithCtrl.get(e.keyCode)){
            e.preventDefault();
            this.onKeyUpWithCtrl.get(e.keyCode)!(e);
        }
        else if(this.onKeyUp.get(e.keyCode)) {
            e.preventDefault();
            this.onKeyUp.get(e.keyCode)!(e);
        }
    }

    public undo(){
        this.props.tree.undo("");
    }
    public redo(){
        this.props.tree.redo("");
    }
    public focusNextColumn(){
        if(this.findFocusedRow().nodeView.node.hasChild()) {
            this.findFocusedRow().switch();
            this.findFocusedRow().select(); // todo 選択状態ではなくなる。。なぜ？
            //this.update();
        } else {
            this.findSelectedRow().focusNext();
        }
    }
    public focusPrevColumn(){
        if(this.findFocusedRow().nodeView.node.hasChild()) {
            this.findFocusedRow().switch();
            this.findFocusedRow().select(); // todo 選択状態ではなくなる。。なぜ？
            //this.update();
        } else {
            this.findSelectedRow().focusPrev();
        }
    }
    public moveUp(moveAmountIdx: number = 1){
        this.select(bigger(0, this.indexOfSelectedNode() - moveAmountIdx), true);
        this.update(this.node, ()=>this.findSelectedRow().focus(this.findFocusedRow().focusColIndex()));
    }
    public moveDown(moveAmountIdx: number = 1){
        this.select(smaller(this.props.view.visible.resultViewNodes.length, this.indexOfSelectedNode() + moveAmountIdx), true);
        this.update(this.node, ()=>this.findSelectedRow().focus(this.findFocusedRow().focusColIndex()));
    }


    public componentDidMount(){
        this.resetColWidths();
        this.parentResizeCheck.set(this.ref.root!.parentElement!, _ => this.resize());
    }

    private readonly columnWidths = [150,160,190,100,100,100];

    private resetColWidths(){
        // const tableWidth = this.ref.root!.getBoundingClientRect().width - Define.table.scrollBarWidth;
        // const colWidth = Math.round(tableWidth / (FastTreeGridDefine.table.colNum + 1));
        // this.ref.headerCol.forEach(h => h.style.width = colWidth+"px");
        this.ref.headerCol.filter(c=>c!=null).forEach((h, i) => h.style.width = this.columnWidths[i]+"px");
    }

    public update(node: Node, cb: ()=>void = ()=>{}){
        this.node = node;
        this.propNodes = node.childIds.map(id => this.props.tree.nodes.get(id)!);
        this.nodeDataCategory = node.data.nodeDataCategory;
        this.forceUpdate(()=>{
            this.resetColWidths();
            this.propNodes.forEach((n,i) => {
                if(this.ref.rows[i]) this.ref.rows[i]!.update(new FastTreeGridViewNodeData(n, node.id, 0), ()=>{})
            });
            this.resize();
            cb();
        });
    }

    private resize(){
        //if(_(this.ref.rows).any(r => r != null && r.isEditing)) return;

        const widths = this.ref.headerCol.filter(c => c != null).map(c => parseInt(c.style.width!)).map(w => bigger(w, Define.table.minColWidth));

        this.ref.bodyCol.filter(c => c != null).forEach((r, i) => r.style.width = r.style.maxWidth = widths[i] + "px");
        this.ref.headerCol.filter(c => c != null).forEach((r, i) => r.style.width = r.style.maxWidth = widths[i] + "px");

        this.ref.rows.filter(r=>r != null).forEach(r => r.resize(widths.map(w => w - 2 + "px")));// todo なんでここでcurrentがnull?? 他のrefは入ってるのになんで？
    }

    private node: Node;
    private propNodes: Node[] = [];

    private columns = new Map<NodeDataCategory, string[]>([
        [NodeDataCategory.Const, ["詳細"]],
        [NodeDataCategory.Logical, ["詳細"]],
        [NodeDataCategory.Enum, ["詳細"]],
        [NodeDataCategory.Program, ["詳細"]],
        [NodeDataCategory.DB, ["DB型", "長さ", "NULL許可"]],
    ]);
    private getColumns(cate: NodeDataCategory){
        return ["名称","説明","型"].concat(this.columns.get(cate)!);
    }
    public nodeDataCategory: NodeDataCategory = NodeDataCategory.Logical;

    private handleChangePrimaryKey(data: DropdownProps){
        this.node.data.dbTableDetailData().primaryKeyNodeIds = data.value as any;
        this.forceUpdate();
    }

    private handleChangeIndexName(e: React.FormEvent<HTMLInputElement>, idx: number){
        const indexName = [...this.node.data.dbTableDetailData().indexNodeIds.keys()][idx];
        const items = this.node.data.dbTableDetailData().indexNodeIds.get(indexName) || [];
        const name = e.currentTarget.value;
        this.node.data.dbTableDetailData().indexNodeIds.delete(indexName);
        this.node.data.dbTableDetailData().indexNodeIds.set(name, items);
        this.forceUpdate();
    }

    private handleChangeIndexItems(data: DropdownProps, idx: number){
        const indexName = [...this.node.data.dbTableDetailData().indexNodeIds.keys()][idx];
        const items = data.value as any;
        this.node.data.dbTableDetailData().indexNodeIds.set(indexName, items);
        this.forceUpdate();
    }

    public render(){
        return <div ref={e=>this.ref.root=e} className="main" onMouseMove={() => this.resize()} onKeyUp={e => this.onkeyup(e)} onKeyDown={e => this.onkeydown(e)} >
            {this.node ?
                <div>
                    <div style={{padding:"10px"}}>
                        <i className={FastTreeGridDefine.nodeIcons.get(this.node.data.nodeType)}/> <b>{this.node.data.name}</b>
                    </div>
                    {(()=>{switch(this.node.data.nodeDataCategory) {
                        case NodeDataCategory.DB:
                            return <div style={{width:"100%"}}>
                                <div className="ui labeled input" style={{width:"100%"}}>
                                    <div className="ui label">
                                        主キー
                                    </div>
                                    <Dropdown ref={e=>this.ref.primaryKeyDropDown=e} placeholder='主キー' fluid multiple search selection style={{width:"80%"}}
                                              options={this.getDDItemColumn()} onChange={(e, data)=>this.handleChangePrimaryKey(data)} value={this.node.data.dbTableDetailData().primaryKeyNodeIds}/>
                                </div>
                                {[...this.node.data.dbTableDetailData().indexNodeIds.keys(), ""].map((indexName, i)=>{
                                    return <div className="ui labeled input" style={{width:"100%"}}>
                                        <div className="ui label">
                                            インデックス
                                        </div>
                                        <div style={{width:"20%", minWidth: "150px", whiteSpace: "nowrap",  maxWidth: "150px", float:"left"}}>
                                            <input className="ui input" type="text" placeholder={"インデックス名"} style={{width:"100%", padding:"6px"}}
                                                   value={indexName} onChange={(e)=>this.handleChangeIndexName(e, i)}/>
                                        </div>
                                        <Dropdown ref={e=>this.ref.primaryKeyDropDown=e} placeholder='インデックス' fluid multiple search selection style={{width:"60%"}}
                                                  options={this.getDDItemColumn()} onChange={(e, data)=>this.handleChangeIndexItems(data, i)} value={this.node.data.dbTableDetailData().indexNodeIds.get(indexName) || []}/>
                                    </div>
                                })}
                            </div>
                        case NodeDataCategory.Program:
                            return <div>
                                PROGRAM
                            </div>
                        default:
                            return <div/>
                    }})()}
                </div>
                : <div/>
            }
            <div>
                <table ref={e=>this.ref.headerTable=e} className="headerTable">
                    <tbody>
                    <tr>
                        {this.getColumns(this.nodeDataCategory).map((c,i)=>
                            <td key={i} ref={e=>this.ref.headerCol[i]=e!}>{c}</td>
                        )}
                        <td style={{width:"20px", minWidth:"20px", visibility:"hidden" }}/>
                    </tr>
                    </tbody>
                </table>
                <table ref={e=>this.ref.table=e!} className="bodyTable">
                    <thead>
                    <tr>
                        {this.getColumns(this.nodeDataCategory).map((c,i)=>
                            <th key={i} ref={e=>this.ref.bodyCol[i]=e!} />
                        )}
                    </tr>
                    </thead>
                    <tbody>
                    {this.propNodes.map((n,i)=>
                        <React.Fragment key={i} >
                            <Row key={"row"+i} ref={e => this.ref.rows[i] = e!} height={this.props.rowHeight}
                                 onUpdate={() => {}} tree={this.props.tree}
                                 view={this.props.view} onSelected={() => this.update(this.node)} onEditEnd={() => {}}
                                 onDrag={(st, r, b, e) => {}} treeId={this.treeId}
                                 onDropValueType={(r, e) => {}}
                                 onCopy={e => {}} onPaste={e => {}}
                                 onSearch={cond => {}}
                                 isDetail={true}
                            />
                        </React.Fragment>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    }

    private lastSelectedViewId = () => this.props.view.selected.lastSelectedNodeViewId;
    private availableRows = () => this.ref.rows.filter(r => r != null && r.hasNodeView());
    private findSelectedRowIndex = () => this.availableRows().findIndex(r => r.nodeView.viewId == this.lastSelectedViewId()) || 0;
    private findSelectedRow = () => this.availableRows().find(r => r.nodeView.viewId == this.lastSelectedViewId()) || this.availableRows()[0];
    private findFocusedRow = () => this.availableRows()[this.availableRows().findIndex(r=>r.isFocused())] || this.availableRows()[0];
    private indexOfSelectedNode = () => _.findIndex(this.props.view.visible.resultViewNodes, n => this.lastSelectedViewId() == n.viewId);
    private select = (idx:number, clear:boolean) => {
        if(this.props.view.visible.resultViewNodes[idx]) {
            if(clear) this.props.view.selected.clear();
            this.props.view.selected.select(this.props.view.visible.resultViewNodes[idx])
        }
    }

}

class Ref{
    constructor(
        parent: FastTreeGridDetail,
        public headerTable: HTMLTableElement|null = null,
        public headerCol: HTMLTableHeaderCellElement[] = new Array(Define.table.colNum + 10), // todo おおめ
        public rows: Row[] = [],

        public primaryKeyDropDown: React.Component<DropdownProps, any, any>|null = null,
        public root: HTMLDivElement|null = null,
        public tableDiv: HTMLDivElement|null = null,
        public table: HTMLTableElement|null = null,
        public bodyCol: HTMLTableHeaderCellElement[] = new Array(Define.table.colNum + 10),
        public tdBorders: HTMLTableDataCellElement[] = new Array(Define.table.colNum + 10),
    ){}
}

export default FastTreeGridDetail;