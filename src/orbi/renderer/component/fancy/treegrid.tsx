import * as React from "react";
import IdGenerator from "orbi/renderer/services/idGenerator/idGenerator";
import {Setting} from "orbi/renderer/component/fancy/setting";
import 'jquery.fancytree/dist/skin-lion/ui.fancytree.less'
import {lazyInject} from 'orbi/inversify.config'
import ConfigService from "orbi/renderer/services/config/configService";
import Strings from "../../common/strings";
import {DataConfig} from "../../services/config/config";

const storage = require("electron-json-storage");

const $ = require('jquery');
window.jQuery = $;
window.$ = $;
require('jquery-ui');

const fancytree = require('jquery.fancytree');
require('jquery.fancytree/dist/modules/jquery.fancytree.edit');
require('jquery.fancytree/dist/modules/jquery.fancytree.filter');
require('jquery.fancytree/dist/modules/jquery.fancytree.dnd');
//require('jquery.fancytree/dist/modules/jquery.fancytree.dnd5');
require('jquery.fancytree.multi.custom');
require('jquery.fancytree/dist/modules/jquery.fancytree.gridnav');
require('jquery.fancytree/dist/modules/jquery.fancytree.table');

require("ui-contextmenu/jquery.ui-contextmenu");
require("jquery-ui/themes/base/all.css");

require("store");
require("jquery-resizable-columns");
require("jquery-resizable-columns/dist/jquery.resizableColumns.css");

// todo GPL and MIT (https://github.com/alvaro-prieto/colResizable/issues/70)
require("colresizable/colResizable-1.6.min.js");

require("orbi/renderer/component/fancy/fancy.css");

export interface TreeGridProps {
    // todo golden-layout type definition
    glContainer: any;

    id: string;
    onReload: () => void;
    saveLayout: () => void;
}

export interface TreeGridState {
}

export class TreeGrid extends React.Component<TreeGridProps, TreeGridState> {

    private readonly TREE_DATA_NAME = "tree";

    @lazyInject(IdGenerator) private idGenerator: IdGenerator;
    @lazyInject(ConfigService) private configService: ConfigService;
    private config: DataConfig;
    private expandedAll: boolean = false;

    private parentElem: any;

    refs: {
        setting: any
    };

    constructor(props: TreeGridProps) {
        super(props);
        this.config = this.configService.config.dataConfigs[0];
        this.load(this.props.glContainer.parent);
    }

    render() {
        return (
            <div id="fancyTest">
                <Setting ref={`setting_${this.props.id}`} id={this.props.id} glContainer={this.props.glContainer}
                         onOk={() => this.settingsOk()}/>
                <div className="fancytest">
                    <div>
                        検索 : <input onKeyUp={e => this.searchTree(e.currentTarget)} placeholder="Filter..."/>
                        <button onClick={this.toggleExpand}>Expand/Collapse</button>
                        <button onClick={this.saveData}>Save</button>
                        <button onClick={this.loadData}>Load</button>
                        <button onClick={this.openSettingWindow}>Settings</button>
                        <button onClick={this.reload}>Reload</button>
                    </div>
                    <div id={`div_${this.props.id}`}>
                        <table id={`${this.props.id}`} className="tanaka">
                            <thead className="fancytest">
                            <tr>
                                {this.config.columns.map((column, i) => {
                                    let columnStyle = {minWidth: column.minWidth, maxWidth: column.maxWidth};
                                    return <th key={i} id={`tree${column.id}Th_${this.props.id}`}
                                               style={columnStyle}>{column.name}</th>
                                })}
                            </tr>
                            </thead>
                            <tbody className="fancytest">
                            <tr>
                                {this.config.columns.map((column, i) => {
                                    let columnStyle = {minWidth: column.minWidth, maxWidth: column.maxWidth};
                                    return <td key={i} id={`tree${column.id}Td_${this.props.id}`}
                                               style={columnStyle}>
                                        {(() => {
                                            switch (column.type) {
                                                case "Text":
                                                    return <input type="text" name={column.id} title="name"
                                                                  style={{width: "98%"}}/>;
                                                case "CheckBox":
                                                    return <input type="checkbox" name={column.id} title="check"/>
                                                case "Number":
                                                    return <input type="number" name={column.id} title="number"
                                                                  style={{width: "98%"}}/>;
                                            }
                                        })()}
                                    </td>
                                })}
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    public load(elem: any = null) {
        if (elem != null) {
            this.parentElem = elem;
        }
        this.initTree();
        this.parentElem.container.on("resize", () => this.resize());
    }

    public resize() {
        let container = this.props.glContainer;
        $("#div_" + this.props.id).height(container.getElement().height() - 50);
        $("#" + this.props.id).height(container.getElement().height() - 50);
        $("#" + this.props.id).width(container.getElement().width());
    }

    public settingsOk() {
        let glContainer = this.props.glContainer;
        const settings = {};
        this.config.columns.forEach(column => {
            settings["settings" + column.id + "Disp"] = $("#settings" + column.id + "Disp_" + this.props.id).prop("checked");
        });
        glContainer.extendState({"settings": settings});
        this.reload();
        this.props.saveLayout();
    }

    private initTree() {
        const glContainer = this.props.glContainer;
        const id = this.props.id;
        const idGenerator = this.idGenerator;

        $(() => {
            let state = glContainer.getState();
            if (state && "settings" in state) {
                this.config.columns.forEach(column => {
                    if ("settings" + column.id + "Disp" in state.settings && !state.settings["settings" + column.id + "Disp"]) {
                        $("#tree" + column.id + "Th_" + this.props.id).remove();
                        $("#tree" + column.id + "Td_" + this.props.id).remove();
                    }
                });
            }
            var clipboard;
            var source = [
                {
                    title: "node 1", folder: true, expanded: true, name: "a", children: [
                        {title: "node 1.1", name: "a"},
                        {title: "node 1.2", name: "b"}
                    ]
                },
                {
                    title: "node 2", folder: true, expanded: false, name: "a", children: [
                        {title: "node 2.1", name: "c"},
                        {title: "node 2.2", name: "d"}
                    ]
                }
            ];

            var tree;

            $("#" + id).fancytree({
                //checkbox: true,
                titlesTabbable: true,
                quicksearch: true,
                clickFolderMode: 4,
                autoScroll: true,
                source: source,
                extensions: ["edit", "dnd", "table", "gridnav", "filter", "multi"],
                //extensions: ["edit", "dnd", "table", "gridnav", "filter"],
                multi: {
                    mode: "sameParent"
                },
                filter: {
                    autoApply: true,   // Re-apply last filter if lazy data is loaded
                    autoExpand: true, // Expand all branches that contain matches while filtered
                    counter: true,     // Show a badge with number of matching child nodes near parent icons
                    fuzzy: false,      // Match single characters in order, e.g. 'fb' will match 'FooBar'
                    hideExpandedCounter: true,  // Hide counter badge if parent is expanded
                    hideExpanders: false,       // Hide expanders if all child nodes are hidden by filter
                    highlight: true,   // Highlight matches by wrapping inside <mark> tags
                    leavesOnly: false, // Match end nodes only
                    nodata: true,      // Display a 'no data' status node if result is empty
                    mode: "hide"       // Grayout unmatched nodes (pass "hide" to remove unmatched node instead)
                },
                dnd: {
                    preventVoidMoves: true, // Prevent dropping nodes 'before self', etc.
                    preventRecursiveMoves: true, // Prevent dropping nodes on own descendants
                    autoExpandMS: 400,
                    // focusOnClick: true,
                    refreshPositions: true,
                    draggable: {
                        appendTo: "body",  // We don't want to clip the helper inside container
                        // scroll: false,
                        // containment: "parent",  // $("ul.fancytree-container"),
                        // cursorAt: { left: 5 },
                        revert: "invalid"
                        // revert: function(dropped) {
                        //   return
                        // }
                    },
                    dragStart: function (node, data) {
                        // allow dragging `node`:
                        return true;
                    },
                    dragEnter: function (node, data) {
                        return true;
                    },
                    initHelper: function (node, data) {
                        // Helper was just created: modify markup
                        var helper = data.ui.helper,
                            sourceNodes = data.tree.getSelectedNodes();

                        // Store a list of active + all selected nodes
                        if (!node.isSelected()) {
                            sourceNodes.unshift(node);
                        }
                        helper.data("sourceNodes", sourceNodes);
                        // Mark selected nodes also as drag source (active node is already)

                        //$(".fancytree-active,.fancytree-selected", tree.$container)
                        $(".fancytree-active,.fancytree-selected", $("#" + id).$container)
                            .addClass("fancytree-drag-source");
                        // Add a counter badge to helper if dragging more than one node
                        if (sourceNodes.length > 1) {
                            helper.append($("<span class='fancytree-childcounter'/>")
                                .text("+" + (sourceNodes.length - 1)));
                        }
                        // Prepare an indicator for copy-mode
                        helper.prepend($("<span class='fancytree-dnd-modifier'/>")
                            .text("+").hide());
                    },
                    updateHelper: function (node, data) {
                        // Mouse was moved or key pressed: update helper according to modifiers

                        // NOTE: pressing modifier keys stops dragging in jQueryUI 1.11
                        // http://bugs.jqueryui.com/ticket/14461
                        var event = data.originalEvent,
                            tree = node.tree,
                            copyMode = event.ctrlKey || event.altKey;

                        // Adjust the drop marker icon
//          data.dropMarker.toggleClass("fancytree-drop-copy", copyMode);

                        // Show/hide the helper's copy indicator (+)
                        data.ui.helper.find(".fancytree-dnd-modifier").toggle(copyMode);
                        // tree.debug("1", $(".fancytree-active,.fancytree-selected", tree.$container).length)
                        // tree.debug("2", $(".fancytree-active,.fancytree-selected").length)
                        // Dim the source node(s) in move-mode
                        $(".fancytree-drag-source", tree.$container)
                            .toggleClass("fancytree-drag-remove", !copyMode);
                        // data.dropMarker.toggleClass("fancytree-drop-move", !copyMode);
                    },
                    dragDrop: function (node, data) {
                        if (!node.folder && data.hitMode === "over") {
                            data.hitMode = "after"
                        }
                        var sourceNodes = data.ui.helper.data("sourceNodes"),
                            event = data.originalEvent,
                            copyMode = event.ctrlKey || event.altKey;

                        if (copyMode) {
                            $.each(sourceNodes, function (i, o) {
                                o.copyTo(node, data.hitMode, function (n) {
                                    delete n.key;
                                    n.selected = false;
                                    n.title = "Copy of " + n.title;
                                });
                            });
                        } else {
                            $.each(sourceNodes, function (i, o) {
                                o.moveTo(node, data.hitMode);
                            });
                        }
                    }
                },
                edit: {
                    //triggerStart: ["f2", "shift+click", "mac+enter"],
                    triggerStart: ["clickActive", "f2", "mac+enter"],
                    beforeEdit: function (event, data) {
                        console.log(event);
                        return true;
                    },
                    close: function (event, data) {
                        if (data.save && data.isNew) {
                            // Quick-enter: add new nodes until we hit [enter] on an empty title
                            $("#" + id).trigger("nodeCommand", {cmd: "addSibling"});
                        }
                    }
                },
                table: {
                    indentation: 10,
                    //nodeColumnIdx: 2,
                    //checkboxColumnIdx: 0
                },
                gridnav: {
                    autofocusInput: true,
                    handleCursorKeys: true
                },

                lazyLoad: function (event, data) {
                    data.result = {url: "../demo/ajax-sub2.json"};
                },
                createNode: function (event, data) {
                    var node = data.node,
                        $tdList = $(node.tr).find(">td");
                },
                renderColumns: (event, data) => {
                    var node = data.node,
                        $tdList = $(node.tr).find(">td");
                    this.config.columns.forEach((column, i) => {
                        switch (column.type) {
                            case "Text":
                                $tdList.eq(i).find("input").val(node.data[column.id]);
                                break;
                            case "Number":
                                $tdList.eq(i).find("input").val(node.data[column.id]);
                                break;
                            case "CheckBox":
                                $tdList.eq(i).find("input").prop("checked", node.data[column.id]);
                                break;
                        }
                    });
                }
            }).on("nodeCommand", function (event, data) {
                // Custom event handler that is triggered by keydown-handler and
                // context menu:
                var refNode, moveMode,
                    tree = $(this).fancytree("getTree"),
                    node = tree.getActiveNode();

                switch (data.cmd) {
                    case "moveUp":
                        refNode = node.getPrevSibling();
                        if (refNode) {
                            node.moveTo(refNode, "before");
                            node.setActive();
                        }
                        break;
                    case "moveDown":
                        refNode = node.getNextSibling();
                        if (refNode) {
                            node.moveTo(refNode, "after");
                            node.setActive();
                        }
                        break;
                    case "indent":
                        refNode = node.getPrevSibling();
                        if (refNode) {
                            node.moveTo(refNode, "child");
                            refNode.setExpanded();
                            node.setActive();
                        }
                        break;
                    case "outdent":
                        if (!node.isTopLevel()) {
                            node.moveTo(node.getParent(), "after");
                            node.setActive();
                        }
                        break;
                    case "rename":
                        node.editStart();
                        break;
                    case "remove":
                        refNode = node.getNextSibling() || node.getPrevSibling() || node.getParent();
                        node.remove();
                        if (refNode) {
                            refNode.setActive();
                        }
                        break;
                    case "addSibling":
                        node.editCreateNode("after", {key: idGenerator.makeUniqueId(), title: ""});
                        break;
                    case "addGroup":
                        node.editCreateNode("after", {
                            key: idGenerator.makeUniqueId(),
                            title: "",
                            folder: true,
                            expanded: false
                        });
                        break;
                    case "cut":
                        clipboard = {mode: data.cmd, data: node};
                        break;
                    case "copy":
                        clipboard = {
                            mode: data.cmd,
                            data: node.toDict(function (n) {
                                delete n.key;
                            })
                        };
                        break;
                    case "clear":
                        clipboard = null;
                        break;
                    case "paste":
                        if (clipboard.mode === "cut") {
                            // refNode = node.getPrevSibling();
                            clipboard.data.moveTo(node, "child");
                            clipboard.data.setActive();
                        } else if (clipboard.mode === "copy") {
                            node.addChildren(clipboard.data).setActive();
                        }
                        break;
                    default:
                        alert("Unhandled command: " + data.cmd);
                        return;
                }

            }).on("click dblclick", function (e) {
                console.log(e, $.ui.fancytree.eventToString(e));
                console.log("tanaka");

            }).on("keydown", function (e) {
                var cmd = null;

                console.log(e.type, $.ui.fancytree.eventToString(e));
                switch ($.ui.fancytree.eventToString(e)) {
                    case "ctrl+c":
                    case "meta+c": // mac
                        cmd = "copy";
                        break;
                    case "ctrl+v":
                    case "meta+v": // mac
                        cmd = "paste";
                        break;
                    case "ctrl+x":
                    case "meta+x": // mac
                        cmd = "cut";
                        break;
                    case "ctrl+n":
                    case "meta+n": // mac
                        cmd = "addSibling";
                        break;
                    case "ctrl+g":
                    case "meta+g": // mac
                        cmd = "addGroup";
                        break;
                    case "del":
                    case "meta+backspace": // mac
                        cmd = "remove";
                        break;
                    // case "f2":  // already triggered by ext-edit pluging
                    //   cmd = "rename";
                    //   break;
                    case "ctrl+up":
                        cmd = "moveUp";
                        break;
                    case "ctrl+down":
                        cmd = "moveDown";
                        break;
                    case "ctrl+right":
                    case "ctrl+shift+right": // mac
                        cmd = "indent";
                        break;
                    case "ctrl+left":
                    case "ctrl+shift+left": // mac
                        cmd = "outdent";
                }
                if (cmd) {
                    $(this).trigger("nodeCommand", {cmd: cmd});
                    // e.preventDefault();
                    // e.stopPropagation();
                    return false;
                }
            });

            $("#" + id).colResizable({
                resizeMode: 'flex',
                partialRefresh: true,
                liveDrag: true,
                onDrag: () => {
                    $("#treeNodeTd_" + this.props.id).width($("#treeNodeTh_" + this.props.id).width());
                    $("#treeNameTd_" + this.props.id).width($("#treeNameTh_" + this.props.id).width());
                    $("#treeCsTd_" + this.props.id).width($("#treeCsTh_" + this.props.id).width());
                    $("#treePhpTd_" + this.props.id).width($("#treePhpTh_" + this.props.id).width());
                    $("#treeTypeTd_" + this.props.id).width($("#treeTypeTh_" + this.props.id).width());
                    $("#treeMinTd_" + this.props.id).width($("#treeMinTh_" + this.props.id).width());
                    $("#treeMaxTd_" + this.props.id).width($("#treeMaxTh_" + this.props.id).width());
                    $("#treeDefTd_" + this.props.id).width($("#treeDefTh_" + this.props.id).width());
                },
                // onResize:()=>{
                //     $("#treeNodeTh").width($("#treeNodeTd").width());
                //     $("#treeNameTh").width($("#treeNameTd").width());
                //     $("#treeCsTh").width($("#treeCsTd").width());
                //     $("#treePhpTh").width($("#treePhpTd").width());
                //     $("#treeTypeTh").width($("#treeTypeTd").width());
                //     $("#treeMinTh").width($("#treeMinTd").width());
                //     $("#treeMaxTh").width($("#treeMaxTd").width());
                //     $("#treeDefTh").width($("#treeDefTd").width());
                // }
            });

            /* Context menu (https://github.com/mar10/jquery-ui-contextmenu) */
            $("#" + id).contextmenu({
                delegate: "span.fancytree-node",
                menu: [
                    {title: "編集 <kbd>[F2]</kbd>", cmd: "rename", uiIcon: "ui-icon-pencil"},
                    {title: "削除 <kbd>[Del]</kbd>", cmd: "remove", uiIcon: "ui-icon-trash"},
                    {title: "----"},
                    {title: "ノードグループ作成 <kbd>[Ctrl+G]</kbd>", cmd: "addGroup", uiIcon: "ui-icon-plus"},
                    {title: "ノード作成 <kbd>[Ctrl+N]</kbd>", cmd: "addSibling", uiIcon: "ui-icon-plus"},
                    {title: "----"},
                    {title: "切り取り <kbd>Ctrl+X</kbd>", cmd: "cut", uiIcon: "ui-icon-scissors"},
                    {title: "コピー <kbd>Ctrl-C</kbd>", cmd: "copy", uiIcon: "ui-icon-copy"},
                    {
                        title: "貼り付け<kbd>Ctrl+V</kbd>",
                        cmd: "paste",
                        uiIcon: "ui-icon-clipboard",
                        disabled: true
                    }
                ],
                beforeOpen: function (event, ui) {
                    var node = $.ui.fancytree.getNode(ui.target);
                    $("#" + id).contextmenu("enableEntry", "paste", !!clipboard);
                    node.setActive();
                },
                select: function (event, ui) {
                    var that = this;
                    // delay the event, so the menu can close and the click event does
                    // not interfere with the edit control
                    setTimeout(function () {
                        $(that).trigger("nodeCommand", {cmd: ui.cmd});
                    }, 100);
                }
            });

            this.resize();
        });
    }

    private searchTree = (input) => {
        let tree = this.getTree();
        if ($.trim(input.value) === "") {
            tree.clearFilter();
            return;
        }
        tree.filterBranches.call(tree, input.value, {mode: "hide"});
    }

    private toggleExpand = () => {
        this.expandedAll = !this.expandedAll;
        $("#" + this.props.id).fancytree("getTree").visit(node => {
            node.setExpanded(this.expandedAll);
        });
    }

    private saveData = () => {
        let tree: Fancytree.Fancytree = this.getTree();
        let d = tree.toDict(true, (node: Fancytree.FancytreeNode) => {
            const n = tree.getNodeByKey(node.key);
            if (n.tr) {
                const $tdList = $(n.tr).find(">td");
                if (!node.data) {
                    node.data = {};
                }
                this.config.columns.forEach((column, i) => {
                    switch (column.type) {
                        case "Text":
                            node.data[column.id] = $tdList.eq(1).find("input").val();
                            break;
                        case "Number":
                            node.data[column.id] = $tdList.eq(1).find("input").val();
                            break;
                        case "CheckBox":
                            node.data[column.id] = $tdList.eq(i).find("input").prop("checked");
                            break;
                    }
                });
            }
        });
        const json = JSON.stringify(d);
        storage.set("tree", json, error => {
            if (error) {
                alert("保存に失敗しました。");
                throw error;
            }
        });
    }

    private loadData = () => {
        storage.get(this.TREE_DATA_NAME, (error, data) => {
            if (error) {
                alert("読み込みに失敗しました。");
                throw error;
            }
            this.setTreeData((JSON).parse(data));
        });
    }

    private openSettingWindow = () => {
        this.refs["setting_" + this.props.id].show();
    }

    private reload = () => {
        this.props.onReload();
    }

    private getTree = (): Fancytree.Fancytree => {
        return $("#" + this.props.id).fancytree("getTree");
    }

    private setTreeData = (data: object) => {
        $("#" + this.props.id).fancytree("option", "source", data);
    }
}