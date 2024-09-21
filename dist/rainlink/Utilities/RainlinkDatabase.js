export class RainlinkDatabase {
    constructor() {
        this.cache = {};
    }
    /**
     * Get data from database
     * @param key key of that data
     * @returns D
     */
    get(key) {
        var _a;
        return (_a = this.cache[key]) !== null && _a !== void 0 ? _a : undefined;
    }
    /**
     * detete data from database and returns the deleted data
     * @param key key of that data
     * @returns D
     */
    delete(key) {
        var _a;
        const data = (_a = this.cache[key]) !== null && _a !== void 0 ? _a : undefined;
        delete this.cache[key];
        return data;
    }
    /**
     * detete all data from database
     */
    clear() {
        this.cache = {};
    }
    /**
     * Set data from database
     * @param key the key you want to set
     * @param data data of that key
     * @returns D
     */
    set(key, data) {
        this.cache[key] = data;
        return data;
    }
    /**
     * Get how many elements of current database
     * @returns number
     */
    get size() {
        return Object.keys(this.cache).length;
    }
    /**
     * Get all current values of current database
     * @returns unknown[]
     */
    get values() {
        return Object.values(this.cache);
    }
    /**
     * Get all current values of current database
     * @returns unknown[]
     */
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
