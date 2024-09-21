export class Collection {
    constructor() {
        this.cache = {};
    }
    get(key) {
        var _a;
        return (_a = this.cache[key]) !== null && _a !== void 0 ? _a : undefined;
    }
    delete(key) {
        var _a;
        const data = (_a = this.cache[key]) !== null && _a !== void 0 ? _a : undefined;
        delete this.cache[key];
        return data;
    }
    clear() {
        this.cache = {};
    }
    set(key, data) {
        this.cache[key] = data;
        return data;
    }
    get size() {
        return Object.keys(this.cache).length;
    }
    get values() {
        return Object.values(this.cache);
    }
    get full() {
        const finalRes = [];
        const keys = Object.keys(this.cache);
        const values = Object.values(this.cache);
        for (let i = 0; i < keys.length; i++) {
            finalRes.push([keys[i], values[i]]);
        }
        return finalRes;
    }
    forEach(callback) {
        for (const data of this.full) {
            callback(data[1], data[0]);
        }
    }
}
