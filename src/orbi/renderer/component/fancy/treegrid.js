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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
var React = __importStar(require("react"));
require("jquery.fancytree/dist/skin-lion/ui.fancytree.less");
var util_1 = __importDefault(require("orbi/renderer/common/IdGenerator"));
var setting_1 = require("orbi/renderer/component/fancy/setting");
var remote = require("electron").remote;
var storage = require("electron-json-storage");
var $ = require('jquery');
window.jQuery = $;
window.$ = $;
require('jquery-ui');
var fancytree = require('jquery.fancytree');
require('jquery.fancytree/dist/modules/jquery.fancytree.edit');
require('jquery.fancytree/dist/modules/jquery.fancytree.filter');
require('jquery.fancytree/dist/modules/jquery.fancytree.dnd');
//require('jquery.fancytree/dist/modules/jquery.fancytree.dnd5');
require('orbi/renderer/jquery.fancytree.multi.custom');
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
var TreeGrid = /** @class */ (function (_super) {
    __extends(TreeGrid, _super);
    function TreeGrid(props) {
        var _this = _super.call(this, props) || this;
        _this.id = +props.id;
        _this.load(_this.props.glContainer.parent);
        return _this;
    }
    TreeGrid.prototype.render = function () {
        var _this = this;
        return (React.createElement("div", { id: "fancyTest" },
            React.createElement(setting_1.Setting, { ref: "setting", onOk: function () {
                    _this.settingsOk();
                } }),
            React.createElement("div", { className: "fancytest" },
                React.createElement("div", null,
                    "\u691C\u7D22 : ",
                    React.createElement("input", { name: "search_" + this.props.id, placeholder: "Filter..." }),
                    React.createElement("button", { id: "toggleExpand_" + this.props.id }, "Expand/Collapse"),
                    React.createElement("button", { id: "saveBtn_" + this.props.id }, "Save"),
                    React.createElement("button", { id: "loadBtn_" + this.props.id }, "Load"),
                    React.createElement("button", { id: "settingsBtn_" + this.props.id }, "Settings"),
                    React.createElement("button", { id: "reload_" + this.props.id }, "Reload")),
                React.createElement("div", { id: "div_" + this.props.id },
                    React.createElement("table", { id: "" + this.props.id, className: "tanaka" },
                        React.createElement("thead", { className: "fancytest" },
                            React.createElement("tr", null,
                                React.createElement("th", { id: "treeNodeTh", style: { minWidth: "250px", maxWidth: "250px" } }, "\u30CE\u30FC\u30C9"),
                                React.createElement("th", { id: "treeNameTh", style: { minWidth: "180px" } }, "\u540D\u79F0"),
                                React.createElement("th", { id: "treeCsTh", style: { minWidth: "30px", maxWidth: "30px" } }, "C#"),
                                React.createElement("th", { id: "treePhpTh", style: { minWidth: "30px", maxWidth: "30px" } }, "PHP"),
                                React.createElement("th", { id: "treeTypeTh", style: { minWidth: "50px" } }, "\u578B"),
                                React.createElement("th", { id: "treeMinTh", style: { minWidth: "70px" } }, "\u6700\u5C0F\u5024"),
                                React.createElement("th", { id: "treeMaxTh", style: { minWidth: "70px" } }, "\u6700\u5927\u5024"),
                                React.createElement("th", { id: "treeDefTh", style: { minWidth: "70px" } }, "\uFF83\uFF9E\uFF8C\uFF6B\uFF99\uFF84\u5024"))),
                        React.createElement("tbody", { className: "fancytest" },
                            React.createElement("tr", null,
                                React.createElement("td", { id: "treeNodeTd", style: { minWidth: "250px", maxWidth: "250px" }, className: "alignCenter" }),
                                React.createElement("td", { id: "treeNameTd", style: { minWidth: "180px" } },
                                    React.createElement("input", { type: "text", name: "name", title: "name", style: { width: "98%" } })),
                                React.createElement("td", { id: "treeCsTd", style: { minWidth: "30px", maxWidth: "30px" } }),
                                React.createElement("td", { id: "treePhpTd", style: { minWidth: "30px", maxWidth: "30px" } }),
                                React.createElement("td", { id: "treeTypeTd", style: { minWidth: "50px" } }),
                                React.createElement("td", { id: "treeMinTd", style: { minWidth: "70px" } }),
                                React.createElement("td", { id: "treeMaxTd", style: { minWidth: "70px" } }),
                                React.createElement("td", { id: "treeDefTd", style: { minWidth: "70px" } }))))))));
    };
    TreeGrid.prototype.load = function (elem) {
        var _this = this;
        if (elem === void 0) { elem = null; }
        if (elem != null) {
            this.parentElem = elem;
        }
        this.initTree();
        this.parentElem.container.on("resize", function () { return _this.resize(); });
    };
    TreeGrid.prototype.resize = function () {
        var container = this.props.glContainer;
        $("#div_" + this.id).height(container.getElement().height() - 50);
        $("#" + this.id).height(container.getElement().height() - 50);
        $("#" + this.id).width(container.getElement().width());
    };
    TreeGrid.prototype.settingsOk = function () {
        var _this = this;
        storage.set("settings", JSON.stringify({
            "settingsNameDisp": $("#settingsNameDisp").prop("checked"),
            "settingsPhpDisp": $("#settingsPhpDisp").prop("checked"),
            "settingsCsDisp": $("#settingsCsDisp").prop("checked"),
            "settingsTypeDisp": $("#settingsTypeDisp").prop("checked"),
            "settingsMinDisp": $("#settingsMinDisp").prop("checked"),
            "settingsMaxDisp": $("#settingsMaxDisp").prop("checked"),
            "settingsDefaultDisp": $("#settingsDefaultDisp").prop("checked"),
        }), function (error) {
            _this.props.onReload();
        });
    };
    TreeGrid.prototype.initTree = function () {
        var _this = this;
        var id = this.id;
        $(function () {
            storage.get("settings", function (error, data) {
                if (data) {
                    data = JSON.parse(data);
                    if (!data.settingsNameDisp) {
                        $("#treeNameTh").remove();
                        $("#treeNameTd").remove();
                    }
                    if (!data.settingsCsDisp) {
                        $("#treeCsTh").remove();
                        $("#treeCsTd").remove();
                    }
                    if (!data.settingsPhpDisp) {
                        $("#treePhpTh").remove();
                        $("#treePhpTd").remove();
                    }
                    if (!data.settingsTypeDisp) {
                        $("#treeTypeTh").remove();
                        $("#treeTypeTd").remove();
                    }
                    if (!data.settingsMinDisp) {
                        $("#treeMinTh").remove();
                        $("#treeMinTd").remove();
                    }
                    if (!data.settingsMaxDisp) {
                        $("#treeMaxTh").remove();
                        $("#treeMaxTd").remove();
                    }
                    if (!data.settingsDefaultDisp) {
                        $("#treeDefTh").remove();
                        $("#treeDefTd").remove();
                    }
                }
                var clipboard;
                var source = [
                    {
                        title: "node 1", folder: true, expanded: true, name: "a", children: [
                            { title: "node 1.1", name: "a" },
                            { title: "node 1.2", name: "b" }
                        ]
                    },
                    {
                        title: "node 2", folder: true, expanded: false, name: "a", children: [
                            { title: "node 2.1", name: "c" },
                            { title: "node 2.2", name: "d" }
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
                        // focusOnClick: true,
                        refreshPositions: true,
                        draggable: {
                            appendTo: "body",
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
                            var helper = data.ui.helper, sourceNodes = data.tree.getSelectedNodes();
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
                        },
                        dragDrop: function (node, data) {
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
                                $("#" + id).trigger("nodeCommand", { cmd: "addSibling" });
                            }
                        }
                    },
                    table: {
                        indentation: 10,
                    },
                    gridnav: {
                        autofocusInput: true,
                        handleCursorKeys: true
                    },
                    lazyLoad: function (event, data) {
                        data.result = { url: "../demo/ajax-sub2.json" };
                    },
                    createNode: function (event, data) {
                        var node = data.node, $tdList = $(node.tr).find(">td");
                    },
                    renderColumns: function (event, data) {
                        var node = data.node, $tdList = $(node.tr).find(">td");
                        $tdList.eq(1).find("input").val(node.data.name);
                    }
                }).on("nodeCommand", function (event, data) {
                    // Custom event handler that is triggered by keydown-handler and
                    // context menu:
                    var refNode, moveMode, tree = $(this).fancytree("getTree"), node = tree.getActiveNode();
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
                            node.editCreateNode("after", { key: util_1.default.makeUniqueId(), title: "" });
                            break;
                        case "addGroup":
                            node.editCreateNode("after", {
                                key: util_1.default.makeUniqueId(),
                                title: "",
                                folder: true,
                                expanded: false
                            });
                            break;
                        case "cut":
                            clipboard = { mode: data.cmd, data: node };
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
                            }
                            else if (clipboard.mode === "copy") {
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
                        $(this).trigger("nodeCommand", { cmd: cmd });
                        // e.preventDefault();
                        // e.stopPropagation();
                        return false;
                    }
                });
                // $("#" + id).resizableColumns({
                //     store: window.store
                // });
                /*
                 * Tooltips
                 */
                // $("#" + id).tooltip({
                //     content: function () {
                //         return $(this).attr("title");
                //     }
                // });
                $("#" + id).colResizable({
                    resizeMode: 'flex',
                    partialRefresh: true,
                    liveDrag: true,
                    onDrag: function () {
                        $("#treeNodeTd").width($("#treeNodeTh").width());
                        $("#treeNameTd").width($("#treeNameTh").width());
                        $("#treeCsTd").width($("#treeCsTh").width());
                        $("#treePhpTd").width($("#treePhpTh").width());
                        $("#treeTypeTd").width($("#treeTypeTh").width());
                        $("#treeMinTd").width($("#treeMinTh").width());
                        $("#treeMaxTd").width($("#treeMaxTh").width());
                        $("#treeDefTd").width($("#treeDefTh").width());
                    },
                });
                /*
                 * Context menu (https://github.com/mar10/jquery-ui-contextmenu)
                 */
                $("#" + id).contextmenu({
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
                            $(that).trigger("nodeCommand", { cmd: ui.cmd });
                        }, 100);
                    }
                });
                $("input[name=search_" + id + "]").keyup(function (e) {
                    var n, 
                    //tree = $.ui.fancytree.getTree(),
                    tree = $("#" + id).fancytree("getTree"), args = "autoApply autoExpand fuzzy hideExpanders highlight leavesOnly nodata".split(" "), opts = {}, 
                    //filterFunc = $("#branchMode").is(":checked") ? tree.filterBranches : tree.filterNodes,
                    filterFunc = tree.filterBranches, match = $(this).val();
                    $.each(args, function (i, o) {
                        opts[o] = $("#" + o).is(":checked");
                    });
                    //opts.mode = $("#hideMode").is(":checked") ? "hide" : "dimm";
                    opts.mode = "hide";
                    if (e && e.which === $.ui.keyCode.ESCAPE || $.trim(match) === "") {
                        tree.clearFilter();
                        return;
                    }
                    // if ($("#regex").is(":checked")) {
                    //     // Pass function to perform match
                    //     n = filterFunc.call(tree, function (node) {
                    //         return new RegExp(match, "i").test(node.title);
                    //     }, opts);
                    // } else {
                    //     // Pass a string to perform case insensitive matching
                    //     n = filterFunc.call(tree, match, opts);
                    // }
                    n = filterFunc.call(tree, match, opts);
                }).focus();
                var expandedAll = false;
                $("#toggleExpand_" + id).on("click", function () {
                    expandedAll = !expandedAll;
                    $("#" + id).fancytree("getTree").visit(function (node) {
                        node.setExpanded(expandedAll);
                    });
                });
                $("#saveBtn_" + id).on("click", function () {
                    var tree = $("#" + id).fancytree("getTree");
                    var d = tree.toDict(true, function (node) {
                        var n = tree.getNodeByKey(node.key);
                        if (n.tr) {
                            var $tdList = $(n.tr).find(">td");
                            if (!node.data) {
                                node.data = {};
                            }
                            node.data.name = $tdList.eq(1).find("input").val();
                        }
                    });
                    var json = JSON.stringify(d);
                    storage.set("tree", json, function (error) {
                        if (error) {
                            alert("保存に失敗しました。");
                            throw error;
                        }
                    });
                });
            });
            $("#loadBtn_" + id).on("click", function () {
                storage.get("tree", function (error, data) {
                    if (error) {
                        alert("読み込みに失敗しました。");
                        throw error;
                    }
                    $("#" + id).fancytree("option", "source", JSON.parse(data));
                });
            });
            $("#settingsBtn_" + id).on("click", function () {
                _this.refs.setting.show();
            });
            $("#reload_" + id).on("click", function () {
                //$("#fancyTest").remove();
                //this.load(this.parentElem);
                _this.props.onReload();
            });
            _this.resize();
        });
    };
    return TreeGrid;
}(React.Component));
exports.TreeGrid = TreeGrid;
//# sourceMappingURL=treegrid.js.map