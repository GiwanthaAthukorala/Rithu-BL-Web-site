"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.doFetch = void 0;
const chalk_1 = __importDefault(require("chalk"));
const https_proxy_agent_1 = __importDefault(require("https-proxy-agent"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_https_1 = __importDefault(require("node:https"));
const node_path_1 = __importDefault(require("node:path"));
const node_util_1 = __importDefault(require("node:util"));
const catalog_json_1 = __importDefault(require("./catalog.json"));
const const_1 = require("./const");
const fetchOptions = process.env.HTTPS_PROXY
    ? { agent: (0, https_proxy_agent_1.default)(process.env.HTTPS_PROXY) }
    : {};
const doFetchJson = async (url) => {
    let retryTimes = 3;
    do {
        try {
            const fetchJson = (url, opts) => {
                return fetch(url, opts).then((res) => {
                    if (res.status !== 200) {
                        if (res.status !== 404) {
                            debugger;
                        }
                        throw new Error(res.statusText);
                    }
                    return res.json();
                });
            };
            const getjson = (url, opts) => {
                return new Promise((resolve, reject) => {
                    node_https_1.default.get(url, opts, async (res) => {
                        if (res.statusCode !== 200) {
                            if (res.statusCode === 302 || res.statusCode === 301) {
                                return resolve(getjson(res.headers.location, opts));
                            }
                            debugger;
                            return reject(res.statusMessage);
                        }
                        let text = "";
                        for await (const chunk of res) {
                            text += chunk;
                        }
                        return resolve(Function(`return (${text})`)());
                    });
                });
            };
            if (retryTimes === 3) {
                return await fetchJson(url, fetchOptions);
            }
            else {
                return await getjson(url, fetchOptions);
            }
        }
        catch (err) {
            if (err.message === "Not Found") {
                console.log(chalk_1.default.gray("no found"), url);
                return {};
            }
            console.log(chalk_1.default.yellow("retrying"), url, err.message);
            if (retryTimes-- > 0) {
                continue;
            }
            throw err;
        }
    } while (true);
};
const isForce = process.argv.includes("--force");
const download = async (url) => {
    const urlInfo = new URL(url);
    const filepath = node_path_1.default.join(const_1.JSON_SCHEMA_ROOT, urlInfo.hostname, urlInfo.pathname);
    if (node_fs_1.default.existsSync(filepath)) {
        if (isForce === false) {
            console.log(chalk_1.default.cyan("use local file"), url, filepath);
            return filepath;
        }
    }
    console.log(chalk_1.default.blue("downloading"), url, node_path_1.default.relative(process.cwd(), filepath));
    const remoteSchemaJson = await doFetchJson(url);
    if (node_fs_1.default.existsSync(filepath)) {
        const localeSchemaJson = JSON.parse(node_fs_1.default.readFileSync(filepath, "utf-8"));
        if (localeSchemaJson.$schema !== remoteSchemaJson.$schema) {
            console.error("冲突", url, filepath);
            return false;
        }
        if (node_util_1.default.isDeepStrictEqual(remoteSchemaJson, localeSchemaJson)) {
            return filepath;
        }
    }
    else {
        node_fs_1.default.mkdirSync(node_path_1.default.dirname(filepath), { recursive: true });
    }
    node_fs_1.default.writeFileSync(filepath, JSON.stringify(remoteSchemaJson, null, 2));
    return filepath;
};
const fixUrl = async (url, doFix) => {
    if (url.startsWith(const_1.BASE_HOST) === false) {
        const filepath = await download(url);
        if (filepath) {
            doFix(new URL(node_path_1.default.relative(const_1.JSON_SCHEMA_ROOT, filepath), const_1.BASE_HOST).href);
            return true;
        }
    }
    return false;
};
const doFetch = async () => {
    for (const schema of catalog_json_1.default.schemas) {
        let changed = false;
        changed =
            (await fixUrl(schema.url, (url) => (schema.url = url))) || changed;
        const versions = schema.versions;
        if (versions) {
            for (const version in versions) {
                changed =
                    (await fixUrl(versions[version], (url) => (versions[version] = url))) || changed;
            }
        }
        if (changed) {
            node_fs_1.default.writeFileSync(node_path_1.default.join(__dirname, "../src/catalog.json"), JSON.stringify(catalog_json_1.default, null, 2));
        }
    }
};
exports.doFetch = doFetch;
if (require.main === module) {
    (0, exports.doFetch)();
}
//# sourceMappingURL=fetch.js.map