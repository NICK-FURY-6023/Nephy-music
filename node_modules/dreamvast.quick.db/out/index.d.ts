import { IDriver } from "./interfaces/IDriver";
export { IDriver } from "./interfaces/IDriver";
export { IRemoteDriver } from "./interfaces/IRemoteDriver";
export interface IQuickDBOptions {
    table?: string;
    filePath?: string;
    driver?: IDriver;
    normalKeys?: boolean;
}
export declare class QuickDB<D = any> {
    private static instances;
    private _driver;
    private tableName;
    private normalKeys;
    private options;
    get driver(): IDriver;
    constructor(options?: IQuickDBOptions);
    private addSubtract;
    private getArray;
    static registerSingleton<T>(name: string, options?: IQuickDBOptions): QuickDB<T>;
    static getSingleton<T>(name: string): QuickDB<T>;
    init(): Promise<void>;
    close(): Promise<void>;
    all<T = D>(): Promise<{
        id: string;
        value: T;
    }[]>;
    get<T = D>(key: string): Promise<T | null>;
    set<T = D>(key: string, value: T): Promise<T>;
    update<T = D>(key: string, object: object): Promise<T>;
    has(key: string): Promise<boolean>;
    delete(key: string): Promise<number>;
    deleteAll(): Promise<number>;
    add(key: string, value: number): Promise<number>;
    sub(key: string, value: number): Promise<number>;
    push<T = D>(key: string, ...values: T[]): Promise<T[]>;
    unshift<T = D>(key: string, value: T | T[]): Promise<T[]>;
    pop<T = D>(key: string): Promise<T | undefined>;
    shift<T = D>(key: string): Promise<T | undefined>;
    pull<T = D>(key: string, value: T | T[] | ((data: T, index: string) => boolean), once?: boolean): Promise<T[]>;
    startsWith<T = D>(query: string): Promise<{
        id: string;
        value: T;
    }[]>;
    table<T = D>(table: string): Promise<QuickDB<T>>;
    useNormalKeys(activate: boolean): void;
}
//# sourceMappingURL=index.d.ts.map