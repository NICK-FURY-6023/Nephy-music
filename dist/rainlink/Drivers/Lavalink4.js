var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { metadata } from "../metadata.js";
import { RainlinkEvents } from "../Interface/Constants.js";
import { AbstractDriver } from "./AbstractDriver.js";
import util from "node:util";
import { RainlinkWebsocket } from "../Utilities/RainlinkWebsocket.js";
import { RainlinkDatabase } from "../Utilities/RainlinkDatabase.js";
export class Lavalink4 extends AbstractDriver {
    constructor() {
        super();
        this.id = "lavalink/v4/koinu";
        this.wsUrl = "";
        this.httpUrl = "";
        this.manager = null;
        this.node = null;
        this.playerFunctions = new RainlinkDatabase();
        this.functions = new RainlinkDatabase();
        this.sessionId = null;
    }
    get isRegistered() {
        return this.manager !== null && this.node !== null && this.wsUrl.length !== 0 && this.httpUrl.length !== 0;
    }
    initial(manager, node) {
        this.manager = manager;
        this.node = node;
        this.wsUrl = `${this.node.options.secure ? "wss" : "ws"}://${this.node.options.host}:${this.node.options.port}/v4/websocket`;
        this.httpUrl = `${this.node.options.secure ? "https://" : "http://"}${this.node.options.host}:${this.node.options.port}/v4`;
    }
    connect() {
        if (!this.isRegistered)
            throw new Error(`Driver ${this.id} not registered by using initial()`);
        const isResume = this.manager.rainlinkOptions.options.resume;
        const ws = new RainlinkWebsocket(this.wsUrl, {
            headers: {
                authorization: this.node.options.auth,
                "user-id": this.manager.id,
                "client-name": `${metadata.name}/${metadata.version} (${metadata.github})`,
                "session-id": this.sessionId !== null && isResume ? this.sessionId : "",
                "user-agent": this.manager.rainlinkOptions.options.userAgent,
                "num-shards": this.manager.shardCount,
            },
        });
        ws.on("open", () => {
            this.node.wsOpenEvent();
        });
        ws.on("message", (data) => this.wsMessageEvent(data));
        ws.on("error", (err) => this.node.wsErrorEvent(err));
        ws.on("close", (code, reason) => {
            this.node.wsCloseEvent(code, reason);
            ws.removeAllListeners();
        });
        this.wsClient = ws;
        return ws;
    }
    requester(options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!this.isRegistered)
                throw new Error(`Driver ${this.id} not registered by using initial()`);
            if (options.path.includes("/sessions") && this.sessionId == null)
                throw new Error("sessionId not initalized! Please wait for lavalink get connected!");
            const url = new URL(`${this.httpUrl}${options.path}`);
            if (options.params)
                url.search = new URLSearchParams(options.params).toString();
            if (options.data) {
                options.body = JSON.stringify(options.data);
            }
            const lavalinkHeaders = Object.assign({ authorization: this.node.options.auth, "user-agent": this.manager.rainlinkOptions.options.userAgent }, options.headers);
            options.headers = lavalinkHeaders;
            const res = yield fetch(url, options);
            if (res.status == 204) {
                this.debug("Player now destroyed");
                return undefined;
            }
            if (res.status !== 200) {
                this.debug(`${(_a = options.method) !== null && _a !== void 0 ? _a : "GET"} ${url.pathname + url.search} payload=${options.body ? String(options.body) : "{}"}`);
                this.debug("Something went wrong with lavalink server. " +
                    `Status code: ${res.status}\n Headers: ${util.inspect(options.headers)}`);
                return undefined;
            }
            const finalData = yield res.json();
            this.debug(`${(_b = options.method) !== null && _b !== void 0 ? _b : "GET"} ${url.pathname + url.search} payload=${options.body ? String(options.body) : "{}"}`);
            return finalData;
        });
    }
    wsMessageEvent(data) {
        if (!this.isRegistered)
            throw new Error(`Driver ${this.id} not registered by using initial()`);
        const wsData = JSON.parse(data.toString());
        this.node.wsMessageEvent(wsData);
    }
    debug(logs) {
        var _a;
        if (!this.isRegistered)
            throw new Error(`Driver ${this.id} not registered by using initial()`);
        this.manager.emit(RainlinkEvents.Debug, `[Rainlink] / [Node @ ${(_a = this.node) === null || _a === void 0 ? void 0 : _a.options.name}] / [Driver] / [Lavalink4] | ${logs}`);
    }
    wsClose() {
        if (this.wsClient)
            this.wsClient.close(1006, "Self closed");
    }
    updateSession(sessionId, mode, timeout) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                path: `/sessions/${sessionId}`,
                headers: { "content-type": "application/json" },
                method: "PATCH",
                data: {
                    resuming: mode,
                    timeout: timeout,
                },
            };
            yield this.requester(options);
            this.debug(`Session updated! resume: ${mode}, timeout: ${timeout}`);
            return;
        });
    }
}
