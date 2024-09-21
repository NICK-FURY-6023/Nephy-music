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
import { LavalinkLoadType, RainlinkEvents } from "../Interface/Constants.js";
import { AbstractDriver } from "./AbstractDriver.js";
import util from "node:util";
import { RainlinkWebsocket } from "../Utilities/RainlinkWebsocket.js";
import { RainlinkDatabase } from "../Utilities/RainlinkDatabase.js";
export var Lavalink3loadType;
(function (Lavalink3loadType) {
    Lavalink3loadType["TRACK_LOADED"] = "TRACK_LOADED";
    Lavalink3loadType["PLAYLIST_LOADED"] = "PLAYLIST_LOADED";
    Lavalink3loadType["SEARCH_RESULT"] = "SEARCH_RESULT";
    Lavalink3loadType["NO_MATCHES"] = "NO_MATCHES";
    Lavalink3loadType["LOAD_FAILED"] = "LOAD_FAILED";
})(Lavalink3loadType || (Lavalink3loadType = {}));
export class Lavalink3 extends AbstractDriver {
    constructor() {
        super();
        this.id = "lavalink/v3/koto";
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
        this.wsUrl = `${this.node.options.secure ? "wss" : "ws"}://${this.node.options.host}:${this.node.options.port}/`;
        this.httpUrl = `${this.node.options.secure ? "https://" : "http://"}${this.node.options.host}:${this.node.options.port}`;
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
            const url = new URL(`${this.httpUrl}${options.path}`);
            if (options.params)
                url.search = new URLSearchParams(options.params).toString();
            if (options.rawReqData && options.path.includes("/sessions")) {
                this.convertToV3websocket(options.rawReqData);
                return;
            }
            if (options.data) {
                this.convertToV3request(options.data);
                options.body = JSON.stringify(options.data);
            }
            if (options.path.includes("/sessions//"))
                return undefined;
            if (/\/sessions\/(.*)\/players\/(.*)/.test(options.path) || (options.method && options.method == "DELETE"))
                return undefined;
            const lavalinkHeaders = Object.assign({ authorization: this.node.options.auth, "user-agent": this.manager.rainlinkOptions.options.userAgent }, options.headers);
            options.headers = lavalinkHeaders;
            if (this.sessionId)
                url.pathname = "/v3" + url.pathname;
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
            const preFinalData = yield res.json();
            let finalData = preFinalData;
            if (finalData.loadType) {
                finalData = this.convertV4trackResponse(finalData);
            }
            this.debug(`${(_b = options.method) !== null && _b !== void 0 ? _b : "GET"} ${url.pathname + url.search} payload=${options.body ? String(options.body) : "{}"}`);
            return finalData;
        });
    }
    convertToV3websocket(data) {
        let isPlaySent;
        if (!data)
            return;
        // Voice update
        if (data.playerOptions.voice)
            this.wsSendData({
                op: "voiceUpdate",
                guildId: data.guildId,
                sessionId: data.playerOptions.voice.sessionId,
                event: data.playerOptions.voice,
            });
        // Play track
        if (data.playerOptions.track && data.playerOptions.track.encoded && data.playerOptions.track.length !== 0) {
            isPlaySent = true;
            this.wsSendData({
                op: "play",
                guildId: data.guildId,
                track: data.playerOptions.track.encoded,
                startTime: data.playerOptions.position,
                endTime: data.playerOptions.track.length,
                volume: data.playerOptions.volume,
                noReplace: data.noReplace,
                pause: data.playerOptions.paused,
            });
        }
        // Destroy player
        if (data.playerOptions.track && data.playerOptions.track.encoded == null && data.playerOptions.track.length === 0)
            this.wsSendData({
                op: "destroy",
                guildId: data.guildId,
            });
        // Destroy player
        if (data.playerOptions.track && data.playerOptions.track.encoded == null)
            this.wsSendData({
                op: "stop",
                guildId: data.guildId,
            });
        if (isPlaySent)
            return (isPlaySent = false);
        // Pause player
        if (data.playerOptions.paused === false || data.playerOptions.paused === true)
            this.wsSendData({
                op: "pause",
                guildId: data.guildId,
                pause: data.playerOptions.paused,
            });
        // Seek player
        if (data.playerOptions.position)
            this.wsSendData({
                op: "seek",
                guildId: data.guildId,
                position: data.playerOptions.position,
            });
        // Voice player
        if (data.playerOptions.volume)
            this.wsSendData({
                op: "volume",
                guildId: data.guildId,
                volume: data.playerOptions.volume,
            });
        // Filter player
        if (data.playerOptions.filters)
            this.wsSendData(Object.assign({ op: "filters", guildId: data.guildId }, data.playerOptions.filters));
    }
    checkUpdateExist(data) {
        return (data.track ||
            data.identifier ||
            data.position ||
            data.endTime ||
            data.volume ||
            data.paused ||
            data.filters ||
            data.voice);
    }
    wsSendData(data) {
        if (!this.isRegistered)
            throw new Error(`Driver ${this.id} not registered by using initial()`);
        if (!this.wsClient)
            return;
        const jsonData = JSON.stringify(data);
        this.wsClient.send(jsonData);
        return;
    }
    wsMessageEvent(data) {
        if (!this.isRegistered)
            throw new Error(`Driver ${this.id} not registered by using initial()`);
        const wsData = JSON.parse(data.toString());
        if (wsData.reason)
            wsData.reason = wsData.reason.toLowerCase();
        if (wsData.reason == "LOAD_FAILED")
            wsData.reason = "loadFailed";
        this.node.wsMessageEvent(wsData);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateSession(sessionId, mode, timeout) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!sessionId) {
                this.wsSendData({
                    op: "configureResuming",
                    key: "rainlink/lavalink/v3/koto/legacy",
                    timeout: 60,
                });
                this.debug(`Session updated! resume: ${mode}, timeout: ${timeout}`);
                return;
            }
            const options = {
                path: `/sessions/${sessionId}`,
                headers: { "content-type": "application/json" },
                method: "PATCH",
                data: {
                    resumingKey: sessionId,
                    timeout: timeout,
                },
            };
            yield this.requester(options);
            this.debug(`Session updated! resume: ${mode}, timeout: ${timeout}`);
            return;
        });
    }
    debug(logs) {
        var _a;
        if (!this.isRegistered)
            throw new Error(`Driver ${this.id} not registered by using initial()`);
        this.manager.emit(RainlinkEvents.Debug, `[Rainlink] / [Node @ ${(_a = this.node) === null || _a === void 0 ? void 0 : _a.options.name}] / [Driver] / [Lavalink3] | ${logs}`);
    }
    wsClose() {
        if (this.wsClient)
            this.wsClient.close(1006, "Self closed");
    }
    testJSON(text) {
        if (typeof text !== "string") {
            return false;
        }
        try {
            JSON.parse(text);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    convertToV3request(data) {
        if (!data)
            return;
        if (data.track && data.track.encoded !== undefined) {
            data.encodedTrack = data.track.encoded;
            delete data.track;
        }
        return;
    }
    convertV4trackResponse(v3data) {
        if (!v3data)
            return {};
        if (v3data.loadType == Lavalink3loadType.LOAD_FAILED)
            v3data.loadType = LavalinkLoadType.ERROR;
        if (v3data.loadType.includes("PLAYLIST_LOADED")) {
            v3data.loadType = LavalinkLoadType.PLAYLIST;
            const convertedArray = [];
            for (let i = 0; i < v3data.tracks.length; i++) {
                convertedArray.push(this.buildV4track(v3data.tracks[i]));
            }
            v3data.data = {
                info: v3data.playlistInfo,
                tracks: convertedArray,
            };
            delete v3data.tracks;
            return v3data;
        }
        if (v3data.loadType == Lavalink3loadType.SEARCH_RESULT) {
            v3data.loadType = LavalinkLoadType.SEARCH;
            v3data.data = v3data.tracks;
            for (let i = 0; i < v3data.data.length; i++) {
                v3data.data[i] = this.buildV4track(v3data.data[i]);
            }
            delete v3data.tracks;
            delete v3data.playlistInfo;
        }
        if (v3data.loadType == Lavalink3loadType.TRACK_LOADED) {
            v3data.loadType = LavalinkLoadType.TRACK;
            v3data.data = this.buildV4track(v3data.tracks[0]);
            delete v3data.tracks;
        }
        if (v3data.loadType == Lavalink3loadType.NO_MATCHES)
            v3data.loadType = LavalinkLoadType.EMPTY;
        return v3data;
    }
    buildV4track(v3data) {
        return {
            encoded: v3data.track,
            info: {
                sourceName: v3data.info.sourceName,
                identifier: v3data.info.identifier,
                isSeekable: v3data.info.isSeekable,
                author: v3data.info.author,
                length: v3data.info.length,
                isStream: v3data.info.isStream,
                position: v3data.info.position,
                title: v3data.info.title,
                uri: v3data.info.uri,
                artworkUrl: undefined,
            },
            pluginInfo: undefined,
        };
    }
}
