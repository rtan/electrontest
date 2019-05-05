import * as React from 'react';
import * as _ from 'underscore';
import {
    DBColumnNodeDetailData,
    FastTreeGridData as Tree,
    FastTreeGridViewData as View,
    FastTreeGridViewNodeData as NodeView,
    NodeCommonData,
    NodeDataCategory,
    NodeType,
    NodeValueType
} from "./FastTreeGridViewData2";
import './fast-tree-grid.css';
import {ClickHandler} from "../../common/Unclassified";
import {isNotNull} from "../../common/Util";
import {FastTreeGridDefine} from "./FastTreeGridDefine";
import * as toastr from "toastr";
import {SearchCondition} from "./FastTreeGridHeader";

interface IProps{
    treeId: string;
    height: number;
    tree: Tree;
    view: View;
    onUpdate: ()=>void;
    onSelected: ()=>void;
    onEditEnd: ()=>void;
    onDrag: (state: DragState, row: FastTreeGridRow, isBorder: boolean, e: React.DragEvent<HTMLDivElement>)=>void;
    onDropValueType: (row: FastTreeGridRow, e: React.DragEvent<HTMLDivElement>)=>void;
    onCopy: (e: React.ClipboardEvent)=>void;
    onPaste: (e: React.ClipboardEvent)=>void;
    onSearch: (cond: SearchCondition)=>void;
    isDetail: boolean;
}
interface IState{
    // todo setState直後にstateを読むと古いままなので、currentNodeに最新の状態を保持。setStateがほぼ無意味に。。
    //node: NodeProperty | null;
    isOpen: boolean;
    isSelected: boolean;
    data: NodeCommonData;
}

export enum DragState { Start, End, Enter, Leave, Drop }

export class FastTreeGridRow extends React.Component<IProps, IState> {

    private ref: Ref;
    private clickHandler = new ClickHandler();
    private editInput: EditInput = new EditInput();
    private currentNodeView: NodeView; // todo setState直後にstateを読むと古いままなので、こちらに最新の状態を保持。setStateがほぼ無意味に。。

    constructor(props: IProps){
        super(props);
        this.state = {isOpen: false, data: new NodeCommonData(), isSelected: false};
        this.ref = new Ref(this);
    }

    public isOpened(){
        return this.nodeView ? this.props.view.folding.isOpened(this.nodeView.viewId) : false;
    }
    public isSelected(){
        return this.nodeView ? this.props.view.selected.isSelected(this.nodeView) : false;
    }

    public update(nodeView: NodeView, cb: ()=>void){
        if(this.state.isOpen == this.isOpened() && this.currentNodeView == nodeView && this.state.isSelected == this.isSelected()) {
            cb();
            return;
        }
        this.currentNodeView = nodeView;
        this.setState(nodeView ? {isOpen: this.isOpened(), data: nodeView.node.data.deepCopy(), isSelected: this.isSelected()} : {isOpen: false, data: new NodeCommonData(), isSelected: false}, cb);
    }

    private setOpened(opened: boolean){
        this.props.view.folding.openedNodes.set(this.nodeView.viewId, opened);
        this.props.onUpdate();
        this.setState({isOpen: this.isOpened()})
    }

    public hasNodeView(){
        return !!this.currentNodeView;
    }

    public keyDown(e: React.KeyboardEvent) {
        const el = (e.currentTarget as HTMLInputElement);
        if(e.keyCode == 13) {//Enter key
            if(el.readOnly) {
                console.log("enter start");
                if(this.nodeView!.node.isEditable())
                    this.editInput.set(el).startEdit();
            }else{
                console.log("enter end");
                this.endEdit();
            }
        }
        else if(e.keyCode == 27){//Escape
            console.log("escape");
            this.setState({data: this.nodeView.node.data});
            this.editInput.abandonEdit();
        }
    }

    public change(name: string, e: React.ChangeEvent){
        console.log("change");
        const value = (e.target as HTMLInputElement).value;
        // todo ひどい
        if(name == "name")
            this.state.data.name = value;
        else if(name == "desc")
            this.state.data.desc = value;
        else if(name == "defaultValue")
            if(this.state.data.valueType == NodeValueType.Bool)
                this.state.data.defaultValue = (value == "true" || value == "false") ? value : "";
            else
                this.state.data.defaultValue = value;
        else if(name == "valueType") {
            this.state.data.valueType = NodeValueType[value] != undefined ? NodeValueType[value] : NodeValueType.None;
            this.state.data.defaultValue = (()=>{switch(this.state.data.valueType){
                case NodeValueType.Bool: return "false";
                case NodeValueType.Number: return "0";
                case NodeValueType.DateTime: return "1900-01-01T00:00";
                default: return "";
            }})();
        }
        else if(name == "dbType")
            this.state.data.dbColumnDetailData().valueType = value;
        else if(name == "dbValueLength")
            this.state.data.dbColumnDetailData().valueLength = Number.parseInt(value);
        else if(name == "dbIsNotNull")
            this.state.data.dbColumnDetailData().isNotNull = value == "true" ? true : (value == "false" ? false : null);

        this.setState({data: this.state.data});
    }

    public blur(e: React.FocusEvent){
        console.log("blur");
        if(this.editInput.isEditing()) {
            this.endEdit();
        }
    }
    public click(e: React.MouseEvent){
        const el = (e.currentTarget as HTMLInputElement);
        this.clickHandler.click(()=>{
            console.log("click");
            if(e.shiftKey && this.props.view.selected.lastSelectedNodeViewId) this.props.view.selected.areaSelect( this.nodeView,  this.props.view.visible.findByViewId(this.props.view.selected.lastSelectedNodeViewId)!);
            else if(e.ctrlKey) this.props.view.selected.select(this.nodeView);
            else {
                this.props.view.selected.clear();
                this.props.view.selected.select(this.nodeView);
            }
            this.props.onSelected();
        },()=>{
            console.log("doubleclick");
            if(this.nodeView!.node.isEditable())
                this.editInput.set(el).startEdit();
        });
    }

    public endEdit(){
        const allSiblingNodes = _.flatten(this.nodeView.node.parentIds.map(id => this.tree.nodes.get(id)!.childIds)).map(id => this.tree.nodes.get(id));

        // todo 同名の場合できれば末尾に数値をつけたい
        if(_.any(allSiblingNodes, n => n!.id != this.nodeView.node.id && n!.data.name == this.state.data.name)) {
            this.state.data.name = this.nodeView.node.data.name;
            toastr.error("同名のノードが存在します。");
        }
        // ディープコピーされた更新後のノードnodeViewにも反映する
        this.nodeView.node = this.tree.editNode(this.props.treeId, this.nodeView.node, true,n => n.data = this.state.data.deepCopy());
        this.props.onEditEnd();
        this.editInput.endEdit();
        this.tree.nodes.setCheckpoint();
        this.select();
        this.props.onUpdate();
    }

    public startEdit(){
        if(!this.ref.input[0]) return;
        this.ref.input[0].click();
        this.ref.input[0].click();
    }

    public handleDragStart(e: React.DragEvent<HTMLDivElement>, isBorder=false){
        this.props.onDrag(DragState.Start, this, isBorder, e);
    }

    public handleDragEnd(e: React.DragEvent<HTMLDivElement>, isBorder=false){
        this.props.onDrag(DragState.End, this, isBorder, e);
    }

    public handleDragOver(e: React.DragEvent<HTMLDivElement>, isBorder=false){
        e.preventDefault();

    }

    public handleDragLeave(e: React.DragEvent<HTMLDivElement>, isBorder=false){
        e.preventDefault();
        this.props.onDrag(DragState.Leave, this, isBorder, e);
    }

    public handleDragEnter(e: React.DragEvent<HTMLDivElement>, isBorder=false){
        e.preventDefault();
        this.props.onDrag(DragState.Enter, this, isBorder, e);
    }

    public handleDrop(e: React.DragEvent<HTMLDivElement>, isBorder=false){
        this.props.onDrag(DragState.Drop, this, isBorder, e);
    }

    private dispValueType(data: NodeCommonData){
        // todo Enum, Objectのときのみクラス名を表示  ドロップダウンリストにしたいが..
        switch(data.valueType){
            case NodeValueType.None: return "";
            case NodeValueType.Bool: return "フラグ";
            case NodeValueType.Class: return this.tree.getNodeFullName(this.tree.nodes.get(data.valueTypeNodeId)!);
            case NodeValueType.Enum: return this.tree.getNodeFullName(this.tree.nodes.get(data.valueTypeNodeId)!);
            case NodeValueType.Number: return "数値";
            case NodeValueType.String: return "文字列";
            case NodeValueType.DateTime: return "日付";
        }
    }

    public handleSearch(v: string){
        const cond = new SearchCondition();
        cond.searchText = v;
        this.props.onSearch(cond);
    }

    public render = () =>{
        console.log("row rendering");
        let tds = () => {
            const desc = <td ref={e=>this.ref.td[1]=e!}><span style={{width:"100%"}}><input ref={e=>this.ref.input[1]=e!} type="text" readOnly value={this.state.data.desc || ""} className="cellInputText" onClick={e => this.click(e)} onBlur={e => this.blur(e)} onChange={e => this.change("desc", e)} onKeyDown={e => this.keyDown(e)}/></span></td>;
            switch(this.nodeView ? this.nodeView!.node.data.nodeType : NodeType.NodeGroupFixed ){
                case NodeType.NodeProperty:
                    const type  = (()=>{switch(this.nodeView!.node.data.valueType){
                        case NodeValueType.Bool:
                        case NodeValueType.String:
                        case NodeValueType.Number:
                        case NodeValueType.DateTime:
                        case NodeValueType.None:
                            const sameCnt = this.tree.getSameNodeCnt(this.nodeView.node.id);
                            return <React.Fragment>
                                {/* todo プロパティの参照コピー数表示と、同一プロパティ（ノードID）の表示。というかプロパティの参照コピーを作る */}
                                <i className="fas fa-search-location" onClick={()=>this.handleSearch("same:"+this.nodeView.node.id)} style={{paddingRight:"5px", background:"#f0f8ff", borderRadius:"5px", borderStyle:"solid", borderColor:"#87cefa", borderWidth:"1px", marginRight:"5px"}}> {sameCnt} </i>
                                <input list="valueType" style={{width:"55px"}} ref={e=>this.ref.input[2]=e!} type="text" readOnly value={this.dispValueType(this.state.data) || ""} className="cellInputText" onClick={e => this.click(e)} onBlur={e => this.blur(e)} onChange={e => this.change("valueType", e)} onKeyDown={e => this.keyDown(e)}/>
                            </React.Fragment>
                        case NodeValueType.Class:
                        case NodeValueType.Enum:
                            return <React.Fragment>
                                <i className="fas fa-search-location" onClick={()=>this.handleSearch("entity:"+this.dispValueType(this.state.data))} style={{paddingRight:"5px", background:"#f0f8ff", borderRadius:"5px", borderStyle:"solid", borderColor:"#87cefa", borderWidth:"1px", marginRight:"5px"}}> 1 </i>
                                <input list="valueType" ref={e=>this.ref.input[2]=e!} type="text" readOnly value={this.dispValueType(this.state.data) || ""} className="cellInputText" onClick={e => this.click(e)} onBlur={e => this.blur(e)} onChange={e => this.change("valueType", e)} onKeyDown={e => this.keyDown(e)}/>
                            </React.Fragment>
                    }})();
                    const defaultValue = (()=>{switch(this.nodeView!.node.data.valueType){
                        case NodeValueType.Bool: return <input style={{width:"50px"}} ref={e=>this.ref.input[3]=e!} type="text" list="bool" readOnly value={this.state.data.defaultValue || ""} className="cellInputText" onClick={e => this.click(e)} onBlur={e => this.blur(e)} onChange={e => this.change("defaultValue", e)} onKeyDown={e => this.keyDown(e)}/>
                        case NodeValueType.String: return <input style={{width:"100px"}} ref={e=>this.ref.input[3]=e!} type="text" readOnly value={this.state.data.defaultValue || ""} className="cellInputText" onClick={e => this.click(e)} onBlur={e => this.blur(e)} onChange={e => this.change("defaultValue", e)} onKeyDown={e => this.keyDown(e)}/>
                        case NodeValueType.Number: return <input style={{width:"50px"}} ref={e=>this.ref.input[3]=e!} type="number" readOnly value={this.state.data.defaultValue || ""} className="cellInputText" onClick={e => this.click(e)} onBlur={e => this.blur(e)} onChange={e => this.change("defaultValue", e)} onKeyDown={e => this.keyDown(e)}/>
                        case NodeValueType.DateTime: return <input style={{width:"150px"}}  ref={e=>this.ref.input[3]=e!} type="datetime-local" readOnly value={this.state.data.defaultValue || ""} className="cellInputText" onClick={e => this.click(e)} onBlur={e => this.blur(e)} onChange={e => this.change("defaultValue", e)} onKeyDown={e => this.keyDown(e)}/>
                        case NodeValueType.Class: return "-";
                        case NodeValueType.Enum: return "-";
                        case NodeValueType.None: return "-";
                    }})();
                    return <React.Fragment>
                        {desc}
                        <td ref={e=>this.ref.td[2]=e!} onDragStart={e=>e} onDragLeave={e=>e} onDragEnter={e=>e} onDragOver={e => e.preventDefault()}
                            onDrag={e => e} onDrop={e => this.props.onDropValueType(this, e)} draggable={true}>
                            {type}( {defaultValue} )
                        </td>
                    </React.Fragment>
                case NodeType.NodeEnumValue:
                    return <React.Fragment>
                        {desc}
                        <td ref={e=>this.ref.td[2]=e!}><span style={{width:"100%", color:"#AAAAAA"}}>Enum値</span></td>
                    </React.Fragment>
                case NodeType.NodeEntity:
                    // todo 重い?
                    const refCnt = this.tree.getRefNodeCnt(this.nodeView.node.id);
                    return <React.Fragment>
                        {desc}
                        <td ref={e=>this.ref.td[2]=e!}>
                            <i className="fas fa-search-location" onClick={()=>this.handleSearch("ref:"+this.nodeView.node.id)} style={{paddingRight:"5px", background:"#f0f8ff", borderRadius:"5px", borderStyle:"solid", borderColor:"#87cefa", borderWidth:"1px", marginRight:"5px"}}> {refCnt} </i>
                            <span style={{width:"100%", color:"#AAAAAA"}}>エンティティ</span>
                        </td>
                    </React.Fragment>
                case NodeType.NodeUniRefEntity:
                    return <React.Fragment>
                        {desc}
                        <td ref={e=>this.ref.td[2]=e!}><span style={{width:"100%", color:"#AAAAAA"}}>固定エンティティ</span></td>
                    </React.Fragment>
                case NodeType.NodeGroup:
                    return <React.Fragment>
                        {desc}
                        <td ref={e=>this.ref.td[2]=e!}><span style={{width:"100%", color:"#AAAAAA"}}>グループ</span></td>
                    </React.Fragment>
                case NodeType.NodeGroupFixed:
                    return <React.Fragment>
                        <td ref={e=>this.ref.td[1]=e!}><span style={{width:"100%"}}>-</span></td>
                        <td ref={e=>this.ref.td[2]=e!}><span style={{width:"100%", color:"#AAAAAA"}}>固定グループ</span></td>
                    </React.Fragment>
                case NodeType.NodeEnum:
                    return <React.Fragment>
                        {desc}
                        <td ref={e=>this.ref.td[2]=e!}><span style={{width:"100%", color:"#AAAAAA"}}>列挙型</span></td>
                    </React.Fragment>
                default:
                    return <React.Fragment>
                        <td ref={e=>this.ref.td[1]=e!}><span style={{width:"100%"}}></span></td>
                        <td ref={e=>this.ref.td[2]=e!}><span style={{width:"100%"}}></span></td>
                    </React.Fragment>
            }
        };
        const detailTds = ()=>{
            if(this.props.isDetail) {
                switch (this.state.data.nodeDataCategory) {
                    case NodeDataCategory.DB:
                        const isNotNull = (this.state.data.dbColumnDetailData().isNotNull == null) ? "" : (this.state.data.dbColumnDetailData().isNotNull ? "true" : "false");
                        return <React.Fragment>
                            <td ref={e => this.ref.td[3] = e!}><span style={{width: "100%"}}>
                                <input list="dbType" ref={e=>this.ref.input[4]=e!} type="text" readOnly value={this.state.data.dbColumnDetailData().valueType || ""} className="cellInputText"
                                       onClick={e => this.click(e)} onBlur={e => this.blur(e)} onChange={e => this.change("dbType", e)} onKeyDown={e => this.keyDown(e)}/>
                            </span></td>
                            <td ref={e => this.ref.td[4] = e!}><span style={{width: "100%"}}>
                                <input ref={e=>this.ref.input[5]=e!} type="number" readOnly value={this.state.data.dbColumnDetailData().valueLength || 0} className="cellInputText"
                                       onClick={e => this.click(e)} onBlur={e => this.blur(e)} onChange={e => this.change("dbValueLength", e)} onKeyDown={e => this.keyDown(e)}/>
                            </span></td>
                            <td ref={e => this.ref.td[5] = e!}><span style={{width: "100%"}}>
                                <input ref={e=>this.ref.input[6]=e!} type="text" list="bool" readOnly value={isNotNull} className="cellInputText"
                                       onClick={e => this.click(e)} onBlur={e => this.blur(e)} onChange={e => this.change("dbIsNotNull", e)} onKeyDown={e => this.keyDown(e)}/>
                            </span></td>
                        </React.Fragment>
                }
            }
            return <td ref={e=>this.ref.td[3]=e!} title={this.nodeView.node.data.detail.toSummaryString() || "-"}><span style={{width:"100%"}}>{this.nodeView.node.data.detail.toSummaryString() || "-"}</span></td>
        };
        return <React.Fragment>
            <tr onCopy={e=>this.props.onCopy(e)} onPaste={e=>this.props.onPaste(e)} ref={e=>this.ref.tr=e} style={{height: this.props.height, backgroundColor:this.nodeView != null && this.state.isSelected ?  "#C4E6FF" : "transparent"}}>
                {this.nodeView == null ?
                    <td/> :
                    <React.Fragment>
                        <td ref={e=>this.ref.td[0]=e!} style={{textAlign:"left"}}
                            draggable={true} onDragStart={e=>this.handleDragStart(e)} onDragOver={(e)=>this.handleDragOver(e)} onDrop={(e)=>this.handleDrop(e)} onDragLeave={e=>this.handleDragLeave(e)} onDragEnter={e=>this.handleDragEnter(e)}>
                            {/* rootを表示しないためlayerCount-1にしている */}
                            <span ref={e=>this.ref.spanLayer=e!} style={{paddingLeft: (this.nodeView!.layerCount - 1) * 10, paddingRight: "5px"}} onClick={_ => this.switch()}>
                            {(this.nodeView!.node.isHoldableChilds()) ?
                                this.state.isOpen ?
                                    "▼"
                                    : "▶"
                                : "　"
                            }
                            <i className={FastTreeGridDefine.nodeIcons.get(this.nodeView!.node.data.nodeType)}></i>
                            </span>
                            {/* todo オープン・クローズを邪魔せずに全体を反応させたい */}
                            {/* valueの値がundefinedになると"A component is changing a controlled input of type text to be uncontrolled..." の警告が出て値が更新されなくなったため、空文字を入れる */}
                            <input ref={e=>this.ref.input[0]=e!} type="text" readOnly value={this.state.data.name || ""} className="cellInputText" onClick={e => this.click(e)} onBlur={e => this.blur(e)} onChange={e => this.change("name", e)} onKeyDown={e => this.keyDown(e)}/>
                        </td>
                        {tds()}
                        {detailTds()}
                    </React.Fragment>
                }
            </tr>
        </React.Fragment>
    }

    public resize = (widths: string[]) => {
        this.ref.td.filter(isNotNull).forEach((td, i) => td.style.maxWidth = td.style.width = widths[i]);
        if(this.ref.td[0]) {
            const w = this.ref.td[0].getBoundingClientRect().width - this.ref.spanLayer!.getBoundingClientRect().width;
            this.ref.input[0].style.width = w + "px";
        }
    }

    private get tree(){return  this.props.tree; }
    get isEditing(){return this.editInput.isEditing();}
    get nodeView() { return this.currentNodeView; }
    public isLastSelected = () => this.nodeView.viewId ==  this.props.view.selected.lastSelectedNodeViewId;
    public isFocused = () => _.any(this.ref.input, i => i == document.activeElement);
    public focusColIndex = () => this.ref.input.findIndex(i => i == document.activeElement);
    public focus = (idx = 0) => this.ref.input[idx] ? this.ref.input[idx].select() : this.ref.input[0].select();
    public focusNext = () => this.focus(this.focusColIndex()+1);
    public focusPrev = () => this.focus(this.focusColIndex()-1);
    public select = () => {
        this.props.view.selected.clear();
        this.props.view.selected.select(this.nodeView);
    }
    public close = () => this.setOpened(false);
    public open = () => this.setOpened(true);
    public switch = () => this.setOpened( ! this.isOpened());
}

class Ref{
    constructor(
        parent: FastTreeGridRow,
        public tr: HTMLTableRowElement|null = null,
        public td: HTMLTableDataCellElement[] = new Array(FastTreeGridDefine.table.colNum + 10), // todo おおめ
        public tdBorder: HTMLTableDataCellElement|null = null,
        public spanLayer: HTMLSpanElement|null = null,
        public input: HTMLInputElement[] = new Array(FastTreeGridDefine.table.colNum + 10),
    ){}
}

class EditInput{
    private el: HTMLInputElement|null;
    private orgVal: string|null;

    public constructor() {}

    public clear(){
        this.el = null;
        this.orgVal = null;
    }

    public set(el: HTMLInputElement): EditInput{
        this.el = el;
        this.orgVal = el.value;
        return this;
    }

    public startEdit(){
        if(this.el == null) return;
        this.el.className = "cellInputTextEditing";
        this.el.readOnly = false;
        this.el.select();
    }
    public endEdit(){
        if(this.el == null) return;
        this.el.className = "cellInputText";
        this.el.readOnly = true;
        this.clear();
    }
    public abandonEdit(){
        if(this.el == null) return;
        this.el.value = this.orgVal!;
        this.el.dispatchEvent(new Event('input', { bubbles: true }));
        this.endEdit();
    }
    public isEditing(){
        return this.el != null;
    }
}

export default FastTreeGridRow;
