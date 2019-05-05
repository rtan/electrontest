import * as tslib_1 from "tslib";
var ConfigService_1;
import "reflect-metadata";
import { injectable } from "inversify";
import fs from "fs";
let ConfigService = ConfigService_1 = class ConfigService {
    constructor() {
        if (!fs.existsSync(ConfigService_1.CONFIG_NAME)) {
            const defaultConfig = require("orbi/renderer/services/config/defaultConfig.json");
            fs.writeFileSync(ConfigService_1.CONFIG_NAME, JSON.stringify(defaultConfig, null, "  "), { encoding: "utf-8" });
        }
        const json = fs.readFileSync(ConfigService_1.CONFIG_NAME, { encoding: "utf-8" });
        this._config = JSON.parse(json);
    }
    get config() {
        return this._config;
    }
};
ConfigService.CONFIG_NAME = "./config.json";
ConfigService = ConfigService_1 = tslib_1.__decorate([
    injectable()
], ConfigService);
export default ConfigService;
//# sourceMappingURL=configService.js.map