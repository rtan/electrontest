import "reflect-metadata";
import {injectable} from "inversify";
import Config from "./config";
import fs from "fs";

@injectable()
export default class ConfigService {
    private readonly _config: Config;

    constructor() {
        if (!fs.existsSync("./settings.json")) {
            const defaultConfig = require("orbi/renderer/services/config/defaultConfig.json");
            fs.writeFileSync("./settings.json", JSON.stringify(defaultConfig, null, "  "), {encoding: "utf-8"});
        }
        const json = fs.readFileSync("./settings.json", {encoding: "utf-8"});
        this._config = JSON.parse(json);
    }

    get config() {
        return this._config;
    }


}