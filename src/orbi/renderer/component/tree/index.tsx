import * as React from 'react';
import * as ReactDOM from 'react-dom';
import FastTreeGrid from "./FastTreeGrid";
import registerServiceWorker from './registerServiceWorker';
import {createRef, RefObject} from "react";
import {testColumns, testData} from "./FastTreeGridTest";
import {FastTreeGridData} from "./FastTreeGridViewData2";
import 'semantic-ui-css/semantic.css'
import FastTreeGridDetail from "./FastTreeGridDetail";

// windowに登録してしまう
// todo データのIN/OUTができるようにする。データ更新時にフックできるようにする。
interface Window {
    testData(dataFilePath: string): FastTreeGridData;
    fastTreeGrid(elementId: string, data: FastTreeGridData, tree: FastTreeGrid|null): FastTreeGrid;
    removeFastTreeGrid(el: Element): void;
    fastTreeGridDetail(elementId: string): FastTreeGridDetail;
}
declare var window: Window;
// todo データ、カラム外側から指定
window.testData = (dataFilePath: string)=>testData(dataFilePath);
window.fastTreeGrid = (elementId: string, data: FastTreeGridData, tree: FastTreeGrid|null = null): FastTreeGrid => {
    const r = createRef<FastTreeGrid>();
    const o = <FastTreeGrid ref={r} rowHeight={21} tree={data} searchResultTreeGrid={tree}/>
    ReactDOM.render(o, document.getElementById(elementId) as HTMLElement);
    return r.current!;
};
window.removeFastTreeGrid = (el: Element)=>{
    ReactDOM.unmountComponentAtNode(el);
};


//const tree = window.FastTreeGrid("root");
//console.log(tree.search("11"));

// ReactDOM.render(
//     <div>
//         <div style={{resize: "both", overflow:"hidden", border:"solid", borderWidth:"1px", height:"400px", padding:"10px"}}>
//             <FastTreeGrid rowHeight={18} />
//         </div>
//     </div>
//     , document.getElementById('root') as HTMLElement
// );
// registerServiceWorker();
