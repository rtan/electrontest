import GoldenLayout from "golden-layout";
import FancyTest from "./fancy";

require("golden-layout/src/css/goldenlayout-base.css")
require("golden-layout/src/css/goldenlayout-light-theme.css")

var config = {
    content: [{
        type: 'row',
        content: [{
            type: 'component',
            componentName: 'testComponent',
            componentState: {label: 'B'}
        }, {
            type: 'component',
            componentName: 'testComponent2',
            componentState: {label: 'C'}
        }]
    }]
};

var myLayout = new GoldenLayout(config);

let fancyTest = new FancyTest("tree1");

var html2 = require("./fancy2.html");

myLayout.registerComponent('testComponent', function (container, componentState) {
    fancyTest.load(container.getElement());
});

myLayout.registerComponent('testComponent2', function (container, componentState) {
    container.getElement().html(html2);
});

myLayout.init();

require("./fancy2.ts");
