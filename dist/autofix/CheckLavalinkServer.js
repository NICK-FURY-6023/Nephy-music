var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { GetLavalinkServer } from "./GetLavalinkServer.js";
import Websocket from "ws";
export class CheckLavalinkServer {
    constructor(client, isLogEnable = true) {
        this.client = client;
        this.execute(isLogEnable);
    }
    execute(isLogEnable) {
        return __awaiter(this, void 0, void 0, function* () {
            if (isLogEnable)
                this.client.logger.lavalink(import.meta.url, "Running check lavalink server from [https://lavalink.darrennathanael.com/] source");
            const getLavalinkServerClass = new GetLavalinkServer();
            const lavalink_data = yield getLavalinkServerClass.execute();
            if (this.client.lavalinkList.length !== 0)
                this.client.lavalinkList.length = 0;
            for (let i = 0; i < lavalink_data.length; i++) {
                const config = lavalink_data[i];
                let headers = {
                    "Client-Name": "rainlink/1.0.0 (https://github.com/RainyXeon/Rainlink)",
                    "User-Agent": "rainlink/1.0.0 (https://github.com/RainyXeon/Rainlink)",
                    Authorization: config.pass,
                    "User-Id": "977148321682575410",
                    "Resume-Key": "rainlink@1.0.0(https://github.com/RainyXeon/Rainlink)",
                };
                const url = `ws://${config.host}:${config.port}/v4/websocket`;
                this.checkServerStatus(url, headers)
                    .then(() => {
                    this.client.lavalinkList.push({
                        host: config.host,
                        port: config.port,
                        pass: config.pass,
                        secure: config.secure,
                        name: `${config.host}:${config.port}`,
                        online: true,
                    });
                })
                    .catch(() => {
                    this.client.lavalinkList.push({
                        host: config.host,
                        port: config.port,
                        pass: config.pass,
                        secure: config.secure,
                        name: `${config.host}:${config.port}`,
                        online: false,
                    });
                });
            }
        });
    }
    checkServerStatus(url, headers) {
        return new Promise((resolve, reject) => {
            const ws = new Websocket(url, { headers });
            ws.onopen = () => {
                resolve(ws.readyState);
                ws.close();
            };
            ws.onerror = (e) => {
                reject(e);
            };
        });
    }
}
