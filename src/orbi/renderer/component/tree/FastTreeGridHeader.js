import * as React from 'react';
import { NodeDataCategory, NodeType } from "./FastTreeGridViewData2";
import { Dropdown } from 'semantic-ui-react';
class FastTreeGridHeader extends React.Component {
    constructor(props) {
        super(props);
        this.nodeDataCategoryOptions = [
            { key: 'DB', text: 'DB', value: NodeDataCategory.DB },
            { key: 'プログラム', text: 'プログラム', value: NodeDataCategory.Program },
            { key: '列挙型', text: '列挙型', value: NodeDataCategory.Enum },
            { key: '論理', text: '論理', value: NodeDataCategory.Logical },
            { key: '定数', text: '定数', value: NodeDataCategory.Const },
        ];
        this.nodeTypeOptions = [
            { key: '列挙型', text: '列挙型', value: NodeType.NodeEnum },
            { key: 'エンティティ', text: 'エンティティ', value: NodeType.NodeEntity },
            { key: '匿名エンティティ', text: '匿名エンティティ', value: NodeType.NodeUniRefEntity },
            { key: 'プロパティ', text: 'プロパティ', value: NodeType.NodeProperty },
        ];
        this.ref = new Ref(this);
        this.state = { cond: new SearchCondition() };
    }
    componentDidMount() {
    }
    handleChangeDataCategory(data) {
        console.log(data.value);
        this.state.cond.nodeDataCategories = data.value;
        this.setState(this.state);
        this.props.onSearch(this.state.cond);
    }
    handleChangeNodeType(data) {
        console.log(data.value);
        this.state.cond.nodeTypes = data.value;
        this.setState(this.state);
        this.props.onSearch(this.state.cond);
    }
    handleOnClearCond() {
        this.state.cond.clear();
        this.setState(this.state);
        this.props.onSearch(this.state.cond);
    }
    handleSearchTxt(e) {
        this.state.cond.searchText = e.currentTarget.value;
        this.setState(this.state);
        this.props.onSearch(this.state.cond);
    }
    render() {
        return React.createElement("div", { style: { height: "40px" } },
            React.createElement("div", { style: { width: "20%", minWidth: "121px", whiteSpace: "nowrap", maxWidth: "251px", float: "left" } },
                React.createElement("input", { className: "ui input", ref: e => this.ref.searchTxt = e, type: "text", placeholder: "検索ワード", style: { width: "100%", padding: "6px" }, value: this.state.cond.searchText, onChange: (e) => this.handleSearchTxt(e) })),
            React.createElement("div", { style: { width: "25%", minWidth: "121px", whiteSpace: "nowrap", maxWidth: "251px", float: "left" } },
                React.createElement(Dropdown, { ref: e => this.ref.dataCategoryDropdown = e, placeholder: '\u30C7\u30FC\u30BF\u7A2E\u5225', fluid: true, multiple: true, search: true, selection: true, options: this.nodeDataCategoryOptions, onChange: (e, data) => this.handleChangeDataCategory(data), value: this.state.cond.nodeDataCategories })),
            React.createElement("div", { style: { width: "25%", minWidth: "121px", whiteSpace: "nowrap", maxWidth: "251px", float: "left" } },
                React.createElement(Dropdown, { ref: e => this.ref.nodeTypeDropdown = e, placeholder: '\u30CE\u30FC\u30C9\u7A2E\u5225', fluid: true, multiple: true, search: true, selection: true, options: this.nodeTypeOptions, onChange: (e, data) => this.handleChangeNodeType(data), value: this.state.cond.nodeTypes })),
            React.createElement("div", { style: { width: "5%", minWidth: "50x", whiteSpace: "nowrap", maxWidth: "50px", float: "left" } },
                React.createElement("button", { className: "ui button", style: { fontSize: "12px" }, onClick: e => this.handleOnClearCond() }, "\u30AF\u30EA\u30A2")));
    }
}
class Ref {
    constructor(parent, root = null, searchTxt = null, dataCategoryDropdown = null, nodeTypeDropdown = null) {
        this.root = root;
        this.searchTxt = searchTxt;
        this.dataCategoryDropdown = dataCategoryDropdown;
        this.nodeTypeDropdown = nodeTypeDropdown;
    }
}
export class SearchCondition {
    constructor() {
        this.nodeDataCategories = [];
        this.nodeTypes = [];
        this.searchText = "";
    }
    clear() {
        this.nodeDataCategories = [];
        this.nodeTypes = [];
        this.searchText = "";
    }
}
export default FastTreeGridHeader;
//# sourceMappingURL=FastTreeGridHeader.js.map