import { PoolOptions } from "mysql2/promise";
import { IRemoteDriver } from "../interfaces/IRemoteDriver";
export type Config = string | PoolOptions;
export declare class MySQLDriver implements IRemoteDriver {
    private static instance;
    private conn?;
    private config;
    constructor(config: Config);
    static createSingleton(config: string | Config): MySQLDriver;
    private checkConnection;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    prepare(table: string): Promise<void>;
    getAllRows(table: string): Promise<{
        id: string;
        value: any;
    }[]>;
    getStartsWith(table: string, query: string): Promise<{
        id: string;
        value: any;
    }[]>;
    getRowByKey<T>(table: string, key: string): Promise<[T | null, boolean]>;
    setRowByKey<T>(table: string, key: string, value: any, update: boolean): Promise<T>;
    deleteAllRows(table: string): Promise<number>;
    deleteRowByKey(table: string, key: string): Promise<number>;
}
//# sourceMappingURL=MySQLDriver.d.ts.map