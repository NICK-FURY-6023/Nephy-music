import { Database } from "better-sqlite3";
import { IDriver } from "../interfaces/IDriver";
export declare class SqliteDriver implements IDriver {
    private static instance;
    private readonly _database;
    get database(): Database;
    constructor(path: string);
    static createSingleton(path: string): SqliteDriver;
    prepare(table: string): Promise<void>;
    getAllRows(table: string): Promise<{
        id: string;
        value: any;
    }[]>;
    getRowByKey<T>(table: string, key: string): Promise<[T | null, boolean]>;
    getStartsWith(table: string, query: string): Promise<{
        id: string;
        value: any;
    }[]>;
    setRowByKey<T>(table: string, key: string, value: any, update: boolean): Promise<T>;
    deleteAllRows(table: string): Promise<number>;
    deleteRowByKey(table: string, key: string): Promise<number>;
}
//# sourceMappingURL=SqliteDriver.d.ts.map