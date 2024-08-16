import { IRemoteDriver } from "../interfaces/IRemoteDriver";
import { ClientOptions } from "cassandra-driver";
export declare class CassandraDriver implements IRemoteDriver {
    private static instance;
    private _client;
    private config;
    constructor(config: ClientOptions);
    static createSingleton(config: ClientOptions): CassandraDriver;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    private checkConnection;
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
//# sourceMappingURL=CassandraDriver.d.ts.map