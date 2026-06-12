#!/usr/bin/node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.doSearch = exports.search = exports.doAdd = exports.doAutoFix = exports.doBin = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const catalog_json_1 = __importDefault(require("./catalog.json"));
const const_1 = require("./const");
const ROOT = process.cwd();
const [cmd, ...args] = process.argv.slice(2);
const doBin = async () => {
    switch (cmd) {
        case undefined:
            (0, exports.doAutoFix)();
            break;
        case "find":
        case "search":
            (0, exports.doSearch)(args);
            break;
        case "add":
            (0, exports.doAdd)(args);
            break;
    }
};
exports.doBin = doBin;
const doAutoFix = () => {
    const words = node_fs_1.default
        .readdirSync(ROOT)
        .filter((name) => node_fs_1.default.statSync(node_path_1.default.join(ROOT, name)).isFile())
        .map((word) => `=${word}`);
    return (0, exports.doAdd)(words);
};
exports.doAutoFix = doAutoFix;
const doAdd = async (search_words) => {
    if (search_words.length === 0) {
        return;
    }
    console.group("add by keys:", search_words);
    const vscodeSettingsJsonFilepath = node_path_1.default.join(ROOT, ".vscode/settings.json");
    let vscodeSettingsJson;
    /// read .vscode/setting.json
    {
        if (node_fs_1.default.existsSync(vscodeSettingsJsonFilepath) === false) {
            node_fs_1.default.mkdirSync(node_path_1.default.dirname(vscodeSettingsJsonFilepath), {
                recursive: true,
            });
            vscodeSettingsJson = {};
        }
        else {
            vscodeSettingsJson = new Function(`return (${node_fs_1.default.readFileSync(vscodeSettingsJsonFilepath, "utf-8").trim() || "{}"})`)();
        }
    }
    const jsonSchemasList = vscodeSettingsJson["json.schemas"] ?? [];
    const fileMatchs = new Set();
    for (const schemaConfig of jsonSchemasList) {
        for (const match of schemaConfig.fileMatch) {
            fileMatchs.add(match);
        }
    }
    const fixUrl = (url) => {
        if (url.startsWith(const_1.BASE_HOST) === false) {
            return url;
        }
        return node_path_1.default
            .relative(ROOT, node_path_1.default.join(const_1.JSON_SCHEMA_ROOT, url.slice(const_1.BASE_HOST.length)))
            .replace(/\\/g, "/");
    };
    const newJsonSchemasList = jsonSchemasList.slice();
    for (const schema of (0, exports.search)(search_words)) {
        if (schema.fileMatch.every((match) => fileMatchs.has(match))) {
            continue;
        }
        schema.url = fixUrl(schema.url);
        const versions = schema.versions;
        if (versions) {
            for (const version in versions) {
                versions[version] = fixUrl(versions[version]);
            }
        }
        newJsonSchemasList.push(schema);
        console.log("added", schema.name, schema.fileMatch);
    }
    if (newJsonSchemasList.length > jsonSchemasList.length) {
        vscodeSettingsJson["json.schemas"] = newJsonSchemasList;
        node_fs_1.default.writeFileSync(vscodeSettingsJsonFilepath, JSON.stringify(vscodeSettingsJson, null, 2));
    }
};
exports.doAdd = doAdd;
const search = function* (search_words) {
    const searchFuns = search_words.map((word) => {
        if (word.startsWith("/") && word.endsWith("/")) {
            const reg = new RegExp(word.slice(1, -1));
            console.log(reg);
            return (str) => reg.test(str);
        }
        else if (word.startsWith("^") || word.startsWith("~")) {
            const start = word.slice(1);
            return (str) => str.startsWith(start);
        }
        else if (word.startsWith("$")) {
            const end = word.slice(1);
            return (str) => str.endsWith(end);
        }
        else if (word.startsWith("=")) {
            const equal = word.slice(1);
            return (str) => str === equal;
        }
        else {
            return (str) => str.includes(word);
        }
    });
    for (const schema of catalog_json_1.default.schemas) {
        if (schema.url.startsWith(const_1.BASE_HOST) &&
            schema.fileMatch?.some((filename) => searchFuns.some((sfun) => sfun(filename)))) {
            yield schema;
        }
    }
};
exports.search = search;
const doSearch = async (search_words) => {
    console.group("searching by keys:", search_words);
    for (const schema of (0, exports.search)(search_words)) {
        console.log("found name: %o fileMatch: %O description: %o", schema.name, schema.fileMatch, schema.description);
    }
};
exports.doSearch = doSearch;
//# sourceMappingURL=index.js.map