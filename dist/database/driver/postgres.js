var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { PostgresDriver } from "dreamvast.quick.db/PostgresDriver";
import { TableSetup } from "../setup/table.js";
import { keyChecker } from "../keyChecker.js";
export class PostgresConnectDriver {
    constructor(client, dbConfig) {
        this.client = client;
        this.dbConfig = dbConfig;
        this.connect();
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            const sampleConfig = {
                host: "localhost",
                user: "me",
                password: "secret",
                database: "my_db",
            };
            new keyChecker(this.client, this.dbConfig.config, sampleConfig, "postgres");
            const mysqlDriver = new PostgresDriver(this.dbConfig.config);
            new TableSetup(this.client, mysqlDriver, "Postgres");
        });
    }
}
