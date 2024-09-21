var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { MongoConnectDriver } from "./driver/mongodb.js";
import { JSONConnectDriver } from "./driver/json.js";
import { MySQLConnectDriver } from "./driver/mysql.js";
import { PostgresConnectDriver } from "./driver/postgres.js";
export class DatabaseService {
    constructor(client) {
        this.client = client;
        this.execute();
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const databaseConfig = this.client.config.features.DATABASE;
                switch (databaseConfig.driver) {
                    case "json":
                        new JSONConnectDriver(this.client, databaseConfig);
                        break;
                    case "mongodb":
                        new MongoConnectDriver(this.client, databaseConfig);
                        break;
                    case "mysql":
                        new MySQLConnectDriver(this.client, databaseConfig);
                        break;
                    case "postgres":
                        new PostgresConnectDriver(this.client, databaseConfig);
                        break;
                    default:
                        new JSONConnectDriver(this.client, databaseConfig);
                        break;
                }
            }
            catch (error) {
                return this.client.logger.error(import.meta.url, String(error));
            }
        });
    }
}
