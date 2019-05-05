import * as React from 'react';
import * as ReactDOM from 'react-dom';
import FastTreeGrid from "./FastTreeGrid";
import { createRef } from "react";
import { testData } from "./FastTreeGridTest";
import 'semantic-ui-css/semantic.css';
// todo データ、カラム外側から指定
window.testData = (dataFilePath) => testData(dataFilePath);
window.fastTreeGrid = (elementId, data, tree = null) => {
    const r = createRef();
    const o = React.createElement(FastTreeGrid, { ref: r, rowHeight: 21, tree: data, searchResultTreeGrid: tree });
    ReactDOM.render(o, document.getElementById(elementId));
    return r.current;
};
window.removeFastTreeGrid = (el) => {
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
//# sourceMappingURL=index.js.map