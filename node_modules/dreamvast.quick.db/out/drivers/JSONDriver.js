"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONDriver = void 0;
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const write_file_atomic_1 = __importDefault(require("write-file-atomic"));
const MemoryDriver_1 = require("./MemoryDriver");
class JSONDriver extends MemoryDriver_1.MemoryDriver {
    path;
    constructor(path = "./quickdb.json") {
        super();
        this.path = path;
        this.loadContentSync();
    }
    loadContentSync() {
        if ((0, fs_1.existsSync)(this.path)) {
            const contents = (0, fs_1.readFileSync)(this.path, { encoding: "utf-8" });
            try {
                const data = JSON.parse(contents);
                for (const table in data) {
                    const store = this.getOrCreateTable(table);
                    data[table].forEach((d) => store.set(d.id, d.value));
                }
            }
            catch {
                throw new Error("Database malformed");
            }
        }
        else {
            write_file_atomic_1.default.sync(this.path, "{}");
        }
    }
    async loadContent() {
        if ((0, fs_1.existsSync)(this.path)) {
            const contents = await (0, promises_1.readFile)(this.path, { encoding: "utf-8" });
            try {
                const data = JSON.parse(contents);
                for (const table in data) {
                    const store = this.getOrCreateTable(table);
                    data[table].forEach((d) => store.set(d.id, d.value));
                }
            }
            catch {
                throw new Error("Database malformed");
            }
        }
        else {
            await (0, write_file_atomic_1.default)(this.path, "{}");
        }
    }
    async export() {
        const val = {};
        for (const tableName of this.store.keys()) {
            val[tableName] = await this.getAllRows(tableName);
        }
        return val;
    }
    async snapshot() {
        const data = await this.export();
        await (0, write_file_atomic_1.default)(this.path, JSON.stringify(data));
    }
    async deleteAllRows(table) {
        const val = super.deleteAllRows(table);
        await this.snapshot();
        return val;
    }
    async deleteRowByKey(table, key) {
        const val = super.deleteRowByKey(table, key);
        await this.snapshot();
        return val;
    }
    async setRowByKey(table, key, value, update) {
        const val = super.setRowByKey(table, key, value, update);
        await this.snapshot();
        return val;
    }
}
exports.JSONDriver = JSONDriver;
//# sourceMappingURL=JSONDriver.js.map