"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
var idGenerator_1 = __importDefault(require("orbi/renderer/services/idGenerator/idGenerator"));
require("jquery.fancytree/dist/skin-lion/ui.fancytree.less");
var inversify_config_1 = require("../../../inversify.config");
var React = __importStar(require("react"));
var $ = require('jquery');
window.jQuery = $;
window.$ = $;
require('jquery-ui');
var fancytree = require('jquery.fancytree');
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
var FancyTreeCustom = /** @class */ (function (_super) {
    __extends(FancyTreeCustom, _super);
    function FancyTreeCustom() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.expandedAll = false;
        _this._option = {};
        _this.setTreeData = function (data) {
            $(_this.refs.table).fancytree("option", "source", data);
        };
        _this.toDict = function () {
            var tree = _this.getTree();
            return tree.toDict(true, function (node) {
                var n = tree.getNodeByKey(node.key);
                if (n.tr) {
                    var $tdList_1 = $(n.tr).find(">td");
                    if (!node.data) {
                        node.data = {};
                    }
                    _this.props.columns.forEach(function (column, i) {
                        switch (column.type) {
                            case "Text":
                                node.data[column.id] = $tdList_1.eq(1).find("input").val();
                                break;
                            case "Number":
                                node.data[column.id] = $tdList_1.eq(1).find("input").val();
                                break;
                            case "CheckBox":
                                node.data[column.id] = $tdList_1.eq(i).find("input").prop("checked");
                                break;
                        }
                    });
                }
            });
        };
        _this.searchTree = function (input) {
            var tree = _this.getTree();
            if ($.trim(input.value) === "") {
                tree.clearFilter();
                return;
            }
            tree.filterBranches.call(tree, input.value, { mode: "hide" });
        };
        _this.toggleExpand = function () {
            _this.expandedAll = !_this.expandedAll;
            $(_this.refs.table).fancytree("getTree").visit(function (node) {
                node.setExpanded(_this.expandedAll);
            });
        };
        _this.getTree = function () {
            return $(_this.refs.table).fancytree("getTree");
        };
        _this.dragStart = function (node, data) {
            // allow dragging `node`:
            return true;
        };
        _this.dragEnter = function (node, data) {
            return true;
        };
        _this.initHelper = function (node, data) {
            // Helper was just created: modify markup
            var helper = data.ui.helper, sourceNodes = data.tree.getSelectedNodes();
            // Store a list of active + all selected nodes
            if (!node.isSelected()) {
                sourceNodes.unshift(node);
            }
            helper.data("sourceNodes", sourceNodes);
            // Mark selected nodes also as drag source (active node is already)
            //$(".fancytree-active,.fancytree-selected", tree.$container)
            $(".fancytree-active,.fancytree-selected", $(_this.refs.table).$container)
                .addClass("fancytree-drag-source");
            // Add a counter badge to helper if dragging more than one node
            if (sourceNodes.length > 1) {
                helper.append($("<span class='fancytree-childcounter'/>")
                    .text("+" + (sourceNodes.length - 1)));
            }
            // Prepare an indicator for copy-mode
            helper.prepend($("<span class='fancytree-dnd-modifier'/>")
                .text("+").hide());
        };
        _this.updateHelper = function (node, data) {
            // Mouse was moved or key pressed: update helper according to modifiers
            // NOTE: pressing modifier keys stops dragging in jQueryUI 1.11
            // http://bugs.jqueryui.com/ticket/14461
            var event = data.originalEvent, tree = node.tree, copyMode = event.ctrlKey || event.altKey;
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
        };
        _this.dragDrop = function (node, data) {
            if (!node.folder && data.hitMode === "over") {
                data.hitMode = "after";
            }
            var sourceNodes = data.ui.helper.data("sourceNodes"), event = data.originalEvent, copyMode = event.ctrlKey || event.altKey;
            if (copyMode) {
                $.each(sourceNodes, function (i, o) {
                    o.copyTo(node, data.hitMode, function (n) {
                        delete n.key;
                        n.selected = false;
                        n.title = "Copy of " + n.title;
                    });
                });
            }
            else {
                $.each(sourceNodes, function (i, o) {
                    o.moveTo(node, data.hitMode);
                });
            }
        };
        _this.closeEdit = function (event, data) {
            if (data.save && data.isNew) {
                // Quick-enter: add new nodes until we hit [enter] on an empty title
                $(_this.refs.table).trigger("nodeCommand", { cmd: "addSibling" });
            }
        };
        _this.beforeEdit = function (event, data) {
            console.log(event);
            return true;
        };
        _this.createNode = function (event, data) {
            var node = data.node, $tdList = $(node.tr).find(">td");
        };
        _this.renderColumns = function (event, data) {
            var node = data.node, $tdList = $(node.tr).find(">td");
            _this.props.columns.forEach(function (column, i) {
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
        };
        _this.nodeCommand = function (event, data) {
            var refNode, moveMode, tree = $(_this).fancytree("getTree"), node = tree.getActiveNode();
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
                    node.editCreateNode("after", { key: _this.idGenerator.makeUniqueId(), title: "" });
                    break;
                case "addGroup":
                    node.editCreateNode("after", {
                        key: _this.idGenerator.makeUniqueId(),
                        title: "",
                        folder: true,
                        expanded: false
                    });
                    break;
                case "cut":
                    _this._clipboard = { mode: data.cmd, data: node };
                    break;
                case "copy":
                    _this._clipboard = {
                        mode: data.cmd,
                        data: node.toDict(function (n) {
                            delete n.key;
                        })
                    };
                    break;
                case "clear":
                    _this._clipboard = null;
                    break;
                case "paste":
                    if (_this._clipboard.mode === "cut") {
                        // refNode = node.getPrevSibling();
                        _this._clipboard.data.moveTo(node, "child");
                        _this._clipboard.data.setActive();
                    }
                    else if (_this._clipboard.mode === "copy") {
                        node.addChildren(_this._clipboard.data).setActive();
                    }
                    break;
                default:
                    alert("Unhandled command: " + data.cmd);
                    return;
            }
        };
        _this.click = function () {
        };
        _this.keyDown = function (e) {
            var cmd = null;
            switch ($.ui.fancytree.eventToString(e)) {
                case "ctrl+c":
                case "meta+c":// mac
                    cmd = "copy";
                    break;
                case "ctrl+v":
                case "meta+v":// mac
                    cmd = "paste";
                    break;
                case "ctrl+x":
                case "meta+x":// mac
                    cmd = "cut";
                    break;
                case "ctrl+n":
                case "meta+n":// mac
                    cmd = "addSibling";
                    break;
                case "ctrl+g":
                case "meta+g":// mac
                    cmd = "addGroup";
                    break;
                case "del":
                case "meta+backspace":// mac
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
                case "ctrl+shift+right":// mac
                    cmd = "indent";
                    break;
                case "ctrl+left":
                case "ctrl+shift+left":// mac
                    cmd = "outdent";
            }
            if (cmd) {
                $(_this).trigger("nodeCommand", { cmd: cmd });
                return false;
            }
        };
        _this.onDrag = function () {
            _this.props.columns.map(function (column, i) {
                $(_this.refs[column.id + "Td"]).width($(_this.refs[column.id + "Th"]).width());
            });
        };
        _this.beforeOpen = function (event, ui) {
            var node = $.ui.fancytree.getNode(ui.target);
            $(_this.refs.table).contextmenu("enableEntry", "paste", !!_this._clipboard);
            node.setActive();
        };
        _this.select = function (event, ui) {
            var that = _this;
            // delay the event, so the menu can close and the click event does
            // not interfere with the edit control
            setTimeout(function () {
                $(that).trigger("nodeCommand", { cmd: ui.cmd });
            }, 100);
        };
        return _this;
    }
    FancyTreeCustom.prototype.render = function () {
        return (React.createElement("div", { ref: "root" },
            React.createElement("table", { ref: "table", className: "tanaka" },
                React.createElement("thead", { className: "fancytest" },
                    React.createElement("tr", null, this.props.columns.map(function (column, i) {
                        var columnStyle = { minWidth: column.minWidth, maxWidth: column.maxWidth };
                        return React.createElement("th", { key: i, ref: column.id + "Th", style: columnStyle }, column.name);
                    }))),
                React.createElement("tbody", { className: "fancytest" },
                    React.createElement("tr", null, this.props.columns.map(function (column, i) {
                        var columnStyle = { minWidth: column.minWidth, maxWidth: column.maxWidth };
                        return React.createElement("td", { key: i, ref: column.id + "Td", style: columnStyle }, (function () {
                            switch (column.type) {
                                case "Text":
                                    return React.createElement("input", { type: "text", name: column.id, title: "name", style: { width: "98%" } });
                                case "CheckBox":
                                    return React.createElement("input", { type: "checkbox", name: column.id, title: "check" });
                                case "Number":
                                    return React.createElement("input", { type: "number", name: column.id, title: "number", style: { width: "98%" } });
                            }
                        })());
                    }))))));
    };
    FancyTreeCustom.prototype.componentDidMount = function () {
        var _this = this;
        var state = this.props.glContainer.getState();
        if (state && "settings" in state) {
            this.props.columns.forEach(function (column) {
                if ("settings" + column.id + "Disp" in state.settings && !state.settings["settings" + column.id + "Disp"]) {
                    $(_this.refs[column.id + "Th"]).remove();
                    $(_this.refs[column.id + "Td"]).remove();
                }
            });
        }
        var source = [{
                title: "node 1", folder: true, expanded: true, name: "a", children: [
                    { title: "node 1.1", name: "a" }, { title: "node 1.2", name: "b" }
                ]
            }, {
                title: "node 2", folder: true, expanded: false, name: "a", children: [
                    { title: "node 2.1", name: "c" }, { title: "node 2.2", name: "d" }
                ]
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
                autoApply: true,
                autoExpand: true,
                counter: true,
                fuzzy: false,
                hideExpandedCounter: true,
                hideExpanders: false,
                highlight: true,
                leavesOnly: false,
                nodata: true,
                mode: "hide" // Grayout unmatched nodes (pass "hide" to remove unmatched node instead)
            },
            dnd: {
                preventVoidMoves: true,
                preventRecursiveMoves: true,
                autoExpandMS: 400,
                refreshPositions: true,
                draggable: {
                    appendTo: "body",
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
                { title: "編集 <kbd>[F2]</kbd>", cmd: "rename", uiIcon: "ui-icon-pencil" },
                { title: "削除 <kbd>[Del]</kbd>", cmd: "remove", uiIcon: "ui-icon-trash" },
                { title: "----" },
                { title: "ノードグループ作成 <kbd>[Ctrl+G]</kbd>", cmd: "addGroup", uiIcon: "ui-icon-plus" },
                { title: "ノード作成 <kbd>[Ctrl+N]</kbd>", cmd: "addSibling", uiIcon: "ui-icon-plus" },
                { title: "----" },
                { title: "切り取り <kbd>Ctrl+X</kbd>", cmd: "cut", uiIcon: "ui-icon-scissors" },
                { title: "コピー <kbd>Ctrl-C</kbd>", cmd: "copy", uiIcon: "ui-icon-copy" },
                { title: "貼り付け<kbd>Ctrl+V</kbd>", cmd: "paste", uiIcon: "ui-icon-clipboard", disabled: true }
            ],
            beforeOpen: this.beforeOpen,
            select: this.select,
        });
        $(this.refs.table).resize();
    };
    FancyTreeCustom.prototype.resize = function () {
        var container = this.props.glContainer;
        $(this.refs.root).height(container.getElement().height() - 50);
        $(this.refs.table).height(container.getElement().height() - 50);
        $(this.refs.table).width(container.getElement().width());
    };
    __decorate([
        inversify_config_1.lazyInject(idGenerator_1.default)
    ], FancyTreeCustom.prototype, "idGenerator", void 0);
    return FancyTreeCustom;
}(React.Component));
exports.FancyTreeCustom = FancyTreeCustom;
//# sourceMappingURL=fancytreeCustom.js.map