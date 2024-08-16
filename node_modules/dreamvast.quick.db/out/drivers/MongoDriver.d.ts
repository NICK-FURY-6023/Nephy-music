import { Connection, ConnectOptions, Model, Schema } from "mongoose";
import { IRemoteDriver } from "../interfaces/IRemoteDriver";
export interface CollectionInterface<T = unknown> {
    ID: string;
    data: T;
    createdAt: Date;
    updatedAt: Date;
    expireAt?: Date;
}
export declare class MongoDriver implements IRemoteDriver {
    url: string;
    options: ConnectOptions;
    conn?: Connection;
    private models;
    docSchema: Schema<CollectionInterface<unknown>>;
    constructor(url: string, options?: ConnectOptions, pluralizeP?: boolean);
    connect(): Promise<MongoDriver>;
    disconnect(): Promise<void>;
    private checkConnection;
    prepare(table: string): Promise<void>;
    private getModel;
    getAllRows(table: string): Promise<{
        id: string;
        value: any;
    }[]>;
    getRowByKey<T>(table: string, key: string): Promise<[T | null, boolean]>;
    getStartsWith(table: string, query: string): Promise<{
        id: string;
        value: any;
    }[]>;
    setRowByKey<T>(table: string, key: string, value: any, _update: boolean): Promise<T>;
    deleteAllRows(table: string): Promise<number>;
    deleteRowByKey(table: string, key: string): Promise<number>;
    modelSchema<T = unknown>(modelName?: string): Model<CollectionInterface<T>>;
}
//# sourceMappingURL=MongoDriver.d.ts.map