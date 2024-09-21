var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { QuickDB } from "dreamvast.quick.db";
import { Collection } from "./Collection.js";
export class QuickDatabasePlus extends QuickDB {
    constructor(newOptions) {
        super(newOptions);
        this.newOptions = newOptions;
        this.cache = new Collection();
    }
    get(key) {
        const _super = Object.create(null, {
            get: { get: () => super.get }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const getCache = this.cache.get(key);
            if (getCache)
                return getCache;
            const fetchData = yield _super.get.call(this, key);
            if (!fetchData)
                return null;
            this.cache.set(key, fetchData);
            return fetchData;
        });
    }
    set(key, value) {
        const _super = Object.create(null, {
            set: { get: () => super.set }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield _super.set.call(this, key, value);
            this.cache.set(key, res);
            return res;
        });
    }
    update(key, object) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield _super.update.call(this, key, object);
            this.cache.set(key, res);
            return res;
        });
    }
    has(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.get(key)) != null;
        });
    }
    delete(key) {
        const _super = Object.create(null, {
            delete: { get: () => super.delete }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield _super.delete.call(this, key);
            this.cache.delete(key);
            return res;
        });
    }
    deleteAll() {
        const _super = Object.create(null, {
            deleteAll: { get: () => super.deleteAll }
        });
        return __awaiter(this, void 0, void 0, function* () {
            this.cache.clear();
            return yield _super.deleteAll.call(this);
        });
    }
    add(key, value) {
        const _super = Object.create(null, {
            add: { get: () => super.add },
            get: { get: () => super.get }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield _super.add.call(this, key, value);
            const find = yield _super.get.call(this, key);
            this.cache.set(key, find);
            return res;
        });
    }
    sub(key, value) {
        const _super = Object.create(null, {
            sub: { get: () => super.sub },
            get: { get: () => super.get }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield _super.sub.call(this, key, value);
            const find = yield _super.get.call(this, key);
            this.cache.set(key, find);
            return res;
        });
    }
    push(key, ...values) {
        const _super = Object.create(null, {
            push: { get: () => super.push },
            get: { get: () => super.get }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield _super.push.call(this, key, ...values);
            const find = yield _super.get.call(this, key);
            this.cache.set(key, find);
            return res;
        });
    }
    unshift(key, value) {
        const _super = Object.create(null, {
            unshift: { get: () => super.unshift },
            get: { get: () => super.get }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield _super.unshift.call(this, key, value);
            const find = yield _super.get.call(this, key);
            this.cache.set(key, find);
            return res;
        });
    }
    pop(key) {
        const _super = Object.create(null, {
            pop: { get: () => super.pop },
            get: { get: () => super.get }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield _super.pop.call(this, key);
            const find = yield _super.get.call(this, key);
            this.cache.set(key, find);
            return res;
        });
    }
    shift(key) {
        const _super = Object.create(null, {
            shift: { get: () => super.shift },
            get: { get: () => super.get }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield _super.shift.call(this, key);
            const find = yield _super.get.call(this, key);
            this.cache.set(key, find);
            return res;
        });
    }
    pull(key_1, value_1) {
        const _super = Object.create(null, {
            pull: { get: () => super.pull },
            get: { get: () => super.get }
        });
        return __awaiter(this, arguments, void 0, function* (key, value, once = false) {
            const res = yield _super.pull.call(this, key, value, once);
            const find = yield _super.get.call(this, key);
            this.cache.set(key, find);
            return res;
        });
    }
    table(table) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof table != "string") {
                throw new Error(`First argument (table) needs to be a string received "${typeof table}"`);
            }
            const options = Object.assign({}, this.newOptions);
            options.table = table;
            options.driver = this.driver;
            const instance = new QuickDatabasePlus(options);
            yield instance.driver.prepare(options.table);
            return instance;
        });
    }
}
