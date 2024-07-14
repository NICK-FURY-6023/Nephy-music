"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CassandraDriver = void 0;
const cassandra_driver_1 = require("cassandra-driver");
class CassandraDriver {
    static instance;
    _client;
    config;
    constructor(config) {
        this.config = config;
    }
    static createSingleton(config) {
        if (!this.instance)
            this.instance = new CassandraDriver(config);
        return this.instance;
    }
    async connect() {
        this._client = new cassandra_driver_1.Client(this.config);
    }
    async disconnect() {
        this.checkConnection();
        await this._client.shutdown();
    }
    checkConnection() {
        if (this._client === null) {
            throw new Error("No connection to cassandra database");
        }
    }
    async prepare(table) {
        this.checkConnection();
        await this._client.execute("CREATE KEYSPACE IF NOT EXISTS quickdb WITH replication = {'class': 'NetworkTopologyStrategy', 'replication_factor': '1' }");
        await this._client.execute("USE quickdb");
        await this._client.execute(`CREATE TABLE IF NOT EXISTS ${table} (id varchar, key varchar, value TEXT, PRIMARY KEY(id))`);
        await this._client
            .execute(`CREATE CUSTOM INDEX IF NOT EXISTS key_index ON ${table} (key)
                USING 'org.apache.cassandra.index.sasi.SASIIndex'
                WITH OPTIONS = {
                    'mode': 'PREFIX',
                    'case_sensitive': 'false'
                }
        `);
    }
    async getAllRows(table) {
        this.checkConnection();
        const queryResult = await this._client.execute(`SELECT * FROM ${table}`);
        return queryResult.rows.map((row) => ({
            id: row.key,
            value: JSON.parse(row.value),
        }));
    }
    async getStartsWith(table, query) {
        this.checkConnection();
        const queryResult = await this._client.execute(`SELECT * FROM ${table} WHERE key LIKE ?`, [`${query}%`], { prepare: true });
        return queryResult.rows.map((row) => ({
            id: row.key,
            value: JSON.parse(row.value),
        }));
    }
    async getRowByKey(table, key) {
        this.checkConnection();
        const queryResult = await this._client.execute(`SELECT value FROM ${table} WHERE id = ?`, [key], { prepare: true });
        return queryResult.rowLength < 1
            ? [null, false]
            : [JSON.parse(queryResult.rows[0].value), true];
    }
    async setRowByKey(table, key, value, update) {
        this.checkConnection();
        const stringifiedValue = JSON.stringify(value);
        if (update) {
            await this._client.execute(`UPDATE ${table} SET value = ? WHERE key = ?`, [stringifiedValue, key], { prepare: true });
        }
        else {
            await this._client.execute(`INSERT INTO ${table} (id, key, value) VALUES (?, ?, ?)`, [key, key, stringifiedValue], { prepare: true });
        }
        return value;
    }
    async deleteAllRows(table) {
        this.checkConnection();
        const queryResult = await this._client.execute(`TRUNCATE ${table}`);
        return queryResult.rowLength;
    }
    async deleteRowByKey(table, key) {
        this.checkConnection();
        const queryResult = await this._client.execute(`DELETE FROM ${table} WHERE id = ?`, [key], { prepare: true });
        return queryResult.rowLength;
    }
}
exports.CassandraDriver = CassandraDriver;
//# sourceMappingURL=CassandraDriver.js.map