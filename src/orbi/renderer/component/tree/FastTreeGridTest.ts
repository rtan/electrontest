import * as _ from "underscore";
import {
    Column,
    FastTreeGridData as Tree,
    FastTreeGridNodeData as Node,
    NodeCommonData,
    NodeType,
    NodeValueType
} from "./FastTreeGridViewData2";

export const testData = (dataFilePath: string = "d2") =>{

    const data = (i:number) => { return {id: i, _name:"node-"+i, _desc:"desc"+i}};
    const nodes = (start: number, stop: number) => _.range(start, stop).map(i => data(i));

    const toMap = (d: {[n: string]: any}) => {
        const a = new Map<string, any>();
        for (let k in d) {
            a.set(k,d[k]);
        }
        return a;
    }

    let tree = Tree.load(dataFilePath);

    return tree;
}

export const testColumns = [
    //new Column("columnName", d => d.columnName),
    //new Column("nodeType", d => d.nodeType),
    //new Column("nodeSubType", d => d.nodeSubType),
    new Column("name", "name", d => d.name),
    new Column("type", "type", d => d.type),
    new Column("desc", "desc", d => d.desc)
];
