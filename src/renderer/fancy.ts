// Import LESS or CSS:
import 'jquery.fancytree/dist/skin-lion/ui.fancytree.less'

const $ = require('jquery');
window.jQuery = $;
window.$ = $;
require('jquery-ui');

const fancytree = require('jquery.fancytree');
require('jquery.fancytree/dist/modules/jquery.fancytree.edit');
require('jquery.fancytree/dist/modules/jquery.fancytree.filter');
require('jquery.fancytree/dist/modules/jquery.fancytree.dnd');
//require('jquery.fancytree/dist/modules/jquery.fancytree.dnd5');
require('jquery.fancytree/dist/modules/jquery.fancytree.multi');
require('jquery.fancytree/dist/modules/jquery.fancytree.gridnav');
require('jquery.fancytree/dist/modules/jquery.fancytree.table');

require("ui-contextmenu/jquery.ui-contextmenu");
require("jquery-ui/themes/base/all.css");

require("store");
require("jquery-resizable-columns");
require("jquery-resizable-columns/dist/jquery.resizableColumns.css")

const storage = require("electron-json-storage");
const j = require("./ajax-tree-products.json");

console.log(fancytree.version);

export default class FancyTest {
    constructor(private id: string) {
    }

    public load(elem: any) {
        let html = require("./fancy.html");
        html = html.replace("##fancyTableName##", this.id);
        elem.html(html);
        this.initTree();
    }

    private initTree() {
        // todo: this.idが参照できないと思うので修正
        $(function () {
            var clipboard;
            var source = [
                {
                    title: "node 1", folder: true, expanded: true, children: [
                        {title: "node 1.1", foo: "a"},
                        {title: "node 1.2", foo: "b"}
                    ]
                },
                {
                    title: "node 2", folder: true, expanded: false, children: [
                        {title: "node 2.1", foo: "c"},
                        {title: "node 2.2", foo: "d"}
                    ]
                }
            ];

            var tree;

            $("#" + this.id).fancytree({
                //checkbox: true,
                titlesTabbable: true,     // Add all node titles to TAB chain
                quicksearch: true,        // Jump to nodes when pressing first character
                clickFolderMode: 2,
                source: source,
                //source: JSON.stringify(j),

                extensions: ["edit", "dnd", "table", "gridnav", "filter", "multi"],
                //extensions: ["edit", "dnd5", "multi", "table", "gridnav", "filter"],

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
                // dnd: {
                //     preventVoidMoves: true,
                //     preventRecursiveMoves: true,
                //     autoExpandMS: 400,
                //     dragStart: function (node, data) {
                //         return true;
                //     },
                //     dragEnter: function (node, data) {
                //         // return ["before", "after"];
                //         return true;
                //     },
                //     dragDrop: function (node, data) {
                //         data.otherNode.moveTo(node, data.hitMode);
                //     }
                // },
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
                        $(".fancytree-active,.fancytree-selected", $("#" + this.id).$container)
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
                // dnd5: {
                //     preventVoidMoves: true, // Prevent dropping nodes 'before self', etc.
                //     preventRecursiveMoves: true, // Prevent dropping nodes on own descendants
                //     autoExpandMS: 1000,
                //     multiSource: true,  // drag all selected nodes (plus current node)
                //     // focusOnClick: true,
                //     // refreshPositions: true,
                //     dragStart: function (node, data) {
                //         // allow dragging `node`:
                //         data.dataTransfer.dropEffect = "move";
                //         return true;
                //     },
                //     // dragDrag: function(node, data) {
                //     //   data.node.info("dragDrag", data);
                //     //   data.dataTransfer.dropEffect = "copy";
                //     //   return true;
                //     // },
                //     dragEnter: function (node, data) {
                //         data.node.info("dragEnter", data);
                //         data.dataTransfer.dropEffect = "link";
                //         return true;
                //     },
                //     // dragOver: function(node, data) {
                //     //   data.node.info("dragOver", data);
                //     //   data.dataTransfer.dropEffect = "link";
                //     //   return true;
                //     // },
                //     dragEnd: function (node, data) {
                //         data.node.info("dragEnd", data);
                //     },
                //     dragDrop: function (node, data) {
                //         // This function MUST be defined to enable dropping of items on the tree.
                //         //
                //         // The source data is provided in several formats:
                //         //   `data.otherNode` (null if it's not a FancytreeNode from the same page)
                //         //   `data.otherNodeData` (Json object; null if it's not a FancytreeNode)
                //         //   `data.dataTransfer.getData()`
                //         //
                //         // We may access some meta data to decide what to do:
                //         //   `data.hitMode` ("before", "after", or "over").
                //         //   `data.dataTransfer.dropEffect`, `.effectAllowed`
                //         //   `data.originalEvent.shiftKey`, ...
                //         //
                //         // Example:
                //
                //         var dataTransfer = data.dataTransfer,
                //             sourceNodes = data.otherNodeList,
                //             event = data.originalEvent,
                //             copyMode = event.ctrlKey || event.altKey;
                //
                //         if (copyMode) {
                //             $.each(sourceNodes, function (i, o) {
                //                 o.copyTo(node, data.hitMode, function (n) {
                //                     delete n.key;
                //                     n.selected = false;
                //                     n.title = "Copy of " + n.title;
                //                 });
                //             });
                //         } else {
                //             $.each(sourceNodes, function (i, o) {
                //                 o.moveTo(node, data.hitMode);
                //             });
                //         }
                //         node.debug("drop", data);
                //         node.setExpanded();
                //     }
                // },
                edit: {
                    //triggerStart: ["f2", "shift+click", "mac+enter"],
                    triggerStart: ["clickActive", "dblclick", "f2", "mac+enter"],
                    beforeEdit: function (event, data) {
                        console.log(event);
                        return true;
                    },
                    close: function (event, data) {
                        if (data.save && data.isNew) {
                            // Quick-enter: add new nodes until we hit [enter] on an empty title
                            $("#" + this.id).trigger("nodeCommand", {cmd: "addSibling"});
                        }
                    }
                },
                table: {
                    indentation: 10,
                    //nodeColumnIdx: 2,
                    //checkboxColumnIdx: 0
                },
                gridnav: {
                    autofocusInput: false,
                    handleCursorKeys: true
                },

                lazyLoad: function (event, data) {
                    data.result = {url: "../demo/ajax-sub2.json"};
                },
                createNode: function (event, data) {
                    var node = data.node,
                        $tdList = $(node.tr).find(">td");

                    // Span the remaining columns if it's a folder.
                    // We can do this in createNode instead of renderColumns, because
                    // the `isFolder` status is unlikely to change later
                    if (node.isFolder()) {
                        $tdList.eq(2)
                            .prop("colspan", 6)
                            .nextAll().remove();
                    }
                },
                renderColumns: function (event, data) {
                    var node = data.node,
                        $tdList = $(node.tr).find(">td");

                    // (Index #0 is rendered by fancytree by adding the checkbox)
                    // Set column #1 info from node data:
                    //$tdList.eq(1).text(node.getIndexHier());
                    // (Index #2 is rendered by fancytree)
                    // Set column #3 info from node data:
                    //$tdList.eq(0).find("input").val(node.key);
                    //$tdList.eq(1).find("input").val(node.data.foo);

                    // Static markup (more efficiently defined as html row template):
                    // $tdList.eq(3).html("<input type='input' value='" + "" + "'>");
                    // ...
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
                    case "addChild":
                        node.editCreateNode("child", "");
                        break;
                    case "addSibling":
                        node.editCreateNode("after", "");
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
                    case "ctrl+shift+n":
                    case "meta+shift+n": // mac: cmd+shift+n
                        cmd = "addChild";
                        break;
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

            $("#" + this.id).resizableColumns({
                store: window.store
            });

            /*
             * Tooltips
             */
            // $("#" + this.id).tooltip({
            //     content: function () {
            //         return $(this).attr("title");
            //     }
            // });

            /*
             * Context menu (https://github.com/mar10/jquery-ui-contextmenu)
             */
            $("#" + this.id).contextmenu({
                delegate: "span.fancytree-node",
                menu: [
                    {title: "Edit <kbd>[F2]</kbd>", cmd: "rename", uiIcon: "ui-icon-pencil"},
                    {title: "Delete <kbd>[Del]</kbd>", cmd: "remove", uiIcon: "ui-icon-trash"},
                    {title: "----"},
                    {title: "New sibling <kbd>[Ctrl+N]</kbd>", cmd: "addSibling", uiIcon: "ui-icon-plus"},
                    {title: "New child <kbd>[Ctrl+Shift+N]</kbd>", cmd: "addChild", uiIcon: "ui-icon-arrowreturn-1-e"},
                    {title: "----"},
                    {title: "Cut <kbd>Ctrl+X</kbd>", cmd: "cut", uiIcon: "ui-icon-scissors"},
                    {title: "Copy <kbd>Ctrl-C</kbd>", cmd: "copy", uiIcon: "ui-icon-copy"},
                    {
                        title: "Paste as child<kbd>Ctrl+V</kbd>",
                        cmd: "paste",
                        uiIcon: "ui-icon-clipboard",
                        disabled: true
                    }
                ],
                beforeOpen: function (event, ui) {
                    var node = $.ui.fancytree.getNode(ui.target);
                    $("#" + this.id).contextmenu("enableEntry", "paste", !!clipboard);
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

            $("input[name=search]").keyup(function (e) {
                var n,
                    tree = $.ui.fancytree.getTree(),
                    args = "autoApply autoExpand fuzzy hideExpanders highlight leavesOnly nodata".split(" "),
                    opts: any = {},
                    //filterFunc = $("#branchMode").is(":checked") ? tree.filterBranches : tree.filterNodes,
                    filterFunc = tree.filterNodes,
                    match = $(this).val();

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

            let expandedAll = false;
            $("#toggleExpand").on("click", () => {
                expandedAll = !expandedAll;
                $("#" + this.id).fancytree("getTree").visit(node => {
                    node.setExpanded(expandedAll);
                });
            });

            $("#saveBtn").on("click", () => {
                let tree = $("#" + this.id).fancytree("getTree");
                let d = tree.toDict(true);
                storage.set("tree", JSON.stringify(d), error => {
                });
            });

            $("#loadBtn").on("click", function () {
                storage.get("tree", (error, data) => {
                    $("#" + this.id).fancytree("option", "source", JSON.parse(data));
                });
            });
        });
    }
}
