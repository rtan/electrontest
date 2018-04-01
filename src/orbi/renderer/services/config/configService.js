"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
var inversify_1 = require("inversify");
var fs_1 = __importDefault(require("fs"));
var ConfigService = /** @class */ (function () {
    function ConfigService() {
        if (!fs_1.default.existsSync(ConfigService_1.CONFIG_NAME)) {
            var defaultConfig = require("orbi/renderer/services/config/defaultConfig.json");
            fs_1.default.writeFileSync(ConfigService_1.CONFIG_NAME, JSON.stringify(defaultConfig, null, "  "), { encoding: "utf-8" });
        }
        var json = fs_1.default.readFileSync(ConfigService_1.CONFIG_NAME, { encoding: "utf-8" });
        this._config = JSON.parse(json);
    }
    ConfigService_1 = ConfigService;
    Object.defineProperty(ConfigService.prototype, "config", {
        get: function () {
            return this._config;
        },
        enumerable: true,
        configurable: true
    });
    ConfigService.CONFIG_NAME = "./config.json";
    ConfigService = ConfigService_1 = __decorate([
        inversify_1.injectable()
    ], ConfigService);
    return ConfigService;
    var ConfigService_1;
}());
exports.default = ConfigService;
//# sourceMappingURL=configService.js.map