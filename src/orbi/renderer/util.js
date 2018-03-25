"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Util = /** @class */ (function () {
    function Util() {
    }
    Util.makeUniqueId = function () {
        return new Date().getTime().toString(16) + Math.floor(1000 * Math.random()).toString(16);
    };
    return Util;
}());
exports.default = Util;
//# sourceMappingURL=util.js.map