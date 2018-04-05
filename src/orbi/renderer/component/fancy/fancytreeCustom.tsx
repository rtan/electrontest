import EventData = Fancytree.EventData;
import IdGenerator from "orbi/renderer/services/idGenerator/idGenerator";
import 'jquery.fancytree/dist/skin-lion/ui.fancytree.less'
import {lazyInject} from "../../../inversify.config";
import * as React from "react";
import {ItemConfig} from "golden-layout";
import {DataColumn} from "../../services/config/config";

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

export interface FancyTreeCustomProps {
    // todo golden-layout type definition
    glContainer: any;

    columns: DataColumn[]
}

export interface FancyTreeCustomState {
}

export class FancyTreeCustom extends React.Component<FancyTreeCustomProps, FancyTreeCustomState> {

    @lazyInject(IdGenerator) private idGenerator: IdGenerator;

    private expandedAll: boolean = false;

    refs: {
        root: any,
        table: any,
    }

    private _option: any = {}
    private _$parent: any;
    private _clipboard: any;

    render() {
        return (
            <div ref={"root"}>
                <table ref={"table"} className="tanaka">
                    <thead className="fancytest">
                    <tr>
                        {this.props.columns.map((column, i) => {
                            let columnStyle = {minWidth: column.minWidth, maxWidth: column.maxWidth};
                            return <th key={i} ref={`${column.id}Th`} style={columnStyle}>{column.name}</th>
                        })}
                    </tr>
                    </thead>
                    <tbody className="fancytest">
                    <tr>
                        {this.props.columns.map((column, i) => {
                            let columnStyle = {minWidth: column.minWidth, maxWidth: column.maxWidth};
                            return <td key={i} ref={`${column.id}Td`} style={columnStyle}>
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
        );
    }

    componentDidMount() {
        let state = this.props.glContainer.getState();
        if (state && "settings" in state) {
            this.props.columns.forEach(column => {
                if ("settings" + column.id + "Disp" in state.settings && !state.settings["settings" + column.id + "Disp"]) {
                    $(this.refs[column.id + "Th"]).remove();
                    $(this.refs[column.id + "Td"]).remove();
                }
            });
        }
        let source = [{
            title: "node 1", folder: true, expanded: true, name: "a", children: [
                {title: "node 1.1", name: "a"}, {title: "node 1.2", name: "b"}]
        }, {
            title: "node 2", folder: true, expanded: false, name: "a", children: [
                {title: "node 2.1", name: "c"}, {title: "node 2.2", name: "d"}]
        }];

        this._option = {
            titlesTabbable: true,
            quicksearch: true,
            clickFolderMode: 4,
            autoScroll: true,
            source: source,
            extensions: ["edit", "dnd", "table", "gridnav", "filter", "multi"],
            multi: {
                mode: "sameParent"
            },
            filter: {
                autoApply: true,   // Re-apply last filter if lazy data is loaded
                autoExpand: true,  // Expand all branches that contain matches while filtered
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
                refreshPositions: true,
                draggable: {
                    appendTo: "body",  // We don't want to clip the helper inside container
                    revert: "invalid"
                },
                dragStart: this.dragStart,
                dragEnter: this.dragEnter,
                initHelper: this.initHelper,
                updateHelper: this.updateHelper,
                dragDrop: this.dragDrop,
            },
            edit: {
                triggerStart: ["clickActive", "f2", "mac+enter"],
                beforeEdit: this.beforeEdit,
                close: this.closeEdit,
            },
            table: {
                indentation: 10,
            },
            gridnav: {
                autofocusInput: true,
                handleCursorKeys: true
            },
            createNode: this.createNode,
            renderColumns: this.renderColumns,
        };

        $(this.refs.table).fancytree(this._option)
            .on("nodeCommand", this.nodeCommand)
            .on("click dblclick", this.click)
            .on("keydown", this.keyDown);

        $(this.refs.table).colResizable({
            resizeMode: 'flex',
            partialRefresh: true,
            liveDrag: true,
            onDrag: this.onDrag,
        });

        /* Context menu (https://github.com/mar10/jquery-ui-contextmenu) */
        $(this.refs.table).contextmenu({
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
                {title: "貼り付け<kbd>Ctrl+V</kbd>", cmd: "paste", uiIcon: "ui-icon-clipboard", disabled: true}
            ],
            beforeOpen: this.beforeOpen,
            select: this.select,
        });

        $(this.refs.table).resize();
    }

    public setTreeData = (data: object) => {
        $(this.refs.table).fancytree("option", "source", data);
    }

    public toDict = () => {
        let tree: Fancytree.Fancytree = this.getTree();
        return tree.toDict(true, (node: Fancytree.FancytreeNode) => {
            const n = tree.getNodeByKey(node.key);
            if (n.tr) {
                const $tdList = $(n.tr).find(">td");
                if (!node.data) {
                    node.data = {};
                }
                this.props.columns.forEach((column, i) => {
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
    }

    public searchTree = (input) => {
        let tree = this.getTree();
        if ($.trim(input.value) === "") {
            tree.clearFilter();
            return;
        }
        tree.filterBranches.call(tree, input.value, {mode: "hide"});
    }

    public toggleExpand = () => {
        this.expandedAll = !this.expandedAll;
        $(this.refs.table).fancytree("getTree").visit(node => {
            node.setExpanded(this.expandedAll);
        });
    }

    public resize() {
        let container = this.props.glContainer;
        $(this.refs.root).height(container.getElement().height() - 50);
        $(this.refs.table).height(container.getElement().height() - 50);
        $(this.refs.table).width(container.getElement().width());
    }

    private getTree = (): Fancytree.Fancytree => {
        return $(this.refs.table).fancytree("getTree");
    }

    private dragStart = (node, data) => {
        // allow dragging `node`:
        return true;
    }

    private dragEnter = (node, data) => {
        return true;
    }

    private initHelper = (node, data) => {
        // Helper was just created: modify markup
        let helper = data.ui.helper,
            sourceNodes = data.tree.getSelectedNodes();

        // Store a list of active + all selected nodes
        if (!node.isSelected()) {
            sourceNodes.unshift(node);
        }
        helper.data("sourceNodes", sourceNodes);
        // Mark selected nodes also as drag source (active node is already)

        //$(".fancytree-active,.fancytree-selected", tree.$container)
        $(".fancytree-active,.fancytree-selected", $(this.refs.table).$container)
            .addClass("fancytree-drag-source");
        // Add a counter badge to helper if dragging more than one node
        if (sourceNodes.length > 1) {
            helper.append($("<span class='fancytree-childcounter'/>")
                .text("+" + (sourceNodes.length - 1)));
        }
        // Prepare an indicator for copy-mode
        helper.prepend($("<span class='fancytree-dnd-modifier'/>")
            .text("+").hide());
    }

    private updateHelper = (node, data) => {
        // Mouse was moved or key pressed: update helper according to modifiers

        // NOTE: pressing modifier keys stops dragging in jQueryUI 1.11
        // http://bugs.jqueryui.com/ticket/14461
        let event = data.originalEvent,
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
    }

    private dragDrop = (node, data) => {
        if (!node.folder && data.hitMode === "over") {
            data.hitMode = "after"
        }
        let sourceNodes = data.ui.helper.data("sourceNodes"),
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

    private closeEdit = (event, data) => {
        if (data.save && data.isNew) {
            // Quick-enter: add new nodes until we hit [enter] on an empty title
            $(this.refs.table).trigger("nodeCommand", {cmd: "addSibling"});
        }
    }

    private beforeEdit = (event, data) => {
        console.log(event);
        return true;
    }

    private createNode = (event, data) => {
        let node = data.node,
            $tdList = $(node.tr).find(">td");
    }

    private renderColumns = (event, data) => {
        let node = data.node,
            $tdList = $(node.tr).find(">td");
        this.props.columns.forEach((column, i) => {
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

    private nodeCommand = (event: JQueryEventObject, data: any) => {
        let refNode, moveMode,
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
                node.editCreateNode("after", {key: this.idGenerator.makeUniqueId(), title: ""});
                break;
            case "addGroup":
                node.editCreateNode("after", {
                    key: this.idGenerator.makeUniqueId(),
                    title: "",
                    folder: true,
                    expanded: false
                });
                break;
            case "cut":
                this._clipboard = {mode: data.cmd, data: node};
                break;
            case "copy":
                this._clipboard = {
                    mode: data.cmd,
                    data: node.toDict(function (n) {
                        delete n.key;
                    })
                };
                break;
            case "clear":
                this._clipboard = null;
                break;
            case "paste":
                if (this._clipboard.mode === "cut") {
                    // refNode = node.getPrevSibling();
                    this._clipboard.data.moveTo(node, "child");
                    this._clipboard.data.setActive();
                } else if (this._clipboard.mode === "copy") {
                    node.addChildren(this._clipboard.data).setActive();
                }
                break;
            default:
                alert("Unhandled command: " + data.cmd);
                return;
        }
    }

    private click = () => {
    }

    private keyDown = (e: any) => {
        let cmd = null;
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
            return false;
        }
    }

    private onDrag = () => {
        this.props.columns.map((column, i) => {
            $(this.refs[column.id + "Td"]).width($(this.refs[column.id + "Th"]).width());
        });
    }

    private beforeOpen = (event, ui) => {
        let node = $.ui.fancytree.getNode(ui.target);
        $(this.refs.table).contextmenu("enableEntry", "paste", !!this._clipboard);
        node.setActive();
    }

    private select = (event, ui) => {
        let that = this;
        // delay the event, so the menu can close and the click event does
        // not interfere with the edit control
        setTimeout(function () {
            $(that).trigger("nodeCommand", {cmd: ui.cmd});
        }, 100);
    }
}