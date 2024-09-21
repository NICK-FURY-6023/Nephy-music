var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { RainlinkConnectState, RainlinkEvents } from "../Interface/Constants.js";
import { RainlinkRest } from "./RainlinkRest.js";
import { setTimeout } from "node:timers/promises";
import { RainlinkPlayerEvents } from "./RainlinkPlayerEvents.js";
import { LavalinkEventsEnum } from "../Interface/LavalinkEvents.js";
// Drivers
import { Lavalink4 } from "../Drivers/Lavalink4.js";
export class RainlinkNode {
    /**
     * The lavalink server handler class
     * @param manager The rainlink manager
     * @param options The lavalink server options
     */
    constructor(manager, options) {
        /** The lavalink server online status */
        this.online = false;
        this.retryCounter = 0;
        /** The lavalink server connect state */
        this.state = RainlinkConnectState.Closed;
        this.sudoDisconnect = false;
        this.manager = manager;
        this.options = options;
        const getDriver = this.manager.drivers.filter((driver) => driver.id === options.driver);
        if (!getDriver || getDriver.length == 0) {
            this.debug("No driver was found, using lavalink v4 driver instead");
            this.driver = new Lavalink4();
        }
        else {
            this.debug(`Now using driver: ${getDriver[0].id}`);
            this.driver = getDriver[0];
        }
        this.driver.initial(manager, this);
        const customRest = this.manager.rainlinkOptions.options.structures && this.manager.rainlinkOptions.options.structures.rest;
        this.rest = customRest ? new customRest(manager, options, this) : new RainlinkRest(manager, options, this);
        this.wsEvent = new RainlinkPlayerEvents();
        this.stats = {
            players: 0,
            playingPlayers: 0,
            uptime: 0,
            memory: {
                free: 0,
                used: 0,
                allocated: 0,
                reservable: 0,
            },
            cpu: {
                cores: 0,
                systemLoad: 0,
                lavalinkLoad: 0,
            },
            frameStats: {
                sent: 0,
                nulled: 0,
                deficit: 0,
            },
        };
    }
    /** Connect this lavalink server */
    connect() {
        return this.driver.connect();
    }
    /** @ignore */
    wsOpenEvent() {
        this.clean(true);
        this.state = RainlinkConnectState.Connected;
        this.debug(`Node connected! URL: ${this.driver.wsUrl}`);
        this.manager.emit(RainlinkEvents.NodeConnect, this);
    }
    /** @ignore */
    wsMessageEvent(data) {
        var _a;
        switch (data.op) {
            case LavalinkEventsEnum.Ready: {
                const isResume = this.manager.rainlinkOptions.options.resume;
                const timeout = (_a = this.manager.rainlinkOptions.options) === null || _a === void 0 ? void 0 : _a.resumeTimeout;
                this.driver.sessionId = data.sessionId;
                const customRest = this.manager.rainlinkOptions.options.structures && this.manager.rainlinkOptions.options.structures.rest;
                this.rest = customRest
                    ? new customRest(this.manager, this.options, this)
                    : new RainlinkRest(this.manager, this.options, this);
                if (isResume && timeout) {
                    this.driver.updateSession(data.sessionId, isResume, timeout);
                }
                break;
            }
            case LavalinkEventsEnum.Event: {
                this.wsEvent.initial(data, this.manager);
                break;
            }
            case LavalinkEventsEnum.PlayerUpdate: {
                this.wsEvent.initial(data, this.manager);
                break;
            }
            case LavalinkEventsEnum.Status: {
                this.stats = this.updateStatusData(data);
                break;
            }
        }
    }
    /** @ignore */
    wsErrorEvent(logs) {
        this.debug(`Node errored! URL: ${this.driver.wsUrl}`);
        this.manager.emit(RainlinkEvents.NodeError, this, logs);
    }
    /** @ignore */
    wsCloseEvent(code, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            this.online = false;
            this.state = RainlinkConnectState.Disconnected;
            this.debug(`Node disconnected! URL: ${this.driver.wsUrl}`);
            this.manager.emit(RainlinkEvents.NodeDisconnect, this, code, reason);
            if (!this.sudoDisconnect && this.retryCounter !== this.manager.rainlinkOptions.options.retryCount) {
                yield setTimeout(this.manager.rainlinkOptions.options.retryTimeout);
                this.retryCounter = this.retryCounter + 1;
                this.reconnect(true);
                return;
            }
            this.nodeClosed();
            return;
        });
    }
    nodeClosed() {
        this.manager.emit(RainlinkEvents.NodeClosed, this);
        this.debug(`Node closed! URL: ${this.driver.wsUrl}`);
        this.clean();
    }
    updateStatusData(data) {
        var _a, _b, _c, _d, _e, _f;
        return {
            players: (_a = data.players) !== null && _a !== void 0 ? _a : this.stats.players,
            playingPlayers: (_b = data.playingPlayers) !== null && _b !== void 0 ? _b : this.stats.playingPlayers,
            uptime: (_c = data.uptime) !== null && _c !== void 0 ? _c : this.stats.uptime,
            memory: (_d = data.memory) !== null && _d !== void 0 ? _d : this.stats.memory,
            cpu: (_e = data.cpu) !== null && _e !== void 0 ? _e : this.stats.cpu,
            frameStats: (_f = data.frameStats) !== null && _f !== void 0 ? _f : this.stats.frameStats,
        };
    }
    /** Disconnect this lavalink server */
    disconnect() {
        this.sudoDisconnect = true;
        this.driver.wsClose();
    }
    /** Reconnect back to this lavalink server */
    reconnect(noClean) {
        if (!noClean)
            this.clean();
        this.driver.connect();
    }
    /** Clean all the lavalink server state and set to default value */
    clean(online = false) {
        this.sudoDisconnect = false;
        this.retryCounter = 0;
        this.online = online;
        this.state = RainlinkConnectState.Closed;
    }
    debug(logs) {
        this.manager.emit(RainlinkEvents.Debug, `[Rainlink] / [Node @ ${this.options.name}] | ${logs}`);
    }
}
