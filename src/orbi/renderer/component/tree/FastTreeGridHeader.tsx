import * as React from 'react';
import * as _ from 'underscore';
//import {Column, FastTreeGridData as Tree, FastTreeGridNodeData as NodeProperty} from "./FastTreeGridData";
import {DragState, FastTreeGridRow as Row} from "./FastTreeGridRow";
import {bigger, removeUnit, smaller} from "../../common/Util";
import {ElementResizeChecker, StopWatch} from "../../common/Unclassified";
import {Key} from 'ts-keycode-enum';
import {FastTreeGridDefine as Define} from "./FastTreeGridDefine";
import {
    FastTreeGridData as Tree, FastTreeGridNodeData,
    FastTreeGridNodeData as Node,
    FastTreeGridViewData,
    FastTreeGridViewNodeData,
    NodeDataCategory,
    NodeType,
    NodeValueType
} from "./FastTreeGridViewData2";
import nanoid from "nanoid";
import * as toastr from "toastr";
import {Dropdown, DropdownItemProps, DropdownProps} from 'semantic-ui-react'

interface IProps{
    onSearch: (cond: SearchCondition) => void
}
interface IState{
    cond:SearchCondition;
}

class FastTreeGridHeader extends React.Component<IProps, IState> {

    private ref: Ref;

    constructor(props: IProps) {
        super(props);
        this.ref = new Ref(this);
        this.state = {cond: new SearchCondition()};
    }

    public componentDidMount() {
    }

    private nodeDataCategoryOptions: DropdownItemProps[] = [
        {key: 'DB', text: 'DB', value: NodeDataCategory.DB},
        {key: 'プログラム', text: 'プログラム', value: NodeDataCategory.Program},
        {key: '列挙型', text: '列挙型', value: NodeDataCategory.Enum},
        {key: '論理', text: '論理', value: NodeDataCategory.Logical},
        {key: '定数', text: '定数', value: NodeDataCategory.Const},
    ];
    private nodeTypeOptions: DropdownItemProps[] = [
        {key: '列挙型', text: '列挙型', value: NodeType.NodeEnum},
        {key: 'エンティティ', text: 'エンティティ', value: NodeType.NodeEntity},
        {key: '匿名エンティティ', text: '匿名エンティティ', value: NodeType.NodeUniRefEntity},
        {key: 'プロパティ', text: 'プロパティ', value: NodeType.NodeProperty},
    ];

    private handleChangeDataCategory(data: DropdownProps){
        console.log(data.value);
        this.state.cond.nodeDataCategories = data.value as any;
        this.setState(this.state);
        this.props.onSearch(this.state.cond);
    }

    private handleChangeNodeType(data: DropdownProps){
        console.log(data.value);
        this.state.cond.nodeTypes = data.value as any;
        this.setState(this.state);
        this.props.onSearch(this.state.cond);
    }

    private handleOnClearCond(){
        this.state.cond.clear();
        this.setState(this.state);
        this.props.onSearch(this.state.cond);
    }

    private handleSearchTxt(e: React.FormEvent<HTMLInputElement>){
        this.state.cond.searchText = e.currentTarget.value;
        this.setState(this.state);
        this.props.onSearch(this.state.cond);
    }


    public render(){
        return <div style={{height:"40px"}}>
            <div style={{width:"20%", minWidth: "121px", whiteSpace: "nowrap",  maxWidth: "251px", float:"left"}}>
                <input className="ui input" ref={e=>this.ref.searchTxt=e} type="text" placeholder={"検索ワード"} style={{width:"100%", padding:"6px"}} value={this.state.cond.searchText} onChange={(e)=>this.handleSearchTxt(e)}/>
            </div>
            <div style={{width:"25%", minWidth: "121px", whiteSpace: "nowrap",  maxWidth: "251px", float:"left"}}>
                <Dropdown ref={e=>this.ref.dataCategoryDropdown=e} placeholder='データ種別' fluid multiple search selection options={this.nodeDataCategoryOptions} onChange={(e, data)=>this.handleChangeDataCategory(data)} value={this.state.cond.nodeDataCategories}/>
            </div>
            <div style={{width:"25%", minWidth: "121px", whiteSpace: "nowrap",  maxWidth: "251px", float:"left"}}>
                <Dropdown ref={e=>this.ref.nodeTypeDropdown=e} placeholder='ノード種別' fluid multiple search selection options={this.nodeTypeOptions} onChange={(e,data)=>this.handleChangeNodeType(data)} value={this.state.cond.nodeTypes}/>
            </div>
            <div style={{width:"5%", minWidth: "50x", whiteSpace: "nowrap",  maxWidth: "50px", float:"left"}}>
                <button className="ui button" style={{fontSize:"12px"}} onClick={e=>this.handleOnClearCond()}>クリア</button>
            </div>
        </div>
    }
}

class Ref{
    constructor(
        parent: FastTreeGridHeader,
        public root: HTMLDivElement|null = null,
        public searchTxt: HTMLInputElement|null = null,
        public dataCategoryDropdown: React.Component<DropdownProps, any, any>|null = null,
        public nodeTypeDropdown: React.Component<DropdownProps, any, any>|null = null,
    ){}
}

export class SearchCondition{
    public nodeDataCategories: NodeDataCategory[] = [];
    public nodeTypes: NodeType[] = [];
    public searchText: string = "";

    public clear(){
        this.nodeDataCategories = [];
        this.nodeTypes = [];
        this.searchText = "";
    }
}

export default FastTreeGridHeader;