"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
var inversify_1 = require("inversify");
var inversify_inject_decorators_1 = __importDefault(require("inversify-inject-decorators"));
var container = new inversify_1.Container({ autoBindInjectable: true });
exports.container = container;
exports.lazyInject = inversify_inject_decorators_1.default(container).lazyInject;
//# sourceMappingURL=inversify.config.js.map