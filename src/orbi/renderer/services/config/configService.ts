import "reflect-metadata";
import {injectable} from "inversify";
import Config from "./config";
import fs from "fs";

@injectable()
export default class ConfigService {
    private static readonly CONFIG_NAME = "./config.json";
    private readonly _config: Config;

    constructor() {
        if (!fs.existsSync(ConfigService.CONFIG_NAME)) {
            const defaultConfig = require("orbi/renderer/services/config/defaultConfig.json");
            fs.writeFileSync(ConfigService.CONFIG_NAME, JSON.stringify(defaultConfig, null, "  "), {encoding: "utf-8"});
        }
        const json = fs.readFileSync(ConfigService.CONFIG_NAME, {encoding: "utf-8"});
        this._config = JSON.parse(json);
    }

    get config() {
        return this._config;
    }
}