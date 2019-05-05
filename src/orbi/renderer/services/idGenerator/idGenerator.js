import * as tslib_1 from "tslib";
import "reflect-metadata";
import { injectable } from 'inversify';
let IdGenerator = class IdGenerator {
    makeUniqueId() {
        return new Date().getTime().toString(16) + Math.floor(1000 * Math.random()).toString(16);
    }
};
IdGenerator = tslib_1.__decorate([
    injectable()
], IdGenerator);
export default IdGenerator;
//# sourceMappingURL=IdGenerator.js.map