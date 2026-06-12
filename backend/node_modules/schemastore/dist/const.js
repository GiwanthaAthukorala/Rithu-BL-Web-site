"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSON_SCHEMA_ROOT = exports.BASE_HOST = void 0;
const node_path_1 = __importDefault(require("node:path"));
exports.BASE_HOST = "https://json.schemastore.org/";
exports.JSON_SCHEMA_ROOT = node_path_1.default.join(__dirname, "../schemas/json");
//# sourceMappingURL=const.js.map