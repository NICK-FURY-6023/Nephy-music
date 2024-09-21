import { RainlinkPlugin as Plugin } from "../RainlinkPlugin.js";
import { RainlinkEvents, RainlinkPluginType } from "../../Interface/Constants.js";
import { WebSocket } from "ws";
import { metadata } from "../../metadata.js";
export class RainlinkPlugin extends Plugin {
    constructor() {
        super();
        /** Whenever the plugin is enabled or not */
        this.enabled = false;
        this.runningWs = new Map();
    }
    /** Name function for getting plugin name */
    name() {
        return "rainlink-voiceReceiver";
    }
    /** Type function for diferent type of plugin */
    type() {
        return RainlinkPluginType.Default;
    }
    /** Open the ws voice reciver client */
    open(node, voiceOptions) {
        var _a;
        if (!this.enabled)
            throw new Error("This plugin is unloaded!");
        if (!((_a = node.options.driver) === null || _a === void 0 ? void 0 : _a.includes("nodelink")))
            throw new Error("This node not support voice receiver, please use Nodelink2 to use this feature!");
        const wsUrl = `${node.options.secure ? "wss" : "ws"}://${node.options.host}:${node.options.port}`;
        const ws = new WebSocket(wsUrl + "/connection/data", {
            headers: {
                Authorization: node.options.auth,
                "User-Id": this.manager.id,
                "Client-Name": `${metadata.name}/${metadata.version} (${metadata.github})`,
                "user-agent": this.manager.rainlinkOptions.options.userAgent,
                "Guild-Id": voiceOptions.guildId,
            },
        });
        this.runningWs.set(voiceOptions.guildId, ws);
        ws.on("open", () => {
            var _a;
            this.debug("Connected to nodelink's voice receive server!");
            (_a = this.manager) === null || _a === void 0 ? void 0 : _a.emit(RainlinkEvents.VoiceConnect, node);
        });
        ws.on("message", (data) => this.wsMessageEvent(node, data));
        ws.on("error", (err) => {
            var _a;
            this.debug("Errored at nodelink's voice receive server!");
            (_a = this.manager) === null || _a === void 0 ? void 0 : _a.emit(RainlinkEvents.VoiceError, node, err);
        });
        ws.on("close", (code, reason) => {
            var _a;
            this.debug(`Disconnected to nodelink's voice receive server! Code: ${code} Reason: ${reason}`);
            (_a = this.manager) === null || _a === void 0 ? void 0 : _a.emit(RainlinkEvents.VoiceDisconnect, node, code, reason);
            ws.removeAllListeners();
        });
    }
    /** Open the ws voice reciver client */
    close(guildId) {
        const targetWs = this.runningWs.get(guildId);
        if (!targetWs)
            return;
        targetWs.close();
        this.runningWs.delete(guildId);
        this.debug("Destroy connection to nodelink's voice receive server!");
        targetWs.removeAllListeners();
        return;
    }
    wsMessageEvent(node, data) {
        var _a, _b;
        const wsData = JSON.parse(data.toString());
        this.debug(String(data));
        switch (wsData.type) {
            case "startSpeakingEvent": {
                (_a = this.manager) === null || _a === void 0 ? void 0 : _a.emit(RainlinkEvents.VoiceStartSpeaking, node, wsData.data.userId, wsData.data.guildId);
                break;
            }
            case "endSpeakingEvent": {
                (_b = this.manager) === null || _b === void 0 ? void 0 : _b.emit(RainlinkEvents.VoiceEndSpeaking, node, wsData.data.data, wsData.data.userId, wsData.data.guildId);
                break;
            }
        }
        // this.node.wsMessageEvent(wsData);
    }
    /** Load function for make the plugin working */
    load(manager) {
        this.manager = manager;
        this.enabled = true;
    }
    /** unload function for make the plugin stop working */
    unload(manager) {
        this.manager = manager;
        this.enabled = false;
    }
    debug(logs) {
        this.manager ? this.manager.emit(RainlinkEvents.Debug, `[Rainlink] / [Plugin] / [Voice Receiver] | ${logs}`) : true;
    }
}
