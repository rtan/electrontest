import * as React from "react";
import { NodeType } from "./FastTreeGridViewData2";
export class FastTreeGridDefine {
    static dataListValueType() {
        return React.createElement("datalist", { id: "valueType" },
            React.createElement("option", { value: "Number" }, "\u6570\u5024"),
            React.createElement("option", { value: "String" }, "\u6587\u5B57\u5217"),
            React.createElement("option", { value: "Bool" }, "\u30D5\u30E9\u30B0"),
            React.createElement("option", { value: "DateTime" }, "\u65E5\u4ED8"));
    }
    static dataListBool() {
        return React.createElement("datalist", { id: "bool" },
            React.createElement("option", { value: "false" }),
            React.createElement("option", { value: "true" }));
    }
    static dataListDBType() {
        return React.createElement("datalist", { id: "dbType" },
            React.createElement("optgroup", { label: "\u6570\u5024\u578B\uFF08\u6574\u6570\u578B\uFF09" },
                React.createElement("option", { value: "tinyint" }, "-128\uFF5E127"),
                React.createElement("option", { value: "utinyint" }, "0\uFF5E255"),
                React.createElement("option", { value: "smallint" }, "-32768\uFF5E32767"),
                React.createElement("option", { value: "usmallint" }, "0\uFF5E65536"),
                React.createElement("option", { value: "mediumint" }, "-8388608\uFF5E8388607"),
                React.createElement("option", { value: "umediumint" }, "0\uFF5E16777215"),
                React.createElement("option", { value: "int" }, "-2147483648\uFF5E2147483647"),
                React.createElement("option", { value: "uint" }, "0\uFF5E4294967295"),
                React.createElement("option", { value: "bigint" }, "-9223372036854775808\uFF5E9223372036854775807"),
                React.createElement("option", { value: "ubigint" }, "0\uFF5E18446744073709551615")),
            React.createElement("optgroup", { label: "\u6570\u5024\u578B\uFF08\u6D6E\u52D5\u5C0F\u6570\u70B9\u578B\uFF09" },
                React.createElement("option", { value: "float" }, "3.402823466E+38\uFF5E3.402823466E+38"),
                React.createElement("option", { value: "double" }, "3.402823466E+38\uFF5E3.402823466E+38")),
            React.createElement("optgroup", { label: "\u6587\u5B57\u5217\u578B\uFF08\u30C6\u30AD\u30B9\u30C8\u578B\uFF09" },
                React.createElement("option", { value: "char" }, "\u56FA\u5B9A\u9577\u6587\u5B57\u578B(0-255\u6587\u5B57)"),
                React.createElement("option", { value: "varchar" }, "\u53EF\u5909\u9577\u6587\u5B57\u578B(0\uFF5E65535\u30D0\u30A4\u30C8)"),
                React.createElement("option", { value: "tinytext" }, "\u30C6\u30AD\u30B9\u30C8\u578B(0\uFF5E255\u30D0\u30A4\u30C8)"),
                React.createElement("option", { value: "text" }, "\u30C6\u30AD\u30B9\u30C8\u578B(0\uFF5E65535\u30D0\u30A4\u30C8)"),
                React.createElement("option", { value: "mediumtext" }, "\u30C6\u30AD\u30B9\u30C8\u578B(0\uFF5E16777215\u30D0\u30A4\u30C8)"),
                React.createElement("option", { value: "longtext" }, "\u30C6\u30AD\u30B9\u30C8\u578B(0\uFF5E4294967295\u30D0\u30A4\u30C8)")),
            React.createElement("optgroup", { label: "\u30D0\u30A4\u30CA\u30EA\u578B" },
                React.createElement("option", { value: "binary" }, "\u56FA\u5B9A\u9577\u30D0\u30A4\u30CA\u30EA\u578B(0\uFF5E255\u6587\u5B57)"),
                React.createElement("option", { value: "varbinary" }, "\u53EF\u5909\u9577\u30D0\u30A4\u30CA\u30EA\u578B(0\uFF5E65535\u30D0\u30A4\u30C8)")),
            React.createElement("optgroup", { label: "\u65E5\u4ED8\u578B\uFF0F\u6642\u523B\u578B" },
                React.createElement("option", { value: "date" }, "\u65E5\u4ED8\u578B(\u30C7\u30D5\u30A9\u30EB\u30C8: 'YYYY-MM-DD')"),
                React.createElement("option", { value: "datetime" }, "\u65E5\u4ED8\u6642\u523B\u578B(\u30C7\u30D5\u30A9\u30EB\u30C8: 'YYYY-MM-DD HH:MM:SS')"),
                React.createElement("option", { value: "timestamp" }, "\u65E5\u4ED8\u6642\u523B\u578B(\u30C7\u30D5\u30A9\u30EB\u30C8: 'YYYY-MM-DD HH:MM:SS')"),
                React.createElement("option", { value: "time" }, "\u6642\u523B\u578B(\u30C7\u30D5\u30A9\u30EB\u30C8: 'HH:MM:SS')"),
                React.createElement("option", { value: "year[4]" }, "\u65E5\u4ED8\u578B\uFF084\u6841\u5E74\uFF09(\u30C7\u30D5\u30A9\u30EB\u30C8: 'YYYY')"),
                React.createElement("option", { value: "year[2]" }, "\u65E5\u4ED8\u578B\uFF082\u6841\u5E74\uFF09(\u30C7\u30D5\u30A9\u30EB\u30C8: 'YY')")));
    }
}
FastTreeGridDefine.table = new class {
    constructor() {
        this.scrollBarWidth = 40; // todo
        this.minColWidth = 20;
        this.rowNum = 100; // todo 同時表示可能な行数。固定値ではなく親のサイズが変わったときに変更できるのが理想。ただ、それほど性能に影響しないので超えなさそうな値として100を入れておく。
        this.colNum = 4;
    }
};
FastTreeGridDefine.nodeIcons = new Map([
    [NodeType.NodeGroupFixed, "fas fa-coins"],
    [NodeType.NodeGroup, "fas fa-folder"],
    [NodeType.NodeEnum, "fas fa-copy"],
    [NodeType.NodeEntity, "fas fa-copy"],
    //[NodeType.NodeEntity, "fas fa-copyright"],
    [NodeType.NodeUniRefEntity, "far fa-copy"],
    //[NodeType.NodeUniRefEntity, "far fa-copyright"],
    [NodeType.NodeProperty, "far fa-file"],
    [NodeType.NodeEnumValue, "far fa-file"],
]);
//# sourceMappingURL=FastTreeGridDefine.js.map